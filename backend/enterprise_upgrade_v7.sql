-- ============================================================
-- Galaxy ERP - Enterprise Upgrade V7 (Todo & Projects)
-- ============================================================

-- Project System
CREATE TABLE IF NOT EXISTS project_project (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id), -- Project Manager
    partner_id UUID REFERENCES contact(id), -- Customer
    color INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_task (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    project_id UUID REFERENCES project_project(id),
    user_id UUID REFERENCES auth.users(id), -- Assigned to
    stage_id TEXT DEFAULT 'todo', -- todo, in_progress, done, cancelled
    priority TEXT DEFAULT '0',
    date_deadline DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Todo Enhancements (Unified with Project Tasks if needed, or standalone)
ALTER TABLE todo_task ADD COLUMN IF NOT EXISTS date_deadline DATE;
ALTER TABLE todo_task ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;
ALTER TABLE todo_task ADD COLUMN IF NOT EXISTS tag_ids TEXT[]; -- Simple array of tags for now
