import boto3
import hashlib
import json
import os
import time
import logging
from datetime import datetime, timezone
import requests
from boto3.dynamodb.conditions import Key, Attr

try:
    import openai
except ImportError:
    openai = None

logger = logging.getLogger()
logger.setLevel(logging.INFO)

JSEARCH_API_KEY = os.environ.get("JSEARCH_API_KEY", "")
JSEARCH_APP_NAME = os.environ.get("JSEARCH_APP_NAME", "")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
TABLE_NAME = "jobCache"
JSEARCH_BASE_URL = "https://jsearch.p.rapidapi.com/search"

# ---------------------------------------------------------------------------
# Target companies for OpenAI-powered job search. For each position in
# JOB_CATEGORIES, the OpenAI Responses API (web_search_preview tool) will
# search for open roles at these companies and return up to
# OPENAI_MAX_JOBS_PER_POSITION results, structured identically to JSearch.
# ---------------------------------------------------------------------------
TARGET_COMPANIES = [
    "Nvidia", "Microsoft", "Salesforce", "Adobe", "Databricks", "OpenAI",
    "Anthropic", "Jane Street", "Hudson River Trading", "JPMorganChase",
    "Google", "Apple", "Meta", "Amazon", "Snowflake", "Stripe", "Oracle",
    "xAI", "Perplexity", "Clean", "Harvey", "CoreWeave", "Waymo",
    "Citadel Securities", "IMC Trading", "Optiver", "Two Sigma",
    "Tower Research Capital", "Goldman Sachs", "Capital One",
    "American Express", "Bloomberg", "Jump Trading", "Uber", "Airbnb",
    "Netflix",
]
OPENAI_MAX_JOBS_PER_POSITION = 5

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(TABLE_NAME)

# ---------------------------------------------------------------------------
# Job categories and positions to fetch.
# "AI engineer" appears in both Software Engineering and AI & Machine Learning
# intentionally — the API call is deduplicated via api_cache, so only one
# network request is made. Both categories get the same result set stored
# under their respective job_type partition key.
# ---------------------------------------------------------------------------
JOB_CATEGORIES = {
    "Software Engineering": [
        "full stack engineer",
        "frontend engineer",
        "backend engineer",
        "cloud computing engineer",
        "platform engineer",
        "AI engineer",
        "Distributed System Engineer",
        "Site Reliability Engineer",
        "mobile engineer",
        "infrastructure engineer",
        "low latency engineer",
    ],
    "AI & Machine Learning": [
        "Machine learning engineer",
        "AI engineer",
        "deep learning engineer",
        "machine learning scientist",
        "AI research scientist",
        "generative AI engineer",
        "LLM engineer",
        "MLOps engineer",
        "AI platform engineer",
    ],
    "Data Engineering": [
        "data engineer",
        "data platform engineer",
        "data pipeline engineer",
        "ETL engineer",
        "streaming data engineer",
        "data warehouse engineer",
        "data infrastructure engineer",
    ],
    "Data Science": [
        "data scientist",
        "applied scientist",
        "research scientist",
        "data analyst",
        "decision scientist",
        "ML scientist",
    ],
    "UI/UX & Product Design": [
        "product designer",
        "ux designer",
        "ui designer",
        "interaction designer",
        "visual designer",
        "design system designer",
    ],
    "Financial Engineering": [
        "quant researcher",
        "quant developer",
        "financial engineer",
        "trading engineer",
        "financial data scientist",
        "modeling engineer",
    ],
    "Cybersecurity": [
        "security engineer",
        "application security engineer",
        "cloud security engineer",
        "security architect",
        "IAM engineer",
        "GRC analyst",
    ],
}


def normalize_position_name(name: str) -> str:
    """Convert a position name to a consistent lowercase_underscore key."""
    return name.strip().lower().replace(" ", "_").replace("/", "_").replace("&", "and")


def generate_openai_job_id(company_name: str, job_title: str, job_url: str) -> str:
    """
    Generate a deterministic, collision-resistant job_id for OpenAI-sourced
    listings. Prefixed with 'oa_' to distinguish from JSearch IDs.
    """
    raw = f"{company_name.lower()}|{job_title.lower()}|{job_url}"
    return "oa_" + hashlib.md5(raw.encode()).hexdigest()[:16]


