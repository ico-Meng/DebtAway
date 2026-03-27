import boto3
import os
import time
import logging
from datetime import datetime, timezone
import requests
from boto3.dynamodb.conditions import Key, Attr

logger = logging.getLogger()
logger.setLevel(logging.INFO)

JSEARCH_API_KEY = os.environ.get("JSEARCH_API_KEY", "")
JSEARCH_APP_NAME = os.environ.get("JSEARCH_APP_NAME", "")
TABLE_NAME = "jobCache"
JSEARCH_BASE_URL = "https://jsearch.p.rapidapi.com/search"

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
        "unique_api_calls": len(api_cache),
        "failed_positions": failed_positions,
    }
    logger.info(f"Refresh complete: {result}")
    return result
