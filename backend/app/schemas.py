import uuid
from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr


# ---------- Auth ----------
class UserOut(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str
    focus_span_minutes: int
    preferred_content_style: str
    difficulty_level: str
    reminders_enabled: bool = True

    class Config:
        from_attributes = True

class UserUpdateProfile(BaseModel):
    full_name: Optional[str] = None
    focus_span_minutes: Optional[int] = None
    preferred_content_style: Optional[str] = None
    difficulty_level: Optional[str] = None
    reminders_enabled: Optional[bool] = None


# ---------- Tasks ----------
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    due_date: Optional[datetime] = None
    auto_breakdown: bool = True   # let AI split into subtasks

class TaskOut(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str]
    subtasks: List[Any]
    priority: str
    status: str
    estimated_minutes: Optional[int]
    due_date: Optional[datetime]

    class Config:
        from_attributes = True


# ---------- Study Materials ----------
class MaterialCreate(BaseModel):
    title: str
    original_text: str
    subject: Optional[str] = None

class MaterialOut(BaseModel):
    id: uuid.UUID
    title: str
    simplified_text: Optional[str]
    summary_bullets: List[Any]
    flashcards: List[Any]
    subject: Optional[str]

    class Config:
        from_attributes = True


# ---------- Progress ----------
class ProgressCreate(BaseModel):
    subject: Optional[str] = None
    activity_type: str
    score: Optional[float] = None
    time_spent_minutes: Optional[int] = None

class ProgressOut(ProgressCreate):
    id: uuid.UUID
    date: datetime

    class Config:
        from_attributes = True


# ---------- AI ----------
class RecommendationRequest(BaseModel):
    subject: Optional[str] = None

class RecommendationOut(BaseModel):
    recommendations: List[str]
    suggested_focus_minutes: int
    suggested_break_minutes: int
    motivational_note: str
