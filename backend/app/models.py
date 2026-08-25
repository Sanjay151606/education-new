import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Integer, Float, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)

    # ADHD learning profile
    focus_span_minutes = Column(Integer, default=20)          # baseline sustained attention
    preferred_content_style = Column(String, default="visual") # visual / audio / text / mixed
    difficulty_level = Column(String, default="adaptive")      # easy / medium / hard / adaptive
    reminders_enabled = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    tasks = relationship("Task", back_populates="owner", cascade="all, delete-orphan")
    materials = relationship("StudyMaterial", back_populates="owner", cascade="all, delete-orphan")
    progress_logs = relationship("ProgressLog", back_populates="owner", cascade="all, delete-orphan")
    focus_sessions = relationship("FocusSession", back_populates="owner", cascade="all, delete-orphan")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    subtasks = Column(JSON, default=list)       # AI-broken-down microtasks
    priority = Column(String, default="medium") # low / medium / high
    status = Column(String, default="pending")  # pending / in_progress / done
    estimated_minutes = Column(Integer, nullable=True)
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="tasks")


class StudyMaterial(Base):
    __tablename__ = "study_materials"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    title = Column(String, nullable=False)
    original_text = Column(Text, nullable=True)
    simplified_text = Column(Text, nullable=True)   # AI-simplified version
    summary_bullets = Column(JSON, default=list)    # AI-generated key points
    flashcards = Column(JSON, default=list)         # AI-generated Q/A pairs
    subject = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="materials")


class ProgressLog(Base):
    __tablename__ = "progress_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    subject = Column(String, nullable=True)
    activity_type = Column(String, nullable=True)  # quiz / task / study_session
    score = Column(Float, nullable=True)
    time_spent_minutes = Column(Integer, nullable=True)
    date = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="progress_logs")


class FocusSession(Base):
    __tablename__ = "focus_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    technique = Column(String, default="pomodoro")  # pomodoro / timeboxing / body_doubling
    planned_minutes = Column(Integer, default=25)
    actual_minutes = Column(Integer, nullable=True)
    distractions_logged = Column(Integer, default=0)
    completed = Column(Boolean, default=False)
    started_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="focus_sessions")
