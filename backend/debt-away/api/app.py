import boto3
import json
import stripe
import uuid
import time
from datetime import datetime
from config import STRIPE_SECRET_KEY, OPENAI_APIKEY
import openai
import requests
from bs4 import BeautifulSoup
import PyPDF2
import io
from aws_lambda_powertools import Logger
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request, Query, HTTPException, File, UploadFile, Form
from mangum import Mangum  # type: ignore
import asyncio
from pydantic import BaseModel
from typing import List, Optional, Dict, Any


logger = Logger()
s3 = boto3.client("s3", region_name="us-east-1")
stripe.api_key = STRIPE_SECRET_KEY

# Initialize OpenAI client
client = openai.OpenAI(api_key=OPENAI_APIKEY)

# Pydantic models for structured output
class AspectScore(BaseModel):
    score: int  # 1-10
    strengths: List[str]
    improvements: List[str]  # 2-5 improvement advice

class BackgroundInfo(BaseModel):
    full_name: Optional[str] = None
    email_address: Optional[str] = None
    home_address: Optional[str] = None
    personal_website: Optional[str] = None

class EducationInfo(BaseModel):
    college_name: Optional[str] = None
    degree: Optional[str] = None
    major: Optional[str] = None
    location: Optional[str] = None
    duration: Optional[str] = None
    gpa: Optional[str] = None
    coursework: List[str] = []

class ProfessionalInfo(BaseModel):
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    location: Optional[str] = None
    duration: Optional[str] = None
    technologies_used: List[str] = []

class TechnicalSkills(BaseModel):
    domain_knowledge: List[str] = []
    technologies: List[str] = []
    tools: List[str] = []
    software: List[str] = []

class TeamworkInfo(BaseModel):
    teamwork_experience: List[str] = []
    leadership_experience: List[str] = []

class ATSReview(BaseModel):
    formatting_issues: List[str] = []
    syntax_issues: List[str] = []
    ats_compatibility_score: int  # 0-100

class ResumeParsedData(BaseModel):
    background: BackgroundInfo
    education: List[EducationInfo]
    professional: List[ProfessionalInfo]
    technical_skills: TechnicalSkills
    teamwork: TeamworkInfo
    ats_review: ATSReview

class ResumeAnalysis(BaseModel):
    background_score: int  # 1-10
    education_score: int  # 1-10
    professional_score: int  # 1-10
    technical_skills_score: int  # 1-10
    teamwork_score: int  # 1-10
    ats_score: int  # 1-10
    overall_score: int  # 1-10
    background_improvements: List[str] = []
    education_improvements: List[str] = []
    professional_improvements: List[str] = []
    technical_skills_improvements: List[str] = []
    teamwork_improvements: List[str] = []
    ats_improvements: List[str] = []
    general_improvements: List[str] = []

class JobMatchAnalysis(BaseModel):
    standardized_title: str
    technical_skills: List[str]
    soft_skills: List[str]
    industry: str
    experience_level: str
    key_responsibilities: List[str]
    salary_range: Optional[str]
    company_name: Optional[str]

    # User comparison and scoring
    background_score: AspectScore
    education_score: AspectScore
    professional_score: AspectScore
    tech_skills_score: AspectScore
    teamwork_score: AspectScore
    job_match_score: AspectScore

    overall_score: int  # 1-100
    analysis_confidence: str  # high/medium/low
    resume_analysis: Optional[ResumeAnalysis] = None

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
        dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
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