def fetch_jobs_from_openai(position_name: str, max_results: int = OPENAI_MAX_JOBS_PER_POSITION) -> list:
    """
    Use the OpenAI Responses API with the web_search_preview tool to find
    open job listings for `position_name` at TARGET_COMPANIES.

    Returns a list of dicts matching the JSearch structure:
      {job_id, job_title, company_name, job_url, is_direct_apply}
    is_direct_apply is always True because results link to company career pages.
    """
    if not OPENAI_API_KEY:
        logger.warning("OPENAI_API_KEY not set — skipping OpenAI job fetch.")
        return []
    if openai is None:
        logger.warning("openai package not installed — skipping OpenAI job fetch.")
        return []

    client = openai.OpenAI(api_key=OPENAI_API_KEY)
    companies_str = ", ".join(TARGET_COMPANIES)

    prompt = (
        f'Search for currently open "{position_name}" job listings at these companies: {companies_str}.\n\n'
        f"Return up to {max_results} real, currently open positions as a JSON array. "
        "Each element must have exactly these keys:\n"
        '  "job_title"   — the exact title shown in the job posting\n'
        '  "company_name" — the company name (must be one from the list above)\n'
        '  "job_url"     — the direct URL to the job application or job detail page\n\n'
        "Rules:\n"
        "- Only include positions that are verifiably open right now.\n"
        "- Do not invent or guess URLs; every URL must lead to a real job posting.\n"
        "- Return ONLY a valid JSON array with no markdown fences, no explanation."
    )

    try:
        response = client.responses.create(
            model="gpt-4o-mini",
            tools=[{"type": "web_search_preview"}],
            input=prompt,
        )

        # Extract the assistant's text output from the Responses API payload.
        text_content = ""
        for item in response.output:
            if getattr(item, "type", None) == "message":
                for block in getattr(item, "content", []):
                    if getattr(block, "type", None) == "output_text":
                        text_content += block.text

        if not text_content.strip():
            logger.warning(f"OpenAI returned empty content for '{position_name}'")
            return []

        # Strip optional markdown code fences (```json ... ```)
        text_content = text_content.strip()
        if text_content.startswith("```"):
            lines = text_content.splitlines()
            text_content = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

        raw_jobs = json.loads(text_content)
        if not isinstance(raw_jobs, list):
            logger.warning(f"OpenAI response for '{position_name}' was not a JSON array.")
            return []

        jobs = []
        for job in raw_jobs[:max_results]:
            title   = (job.get("job_title")    or "").strip()
            company = (job.get("company_name") or "").strip()
            url     = (job.get("job_url")      or "").strip()

            if not (title and company and url):
                continue

            jobs.append({
                "job_id":         generate_openai_job_id(company, title, url),
                "job_title":      title,
                "company_name":   company,
                "job_url":        url,
                "is_direct_apply": True,
            })

        logger.info(f"OpenAI returned {len(jobs)} jobs for '{position_name}'")
        return jobs

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse OpenAI JSON for '{position_name}': {e}")
        return []
    except Exception as e:
        logger.error(f"OpenAI API error for '{position_name}': {e}")
        return []


def fetch_jobs_for_query(query: str, max_pages: int = 2) -> list:
    """
    Fetch job listings from JSearch for a given query string.
    Fetches up to max_pages pages (10 results per page).
    Deduplicates by job_id within the result set.
    Returns a list of dicts: {job_id, job_title, company_name, job_url, is_direct_apply}.
    """
    headers = {
        "X-RapidAPI-Key": JSEARCH_API_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
    }
    all_jobs = []
    seen_ids = set()

    for page in range(1, max_pages + 1):
        try:
            params = {
                "query": query,
                "page": str(page),
                "num_pages": "1",
                "employment_types": "FULLTIME",
                "date_posted": "all",
            }
            response = requests.get(
                JSEARCH_BASE_URL,
                headers=headers,
                params=params,
                timeout=15,
            )
            response.raise_for_status()
            jobs_raw = response.json().get("data", [])

            if not jobs_raw:
                logger.info(f"No results on page {page} for '{query}', stopping early.")
                break

            for job in jobs_raw:
                job_id = job.get("job_id", "")
                company = (job.get("employer_name") or "").strip()
                title = (job.get("job_title") or "").strip()
                url = (job.get("job_apply_link") or "").strip()

                # Skip incomplete records or duplicates
                if not (job_id and company and title and url):
                    continue
                if job_id in seen_ids:
                    continue

                seen_ids.add(job_id)
                all_jobs.append({
                    "job_id": job_id,
                    "job_title": title,
                    "company_name": company,
                    "job_url": url,
                    "is_direct_apply": bool(job.get("job_apply_is_direct", False)),
                })

            logger.info(f"Page {page} for '{query}': fetched {len(jobs_raw)} raw, kept {len(all_jobs)} total so far.")
            time.sleep(0.5)  # Respect rate limit between pages

        except requests.HTTPError as e:
            logger.error(f"HTTP error on page {page} for '{query}': {e}")
            break
        except Exception as e:
            logger.error(f"Unexpected error on page {page} for '{query}': {e}")
            break

    return all_jobs


