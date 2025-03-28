"""create endpoints table

Revision ID: 20240328224741
Revises: 74a88c6e8dea
Create Date: 2024-03-28 22:47:41.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '20240328224741'
down_revision: Union[str, None] = '74a88c6e8dea'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if the table exists
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    if 'endpoints' not in inspector.get_table_names():
        op.create_table(
            'endpoints',
            sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
            sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('created_at_epoch', sa.BigInteger, nullable=False),
            sa.Column('name', sa.String, nullable=False),
            sa.Column('description', sa.String, nullable=True),
            sa.Column('path', sa.String, nullable=False),
            sa.Column('method', sa.String, nullable=False),
            sa.Column('max_wait_time', sa.Integer, nullable=False, server_default='0'),
            sa.Column('chaos_mode', sa.Boolean, nullable=False, server_default='true'),
            sa.Column('response_schema', postgresql.JSON, nullable=True),
            sa.Column('response_status_code', sa.Integer, nullable=False, server_default='200'),
            sa.Column('response_body', sa.String, nullable=True),
            sa.Column('group_id', postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column('created_by_id', postgresql.UUID(as_uuid=True), nullable=False),
            sa.ForeignKeyConstraint(['group_id'], ['groups.id'], ),
            sa.ForeignKeyConstraint(['created_by_id'], ['users.id'], ),
        )


def downgrade() -> None:
    op.drop_table('endpoints') 