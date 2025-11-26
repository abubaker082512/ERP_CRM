-- DOCUMENTS MODULE TABLES

CREATE TABLE IF NOT EXISTS documents_document (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT, -- file, folder
    folder_id UUID REFERENCES documents_document(id), -- Self-reference for folders
    owner_id UUID REFERENCES hr_employee(id),
    file_url TEXT, -- Path to file (Supabase Storage or local)
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DISCUSS / CHAT MODULE TABLES

CREATE TABLE IF NOT EXISTS mail_channel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    channel_type TEXT DEFAULT 'channel', -- channel, group, chat
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mail_message (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID REFERENCES mail_channel(id) ON DELETE CASCADE,
    author_id UUID REFERENCES hr_employee(id), -- or contacts
    body TEXT NOT NULL,
    message_type TEXT DEFAULT 'comment', -- comment, notification
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE documents_document ENABLE ROW LEVEL SECURITY;
ALTER TABLE mail_channel ENABLE ROW LEVEL SECURITY;
ALTER TABLE mail_message ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all users" ON documents_document FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON documents_document FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON documents_document FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON mail_channel FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON mail_channel FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON mail_channel FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON mail_message FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON mail_message FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON mail_message FOR UPDATE USING (true);
