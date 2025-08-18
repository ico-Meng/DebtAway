import boto3
import json
import stripe
import uuid
import time
from datetime import datetime
from config import STRIPE_SECRET_KEY
from aws_lambda_powertools import Logger
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request, Query, HTTPException, File, UploadFile, Form
from mangum import Mangum  # type: ignore
import asyncio


logger = Logger()
s3 = boto3.client("s3", region_name="us-east-1")
stripe.api_key = STRIPE_SECRET_KEY

app = FastAPI()
handler = Mangum(app, lifespan="off")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    # allow_origins=["*"],
    allow_origins=["http://localhost:3000",
                   "https://main.d3a19hn400g7xw.amplifyapp.com"],
    allow_credentials=True,
    allow_methods=["OPTIONS", "POST", "GET"],  # Ensure OPTIONS is included
    # Include necessary headers
    allow_headers=["Content-Type", "Authorization"],
    # allow_methods=["*"],
    # allow_headers=["*"],
)


'''
API Definition
'''

@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    response = await call_next(request)
    return response



@app.post("/resume-analysis-lab")
async def resume_analysis_lab(file: UploadFile = File(...), form_data: str = Form(...)):
    try:
        logger.info(f"Received resume analysis lab request")
        
        # Parse form data
        form_data_json = json.loads(form_data)
        email = form_data_json.get('email', '')
        full_name = form_data_json.get('fullName', '')
        current_role = form_data_json.get('currentRole', '')
        target_role = form_data_json.get('targetRole', '')
        career_objectives = form_data_json.get('careerObjectives', '')
        
        logger.info(f"Processing resume analysis for {full_name} ({email})")
        
        # Save file to S3 for later processing (non-blocking)
        bucket_name = "career-landing-group"
        current_date = datetime.now().strftime("%Y-%m-%d")
        base_submission_id = f"{email}-{current_date}"
        client_uuid = str(uuid.uuid4())
        submission_id = f"{base_submission_id}-{client_uuid}"
        file_content = await file.read()
        file_name = file.filename
        object_key = f"resume-analysis-lab/{submission_id}/{file_name}"
        async def upload_file_to_s3():
            s3.put_object(
                Bucket=bucket_name, 
                Key=object_key,
                Body=file_content, 
                ContentType=file.content_type
            )
            logger.info(f"Resume file saved to S3: {object_key}")
        asyncio.create_task(upload_file_to_s3())
        # Save client info JSON to S3 (non-blocking)
        info_key = f"resume-analysis-lab/{submission_id}/client_info.json"
        client_info = {
            "client_uuid": client_uuid,
            "email": email,
            "full_name": full_name,
            "submission_id": submission_id,
            "current_role": current_role,
            "target_role": target_role,
            "career_objectives": career_objectives,
            "submission_date": current_date,
            "file_name": file_name,
            "resume_link": f"https://career-landing-group.s3.us-east-1.amazonaws.com/{object_key}"
        }
        client_info_json = json.dumps(client_info, indent=2)
        async def upload_client_info_to_s3():
            s3.put_object(
                Bucket=bucket_name,
                Key=info_key,
                Body=client_info_json,
                ContentType="application/json"
            )
            logger.info(f"Client information saved to S3: {info_key}")
        asyncio.create_task(upload_client_info_to_s3())
        service_path = "/resume-analysis-lab"
        # Create a Stripe checkout session with custom fields
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=[
                'card',
                'afterpay_clearpay',
                'klarna',
                'cashapp'
                ],
            customer_email=email,
            client_reference_id=client_uuid,
            metadata={
                'service_name': 'Resume Analysis Lab',
                'submission_id': submission_id,
                'client_uuid': client_uuid,
                'email': email,
                'full_name': full_name,
                'target_role': target_role,
                's3_client_info_link': f"https://career-landing-group.s3.us-east-1.amazonaws.com/{info_key}"
            },
            line_items=[
                {
                    'price': 'price_1RGVGwCNRzh0Tnp2WgcmYivd',
                    'quantity': 1,
                },
            ],
            mode='payment',
            allow_promotion_codes=True,
            success_url=f"https://www.careerlandinggroup.com/payment-confirmation?session_id={{CHECKOUT_SESSION_ID}}&email={email}&service_path={service_path}",
            cancel_url="https://www.careerlandinggroup.com/resume-design/resume-analysis-lab/"
        )
        logger.info(f"Stripe checkout session created: {checkout_session.id}")
        return {
            "status": "success",
            "checkout_session_id": checkout_session.id,
            "payment_url": checkout_session.url,
            "direct_payment_link": checkout_session.url,
            "submission_id": submission_id,
            "client_uuid": client_uuid
        }
    except Exception as e:
        logger.error(f"Error in resume analysis lab: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error processing resume: {str(e)}")