@app.post("/job_application")
async def job_application(
    firstName: str = Form(...),
    lastName: str = Form(...),
    email: str = Form(...),
    phoneNumber: str = Form(...),
    isStudent: str = Form(...),
    currentEmployer: str = Form(...),
    linkedinUrl: str = Form(...),
    githubUrl: str = Form(...),
    portfolioUrl: str = Form(...),
    websiteUrl: str = Form(...),
    selectedPosition: str = Form(...),
    resume: UploadFile = File(None)
):
    try:
        logger.info(f"Received job application request")
        logger.info(f"Resume parameter: {resume}")
        logger.info(f"Resume filename: {resume.filename if resume else 'None'}")
        logger.info(f"Resume content_type: {resume.content_type if resume else 'None'}")
        
        full_name = f"{firstName} {lastName}"
        logger.info(f"Processing job application for {full_name} ({email})")
        
        # S3 bucket and date
        bucket_name = "career-landing-group"
        current_date = datetime.now().strftime("%Y-%m-%d")
        base_submission_id = f"{email}-{current_date}"
        client_uuid = str(uuid.uuid4())
        submission_id = f"{base_submission_id}-{client_uuid}"
        
        logger.info(f"Generated unique submission ID: {submission_id}")
        logger.info(f"UUID component: {client_uuid}")
        
        # Save file to S3 for later processing (non-blocking) - following resume_analysis_lab pattern
        file_content = None
        file_name = None
        object_key = None
        
        if resume is not None:
            logger.info(f"Resume file received: {resume.filename}, size: {resume.size}, type: {resume.content_type}")
            file_content = await resume.read()
            file_name = resume.filename
            object_key = f"job_application/{submission_id}/{file_name}"
            logger.info(f"File content read, size: {len(file_content)} bytes")
            
            async def upload_file_to_s3():
                try:
                    s3.put_object(
                        Bucket=bucket_name, 
                        Key=object_key,
                        Body=file_content, 
                        ContentType=resume.content_type
                    )
                    logger.info(f"Resume file saved to S3: {object_key}")
                except Exception as e:
                    logger.error(f"Error uploading file to S3: {str(e)}")
                    raise
            
            asyncio.create_task(upload_file_to_s3())
        else:
            logger.info("No resume file provided")
        
        # Store client info as JSON (non-blocking)
        client_info = {
            "client_uuid": client_uuid,
            "email": email,
            "firstName": firstName,
            "lastName": lastName,
            "full_name": full_name,
            "phoneNumber": phoneNumber,
            "isStudent": isStudent,
            "currentEmployer": currentEmployer,
            "linkedinUrl": linkedinUrl,
            "githubUrl": githubUrl,
            "portfolioUrl": portfolioUrl,
            "websiteUrl": websiteUrl,
            "selectedPosition": selectedPosition,
            "submission_date": current_date,
            "submission_id": submission_id,
        }
        
        # Add resume info if file was uploaded
        if resume is not None and file_name and object_key:
            client_info["file_name"] = file_name
            client_info["resume_link"] = f"https://career-landing-group.s3.us-east-1.amazonaws.com/{object_key}"
        
        async def upload_client_info_to_s3():
            client_info_json = json.dumps(client_info, indent=2)
            info_key = f"job_application/{submission_id}/client_info.json"
            s3.put_object(
                Bucket=bucket_name,
                Key=info_key,
                Body=client_info_json,
                ContentType="application/json"
            )
            logger.info(f"Client information saved to S3: {info_key}")
        asyncio.create_task(upload_client_info_to_s3())
        
        logger.info(f"Job application processed successfully for {full_name} ({email})")
        
        return {
            "status": "success",
            "message": "Job application submitted successfully",
            "submission_id": submission_id,
            "client_uuid": client_uuid
        }
    except Exception as e:
        logger.error(f"Error in job application: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error processing job application: {str(e)}")


