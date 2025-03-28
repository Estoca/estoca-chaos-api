# estoca-mock-api

# Estoca Mock API

As developers, when we need to integrate between systems its often important to have a mock api to test the integration without the need to have the real api ready.

This project is a mock api app that can be used to test the integration between systems. You can configure specific API endpoints to return specific data that you want to test. 

And to help build a anti-fragile system, you can always add **/chaos** add the end of the url that would purposefully break the contract, for example, return a 500 error, or a timeout, or a slow response, or a random delay, or a random body, or a random header, or a random status code, etc.  The idea is to test the system in a real environment where things go wrong and see how it behaves.

Here are a few of the features:

- **Fully dockerized** for easy setup and deployment
- **Google OAuth2 Authentication**
    - On first access, the user will be created in the database
    - The user will be redirected to the Google OAuth2 login page
    - After login, the user will be redirected to the application
- **Postgres database** for data persistence
- **Group-based endpoint organization** (e.g., /erp, /ecommerce)
- **Flexible endpoint configuration**:
    - For each group of endpoints you can configure a new endpoint with a specific path and a specific response.
    - For each endpoint you can configure the following:
        - Path name
        - Method
        - Response Code
        - Response Body
        - Response Headers
    - For each method you can configure the contract with the following:
        - For All methods you can configure the **response** based on a JSON Schema, and each response will be randomly generated based on the JSON Schema.
        - For All methods you can configure the **url parameters** to be expected in the request, configuring each one with a specific type of value, range of values, or a random value. Each parameter can be required or not.
        - For All methods you can configure the **headers** to be expected in the request, configuring each one with a specific type of value, range of values, or a random value. Each header can be required or not.
        - For POST, PUT and PATCH methods you can configure the **body** based on a JSON Schema, and each response will be randomly generated based on the JSON Schema.
        - You can also configure the time to wait before the response is returned, this is to simulate a real request.

## User Flow

- The flow in the frontend should be really simple:
    1. Create a new Group with a name and a description
    2. Create a new Endpoint with a path, method, and a description
        - You can configure the max time to wait before the response is returned
    3. Configure the response with the JSON Schema and status code
    4. If the method is POST, PUT or PATCH, configure the body with the JSON Schema
    5. Configure the url parameters
        - You can add multiples url parameters with name and expected type or range of values, and set if it is required or not
        - If the parameter is required, configure the default response and status code for the case that the parameter is not sent
    6. Configure the headers
        - You can add multiples headers with name and expected type or range of values, and set if it is required or not
        - If the headers are required, configure the default response and status code for the case that the header is not sent
    7. You can also disable chaos mode for the endpoint (default is enabled)
    8. Save the Endpoint
        - The endpoint will be available on **/group/endpoint**
        - And, if chaos mode is enabled, there will also be an endpoint available on **/group/endpoint/chaos**


# Tech Stack

## Database 

- Database Type: PostgreSQL
- ORM: SQLAlchemy
- Migration Strategy: Alembic
- Connection Pooling: Settings for performance
- Query Optimization: Guidelines for complex queries

### Models

- All tables should derive from a Base model with the following fields:
    - id: UUID
    - created_at: datetime
    - updated_at: datetime
    - deleted_at: datetime
    - created_at_epoch: int

- The models will use soft delete, so the deleted_at field will be used to mark the record as deleted
- The ORM should provide a way to get non deleted records as a default, and also provide a way to get all records (including deleted ones)
    - Example: Model.objects.filter(id=id).all() will return the all non deleted records
    - Example: Model.all_objects.filter(id=id).all() will return all records including the deleted ones

### Tables
- User
    - email: str
    - name: str

- Group
    - name: str
    - description: str
    - created_by: <User>

- Endpoint
    - id: UUID
    - group_id: <Group>
    - name: str
    - description: str
    - max_wait_time: int
    - chaos_mode: bool
    - response_schema: JSON Schema
    - response_status_code: int
    - response_body: str
    - created_by: <User>

- Header
    - id: UUID
    - endpoint_id: <Endpoint>
    - name: str
    - value: str
    - required: bool
    - default_response: JSON Schema
    - default_status_code: int