@app.post("/instant-mock-interview")
async def instant_mock_interview(
    file: UploadFile = File(None),
    form_data: str = Form(...)
):
    try:
        logger.info(f"Received instant mock interview request")
        
        # Parse form data
        form_data_json = json.loads(form_data)
        email = form_data_json.get('email', '')
        full_name = form_data_json.get('fullName', '')
        current_role = form_data_json.get('currentRole', '')
        target_role = form_data_json.get('targetRole', '')
        target_job_link = form_data_json.get('targetJobLink', '')
        interview_question_type = form_data_json.get('interviewQuestionType', '')
        
        logger.info(f"Processing instant mock interview for {full_name} ({email})")
        
        # S3 bucket and date
        bucket_name = "career-landing-group"
        current_date = datetime.now().strftime("%Y-%m-%d")
        base_submission_id = f"{email}-{current_date}"
        client_uuid = str(uuid.uuid4())
        submission_id = f"{base_submission_id}-{client_uuid}"
        logger.info(f"Generated unique submission ID: {submission_id}")
        logger.info(f"UUID component: {client_uuid}")
        
        # Non-blocking S3 file upload
        async def upload_file_to_s3():
            if file is not None:
                file_content = await file.read()
                file_name = file.filename
                object_key = f"instant-mock-interview/{submission_id}/{file_name}"
                s3.put_object(
                    Bucket=bucket_name,
                    Key=object_key,
                    Body=file_content,
                    ContentType=file.content_type
                )
                logger.info(f"Resume file saved to S3: {object_key}")
        if file is not None:
            asyncio.create_task(upload_file_to_s3())
        
        # Store client info as JSON (non-blocking)
        client_info = {
            "client_uuid": client_uuid,
            "email": email,
            "full_name": full_name,
            "current_role": current_role,
            "target_role": target_role,
            "target_job_link": target_job_link,
            "interview_question_type": interview_question_type,
            "submission_date": current_date,
            "submission_id": submission_id,
        }
        async def upload_client_info_to_s3():
            client_info_json = json.dumps(client_info, indent=2)
            info_key = f"instant-mock-interview/{submission_id}/client_info.json"
            s3.put_object(
                Bucket=bucket_name,
                Key=info_key,
                Body=client_info_json,
                ContentType="application/json"
            )
            logger.info(f"Client information saved to S3: {info_key}")
        asyncio.create_task(upload_client_info_to_s3())
        
        service_path = "/instant-mock-interview"
        info_key = f"instant-mock-interview/{submission_id}/client_info.json"

        # Create a Stripe checkout session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=[
                'card',
                'afterpay_clearpay',
                'klarna',
                'cashapp'
            ],
            customer_email=email,
            client_reference_id=client_uuid,
            metadata={
                'service_name': 'Instant Mock Interview',
                'submission_id': submission_id,
                'client_uuid': client_uuid,
                'email': email,
                'full_name': full_name,
                'target_role': target_role,
                'interview_question_type': interview_question_type,
                's3_client_info_link': f"https://career-landing-group.s3.us-east-1.amazonaws.com/{info_key}"
            },
            line_items=[
                {
                    #'price': 'price_1RLXQuCNRzh0Tnp24yLckBAN', # test price
                    'price': 'price_1RHWPoCNRzh0Tnp2WKqgRJXb',  # live price
                    'quantity': 1,
                },
            ],
            mode='payment',
            allow_promotion_codes=True,
            success_url=f"https://www.careerlandinggroup.com/payment-confirmation?session_id={{CHECKOUT_SESSION_ID}}&email={email}&service_path={service_path}",
            cancel_url="https://www.careerlandinggroup.com/interview-prep/instant-mock-interview/",
            payment_intent_data={
                'setup_future_usage': None,
                'capture_method': 'automatic',
            }
        )

        logger.info(f"Stripe checkout session created: {checkout_session.id}")
        
        return {
            "status": "success",
            "sessionId": checkout_session.id, # Official stripe checkout session id
            "payment_url": checkout_session.url,
            "direct_payment_link": checkout_session.url,
            "client_uuid": client_uuid
        }
    except Exception as e:
        logger.error(f"Error in instant mock interview: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error processing instant mock interview: {str(e)}")



