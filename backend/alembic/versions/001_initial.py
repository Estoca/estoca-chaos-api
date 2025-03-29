"""initial

Revision ID: 001
Revises: 
Create Date: 2024-03-28 17:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create user table
    op.create_table(
        'user',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('picture', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at_epoch', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index(op.f('ix_user_email'), 'user', ['email'], unique=True)

    # Create groups table
    op.create_table(
        'groups',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('created_by_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at_epoch', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['created_by_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create endpoints table
    op.create_table(
        'endpoints',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('group_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('path', sa.String(), nullable=False),
        sa.Column('method', sa.String(), nullable=False),
        sa.Column('max_wait_time', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('chaos_mode', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('response_schema', postgresql.JSON(), nullable=True),
        sa.Column('response_status_code', sa.Integer(), nullable=False, server_default='200'),
        sa.Column('response_body', sa.String(), nullable=True),
        sa.Column('created_by_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at_epoch', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['created_by_id'], ['user.id'], ),
        sa.ForeignKeyConstraint(['group_id'], ['groups.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create headers table
    op.create_table(
        'headers',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('endpoint_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('value', sa.String(), nullable=False),
        sa.Column('required', sa.Boolean(), nullable=False),
        sa.Column('default_response', postgresql.JSON(), nullable=True),
        sa.Column('default_status_code', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at_epoch', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['endpoint_id'], ['endpoints.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create url_parameters table
    op.create_table(
        'url_parameters',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('endpoint_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('value', sa.String(), nullable=False),
        sa.Column('required', sa.Boolean(), nullable=False),
        sa.Column('default_response', postgresql.JSON(), nullable=True),
        sa.Column('default_status_code', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at_epoch', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['endpoint_id'], ['endpoints.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('url_parameters')
    op.drop_table('headers')
    op.drop_table('endpoints')
    op.drop_table('groups')
    op.drop_index(op.f('ix_user_email'), table_name='user')
    op.drop_table('user') 