-- KNOWLEDGE MODULE
CREATE TABLE IF NOT EXISTS knowledge_article (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    body TEXT,
    category TEXT DEFAULT 'general',
    author_id UUID REFERENCES contacts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TO DO MODULE
CREATE TABLE IF NOT EXISTS todo_task (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES hr_employee(id), -- or auth user
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE knowledge_article ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_task ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public Access" ON knowledge_article FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON todo_task FOR ALL USING (true) WITH CHECK (true);
