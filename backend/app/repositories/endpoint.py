from typing import List, Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.endpoint import Endpoint
from app.schemas.endpoint import EndpointCreate, EndpointUpdate

class EndpointRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, endpoint_data: EndpointCreate, created_by_id: UUID) -> Endpoint:
        endpoint = Endpoint(
            **endpoint_data.model_dump(),
            created_by_id=created_by_id
        )
        self.session.add(endpoint)
        await self.session.commit()
        await self.session.refresh(endpoint)
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
            for key, value in endpoint_data.model_dump(exclude_unset=True).items():
                setattr(endpoint, key, value)
            await self.session.commit()
            await self.session.refresh(endpoint)
        return endpoint

    async def delete(self, endpoint_id: UUID) -> bool:
        endpoint = await self.get_by_id(endpoint_id)
        if endpoint:
            await self.session.delete(endpoint)
            await self.session.commit()
            return True
        return False 