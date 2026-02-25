# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

Ambitology is a dual-architecture application with separate frontend and backend deployments:

### Frontend (AWS Amplify + Next.js)
- **Location**: Root directory (`/`)
- **Framework**: Next.js 14 with App Router and TypeScript
- **Deployment**: AWS Amplify (automated via `amplify.yml`)
- **Authentication**: AWS Cognito with Amplify UI React components
- **Key Integrations**: Plaid SDK for banking, Stripe for payments

### Backend (AWS SAM + Python)
- **Location**: `backend/debt-away/`
- **Framework**: FastAPI with AWS Lambda (using Mangum adapter)
- **Infrastructure**: AWS SAM templates (`template.yaml`)
- **Database**: DynamoDB (local development supported)
- **Key Services**: S3 for file storage, API Gateway for routing

### Environment Configuration
- **Frontend**: Environment-specific API endpoints configured in `app/components/config.ts`
  - Development: `http://127.0.0.1:3000` (SAM local)
  - Production: AWS API Gateway endpoint
- **Backend**: Environment variables managed through SAM parameters (Plaid, Experian, OpenRouter API keys, etc.)

## Development Commands

### Frontend Development
```bash
# Install dependencies and start development server
npm ci
npm run dev

# Build and deployment (handled by Amplify)
npm run build
npm run lint

# Amplify backend deployment
npx ampx pipeline-deploy --branch $AWS_BRANCH --app-id $AWS_APP_ID
```

### Backend Development
```bash
cd backend/debt-away

# Local development with SAM
./sam_build_run.sh    # Builds and starts local API on port 3000
./prod_deployment.sh  # Deploys to AWS

# Manual SAM commands
sam build -u
sam local start-api --port 3000 --parameter-overrides "..."
sam deploy --parameter-overrides "..."

# Testing
pip install -r tests/requirements.txt
python -m pytest tests/unit -v
AWS_SAM_STACK_NAME="debt-away" python -m pytest tests/integration -v
```

### Local DynamoDB Setup
```bash
# Run from external DynamoDB Local installation
cd /path/to/dynamodb_local_latest
export PATH="/usr/local/opt/openjdk@17/bin:$PATH"
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb

# Verify tables
aws dynamodb list-tables --endpoint-url http://localhost:8000
aws dynamodb scan --table-name PlaidTokenTable --endpoint-url http://localhost:8000
```

## Key Technical Patterns

### Authentication Flow
- Frontend uses AWS Amplify Authenticator component with Cognito
- User authentication state managed in `app/page.tsx`
- User profile and session data handled via `app/components/link.ts`

### API Integration Pattern
- Frontend → Backend communication via configurable endpoints
- Plaid integration: Link token creation → Bank account linking → Data exchange
- Payment processing: Stripe integration for premium features

### File Upload Handling
- Backend supports multipart/form-data for file uploads
- S3 integration for persistent file storage
- Binary media types configured in API Gateway (audio/wav, audio/mpeg, multipart/form-data)

### State Management
- React hooks for local state management
- Plaid Link integration with `react-plaid-link`
- User session state synchronized between components

## Important Files and Configurations

### Frontend Configuration
- `amplify.yml`: Amplify build and deployment configuration
- `amplify/`: Backend resource definitions (auth, data)
- `app/components/config.ts`: Environment-specific API endpoints
- `next.config.js`: Next.js configuration with image domains

### Backend Configuration
- `template.yaml`: SAM infrastructure definition
- `samconfig.toml`: SAM CLI configuration
- `api/app.py`: Main FastAPI application with CORS and routing
- Environment variables require `.env` file for local development

### Development Scripts
- `sam_build_run.sh`: Local development with hot reload
- `prod_deployment.sh`: Production deployment with parameter injection

## External Service Dependencies

### Required API Keys/Configuration
- **Plaid**: Banking integration (CLIENT_ID, SECRET, ENV)
- **Experian**: Credit data (USERNAME, PASSWORD, CLIENT_ID, SECRET)
- **Stripe**: Payment processing (SECRET_KEY)
- **OpenRouter**: AI services (API_KEY)

### Development vs Production
- API endpoint switching handled automatically via `NODE_ENV`
- SAM local development uses port 3000 (conflicts with Next.js require separate ports)
- DynamoDB local development requires separate Java installation

## Testing Strategy
- Backend: pytest with unit and integration test separation
- Frontend: Next.js built-in linting
- Integration tests require deployed SAM stack for AWS resource testing