def write_jobs_to_dynamo(job_type: str, position_name: str, jobs: list, batch_id: str) -> int:
    """
    Batch-write job items into the jobCache table.
    SK format:  {normalized_position_name}#{job_id}
    Returns the number of items written.
    """
    normalized_pos = normalize_position_name(position_name)

    with table.batch_writer() as batch:
        for job in jobs:
            batch.put_item(Item={
                # Primary key
                "job_type":        job_type,
                "sk":              f"{normalized_pos}#{job['job_id']}",
                # GSI keys (must be stored as top-level attributes)
                "company_name":    job["company_name"],
                "position_name":   normalized_pos,
                # Payload
                "job_title":       job["job_title"],
                "job_url":         job["job_url"],
                "is_direct_apply": job["is_direct_apply"],
                # Refresh tracking
                "batch_id":        batch_id,
            })

    logger.info(f"Wrote {len(jobs)} items — job_type='{job_type}', position='{position_name}'")
    return len(jobs)


def delete_stale_items(job_type: str, current_batch_id: str):
    """
    Remove all items for a job_type whose batch_id differs from the current run.
    Called after all writes are complete to ensure safe atomic swap.
    Handles DynamoDB pagination for large result sets.
    """
    stale_keys = []
    last_key = None

    while True:
        query_kwargs = {
            "KeyConditionExpression": Key("job_type").eq(job_type),
            "FilterExpression": Attr("batch_id").ne(current_batch_id),
            "ProjectionExpression": "job_type, sk",  # Only fetch keys to reduce RCU
        }
        if last_key:
            query_kwargs["ExclusiveStartKey"] = last_key

        response = table.query(**query_kwargs)
        stale_keys.extend(response.get("Items", []))
        last_key = response.get("LastEvaluatedKey")
        if not last_key:
            break

    if not stale_keys:
        logger.info(f"No stale items to delete for job_type='{job_type}'")
        return

    with table.batch_writer() as batch:
        for key in stale_keys:
            batch.delete_item(Key={"job_type": key["job_type"], "sk": key["sk"]})

    logger.info(f"Deleted {len(stale_keys)} stale items for job_type='{job_type}'")


