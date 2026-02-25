import json
from aws_lambda_powertools import Logger
from plaid.model.user_account_session_get_request import UserAccountSessionGetRequest

logger = Logger()


def test_api_handler(event, context, plaid_client):
    public_token = event.get("queryStringParameters", {}).get("publicToken")
    layer_request = UserAccountSessionGetRequest(
        public_token="profile-sandbox-b0e2c4ee-a763-4df5-bfe9-46a46bce992d")
    layer_response = plaid_client.user_account_session_get(layer_request)
    logger.info(f"layer_response", json.dumps(layer_response))

    return layer_response.json()