- Url Parameter
    - id: UUID
    - endpoint_id: <Endpoint>
    - name: str
    - value: str
    - required: bool
    - default_response: JSON Schema
    - default_status_code: int

## Frontend

- The frontend should be in React using Next.js
- The Design System should be in Shadcn/UI
- Core Components:
    - Navigation Sidebar (persistent across all pages)
    - Footer (contact info, links, copyright)
    - Card components for displaying content items
    - Form elements (inputs, dropdowns, buttons)
    - Modal windows for confirmations/additional actions
- Screens:
    - Login (with Google OAuth2)
    - After login, always show the Navigation Sidebar, Footer and Header
    - Navigation Sidebar:
        - Logo
        - Groups
    - Home
        - Big card with total number of Groups and Endpoints
    - Group Detail
        - When accessing the group detail, the navigation sidebar should be updated to show the group name
        - Big card with total number of Endpoints
        - Edit Group
            - Form to edit the group name and description
            - Delete Group
                - Confirmation modal
        - List of Endpoints
            - Endpoint Card
                - Endpoint Name
                - Endpoint Description
                - Endpoint Method
                - Endpoint Path
                - Endpoint Status Code
                - Endpoint Response
                - Edit Endpoint
                    - Form to edit the endpoint
                        - path, description, method, status code, time to wait, chaos mode
                        - url parameters
                            - Possibility to add multiple url parameters
                                - key
                                - value
                                - required
                                - default response if error
                                - default status code if error
                        - headers
                            - Possibility to add multiple headers
                                - key
                                - value
                                - required
                                - default response if error
                                - default status code if error
                        - body
                            - value (JSON Schema)
                            - required
                            - default response
                            - default status code
                - Delete Endpoint
                    - Confirmation modal
                - Test Endpoint
                    - Button to test the endpoint
                    - Response will be shown in a modal

### Interaction Patterns

- Form validation: Inline error messages, real-time feedback
- Loading states: Skeleton loaders for content, spinner for actions
- Transitions: Subtle animations for state changes (300ms duration)
- Feedback: Toast notifications for system messages

### State Management

- Frontend State: Redux/Context API architecture
- Client-side Caching: Strategy for API responses
- Persistence: LocalStorage/IndexedDB usage guidelines
- Rehydration: Server/client state reconciliation approach

## Backend 

- The backend should be in Python using FastAPI
    - Use Pydantic to build the JSON Schema
- Always use the ORM to interact with the database
- Build as many tests as possible to test each endpoint and each model
- Use Pytest to run the tests

### Framework & Environment

- Framework: FastAPI
- Python Version: Python 3.10+
- Virtual Environment: Poetry/Pipenv/venv management approach
- Containerization: Docker configuration details

### API Design

- Architecture Style: RESTful
- Endpoint Structure: Resource-based URL patterns
- Request/Response Formats: JSON schema definitions
- Status Codes: Expected HTTP status code usage
- Authentication: JWT/OAuth2/Session approach
- Documentation: Swagger/ReDoc auto-generation

### API Endpoints

#### Authentication
- POST /api/auth/login - Google OAuth2 login
- GET /api/auth/me - Get current user info

#### Groups
- GET /api/groups - List all groups
- POST /api/groups - Create new group
- GET /api/groups/{id} - Get group details
- PUT /api/groups/{id} - Update group
- DELETE /api/groups/{id} - Delete group

#### Endpoints
- GET /api/groups/{group_id}/endpoints - List all endpoints for a group
- POST /api/groups/{group_id}/endpoints - Create new endpoint
- GET /api/groups/{group_id}/endpoints/{id} - Get endpoint details
- PUT /api/groups/{group_id}/endpoints/{id} - Update endpoint
- DELETE /api/groups/{group_id}/endpoints/{id} - Delete endpoint
- POST /api/groups/{group_id}/endpoints/{id}/test - Test the endpoint

#### Mock API (Dynamic Endpoints)
- ANY /{group_name}/{endpoint_path} - Access configured mock endpoint
- ANY /{group_name}/{endpoint_path}/chaos - Access chaos version of mock endpoint

