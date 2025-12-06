from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

class UserBase(BaseModel):
    email: str
    role: str = "user"

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    pass

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class PresetBase(BaseModel):
    name: str
    layout: List[Dict[str, Any]]

class PresetCreate(PresetBase):
    pass

class Preset(PresetBase):
    id: int
    user_id: int
    created_at: datetime
    class Config:
        from_attributes = True