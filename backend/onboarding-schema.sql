-- Astrologer Onboarding Schema Extensions for Supabase / Postgres

-- 1. Applications Table
CREATE TABLE IF NOT EXISTS astrologer_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_number TEXT UNIQUE NOT NULL,
  user_id TEXT,
  full_name TEXT NOT NULL,
  display_name TEXT,
  email TEXT NOT NULL,
  mobile TEXT NOT NULL,
  gender TEXT DEFAULT 'MALE',
  date_of_birth DATE,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  
  -- Expertise & Qualifications
  years_experience INT DEFAULT 0,
  primary_expertise TEXT[] DEFAULT ARRAY[]::TEXT[],
  secondary_expertise TEXT[] DEFAULT ARRAY[]::TEXT[],
  languages TEXT[] DEFAULT ARRAY[]::TEXT[],
  price_per_min NUMERIC(10, 2) DEFAULT 20.00,
  daily_availability_hours INT DEFAULT 4,
  
  -- Lineage
  highest_degree TEXT,
  institution_name TEXT,
  year_of_passing INT,
  learned_from TEXT,
  background_description TEXT,
  
  -- Identity & Banking
  govt_id_type TEXT DEFAULT 'AADHAAR',
  aadhaar_number TEXT,
  pan_number TEXT,
  bank_account_holder_name TEXT,
  bank_account_number TEXT,
  bank_ifsc TEXT,
  bank_name TEXT,
  
  -- Media & Bio
  profile_picture_url TEXT,
  intro_video_url TEXT,
  sample_consultation_url TEXT,
  bio TEXT,
  website_url TEXT,
  youtube_url TEXT,
  instagram_url TEXT,
  
  -- Workflow Status
  -- SUBMITTED | UNDER_REVIEW | INTERVIEW_ROUND_1 | INTERVIEW_ROUND_2 | DOCUMENTS_PENDING | NEED_MORE_DOCUMENTS | APPROVED | REJECTED | DEACTIVATED
  status TEXT DEFAULT 'SUBMITTED',
  is_live BOOLEAN DEFAULT FALSE,
  
  rejection_reason TEXT,
  approved_at TIMESTAMPTZ,
  approved_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Documents Table
CREATE TABLE IF NOT EXISTS astrologer_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES astrologer_applications(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- DEGREE_CERTIFICATE | GOVT_ID_FRONT | GOVT_ID_BACK | PAN_CARD | BANK_PROOF | INTRO_VIDEO
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  status TEXT DEFAULT 'PENDING', -- PENDING | APPROVED | REJECTED | REUPLOAD_REQUESTED
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Interview Rounds Table
CREATE TABLE IF NOT EXISTS astrologer_interviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES astrologer_applications(id) ON DELETE CASCADE,
  round_number INT NOT NULL DEFAULT 1, -- 1 or 2
  round_type TEXT DEFAULT 'VIDEO', -- PHONE or VIDEO
  scheduled_date DATE,
  scheduled_time TEXT,
  meeting_link TEXT,
  interviewer_name TEXT DEFAULT 'Aroham Senior Evaluator',
  instructions TEXT,
  
  -- Feedback & Scores (1-10)
  score_communication INT,
  score_knowledge INT,
  score_confidence INT,
  score_practical_reading INT,
  score_client_handling INT,
  
  result TEXT DEFAULT 'PENDING', -- PENDING | PASS | FAIL | RESCHEDULED | CANCELLED
  evaluator_remarks TEXT,
  evaluated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Internal Admin Notes
CREATE TABLE IF NOT EXISTS astrologer_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES astrologer_applications(id) ON DELETE CASCADE,
  author_name TEXT DEFAULT 'Admin',
  note_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Audit History
CREATE TABLE IF NOT EXISTS astrologer_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES astrologer_applications(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  performed_by TEXT DEFAULT 'Admin',
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE astrologer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE astrologer_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE astrologer_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE astrologer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE astrologer_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read applications" ON astrologer_applications FOR SELECT USING (true);
CREATE POLICY "Allow public insert applications" ON astrologer_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update applications" ON astrologer_applications FOR UPDATE USING (true);

CREATE POLICY "Public read documents" ON astrologer_documents FOR SELECT USING (true);
CREATE POLICY "Allow public insert documents" ON astrologer_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update documents" ON astrologer_documents FOR UPDATE USING (true);

CREATE POLICY "Public read interviews" ON astrologer_interviews FOR SELECT USING (true);
CREATE POLICY "Allow public insert interviews" ON astrologer_interviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update interviews" ON astrologer_interviews FOR UPDATE USING (true);

CREATE POLICY "Public read notes" ON astrologer_notes FOR SELECT USING (true);
CREATE POLICY "Allow public insert notes" ON astrologer_notes FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read history" ON astrologer_history FOR SELECT USING (true);
CREATE POLICY "Allow public insert history" ON astrologer_history FOR INSERT WITH CHECK (true);
