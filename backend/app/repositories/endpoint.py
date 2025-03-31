from typing import List, Optional
from uuid import UUID
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.models.endpoint import Endpoint
from app.schemas.endpoint import EndpointCreate, EndpointUpdate

class EndpointRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def check_duplicate_endpoint(self, group_id: UUID, path: str, method: str, endpoint_id: Optional[UUID] = None) -> bool:
        """Check if there's already an endpoint with the same path and method in the group"""
        query = select(Endpoint).where(
            and_(
                Endpoint.group_id == str(group_id),
                Endpoint.path == path,
                Endpoint.method == method
            )
        )
        
        # If updating an existing endpoint, exclude it from the check
        if endpoint_id:
            query = query.where(Endpoint.id != endpoint_id)
            
        result = await self.session.execute(query)
        existing_endpoint = result.scalar_one_or_none()
        return existing_endpoint is not None

    async def create(self, endpoint_data: EndpointCreate, created_by_id: UUID) -> Endpoint:
        # Check for duplicates
        duplicate_exists = await self.check_duplicate_endpoint(
            endpoint_data.group_id, endpoint_data.path, endpoint_data.method
        )
        
        if duplicate_exists:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"An endpoint with path '{endpoint_data.path}' and method '{endpoint_data.method}' already exists in this group"
            )
        
        endpoint = Endpoint(
            **endpoint_data.model_dump(),
            created_by_id=created_by_id
        )
        self.session.add(endpoint)
        await self.session.commit()
        # Refresh with relationship loading
        await self.session.refresh(endpoint, attribute_names=['headers', 'url_parameters'])
        return endpoint

    async def get_by_id(self, endpoint_id: UUID) -> Optional[Endpoint]:
        result = await self.session.execute(
            select(Endpoint)
            .options(selectinload(Endpoint.headers), selectinload(Endpoint.url_parameters))
            .where(Endpoint.id == endpoint_id)
        )
        return result.scalar_one_or_none()

    async def get_by_group_id(self, group_id: UUID) -> List[Endpoint]:
        result = await self.session.execute(
            select(Endpoint)
            .options(selectinload(Endpoint.headers), selectinload(Endpoint.url_parameters))
            .where(Endpoint.group_id == group_id)
        )
        return list(result.scalars().all())

    async def update(
        self, endpoint_id: UUID, endpoint_data: EndpointUpdate
    ) -> Optional[Endpoint]:
        endpoint = await self.get_by_id(endpoint_id)
        if endpoint:
            # If path or method is changing, check for duplicates
            if (endpoint_data.path and endpoint_data.path != endpoint.path) or \
               (endpoint_data.method and endpoint_data.method != endpoint.method):
                duplicate_exists = await self.check_duplicate_endpoint(
                    endpoint.group_id, 
                    endpoint_data.path or endpoint.path, 
                    endpoint_data.method or endpoint.method,
                    endpoint_id
                )
                
                if duplicate_exists:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=f"An endpoint with path '{endpoint_data.path or endpoint.path}' and method '{endpoint_data.method or endpoint.method}' already exists in this group"
                    )
            
            # Process data to update
            update_data = endpoint_data.model_dump(exclude_unset=True)
            
            # Handle special cases for relationship fields
            headers_data = update_data.pop('headers', None)
            url_parameters_data = update_data.pop('url_parameters', None)
            
            # Update the regular fields
            for key, value in update_data.items():
                setattr(endpoint, key, value)
                
            # Handle headers update if provided
            if headers_data is not None:
                # Remove existing headers
                for header in endpoint.headers[:]:
                    await self.session.delete(header)
                
                # Create new headers
                from app.models.header import Header
                new_headers = []
                for header_dict in headers_data:
                    header = Header(**header_dict, endpoint_id=endpoint_id)
                    self.session.add(header)
                    new_headers.append(header)
                
                # Will be refreshed during commit
                endpoint.headers = new_headers
                
            # Handle url_parameters update if provided
            if url_parameters_data is not None:
                # Remove existing url parameters
                for param in endpoint.url_parameters[:]:
                    await self.session.delete(param)
                
                # Create new url parameters
                from app.models.url_parameter import UrlParameter
                new_params = []
                for param_dict in url_parameters_data:
                    param = UrlParameter(**param_dict, endpoint_id=endpoint_id)
                    self.session.add(param)
                    new_params.append(param)
                
                # Will be refreshed during commit
                endpoint.url_parameters = new_params
                
            await self.session.commit()
            # Refresh with relationship loading after updating - SAFER ALTERNATIVE:
            # await self.session.refresh(endpoint, attribute_names=['headers', 'url_parameters'])
            # Re-fetch using get_by_id to ensure all data (including relationships) is loaded
            refreshed_endpoint = await self.get_by_id(endpoint_id)
            return refreshed_endpoint # Return the re-fetched object
        # return endpoint # Original return removed
        return None # Should return None if endpoint wasn't found initially

    async def delete(self, endpoint_id: UUID) -> bool:
        endpoint = await self.get_by_id(endpoint_id)
        if endpoint:
            await self.session.delete(endpoint)
            await self.session.commit()
            return True
        return False 