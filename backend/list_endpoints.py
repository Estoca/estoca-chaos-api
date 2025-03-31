import asyncio
import sys
from app.db.session import AsyncSessionLocal
from app.models.group import Group
from app.models.endpoint import Endpoint
from sqlalchemy import select, func

async def list_endpoints(group_name):
    async with AsyncSessionLocal() as session:
        # Find the group
        result = await session.execute(
            select(Group).filter(func.lower(Group.name) == group_name.lower())
        )
        group = result.scalar_one_or_none()
        
        if not group:
            print(f"Group '{group_name}' not found")
            return
            
        # Find all endpoints for the group
        result = await session.execute(
            select(Endpoint).filter(Endpoint.group_id == str(group.id))
        )
        endpoints = result.scalars().all()
        
        if not endpoints:
            print(f"No endpoints found for group '{group.name}'")
            return
            
        print(f"Endpoints for group '{group.name}' (ID: {group.id}):")
        for endpoint in endpoints:
            print(f"  - {endpoint.name}: path='{endpoint.path}', method='{endpoint.method}'")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        group_name = sys.argv[1]
    else:
        group_name = "korp"  # Default group name
        
    asyncio.run(list_endpoints(group_name)) 