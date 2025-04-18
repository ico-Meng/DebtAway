import os
import boto3
import json
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


from fastapi import FastAPI, Request, Query, HTTPException, File, UploadFile, Form
from mangum import Mangum  # type: ignore
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from config import PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV, OPENROUTER_APIKEY

from aws_lambda_powertools import Logger
import time
from openai import OpenAI

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

logger = Logger()

# icoico
transcribe = boto3.client("transcribe", region_name="us-east-1")
polly = boto3.client("polly", region_name="us-east-1")
bedrock = boto3.client("bedrock-runtime")

plaid_env = plaid.Environment.Sandbox if PLAID_ENV == "sandbox" else (
    plaid.Environment.Development if PLAID_ENV == "development" else plaid.Environment.Production
)

plaid_client = plaid_api.PlaidApi(plaid.ApiClient(plaid.Configuration(
    host=plaid_env,
    api_key={
        "clientId": PLAID_CLIENT_ID,
        "secret": PLAID_SECRET,
    }
)))

access_token = None
item_id = None


'''
API Definition
'''

app = FastAPI()

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


@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    response = await call_next(request)
    return response


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
s3 = boto3.client("s3", region_name="us-east-1")


@app.post("/comment-out-video-chat-ai")
# async def chat_ai(file: UploadFile = File(...)):
async def chat_ai(file: UploadFile = File(...)):
    print("icoico chat-ai 1")
    print("icoico file: ", file.filename)

    audio_bytes = await file.read()
    print(f"✅ Audio file size: {len(audio_bytes)} bytes")

    bucket_name = "chat-ai-s3-bucket"
    input_obj_key = "record.wav"

    s3.put_object(Bucket=bucket_name, Key=input_obj_key,
                  Body=audio_bytes, ContentType="audio/wav")
    print("✅ Uploaded user audio to S3.")

    job_name = f"transcribe-job-{int(time.time())}"
    print("icoico job 1")
    s3_uri = f"s3://{bucket_name}/{input_obj_key}"
    print("icoico job 2")
    print("icoico s3_uri: ", s3_uri)
    transcribe.start_transcription_job(
        TranscriptionJobName=job_name,
        Media={"MediaFileUri": s3_uri},
        MediaFormat="wav",
        LanguageCode="en-US"
    )
    print("icoico job 3")
    print(f"✅ Started Transcription Job: {job_name}")

    # ✅ Wait for Transcription Job to Complete
    while True:
        job_status = transcribe.get_transcription_job(
            TranscriptionJobName=job_name)
        if job_status["TranscriptionJob"]["TranscriptionJobStatus"] in ["COMPLETED", "FAILED"]:
            break
        time.sleep(3)  # Wait and check again

    if job_status["TranscriptionJob"]["TranscriptionJobStatus"] == "FAILED":
        print("❌ AWS Transcribe Job Failed")
        raise HTTPException(
            status_code=500, detail="Speech-to-text conversion failed.")

    # ✅ Extract Transcription URL
    transcript_uri = job_status["TranscriptionJob"]["Transcript"]["TranscriptFileUri"]
    print(f"✅ Transcription completed! Transcript URL: {transcript_uri}")

    # ✅ Download Transcription Result
    transcript_response = s3.get_object(
        Bucket=bucket_name, Key="transcript.json")
    transcript_data = json.loads(
        transcript_response["Body"].read().decode("utf-8"))
    extracted_text = transcript_data["results"]["transcripts"][0]["transcript"]

    print(f"✅ Transcribed Text: {extracted_text}")

    # inputText = "This is your AI agent to deal with your debt issue."
    # print(f"inputText = {inputText}")
    response = polly.synthesize_speech(
        Text=extracted_text,
        OutputFormat="mp3",
        VoiceId="Joanna"
    )
    print("icoico after response")
    print(f"icoico response: {response}")
    audio_stream = response["AudioStream"].read()

    object_key = "response.mp3"

    s3.put_object(Bucket=bucket_name, Key=object_key,
                  Body=audio_stream, ContentType="audio/mpeg")

    print("Finished chat_ai")

    return {"audio_url": f"http://localhost:4566/{bucket_name}/{object_key}"}


handler = Mangum(app, lifespan="off")


@app.post("/chat-deepseek")
async def chat_deepseek(request: Request):
    body = await request.json()
    chatContent = body.get("chatContent")

    logger.info(f"chatContent: {chatContent}")

    openai_client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=OPENROUTER_APIKEY,
    )

    completion = openai_client.chat.completions.create(
        model="deepseek/deepseek-chat:free",
        messages=[
            {
                "role": "user",
                "content": str(chatContent)
            }
        ],
        timeout=60
    )
    logger.info("chatResponse: ", completion.choices[0].message.content)

    return {"chatResponse": completion.choices[0].message.content}


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