@app.post("/flash-chat")
async def flash_chat(request: Request):
    try:
        # Parse JSON data from the request
        data = await request.json()
        email = data.get('email', '')
        full_name = data.get('fullName', '')
        current_role = data.get('currentRole', '')
        target_role = data.get('targetRole', '')
        message = data.get('message', '')
        selected_questions = data.get('selectedQuestions', [])
        subscription_type = data.get('subscriptionType', 'monthly')
        # Determine price_id based on subscription_type
        if subscription_type == 'biweekly':
            price_id = 'price_1RUrC2CNRzh0Tnp2ikTobjoM'
        else:
            price_id = 'price_1RJ4LnCNRzh0Tnp2aOj91XNX'
        
        logger.info(f"Received flash chat request from {full_name} ({email})")
        
        # Create a human-readable date string
        current_date = datetime.now().strftime("%Y-%m-%d")
        
        # Create a unique identifier for this chat
        base_chat_id = f"{email}-{current_date}"
        
        # Generate a UUID based on the chat_id
        client_uuid = str(uuid.uuid4())
        
        # Final chat ID combines the readable ID and UUID
        chat_id = f"{base_chat_id}-{client_uuid}"
        
        logger.info(f"Generated unique chat ID: {chat_id}")
        logger.info(f"UUID component: {client_uuid}")
        
        # Create and store client information as JSON (non-blocking)
        client_info = {
            "client_uuid": client_uuid,
            "email": email,
            "full_name": full_name,
            "current_role": current_role,
            "target_role": target_role,
            "message": message,
            "selected_questions": selected_questions,
            "submission_date": current_date,
            'subscription_type': subscription_type,
            "chat_id": chat_id
        }
        info_key = f"flash-chat/{chat_id}/client_info.json"
        client_info_json = json.dumps(client_info, indent=2)
        async def upload_client_info_to_s3():
            s3.put_object(
                Bucket="career-landing-group",
                Key=info_key,
                Body=client_info_json,
                ContentType="application/json"
            )
            logger.info(f"Client chat information saved to S3: {info_key}")
        asyncio.create_task(upload_client_info_to_s3())
        service_path = "/flash-chat"
        # Create a Stripe checkout session with custom fields for monthly subscription
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=[ 'card' ],
            customer_email=email,
            client_reference_id=client_uuid,
            metadata={
                'service_name': 'Flash Chat',
                'chat_id': chat_id,
                'client_uuid': client_uuid,
                'email': email,
                'full_name': full_name,
                'target_role': target_role,
                's3_client_info_link': f"https://career-landing-group.s3.us-east-1.amazonaws.com/{info_key}",
                'subscription_type': subscription_type,
            },
            line_items=[
                {
                    'price': price_id,
                    'quantity': 1,
                },
            ],
            mode='subscription',
            allow_promotion_codes=True,
            subscription_data={
                'trial_period_days': 2,
            },
            success_url=f"https://www.careerlandinggroup.com/payment-confirmation?session_id={{CHECKOUT_SESSION_ID}}&email={email}&service_path={service_path}",
            cancel_url="https://www.careerlandinggroup.com/career-cruise/flash-chat-2/"
        )
        logger.info(f"Stripe subscription checkout session created: {checkout_session.id}")
        return {
            "status": "success",
            "checkout_session_id": checkout_session.id,
            "payment_url": checkout_session.url,
            "direct_payment_link": checkout_session.url,
            "chat_id": chat_id,
            "client_uuid": client_uuid
        }
    except Exception as e:
        logger.error(f"Error in flash chat: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")