def lambda_handler(event, context):
    """
    Lambda entry point. Invoked by EventBridge schedule (1st and 15th of each
    month at 03:00 UTC) or manually via the AWS console / CLI.

    Workflow:
      Phase 1 — Fetch all job listings from JSearch and write to DynamoDB
                 under the new batch_id. Duplicate API queries (same position
                 name across categories) are served from an in-memory cache.
      Phase 2 — Delete items from previous runs whose batch_id differs from
                 the current one, completing the atomic data refresh.
    """
    batch_id = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    logger.info(f"Job listing cache refresh started — batch_id={batch_id}")

    # In-memory API result cache keyed by normalized position name.
    # Prevents duplicate JSearch calls for positions shared across categories
    # (e.g., "AI engineer" in Software Engineering and AI & Machine Learning).
    api_cache: dict = {}

    total_written = 0
    failed_positions: list = []

    # ------------------------------------------------------------------
    # Phase 1: Fetch from JSearch and write new data
    # ------------------------------------------------------------------
    for job_type, positions in JOB_CATEGORIES.items():
        logger.info(f"--- Processing job_type: '{job_type}' ({len(positions)} positions) ---")

        for position_name in positions:
            cache_key = normalize_position_name(position_name)

            if cache_key not in api_cache:
                logger.info(f"API call: '{position_name}'")
                jobs = fetch_jobs_for_query(position_name, max_pages=2)
                api_cache[cache_key] = jobs
                time.sleep(0.3)  # Gentle rate limiting between distinct queries
            else:
                logger.info(f"Cache hit: '{position_name}' (reusing {len(api_cache[cache_key])} results)")
                jobs = api_cache[cache_key]

            if not jobs:
                logger.warning(f"No jobs returned for '{position_name}' — skipping write.")
                continue

            try:
                count = write_jobs_to_dynamo(job_type, position_name, jobs, batch_id)
                total_written += count
            except Exception as e:
                logger.error(f"DynamoDB write failed — job_type='{job_type}', position='{position_name}': {e}")
                failed_positions.append(f"{job_type}/{position_name}")

    logger.info(f"Phase 1 complete — {total_written} items written, {len(failed_positions)} failed.")

    # ------------------------------------------------------------------
    # Phase 1b: Fetch company-targeted jobs via OpenAI web search and
    #           write them to DynamoDB alongside JSearch results.
    #
    # For each unique position name, the OpenAI Responses API uses its
    # web_search_preview tool to find up to OPENAI_MAX_JOBS_PER_POSITION
    # open roles at TARGET_COMPANIES. Results share the same batch_id and
    # DynamoDB schema as Phase 1 data so Phase 2 stale-deletion handles
    # cleanup automatically. job_ids are prefixed with "oa_" to avoid
    # collisions with JSearch IDs.
    # ------------------------------------------------------------------
    logger.info("Phase 1b: Fetching company-targeted jobs via OpenAI web search...")
    openai_cache: dict = {}  # keyed by normalized position name, same dedup logic as JSearch
    openai_written = 0

    for job_type, positions in JOB_CATEGORIES.items():
        logger.info(f"--- OpenAI: Processing job_type: '{job_type}' ({len(positions)} positions) ---")

        for position_name in positions:
            cache_key = normalize_position_name(position_name)

            if cache_key not in openai_cache:
                logger.info(f"OpenAI API call: '{position_name}'")
                oa_jobs = fetch_jobs_from_openai(position_name)
                openai_cache[cache_key] = oa_jobs
                time.sleep(1.0)  # Respect OpenAI rate limits between queries
            else:
                logger.info(
                    f"OpenAI cache hit: '{position_name}' "
                    f"(reusing {len(openai_cache[cache_key])} results)"
                )
                oa_jobs = openai_cache[cache_key]

            if not oa_jobs:
                logger.warning(f"No OpenAI jobs for '{position_name}' — skipping write.")
                continue

            try:
                count = write_jobs_to_dynamo(job_type, position_name, oa_jobs, batch_id)
                openai_written += count
                total_written += count
            except Exception as e:
                logger.error(
                    f"DynamoDB write failed (OpenAI) — "
                    f"job_type='{job_type}', position='{position_name}': {e}"
                )
                failed_positions.append(f"openai:{job_type}/{position_name}")

    logger.info(
        f"Phase 1b complete — {openai_written} OpenAI items written, "
        f"{len(openai_cache)} unique API calls made."
    )

    # ------------------------------------------------------------------
    # Phase 2: Delete stale data from previous batch
    # ------------------------------------------------------------------
    logger.info("Phase 2: Deleting stale items from previous batch...")
    for job_type in JOB_CATEGORIES.keys():
        try:
            delete_stale_items(job_type, batch_id)
        except Exception as e:
            logger.error(f"Stale item deletion failed for job_type='{job_type}': {e}")

    result = {
        "status": "success" if not failed_positions else "partial",
        "batch_id": batch_id,
        "total_jobs_written": total_written,
        "categories_processed": len(JOB_CATEGORIES),
        "jsearch_unique_api_calls": len(api_cache),
        "openai_unique_api_calls": len(openai_cache),
        "openai_jobs_written": openai_written,
        "failed_positions": failed_positions,
    }
    logger.info(f"Refresh complete: {result}")
    return result
