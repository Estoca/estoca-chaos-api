import asyncio
from collections import defaultdict
from sqlalchemy import and_, select
from app.db.session import AsyncSessionLocal
from app.models.endpoint import Endpoint

async def cleanup_duplicate_endpoints():
    async with AsyncSessionLocal() as session:
        # Get all endpoints
        result = await session.execute(select(Endpoint))
        endpoints = list(result.scalars().all())
        
        # Group endpoints by their group_id, path, and method
        endpoint_groups = defaultdict(list)
        for endpoint in endpoints:
            key = (str(endpoint.group_id), endpoint.path, endpoint.method)
            endpoint_groups[key].append(endpoint)
        
        # Find groups with duplicates
        duplicate_count = 0
        
        print("Scanning for duplicate endpoints...")
        
        for (group_id, path, method), endpoint_list in endpoint_groups.items():
            if len(endpoint_list) > 1:
                duplicate_count += len(endpoint_list) - 1
                print(f"Found {len(endpoint_list)} endpoints with path '{path}' and method '{method}' in group '{group_id}'")
                
                # Keep the first one, delete the rest
                keep = endpoint_list[0]
                print(f"  Keeping endpoint ID {keep.id} (name: {keep.name})")
                
                for dupe in endpoint_list[1:]:
                    print(f"  Deleting duplicate endpoint ID {dupe.id} (name: {dupe.name})")
                    await session.delete(dupe)
                
        if duplicate_count > 0:
            await session.commit()
            print(f"\nRemoved {duplicate_count} duplicate endpoints.")
        else:
            print("No duplicate endpoints found.")

if __name__ == "__main__":
    asyncio.run(cleanup_duplicate_endpoints()) 