@app.post("/lead_sign_up")
async def lead_sign_up(request: Request):
    try:
        logger.info("Received lead sign up request")
        
        # Get request body
        body = await request.json()
        email = body.get('email', '').strip()
        
        if not email:
            raise HTTPException(status_code=400, detail="Email is required")
        
        # Validate email format
        import re
        email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        if not re.match(email_pattern, email):
            raise HTTPException(status_code=400, detail="Invalid email format")
        
        # Initialize DynamoDB client
        # dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
        dynamodb = boto3.resource(
           'dynamodb', endpoint_url="http://host.docker.internal:8000")
        logger.info("Initializing DynamoDB connection")
        
        # Check if table exists, create if not
        table_name = 'lead_email'
        try:
            table = dynamodb.Table(table_name)
            # Try to describe the table to check if it exists
            table.table_status
            logger.info(f"Table {table_name} exists")
        except dynamodb.meta.client.exceptions.ResourceNotFoundException:
            logger.info(f"Table {table_name} does not exist, creating it...")
            # Create the table
            table = dynamodb.create_table(
                TableName=table_name,
                KeySchema=[
                    {
                        'AttributeName': 'id',
                        'KeyType': 'HASH'
                    }
                ],
                AttributeDefinitions=[
                    {
                        'AttributeName': 'id',
                        'AttributeType': 'S'
                    }
                ],
                BillingMode='PAY_PER_REQUEST'
            )
            # Wait for table to be created
            table.wait_until_exists()
            logger.info(f"Table {table_name} created successfully")
        except Exception as table_check_error:
            logger.error(f"Error checking/creating table: {str(table_check_error)}")
            raise
        
        # Generate unique ID and timestamp
        lead_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        
        logger.info(f"Attempting to save lead email: {email}")
        # Save to DynamoDB
        table.put_item(
            Item={
                'id': lead_id,
                'email': email,
                'timestamp': timestamp,
                'source': 'lead_page'
            },
            ConditionExpression="attribute_not_exists(id)",
        )
        logger.info(f"Successfully wrote to DynamoDB table: {table_name}")
        
        logger.info(f"Successfully saved lead email: {email}")
        
        return {
            "status": "success",
            "message": "Email successfully saved",
            "lead_id": lead_id
        }
        
    except HTTPException as http_err:
        # Log HTTP exceptions with details
        logger.error(f"HTTP error in lead_sign_up: {http_err.status_code} - {http_err.detail}")
        logger.error(f"Request details - Email: {email if 'email' in locals() else 'N/A'}")
        raise
    except Exception as e:
        # Comprehensive error logging for debugging
        import traceback
        error_traceback = traceback.format_exc()
        
        logger.error(f"Unexpected error in lead_sign_up: {str(e)}")
        logger.error(f"Error type: {type(e).__name__}")
        logger.error(f"Full traceback: {error_traceback}")
        
        # Log request context for debugging
        try:
            logger.error(f"Request details - Email: {email if 'email' in locals() else 'N/A'}")
            logger.error(f"Lead ID: {lead_id if 'lead_id' in locals() else 'N/A'}")
            logger.error(f"Timestamp: {timestamp if 'timestamp' in locals() else 'N/A'}")
        except:
            logger.error("Could not log request details")
        
        # Log system information for infrastructure debugging
        import os
        logger.error(f"Environment: {os.environ.get('AWS_LAMBDA_FUNCTION_NAME', 'local')}")
        logger.error(f"Region: {os.environ.get('AWS_REGION', 'unknown')}")
        
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


'''
import os
import plaid
import experian_handler
import plaid_handler
import requests
from plaid.api import plaid_api
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.accounts_get_request import AccountsGetRequest
from plaid.model.products import Products
from plaid.model.country_code import CountryCode


from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from config import PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV, OPENROUTER_APIKEY

import time
from openai import OpenAI
'''