@app.post("/referral_application")
async def referral_application(file: UploadFile = File(...), form_data: str = Form(...)):
    try:
        logger.info(f"Received referral application request")
        
        # Parse form data
        form_data_json = json.loads(form_data)
        email = form_data_json.get('email', '')
        
        logger.info(f"Processing referral application for ({email})")
        
        # Save file to S3 for later processing (non-blocking)
        bucket_name = "career-landing-group"
        current_date = datetime.now().strftime("%Y-%m-%d")
        base_submission_id = f"{email}-{current_date}"
        client_uuid = str(uuid.uuid4())
        submission_id = f"{base_submission_id}-{client_uuid}"
        file_content = await file.read()
        file_name = file.filename
        object_key = f"referral/{submission_id}/{file_name}"
        
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
        info_key = f"referral/{submission_id}/client_info.json"
        client_info = {
            "client_uuid": client_uuid,
            "email": email,
            "submission_id": submission_id,
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
        
        logger.info(f"Referral application processed successfully for ({email})")
        
        return {
            "status": "success",
            "message": "Referral application submitted successfully",
            "submission_id": submission_id,
            "client_uuid": client_uuid
        }
    except Exception as e:
        logger.error(f"Error in referral application: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error processing referral application: {str(e)}")


async def extract_text_from_pdf(file_content: bytes) -> str:
    """
    Extract text content from PDF file bytes
    """
    try:
        # Create a BytesIO object from the file content
        pdf_file = io.BytesIO(file_content)
        
        # Create PDF reader object
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        # Extract text from all pages
        text_content = ""
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text_content += page.extract_text() + "\n"
        
        logger.info(f"Successfully extracted text from PDF with {len(pdf_reader.pages)} pages")
        return text_content.strip()
        
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {str(e)}")
        # Fallback: try to decode as text if it's not a PDF
        try:
            return file_content.decode('utf-8', errors='ignore')
        except:
            return "Unable to extract text from file"


async def fetch_web_page_content(url: str):
    """
    Fetch and extract text content from a web page URL
    """
    try:
        logger.info(f"Fetching web page content from: {url}")
        
        # Validate URL format
        if not url.startswith(('http://', 'https://')):
            logger.warning(f"Invalid URL format: {url}")
            return f"Invalid URL format: {url}"
        
        # Add headers to mimic a real browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        }
        
        # Make the request with timeout
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        # Check if content is HTML
        content_type = response.headers.get('content-type', '').lower()
        if 'text/html' not in content_type:
            logger.warning(f"Non-HTML content type: {content_type}")
            return f"Non-HTML content detected: {content_type}"
        
        # Parse the HTML content
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer", "header"]):
            script.decompose()
        
        # Extract text content
        text_content = soup.get_text()
        
        # Clean up the text
        lines = (line.strip() for line in text_content.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = ' '.join(chunk for chunk in chunks if chunk)
        
        # Check if we got meaningful content
        if len(text.strip()) < 50:
            logger.warning(f"Very little content extracted: {len(text)} characters")
            return f"Very little content extracted from the page. This might not be a valid job posting."
        
        # Limit content length to avoid token limits (keep first 8000 characters)
        if len(text) > 4000:
            text = text[:4000] + "... [content truncated]"
        
        logger.info(f"Successfully extracted {len(text)} characters from web page")
        return text
        
    except requests.exceptions.Timeout:
        logger.error(f"Timeout fetching web page: {url}")
        return f"Timeout fetching web page content from: {url}"
    except requests.exceptions.ConnectionError:
        logger.error(f"Connection error fetching web page: {url}")
        return f"Connection error fetching web page content from: {url}"
    except requests.exceptions.HTTPError as e:
        logger.error(f"HTTP error fetching web page: {str(e)}")
        return f"HTTP error fetching web page content: {str(e)}"
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error fetching web page: {str(e)}")
        return f"Request error fetching web page content: {str(e)}"
    except ImportError as e:
        logger.error(f"Missing dependency: {str(e)}")
        return f"Missing dependency for web scraping: {str(e)}"
    except Exception as e:
        logger.error(f"Unexpected error parsing web page content: {str(e)}")
        return f"Unexpected error parsing web page content: {str(e)}"


async def analyze_target_job_with_openai(target_job: str, user_data: dict = None):
    """
    Analyze target job using OpenAI GPT-4o-mini with web page content and compare with user data
    """
    try:
        logger.info(f"Analyzing target job with OpenAI: {target_job}")
        
        # First, fetch the web page content
        web_content = await fetch_web_page_content(target_job)
        
        # Build user profile summary
        user_profile = ""
        if user_data:
            user_profile = f"""
            USER PROFILE:
            Name: {user_data.get('firstName', '')} {user_data.get('lastName', '')}
            Education: {user_data.get('degree', '')} in {user_data.get('major', '')} from {user_data.get('collegeName', '')} ({user_data.get('graduationYear', '')})
            Technical Skills:
            - Programming Languages: {user_data.get('programmingLanguages', '')}
            - Frameworks: {user_data.get('frameworks', '')}
            - Databases: {user_data.get('databases', '')}
            - Tools: {user_data.get('tools', '')}
            Work Experience: {len(user_data.get('workExperiences', []))} positions
            """

            # Add work experience details
            work_experiences = user_data.get('workExperiences', [])
            if work_experiences:
                user_profile += "\nWork Experience Details:\n"
                for i, exp in enumerate(work_experiences, 1):
                    user_profile += f"{i}. {exp.get('title', '')} at {exp.get('company', '')} ({exp.get('startDate', '')} - {exp.get('endDate', 'Present')})\n"
                    user_profile += f"   Description: {exp.get('description', '')}\n"

        # Create the comprehensive prompt
        prompt = f"""
        Analyze the following job posting and compare it with the user's profile:

        JOB POSTING:
        URL: "{target_job}"
        Content: {web_content}

        {user_profile}

        ANALYSIS REQUIREMENTS:
        1. Extract job details from the posting content:
           - standardized_title: Clean, professional job title
           - company_name: Extract the company/organization name from the job posting
           - technical_skills: Required programming languages, frameworks, tools
           - soft_skills: Communication, leadership, teamwork requirements
           - industry: Business sector (e.g., Technology, Finance, Healthcare)
           - experience_level: Entry, Mid, Senior level
           - key_responsibilities: Main job duties and tasks
           - salary_range: Compensation if mentioned

        2. Compare user profile against job requirements
        3. Score each aspect (1-10) with specific strengths and 2-5 improvement recommendations:
           - Background: Overall professional background alignment
           - Education: Degree relevance, school prestige, academic achievements
           - Professional: Work experience relevance, career progression, industry experience
           - Technical Skills: Programming languages, frameworks, tools alignment
           - Teamwork: Collaboration skills, team leadership, communication
           - Job Match: Overall fit for this specific position

        4. Provide overall score (1-100) representing job match percentage

        For each improvement recommendation, be specific and actionable (e.g., "Learn React.js through online courses" instead of "Improve frontend skills").

        IMPORTANT: Pay special attention to extracting the actual company name from the job posting content.
        """
        
        # Call OpenAI GPT-4o-mini with structured output using responses.parse
        response = client.responses.parse(
            model="gpt-4o-mini",
            input=[
                {
                    "role": "system",
                    "content": "You are a career analyst with access to current job market data. Analyze job positions and provide detailed information about required skills, industry trends, and market insights. Compare user profiles against job requirements and provide specific, actionable improvement recommendations."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            text_format=JobMatchAnalysis
        )
        
        # Extract the parsed structured analysis
        analysis_data = response.output_parsed

        logger.info(f"OpenAI analysis completed for job: {target_job}")
        logger.info(f"Analysis result: {analysis_data}")

        return {
            "success": True,
            "analysis": analysis_data.dict(),
            "structured_output": True
        }
        
    except Exception as e:
        logger.error(f"Error in OpenAI job analysis: {str(e)}")
        # Create default AspectScore for error case
        default_aspect = {
            "score": 1,
            "strengths": ["Analysis could not be completed"],
            "improvements": ["Please try again later", "Ensure job URL is accessible"]
        }

        return {
            "success": False,
            "error": str(e),
            "analysis": {
                "standardized_title": target_job,
                "technical_skills": [],
                "soft_skills": [],
                "industry": "Unknown",
                "experience_level": "Unknown",
                "key_responsibilities": [],
                "salary_range": "Unknown",
                "company_name": "Unknown",
                "background_score": default_aspect,
                "education_score": default_aspect,
                "professional_score": default_aspect,
                "tech_skills_score": default_aspect,
                "teamwork_score": default_aspect,
                "job_match_score": default_aspect,
                "overall_score": 1,
                "analysis_confidence": "low"
            }
        }


async def parse_resume_with_openai(resume_content: str):
    """
    Parse resume content using OpenAI GPT-4o-mini as a file parser, ATS checker, and job recruiter
    """
    try:
        logger.info("Starting resume parsing with OpenAI...")
        
        prompt = f"""
        You are an expert resume parser, ATS (Application Tracking System) checker, and job recruiter. 
        Parse the following resume content and extract structured information.

        RESUME CONTENT:
        {resume_content}

        EXTRACTION REQUIREMENTS:
        1. Background Information:
           - Full name
           - Email address
           - Home address
           - Personal website

        2. Education (extract ALL education entries):
           - College/university name
           - Degree type
           - Major/field of study
           - Location
           - Duration (start and end dates)
           - GPA (if mentioned)
           - Relevant coursework

        3. Professional Experience (extract ALL work entries):
           - Company name
           - Job title
           - Location
           - Duration (start and end dates)
           - Technologies/tools used in projects

        4. Technical Skills:
           - Domain knowledge areas
           - Technologies mentioned
           - Tools used
           - Software applications

        5. Teamwork:
           - Teamwork experiences mentioned
           - Leadership experiences mentioned

        6. ATS Review:
           - Formatting issues that could affect ATS parsing
           - Syntax issues in the document
           - ATS compatibility score (0-100)

        IMPORTANT:
        - Extract ALL instances of education and work experience (not just the first one)
        - If information is not available, leave as null/empty
        - Be thorough in identifying all technologies, tools, and skills mentioned
        - Focus on ATS compatibility issues that could prevent resume parsing
        - Provide specific, actionable feedback for ATS optimization
        """
        
        # Call OpenAI with structured output for resume parsing
        response = client.responses.parse(
            model="gpt-4o-mini",
            input=[
                {
                    "role": "system",
                    "content": "You are an expert resume parser, ATS specialist, and technical recruiter with deep knowledge of resume formats, applicant tracking systems, and technical hiring. Extract comprehensive information from resumes with high accuracy and attention to ATS compatibility."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            text_format=ResumeParsedData
        )
        
        # Extract the parsed structured data
        parsed_data = response.output_parsed
        
        logger.info(f"Resume parsing completed successfully")
        logger.info(f"Resume parsed data: {parsed_data}")
        
        return {
            "success": True,
            "parsed_data": parsed_data.dict(),
            "structured_output": True
        }
        
    except Exception as e:
        logger.error(f"Error in resume parsing: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "parsed_data": {
                "background": {
                    "full_name": None,
                    "email_address": None,
                    "home_address": None,
                    "personal_website": None
                },
                "education": [],
                "professional": [],
                "technical_skills": {
                    "domain_knowledge": [],
                    "technologies": [],
                    "tools": [],
                    "software": []
                },
                "teamwork": {
                    "teamwork_experience": [],
                    "leadership_experience": []
                },
                "ats_review": {
                    "formatting_issues": ["Resume parsing failed"],
                    "syntax_issues": ["Unable to parse resume"],
                    "ats_compatibility_score": 0
                }
            }
        }


async def analyze_resume_with_openai(resume_parsed_data: dict, job_requirements: str):
    """
    Analyze parsed resume data using OpenAI GPT-4o-mini as a technical recruiter/HR
    """
    try:
        logger.info("Starting resume analysis with OpenAI...")
        
        prompt = f"""
        You are an experienced technical recruiter and HR professional. 
        Analyze the following parsed resume data against the job requirements and provide comprehensive feedback.

        JOB REQUIREMENTS:
        {job_requirements}

        PARSED RESUME DATA:
        {resume_parsed_data}

        ANALYSIS REQUIREMENTS:
        For each section (Background, Education, Professional, Technical Skills, Teamwork, ATS), provide:
        1. Score (1-10): How well does this section align with job requirements?
        2. Improvement suggestions: Specific, actionable advice to improve this section

        Focus on:
        - How well the resume content matches the job requirements
        - Missing information that would strengthen the application
        - Areas where the candidate could better highlight relevant experience
        - ATS optimization opportunities
        - Specific improvements to make the resume more competitive

        Provide specific, actionable feedback that would help the candidate improve their resume for this specific role.
        Only include non-empty, relevant improvement suggestions.
        """
        
        # Call OpenAI with structured output for resume analysis
        response = client.responses.parse(
            model="gpt-4o-mini",
            input=[
                {
                    "role": "system",
                    "content": "You are an expert technical recruiter and HR professional with deep knowledge of resume optimization and technical hiring. Analyze parsed resume data with the perspective of both human recruiters and ATS systems to provide comprehensive, actionable feedback."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            text_format=ResumeAnalysis
        )
        
        # Extract the parsed structured analysis
        analysis_data = response.output_parsed
        
        logger.info(f"Resume analysis completed successfully")
        logger.info(f"Resume analysis result: {analysis_data}")
        
        return {
            "success": True,
            "analysis": analysis_data.dict(),
            "structured_output": True
        }
        
    except Exception as e:
        logger.error(f"Error in resume analysis: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "analysis": {
                "background_score": 1,
                "education_score": 1,
                "professional_score": 1,
                "technical_skills_score": 1,
                "teamwork_score": 1,
                "ats_score": 1,
                "overall_score": 1,
                "background_improvements": ["Analysis could not be completed"],
                "education_improvements": ["Unable to analyze education"],
                "professional_improvements": ["Unable to analyze professional experience"],
                "technical_skills_improvements": ["Unable to analyze technical skills"],
                "teamwork_improvements": ["Unable to analyze teamwork"],
                "ats_improvements": ["Unable to analyze ATS compatibility"],
                "general_improvements": ["Please try again later"]
            }
        }


@app.post("/ambit_alpha")
async def ambit_alpha(
    target_job: str = Form(...),
    form_data: str = Form(...),
    resume_file: UploadFile = File(None)
):
    try:
        logger.info("icoico: Received Ambit Alpha analysis request")
        
        # Parse form data
        import json
        form_data_parsed = json.loads(form_data) if form_data else {}
        
        # Analyze target job with OpenAI using user data
        logger.info("Starting OpenAI job analysis with user data comparison...")
        try:
            job_analysis_result = await analyze_target_job_with_openai(target_job, form_data_parsed)
            logger.info("OpenAI analysis completed successfully")
        except Exception as e:
            logger.error(f"Error in OpenAI analysis: {str(e)}")
            # Create default AspectScore for error case
            default_aspect = {
                "score": 1,
                "strengths": ["Analysis could not be completed"],
                "improvements": ["Please try again later", "Ensure job URL is accessible"]
            }
            job_analysis_result = {
                "success": False,
                "error": str(e),
                "analysis": {
                    "standardized_title": target_job,
                    "technical_skills": [],
                    "soft_skills": [],
                    "industry": "Unknown",
                    "experience_level": "Unknown",
                    "key_responsibilities": [],
                    "salary_range": "Unknown",
                    "company_name": "Unknown",
                    "background_score": default_aspect,
                    "education_score": default_aspect,
                    "professional_score": default_aspect,
                    "tech_skills_score": default_aspect,
                    "teamwork_score": default_aspect,
                    "job_match_score": default_aspect,
                    "overall_score": 1,
                    "analysis_confidence": "low"
                }
            }
        
        # Log resume file information
        resume_info = "No resume file uploaded"
        resume_analysis_result = None
        
        if resume_file and resume_file.filename:
            resume_info = f"Resume file: {resume_file.filename} ({resume_file.content_type}, {resume_file.size} bytes)"
            logger.info(f"Resume file details: {resume_info}")
            
            # Analyze resume if file is provided
            try:
                logger.info("Starting resume parsing and analysis...")
                resume_content = await resume_file.read()
                
                # Check if it's a PDF file and extract text properly
                if resume_file.content_type == 'application/pdf' or resume_file.filename.lower().endswith('.pdf'):
                    logger.info("Detected PDF file, extracting text...")
                    resume_text = await extract_text_from_pdf(resume_content)
                else:
                    # For non-PDF files, try to decode as text
                    resume_text = resume_content.decode('utf-8', errors='ignore')
                
                logger.info("Step 0: Extracted resume text content (first 200 chars): %s", resume_text[:200] if resume_text else "No content")
                
                # Step 1: Parse resume content
                logger.info("Step 1: Parsing resume content...")
                resume_parsing_result = await parse_resume_with_openai(resume_text)
                
                if not resume_parsing_result.get("success"):
                    logger.error(f"Resume parsing failed: {resume_parsing_result.get('error')}")
                    raise Exception(f"Resume parsing failed: {resume_parsing_result.get('error')}")
                
                # Step 2: Analyze parsed resume data
                logger.info("Step 2: Analyzing parsed resume data...")
                
                # Create job requirements summary for resume analysis
                job_requirements = f"""
                Job Title: {job_analysis_result.get('analysis', {}).get('standardized_title', target_job)}
                Technical Skills Required: {', '.join(job_analysis_result.get('analysis', {}).get('technical_skills', []))}
                Soft Skills Required: {', '.join(job_analysis_result.get('analysis', {}).get('soft_skills', []))}
                Industry: {job_analysis_result.get('analysis', {}).get('industry', 'Unknown')}
                Experience Level: {job_analysis_result.get('analysis', {}).get('experience_level', 'Unknown')}
                Key Responsibilities: {', '.join(job_analysis_result.get('analysis', {}).get('key_responsibilities', []))}
                """
                
                resume_analysis_result = await analyze_resume_with_openai(
                    resume_parsing_result.get('parsed_data', {}), 
                    job_requirements
                )
                
                # Combine parsing and analysis results
                resume_analysis_result['parsed_data'] = resume_parsing_result.get('parsed_data', {})
                logger.info("Resume parsing and analysis completed successfully")
                
            except Exception as e:
                logger.error(f"Error in resume analysis: {str(e)}")
                resume_analysis_result = {
                    "success": False,
                    "error": str(e),
                    "analysis": {
                        "ats_score": 0,
                        "resume_strengths": ["Resume analysis failed"],
                        "resume_weaknesses": ["Unable to analyze resume"],
                        "missing_keywords": ["Analysis error"],
                        "formatting_issues": ["Unable to assess"],
                        "improvement_suggestions": ["Please try again"],
                        "overall_resume_rating": 1,
                        "recruiter_feedback": "Resume analysis encountered an error. Please try again."
                    }
                }
        
        # Log the complete user data
        #logger.info("=== AMBIT ALPHA USER DATA ===")
        #logger.info(f"Target Job: {target_job}")
        #logger.info(f"Form Data: {json.dumps(form_data_parsed, indent=2)}")
        #logger.info(f"Resume: {resume_info}")
        
        # Log OpenAI job analysis results
        #logger.info("=== OPENAI JOB ANALYSIS ===")
        if job_analysis_result.get("success"):
            analysis_data = job_analysis_result.get("analysis", {})
            #logger.info(f"Standardized Title: {analysis_data.get('standardized_title', 'N/A')}")
            #logger.info(f"Technical Skills: {analysis_data.get('technical_skills', [])}")
            #logger.info(f"Soft Skills: {analysis_data.get('soft_skills', [])}")
            #logger.info(f"Industry: {analysis_data.get('industry', 'N/A')}")
            #logger.info(f"Experience Level: {analysis_data.get('experience_level', 'N/A')}")
            #logger.info(f"Salary Range: {analysis_data.get('salary_range', 'N/A')}")
            #logger.info(f"Analysis Confidence: {analysis_data.get('analysis_confidence', 'N/A')}")
        else:
            logger.warning(f"OpenAI analysis failed: {job_analysis_result.get('error', 'Unknown error')}")
        
        # Extract specific sections for detailed logging
        basic_info = {
            'firstName': form_data_parsed.get('firstName', ''),
            'lastName': form_data_parsed.get('lastName', ''),
            'email': form_data_parsed.get('email', ''),
            'phoneNumber': form_data_parsed.get('phoneNumber', '')
        }
        
        education_info = {
            'collegeName': form_data_parsed.get('collegeName', ''),
            'degree': form_data_parsed.get('degree', ''),
            'major': form_data_parsed.get('major', ''),
            'graduationYear': form_data_parsed.get('graduationYear', '')
        }
        
        skills_info = {
            'programmingLanguages': form_data_parsed.get('programmingLanguages', ''),
            'frameworks': form_data_parsed.get('frameworks', ''),
            'databases': form_data_parsed.get('databases', ''),
            'tools': form_data_parsed.get('tools', '')
        }
        
        work_experience = form_data_parsed.get('workExperiences', [])
        
        # Log detailed breakdown
        logger.info("=== DETAILED BREAKDOWN ===")
        logger.info(f"Basic Info: {json.dumps(basic_info, indent=2)}")
        logger.info(f"Education: {json.dumps(education_info, indent=2)}")
        logger.info(f"Skills: {json.dumps(skills_info, indent=2)}")
        logger.info(f"Work Experience ({len(work_experience)} entries): {json.dumps(work_experience, indent=2)}")
        
        # Calculate some basic metrics
        filled_basic_fields = sum(1 for v in basic_info.values() if v.strip())
        filled_education_fields = sum(1 for v in education_info.values() if v.strip())
        filled_skills_fields = sum(1 for v in skills_info.values() if v.strip())
        total_work_entries = len(work_experience)
        
        logger.info("=== ANALYSIS METRICS ===")
        logger.info(f"Filled Basic Info Fields: {filled_basic_fields}/4")
        logger.info(f"Filled Education Fields: {filled_education_fields}/4")
        logger.info(f"Filled Skills Fields: {filled_skills_fields}/4")
        logger.info(f"Work Experience Entries: {total_work_entries}")
        
        # Log completion status
        completion_percentage = ((filled_basic_fields + filled_education_fields + filled_skills_fields) / 12) * 100
        logger.info(f"Form Completion: {completion_percentage:.1f}%")
        
        logger.info("=== AMBIT ALPHA ANALYSIS COMPLETE ===")
        
        # Combine job analysis with resume analysis
        combined_analysis = job_analysis_result.copy()
        if resume_analysis_result:
            combined_analysis["analysis"]["resume_analysis"] = resume_analysis_result.get("analysis")
        
        return {
            "status": "success",
            "message": "Ambit Alpha analysis data received and logged successfully",
            "analysis_id": f"ambit_alpha_{int(time.time())}",
            "completion_percentage": round(completion_percentage, 1),
            "resume_uploaded": resume_file and resume_file.filename is not None,
            "job_analysis": combined_analysis,
            "resume_analysis": resume_analysis_result,
            "data_summary": {
                "target_job": target_job,
                "basic_info_complete": filled_basic_fields,
                "education_complete": filled_education_fields,
                "skills_complete": filled_skills_fields,
                "work_experience_count": total_work_entries,
                "resume_file": resume_info
            }
        }
        
    except Exception as e:
        logger.error(f"Error in ambit_alpha: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error processing Ambit Alpha analysis: {str(e)}")
