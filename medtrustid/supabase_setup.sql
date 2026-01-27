-- MedTrustID Supabase Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'patient' CHECK (role IN ('patient', 'staff')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consents table
CREATE TABLE IF NOT EXISTS consents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    requester_id VARCHAR(255) NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    expiry_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Access logs table
CREATE TABLE IF NOT EXISTS access_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES users(id) ON DELETE CASCADE,
    purpose VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'granted', 'denied')),
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Access requests table (staff requests -> patient approves/rejects)
CREATE TABLE IF NOT EXISTS access_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES users(id) ON DELETE CASCADE,
    purpose VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient medical records table
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    record_type VARCHAR(100) NOT NULL,
    diagnosis TEXT,
    treatment TEXT,
    doctor_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_consents_patient_id ON consents(patient_id);
CREATE INDEX IF NOT EXISTS idx_consents_status ON consents(status);
CREATE INDEX IF NOT EXISTS idx_access_logs_patient_id ON access_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_staff_id ON access_logs(staff_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_patient_id ON access_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_staff_id ON access_requests(staff_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(status);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Consents policies
DROP POLICY IF EXISTS "Patients can view own consents" ON consents;
CREATE POLICY "Patients can view own consents" ON consents
    FOR SELECT USING (auth.uid()::text = patient_id::text);

DROP POLICY IF EXISTS "Staff can view all consents" ON consents;
CREATE POLICY "Staff can view all consents" ON consents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'staff'
        )
    );

DROP POLICY IF EXISTS "Users can create consents" ON consents;
CREATE POLICY "Users can create consents" ON consents
    FOR INSERT WITH CHECK (auth.uid()::text = created_by::text);

DROP POLICY IF EXISTS "Users can update own consents" ON consents;
CREATE POLICY "Users can update own consents" ON consents
    FOR UPDATE USING (auth.uid()::text = patient_id::text OR auth.uid()::text = created_by::text);

-- Access logs policies
DROP POLICY IF EXISTS "Staff can view all access logs" ON access_logs;
CREATE POLICY "Staff can view all access logs" ON access_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'staff'
        )
    );

DROP POLICY IF EXISTS "Patients can view own access logs" ON access_logs;
CREATE POLICY "Patients can view own access logs" ON access_logs
    FOR SELECT USING (auth.uid()::text = patient_id::text);

DROP POLICY IF EXISTS "Staff can create access logs" ON access_logs;
CREATE POLICY "Staff can create access logs" ON access_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'staff'
        )
    );

-- Access requests policies
DROP POLICY IF EXISTS "Patients can view own access requests" ON access_requests;
CREATE POLICY "Patients can view own access requests" ON access_requests
    FOR SELECT USING (auth.uid()::text = patient_id::text);

DROP POLICY IF EXISTS "Staff can view own access requests" ON access_requests;
CREATE POLICY "Staff can view own access requests" ON access_requests
    FOR SELECT USING (auth.uid()::text = staff_id::text);

DROP POLICY IF EXISTS "Staff can create access requests" ON access_requests;
CREATE POLICY "Staff can create access requests" ON access_requests
    FOR INSERT WITH CHECK (
        auth.uid()::text = staff_id::text AND EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'staff'
        )
    );

DROP POLICY IF EXISTS "Patients can approve/reject their access requests" ON access_requests;
CREATE POLICY "Patients can approve/reject their access requests" ON access_requests
    FOR UPDATE USING (auth.uid()::text = patient_id::text);

-- Medical records policies
DROP POLICY IF EXISTS "Patients can view own medical records" ON medical_records;
CREATE POLICY "Patients can view own medical records" ON medical_records
    FOR SELECT USING (auth.uid()::text = patient_id::text);

DROP POLICY IF EXISTS "Staff can view medical records with consent" ON medical_records;
CREATE POLICY "Staff can view medical records with consent" ON medical_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'staff'
        ) AND EXISTS (
            SELECT 1 FROM consents 
            WHERE patient_id = medical_records.patient_id 
            AND status = 'active' 
            AND expiry_date >= CURRENT_DATE
        )
    );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_consents_updated_at ON consents;
CREATE TRIGGER update_consents_updated_at BEFORE UPDATE ON consents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_access_requests_updated_at ON access_requests;
CREATE TRIGGER update_access_requests_updated_at BEFORE UPDATE ON access_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_medical_records_updated_at ON medical_records;
CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
INSERT INTO users (name, email, password, role) VALUES
('John Doe', 'john@example.com', '$2a$10$example_hash', 'patient'),
('Jane Smith', 'jane@example.com', '$2a$10$example_hash', 'patient'),
('Dr. Wilson', 'wilson@hospital.com', '$2a$10$example_hash', 'staff')
ON CONFLICT (email) DO NOTHING;

-- Sample consents
INSERT INTO consents (patient_id, requester_id, purpose, expiry_date, created_by) VALUES
((SELECT id FROM users WHERE email = 'john@example.com'), 'staff-001', 'Emergency Treatment', CURRENT_DATE + INTERVAL '7 days', (SELECT id FROM users WHERE email = 'john@example.com')),
((SELECT id FROM users WHERE email = 'jane@example.com'), 'pharmacy-001', 'Prescription Fill', CURRENT_DATE + INTERVAL '30 days', (SELECT id FROM users WHERE email = 'jane@example.com'))
ON CONFLICT DO NOTHING;

-- Sample medical records
INSERT INTO medical_records (patient_id, record_type, diagnosis, treatment, doctor_notes) VALUES
((SELECT id FROM users WHERE email = 'john@example.com'), 'General Checkup', 'Healthy', 'No treatment needed', 'Patient is in good health'),
((SELECT id FROM users WHERE email = 'jane@example.com'), 'Emergency', 'Fractured arm', 'Cast applied', 'Follow up in 2 weeks')
ON CONFLICT DO NOTHING;