# Global Variable Cache
# dynamodb = boto3.resource(
#    'dynamodb', endpoint_url="http://host.docker.internal:8000")
#
#
# def ensure_table_exists():
#    table_name = "PlaidTokenTable"
#
#    existing_tables = dynamodb.meta.client.list_tables()["TableNames"]
#    if table_name in existing_tables:
#        print(f"Table '{table_name}' already exists.")
#        return dynamodb.Table(table_name)
#
#    # Create the table if it doesn't exist
#    print(f"Table '{table_name}' does not exist. Creating...")
#    table = dynamodb.create_table(
#        TableName=table_name,
#        KeySchema=[
#            {
#                "AttributeName": "client_id",  # Partition key
#                "KeyType": "HASH"
#            },
#            {
#                "AttributeName": "sk",  # Sort Key
#                "KeyType": "RANGE"
#            }
#        ],
#        AttributeDefinitions=[
#            {
#                "AttributeName": "client_id",
#                "AttributeType": "S"  # 'S' for String
#            },
#            {
#                "AttributeName": "sk",
#                "AttributeType": "S"  # 'S' for String
#            }
#        ],
#        ProvisionedThroughput={
#            "ReadCapacityUnits": 5,
#            "WriteCapacityUnits": 5
#        }
#    )
#
#    # Wait until the table becomes active
#    print(f"Creating table '{table_name}'...")
#    table.meta.client.get_waiter("table_exists").wait(TableName=table_name)
#    print(f"Table '{table_name}' created successfully!")
#    return table
#
#
# PlaidTokenTable = ensure_table_exists()


#transcribe = boto3.client("transcribe", region_name="us-east-1")
#polly = boto3.client("polly", region_name="us-east-1")
#bedrock = boto3.client("bedrock-runtime")

#
# Used for Plaid API
#
#plaid_env = plaid.Environment.Sandbox if PLAID_ENV == "sandbox" else (
#    plaid.Environment.Development if PLAID_ENV == "development" else plaid.Environment.Production
#)
#
#plaid_client = plaid_api.PlaidApi(plaid.ApiClient(plaid.Configuration(
#    host=plaid_env,
#    api_key={
#        "clientId": PLAID_CLIENT_ID,
#        "secret": PLAID_SECRET,
#    }
#)))
# plaid_client = None
# access_token = None
# item_id = None


