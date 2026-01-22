import json
import requests
from aws_lambda_powertools import Logger
from requests.exceptions import RequestException
from config import EXPERIAN_USERNAME, EXPERIAN_PASSWORD, EXPERIAN_CLIENT_ID, EXPERIAN_SECRET

logger = Logger()


def experian_token_handler():
    """
    AWS Lambda function to call Experian's token endpoint and retrieve an access token.
    """
    # API endpoint and headers
    url = "https://sandbox-us-api.experian.com/oauth2/v1/token"
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

    # Request payload
    payload = {
        "username": EXPERIAN_USERNAME,
        "password": EXPERIAN_PASSWORD,
        "client_id": EXPERIAN_CLIENT_ID,
        "client_secret": EXPERIAN_SECRET
    }

    try:
        # Make the POST request to Experian
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()

        # Parse the JSON response
        data = response.json()
        logger.info("experian data: ", data)

        return {
            "access_token": data.get("access_token"),
            "expires_in": data.get("expires_in"),
            "token_type": data.get("token_type"),
            "refresh_token": data.get("refresh_token"),
        }
    except RequestException as e:
        # Handle any errors in the request
        return {
            "error": str(e),
            "message": "Failed to retrieve access token from Experian."
        }


def credit_report_handler():
    url = "https://sandbox-us-api.experian.com/oauth2/v1/token"
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

    # Request payload
    payload = {
        "username": EXPERIAN_USERNAME,
        "password": EXPERIAN_PASSWORD,
        "client_id": EXPERIAN_CLIENT_ID,
        "client_secret": EXPERIAN_SECRET
    }

    # Make the POST request to Experian
    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()

    # Parse the JSON response
    data = response.json()
    authorization_token = data.get("access_token")
    logger.info(f"authorization_token: {authorization_token}")

    """
    AWS Lambda function to call Experian's Credit Report API.
    """
    # body = json.loads(event["body"])
    # authorization_token = body.get("experian_access_token")
    # API endpoint and headers
    url = "https://sandbox-us-api.experian.com/consumerservices/credit-profile/v2/credit-report"
    headers = {
        "accept": "application/json",
        "clientReferenceId": "SBMYSQL",
        # Authorization token passed in the event
        # event.get("authorization_token", ""),
        "authorization": "Bearer " + authorization_token,
        "Content-Type": "application/json"
    }

    # Hardcode the payload
    payload = {
        "requestor": {
            "subscriberCode": "2222222"
        },
        "numericInquiry": {
            "addressNumber": "1400",
            "addressZip": "20744",
            "ssn": "999999999"
        }
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        logger.info("credit report : ", json.dumps(response.json()))

        return response.json()
    except RequestException as e:
        logger.error("error:", str(e))
        return {
            "error": str(e),
            "message": "Failed to retrieve credit report from Experian."
        }
