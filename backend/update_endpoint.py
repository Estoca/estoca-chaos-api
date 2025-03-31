import asyncio
from app.db.session import AsyncSessionLocal
from app.models.endpoint import Endpoint
from sqlalchemy import select
from sqlalchemy.orm import selectinload

async def update_endpoint():
    async with AsyncSessionLocal() as session:
        # Get the endpoint
        result = await session.execute(
            select(Endpoint)
            .options(selectinload(Endpoint.headers), selectinload(Endpoint.url_parameters))
            .filter(Endpoint.path == 'ts', Endpoint.method == 'GET')
        )
        endpoint = result.scalar_one_or_none()
        
        if not endpoint:
            print('Endpoint not found')
            return
            
        # Update the response body
        endpoint.response_body = '{"message": "Hello from ts endpoint!"}'
        await session.commit()
        print(f'Updated endpoint {endpoint.name} with a proper response body')

if __name__ == "__main__":
    asyncio.run(update_endpoint()) 