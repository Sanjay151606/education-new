-- BrainGraph Supabase Schema
-- Run this in the Supabase SQL editor

create extension if not exists "uuid-ossp";

-- ================= USERS =================
-- Linked directly to Supabase Auth (auth.users)
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text not null,
  focus_span_minutes int default 20,
  preferred_content_style text default 'visual' check (preferred_content_style in ('visual','audio','text','mixed')),
  difficulty_level text default 'adaptive' check (difficulty_level in ('easy','medium','hard','adaptive')),
  reminders_enabled boolean default true,
  created_at timestamptz default now()
);

-- ================= TASKS =================
create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  title text not null,
  description text,
  subtasks jsonb default '[]',
  priority text default 'medium' check (priority in ('low','medium','high')),
  status text default 'pending' check (status in ('pending','in_progress','done')),
  estimated_minutes int,
  due_date timestamptz,
  created_at timestamptz default now()
);

-- ================= STUDY MATERIALS =================
create table if not exists study_materials (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  title text not null,
  original_text text,
  simplified_text text,
  summary_bullets jsonb default '[]',
  flashcards jsonb default '[]',
  subject text,
  created_at timestamptz default now()
);

-- ================= PROGRESS LOGS =================
create table if not exists progress_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  subject text,
  activity_type text,
  score numeric,
  time_spent_minutes int,
  date timestamptz default now()
);

-- ================= FOCUS SESSIONS =================
create table if not exists focus_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  technique text default 'pomodoro',
  planned_minutes int default 25,
  actual_minutes int,
  distractions_logged int default 0,
  completed boolean default false,
  started_at timestamptz default now()
);

-- ================= INDEXES =================
create index if not exists idx_tasks_user on tasks(user_id);
create index if not exists idx_materials_user on study_materials(user_id);
create index if not exists idx_progress_user on progress_logs(user_id);
create index if not exists idx_focus_user on focus_sessions(user_id);

-- ================= ROW LEVEL SECURITY =================
alter table users enable row level security;
alter table tasks enable row level security;
alter table study_materials enable row level security;
alter table progress_logs enable row level security;
alter table focus_sessions enable row level security;

create policy "Users manage their own profile" on users
  for all using (auth.uid() = id);

create policy "Users manage their own tasks" on tasks
  for all using (auth.uid() = user_id);

create policy "Users manage their own materials" on study_materials
  for all using (auth.uid() = user_id);

create policy "Users manage their own progress" on progress_logs
  for all using (auth.uid() = user_id);

create policy "Users manage their own focus sessions" on focus_sessions
  for all using (auth.uid() = user_id);
