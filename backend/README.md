# Estoca Mock API Backend

This is the backend service for the Estoca Mock API application. It provides a RESTful API for managing mock endpoints and groups, with support for chaos mode testing.

## Features

- User authentication with Google OAuth2
- Group-based endpoint organization
- Flexible endpoint configuration with JSON Schema support
- Chaos mode for testing system resilience
- PostgreSQL database with SQLAlchemy ORM
- Alembic database migrations
- FastAPI with automatic OpenAPI documentation

## Prerequisites

- Python 3.10+
- PostgreSQL 15+
- Docker and Docker Compose (optional)

## Installation

### Using Docker (Recommended)

1. Clone the repository
2. Copy the `.env.example` file to `.env` and update the values
3. Run the application:
   ```bash
   docker-compose up -d
   ```

The application will be available at http://localhost:8000

### Manual Installation

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   poetry install
   ```

3. Copy the `.env.example` file to `.env` and update the values

4. Run database migrations:
   ```bash
   poetry run alembic upgrade head
   ```

5. Start the application:
   ```bash
   poetry run uvicorn app.main:app --reload
   ```

The application will be available at http://localhost:8000

## API Documentation

Once the application is running, you can access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Development

### Running Tests

```bash
poetry run pytest
```

### Code Style

The project uses:
- Black for code formatting
- isort for import sorting
- flake8 for linting
- mypy for type checking

Run the formatters:
```bash
poetry run black .
poetry run isort .
```

### Database Migrations

Create a new migration:
```bash
poetry run alembic revision --autogenerate -m "description"
```

Apply migrations:
```bash
poetry run alembic upgrade head
```

Rollback migrations:
```bash
poetry run alembic downgrade -1
```

## Environment Variables

- `POSTGRES_SERVER`: PostgreSQL server hostname
- `POSTGRES_USER`: PostgreSQL username
- `POSTGRES_PASSWORD`: PostgreSQL password
- `POSTGRES_DB`: PostgreSQL database name
- `SECRET_KEY`: JWT secret key
- `ALGORITHM`: JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: JWT token expiration time in minutes
- `GOOGLE_CLIENT_ID`: Google OAuth2 client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth2 client secret
- `OAUTH_REDIRECT_URL`: OAuth2 redirect URL
- `BACKEND_CORS_ORIGINS`: List of allowed CORS origins

## License

MIT 