'''
@app.post("/create-link-token")
async def create_link_token(request: Request):
    body = await request.json()
    user_id = body.get("userId")
    client_id = user_id

    try:
        # Generate a link_token
        link_request = LinkTokenCreateRequest(
            client_name="Debt Away",
            products=[Products("auth")],
            # products=[Products("auth"), Products("layer")],
            country_codes=[CountryCode('US')],
            language="en",
            user=LinkTokenCreateRequestUser(
                # client_user_id=client_id
                client_user_id="+14155550015"  # Sandbox phone number
            ),
            # webhook="https://your-app.com/webhook"  # Optional: webhook for updates
        )
        response = plaid_client.link_token_create(link_request)
        link_token = response["link_token"]
        logger.info(f"client_id: {client_id}; link_token: {link_token}")

        # Should check availability first, then see if need to update
        # try:
        #    PlaidTokenTable.put_item(
        #        Item={
        #            "client_id": client_id,
        #            "sk": "link_token",
        #            "link_token": link_token,
        #            "access_token": "",
        #        },
        #        ConditionExpression="attribute_not_exists(client_id) AND attribute_not_exists(sk)"
        #    )
        #    print("Item successfully inserted.")
        # except Exception as e:
        #    if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
        #        # If the item already exists, skip writing
        #        print(
        #            f"client_id={client_id} or link_token{link_token} already exists, skipping insert")
        #    else:
        #        # Handle other exceptions
        #        print(f"Error: {str(e)}")

        # print("Finished DynamoDB insert.")
        # dbResp = PlaidTokenTable.get_item(
        #    Key={
        #        "client_id": client_id,
        #        "sk": link_token
        #    }
        # )
        # if "Item" in dbResp:
        #    print("Item found: ", json.dumps(dbResp["Item"], indent=4))
        # else:
        #    print("No item found with client_id: ", client_id)

        return JSONResponse({
            "link_token": link_token,
            "user_id": user_id
        })
    except plaid.ApiException as e:
        return {"status": "error", "message": str(e)}


@app.post("/exchange-public-token")
async def exchange_public_token(request: Request):
    body = await request.json()
    client_id = body.get("clientId")  # Extract the clientId

    global access_token
    public_token = body.get('publicToken')
    link_token = body.get('linkToken')

    request = ItemPublicTokenExchangeRequest(
        public_token=public_token
    )
    response = plaid_client.item_public_token_exchange(request)

    access_token = response['access_token']
    item_id = response['item_id']

    logger.info(f"client_id: {client_id}; access_token: {access_token}")

    # try:
    #    dbResp = PlaidTokenTable.update_item(
    #        Key={
    #            "client_id": client_id,
    #            "sk": link_token
    #        },
    #        UpdateExpression="SET access_token = :value",
    #        # ConditionExpression="attribute_not_exists(access_token)",
    #        ExpressionAttributeValues={
    #            ":value": access_token
    #        },
    #        ReturnValues="UPDATED_NEW"
    #    )
    #    print("Update succeeded:", dbResp)
    # except Exception as e:
    #    if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
    #        print("Access token already exists, update skipped.")
    #    else:
    #        print("Unexpected error:", e)

    # dbResp = PlaidTokenTable.get_item(
    #    Key={
    #        "client_id": client_id,
    #        "sk": link_token
    #    }
    # )
    # if "Item" in dbResp:
    #    print("Item found after update access_token: ",
    #          json.dumps(dbResp["Item"], indent=4))
    # else:
    #    print("No item found with client_id: ", client_id)

    return {"status": "success", "access_token": access_token, "item_id": item_id}
    # return {
    #    "statusCode": 200,
    #    "headers": {
    #        "Content-Type": "application/json",
    #        "Access-Control-Allow-Origin": "*",
    #        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    #        "Access-Control-Allow-Headers": "Content-Type",
    #    },
    #    "body": json.dumps({"access_token": access_token, "item_id": item_id}),
    # }


@app.get("/get-account")
async def get_account(
    clientId: str = Query(...),  # Required query parameter
    linkToken: str = Query(...),  # Required query parameter
    publicToken: str = Query(None),  # Required query parameter
):
    # http_method = event.get("httpMethod")
    # print("HTTP Method:", http_method)

    # client_id = event.get("queryStringParameters", {}).get("clientId")
    # link_token = event.get("queryStringParameters", {}).get("linkToken")
    # print("client_id: ", client_id)
    # print("link_token: ", link_token)

    global access_token
    logger.info(f"get-account access_token: {access_token}")
    # dbResp = PlaidTokenTable.get_item(
    #    Key={
    #        "client_id": clientId,
    #        "sk": linkToken
    #    }
    # )
    # if "Item" in dbResp:
    #    print("Item found after update access_token: ",
    #          json.dumps(dbResp["Item"], indent=4))

    #    access_token = dbResp["Item"]["access_token"]
    #    print("queried access_token: {access_token}")
    # else:
    #    print("No item found with client_id: ", clientId)

    request = AccountsGetRequest(
        access_token=access_token
    )
    accounts_response = plaid_client.accounts_get(request)
    accounts_response_dict = accounts_response.to_dict()
    logger.info(f"account response: {accounts_response_dict}")
    return {"status": "success", "account": accounts_response_dict}
    # return {
    #    "statusCode": 200,
    #    "headers": {
    #        "Access-Control-Allow-Origin": "*",
    #        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    #        "Access-Control-Allow-Headers": "Content-Type",
    #    },
    #    "body": json.dumps({"account": accounts_response_dict}),
    # }


@app.get("/get-experian-token")
async def get_experian_token():
    return experian_handler.experian_token_handler()


@app.get("/get-credit-report")
async def get_credit_report():
    return experian_handler.credit_report_handler()


@app.get("/test-api")
async def test_api():
    # return plaid_handler.test_api_handler(event, context, plaid_client)
    return {"link_token": "Plaid provided your link token"}
    # return {
    #    "statusCode": 200,
    #    "headers": {
    #        "Access-Control-Allow-Origin": "*",
    #        "Access-Control-Allow-Methods": "GET,OPTIONS",
    #        "Access-Control-Allow-Headers": "Content-Type",
    #    },
    #    "body": json.dumps({"link_token": "Plaid provided your link token"})
    # }


@app.get("/test2-api")
async def test2_api():
    # return plaid_handler.test_api_handler(event, context, plaid_client)
    return {"link_token2": "Plaid provided your link token2"}
    # return {
    #    "statusCode": 200,
    #    "headers": {
    #        "Access-Control-Allow-Origin": "*",
    #        "Access-Control-Allow-Methods": "GET,OPTIONS",
    #        "Access-Control-Allow-Headers": "Content-Type",
    #    },
    #    "body": json.dumps({"link_token": "Plaid provided your link token"})
    # }

# s3 = boto3.client(
#    "s3",
#    # endpoint_url="http://localhost:4566",
#    endpoint_url="http://host.docker.internal:4566",
#    aws_access_key_id="test",
#    aws_secret_access_key="test",
#    region_name="us-east-1"
# )


#@app.post("/comment-out-video-chat-ai")
# async def chat_ai(file: UploadFile = File(...)):
#async def chat_ai(file: UploadFile = File(...)):
#
#    audio_bytes = await file.read()
#    print(f"✅ Audio file size: {len(audio_bytes)} bytes")
#
#    bucket_name = "chat-ai-s3-bucket"
#    input_obj_key = "record.wav"
#
#    s3.put_object(Bucket=bucket_name, Key=input_obj_key,
#                  Body=audio_bytes, ContentType="audio/wav")
#    print("✅ Uploaded user audio to S3.")
#
#    job_name = f"transcribe-job-{int(time.time())}"
#    s3_uri = f"s3://{bucket_name}/{input_obj_key}"
#    transcribe.start_transcription_job(
#        TranscriptionJobName=job_name,
#        Media={"MediaFileUri": s3_uri},
#        MediaFormat="wav",
#        LanguageCode="en-US"
#    )
#    print(f"✅ Started Transcription Job: {job_name}")
#
#    # ✅ Wait for Transcription Job to Complete
#    while True:
#        job_status = transcribe.get_transcription_job(
#            TranscriptionJobName=job_name)
#        if job_status["TranscriptionJob"]["TranscriptionJobStatus"] in ["COMPLETED", "FAILED"]:
#            break
#        time.sleep(3)  # Wait and check again
#
#    if job_status["TranscriptionJob"]["TranscriptionJobStatus"] == "FAILED":
#        print("❌ AWS Transcribe Job Failed")
#        raise HTTPException(
#            status_code=500, detail="Speech-to-text conversion failed.")
#
#    # ✅ Extract Transcription URL
#    transcript_uri = job_status["TranscriptionJob"]["Transcript"]["TranscriptFileUri"]
#    print(f"✅ Transcription completed! Transcript URL: {transcript_uri}")
#
#    # ✅ Download Transcription Result
#    transcript_response = s3.get_object(
#        Bucket=bucket_name, Key="transcript.json")
#    transcript_data = json.loads(
#        transcript_response["Body"].read().decode("utf-8"))
#    extracted_text = transcript_data["results"]["transcripts"][0]["transcript"]
#
#    print(f"✅ Transcribed Text: {extracted_text}")
#
#    # inputText = "This is your AI agent to deal with your debt issue."
#    # print(f"inputText = {inputText}")
#    response = polly.synthesize_speech(
#        Text=extracted_text,
#        OutputFormat="mp3",
#        VoiceId="Joanna"
#    )
#    audio_stream = response["AudioStream"].read()
#
#    object_key = "response.mp3"
#
#    s3.put_object(Bucket=bucket_name, Key=object_key,
#                  Body=audio_stream, ContentType="audio/mpeg")
#
#    print("Finished chat_ai")
#
#    return {"audio_url": f"http://localhost:4566/{bucket_name}/{object_key}"}




#@app.post("/chat-deepseek")
#async def chat_deepseek(request: Request):
#    body = await request.json()
#    chatContent = body.get("chatContent")
#
#    logger.info(f"chatContent: {chatContent}")
#
#    openai_client = OpenAI(
#        base_url="https://openrouter.ai/api/v1",
#        api_key=OPENROUTER_APIKEY,
#    )
#
#    completion = openai_client.chat.completions.create(
#        model="deepseek/deepseek-chat:free",
#        messages=[
#            {
#                "role": "user",
#                "content": str(chatContent)
#            }
#        ],
#        timeout=60
#    )
#    logger.info("chatResponse: ", completion.choices[0].message.content)
#
#    return {"chatResponse": completion.choices[0].message.content}


@app.post("/upload-document")
async def upload_document(file: UploadFile = File(...)):
    try:
        bucket_name = "chat-ai-s3-bucket"
        file_content = await file.read()
        file_name = file.filename
        
        logger.info(f"Received file: {file_name}")
        logger.info(f"File size: {len(file_content)} bytes")
        
        # Upload to S3
        object_key = f"vust/{file_name}"
        s3.put_object(
            Bucket=bucket_name, 
            Key=object_key,
            Body=file_content, 
            ContentType=file.content_type
        )
        
        return {
            "status": "success", 
            "message": f"File {file_name} uploaded successfully",
            "file_url": f"s3://{bucket_name}/{object_key}"
        }
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")


@app.post("/lead_sign_up")
async def lead_sign_up(request: Request):
    try:
        logger.info("Received lead sign up request")
        
        # Get request body
        body = await request.json()
        email = body.get('email', '').strip()
        
        if not email:
            raise HTTPException(status_code=400, detail="Email is required")
        
        # Validate email format
        import re
        email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        if not re.match(email_pattern, email):
            raise HTTPException(status_code=400, detail="Invalid email format")
        
        # Initialize DynamoDB client
        dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
        table = dynamodb.Table('lead_email')
        
        # Generate unique ID and timestamp
        lead_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        
        # Save to DynamoDB
        table.put_item(
            Item={
                'id': lead_id,
                'email': email,
                'timestamp': timestamp,
                'source': 'lead_page'
            }
        )
        
        logger.info(f"Successfully saved lead email: {email}")
        
        return {
            "status": "success",
            "message": "Email successfully saved",
            "lead_id": lead_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in lead_sign_up: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.post("/submit-application")
async def submit_application(
    files: list[UploadFile] = File(None),
    form_data: str = Form(...)  # Changed from Query to Form
):
    try:
        logger.info(f"Received form_data: {form_data[:100]}...") # Log the beginning of form_data
        
        # Parse form data
        form_data_json = json.loads(form_data)
        logger.info(f"Received form submission with {len(files) if files else 0} files")
        logger.info(f"Form data contains keys: {list(form_data_json.keys())}")
        
        if files:
            logger.info(f"Received files: {[file.filename for file in files if file.filename]}")
        
        # Get applicant identifiers for organization
        applicant_last_name = form_data_json.get('lastName', 'unknown')
        applicant_email = form_data_json.get('email', 'unknown-email')
        applicant_id = f"{applicant_last_name}-{int(time.time())}"  # Add timestamp to make it unique
        
        # Process each file
        uploaded_files = []
        bucket_name = "chat-ai-s3-bucket"
        
        # First, save the form data as a JSON file in S3
        try:
            # Convert form data to pretty-printed JSON for readability
            form_data_formatted = json.dumps(form_data_json, indent=2)
            
            # Create object key for application data
            form_data_key = f"vust/applications/{applicant_id}/application-data.json"
            
            # Upload JSON data to S3
            s3.put_object(
                Bucket=bucket_name,
                Key=form_data_key,
                Body=form_data_formatted,
                ContentType="application/json"
            )
            
            logger.info(f"Successfully saved application data to S3: {form_data_key}")
            
            # Add to uploaded files list
            uploaded_files.append({
                "filename": "application-data.json",
                "s3_path": f"s3://{bucket_name}/{form_data_key}",
                "type": "application_data"
            })
            
        except Exception as data_error:
            logger.error(f"Error saving application data: {str(data_error)}")
            import traceback
            logger.error(traceback.format_exc())
        
        # Then process each uploaded file
        if files:
            for file in files:
                if file.filename:
                    try:
                        file_content = await file.read()
                        file_name = file.filename
                        logger.info(f"Processing file: {file_name}, size: {len(file_content)} bytes")
                        
                        # Upload to S3 with better organization
                        object_key = f"vust/applications/{applicant_id}/files/{file_name}"
                        s3.put_object(
                            Bucket=bucket_name, 
                            Key=object_key,
                            Body=file_content, 
                            ContentType=file.content_type
                        )
                        logger.info(f"Successfully uploaded {file_name} to S3")
                        
                        uploaded_files.append({
                            "filename": file_name,
                            "s3_path": f"s3://{bucket_name}/{object_key}",
                            "type": "document"
                        })
                    except Exception as file_error:
                        logger.error(f"Error processing file {file.filename}: {str(file_error)}")
                        import traceback
                        logger.error(traceback.format_exc())
        
        # Return success response with information about all saved data
        return {
            "status": "success",
            "message": "Application submitted successfully",
            "applicant_id": applicant_id,
            "uploaded_files": uploaded_files
        }
    except Exception as e:
        logger.error(f"Error submitting application: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error submitting application: {str(e)}")

'''