### Internationalization

- Use i18n in the backend with babel
- Use react-i18next in the frontend
- Use react-i18next-adapter in the frontend to adapt the i18n to the Shadcn/UI

## Folder Structure

- Folder structure should be as follows:
estoca-mock-api/
├── backend/                # FastAPI application
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   │   ├── v1/
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── groups.py
│   │   │   │   │   ├── endpoints.py
│   │   │   │   │   └── users.py
│   │   │   │   ├── dependencies.py
│   │   │   │   └── router.py
│   │   ├── core/           # Core application code
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── events.py
│   │   ├── db/             # Database related
│   │   │   ├── base.py
│   │   │   ├── session.py
│   │   │   └── repositories/
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   │   ├── auth/
│   │   │   ├── groups/
│   │   │   └── endpoints/
│   │   ├── utils/          # Utility functions
│   │   │   ├── oauth2.py
│   │   │   └── json_schema.py
│   │   └── tests/          # Test cases
│   ├── alembic/            # Database migrations
│   ├── pyproject.toml      # Dependencies
│   └── main.py             # Application entry point
├── frontend/               # Next.js application
│   ├── src/
│   │   ├── app/            # Next.js app router
│   │   ├── components/
│   │   │   ├── common/     # Reusable components
│   │   │   ├── layout/     # Layout components
│   │   │   └── features/   # Feature-specific components
│   │   │       ├── auth/
│   │   │       ├── groups/
│   │   │       └── endpoints/
│   │   ├── hooks/          # Custom React hooks
│   │   ├── context/        # React context providers
│   │   ├── services/       # API service calls
│   │   ├── store/          # State management
│   │   ├── styles/         # Global styles
│   │   ├── types/          # TypeScript definitions
│   │   └── utils/          # Helper functions
│   ├── public/             # Static files
│   └── package.json        # Dependencies
└── docker/                 # Docker configuration
    ├── docker-compose.yml
    ├── backend.Dockerfile
    ├── frontend.Dockerfile
    └── postgres.Dockerfile


## Testing Strategy

### Backend Tests
- Unit tests for models and services
- Integration tests for API endpoints
- Use pytest fixtures for test data
- Coverage targets: minimum 80%

### Frontend Tests
- Component tests with React Testing Library
- Integration tests with Cypress
- Mock API responses with MSW


## Environment Variables

### Backend (.env)
DATABASE_URL=postgresql://postgres:postgres@db:5432/estoca
SECRET_KEY=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OAUTH_REDIRECT_URL=http://localhost:8000/api/auth/callback

### Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id


## Development Setup

- Always document every commit with detailed information about the changes, including the why and the how
- Make a commit every time you add a new feature or fix a bug

### Prerequisites
- Docker and Docker Compose
- Node.js 18+
- Python 3.10+

### Running with Docker
1. Clone the repository
2. Configure environment variables in `.env` files
3. Run `docker-compose up -d`
4. Access the application at http://localhost:3000

### Running Locally
#### Backend
1. cd backend
2. poetry install
3. poetry run alembic upgrade head
4. poetry run uvicorn app.main:app --reload

#### Frontend
1. cd frontend
2. npm install
3. npm run dev

## Deployment

### Production Considerations
- Use environment-specific configuration
- Set up CI/CD pipeline with GitHub Actions
- Configure proper logging and monitoring
- Enable rate limiting for API endpoints
- Set up database backups

# Performance Considerations

## Backend
- Implement proper database indexing
- Use connection pooling
- Cache frequently accessed data with Redis
- Implement database query optimization

## Frontend
- Implement code splitting
- Optimize bundle size
- Use server-side rendering where appropriate
- Implement proper caching strategies


# Security Measures

- HTTPS for all communications
- Input validation for all API endpoints
- Proper error handling without exposing sensitive information
- JWT token validation and refresh mechanism
- CORS policy configuration
- Rate limiting to prevent abuse
- SQL injection prevention through ORM


# Documentation

- API documentation with Swagger/ReDoc
- User documentation for setting up and using the system
- Developer documentation for contributing to the project
