from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

# Channel
class ChannelBase(BaseModel):
    name: str
    description: Optional[str] = None
    channel_type: str = "channel"

class ChannelCreate(ChannelBase):
    pass

class Channel(ChannelBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# Message
class MessageBase(BaseModel):
    channel_id: UUID
    author_id: Optional[UUID] = None
    body: str
    message_type: str = "comment"

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
