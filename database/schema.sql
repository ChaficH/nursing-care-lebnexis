CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('patient', 'provider', 'admin');
CREATE TYPE provider_status AS ENUM ('pending', 'approved', 'suspended');
CREATE TYPE request_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled', 'completed');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled');
CREATE TYPE urgency_level AS ENUM ('low', 'medium', 'high', 'emergency');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    role user_role NOT NULL,
    preferred_language VARCHAR(10) DEFAULT 'en',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    managed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    date_of_birth DATE,
    address TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    address TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    status provider_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

INSERT INTO services (name, description) VALUES
('Nursing', 'Professional nursing care'),
('Elderly Care', 'Daily support and elderly care'),
('Physiotherapy', 'Physical therapy and rehabilitation');

CREATE TABLE provider_services (
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    PRIMARY KEY (provider_id, service_id)
);

CREATE TABLE provider_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

CREATE TABLE care_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    urgency urgency_level NOT NULL DEFAULT 'medium',
    address TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    status request_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE care_request_services (
    care_request_id UUID REFERENCES care_requests(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    confidence_score DECIMAL(5,4),
    source VARCHAR(20) DEFAULT 'user',
    PRIMARY KEY (care_request_id, service_id)
);

CREATE TABLE ai_request_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    care_request_id UUID NOT NULL REFERENCES care_requests(id) ON DELETE CASCADE,
    structured_data JSONB,
    generated_summary TEXT,
    urgency VARCHAR(20),
    disclaimer TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE provider_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    care_request_id UUID NOT NULL REFERENCES care_requests(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    status request_status NOT NULL DEFAULT 'pending',
    response_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (care_request_id, provider_id)
);

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    care_request_id UUID REFERENCES care_requests(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    status appointment_status NOT NULL DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID UNIQUE NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_patients_managed_by ON patients(managed_by_user_id);

CREATE INDEX idx_providers_location ON providers(latitude, longitude);
CREATE INDEX idx_providers_status ON providers(status);

CREATE INDEX idx_provider_services_service ON provider_services(service_id);
CREATE INDEX idx_provider_availability_provider ON provider_availability(provider_id);

CREATE INDEX idx_care_requests_patient ON care_requests(patient_id);
CREATE INDEX idx_care_requests_status ON care_requests(status);

CREATE INDEX idx_provider_requests_provider ON provider_requests(provider_id);
CREATE INDEX idx_provider_requests_status ON provider_requests(status);

CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_provider ON appointments(provider_id);
CREATE INDEX idx_appointments_date ON appointments(scheduled_at);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER care_requests_updated_at
BEFORE UPDATE ON care_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER provider_requests_updated_at
BEFORE UPDATE ON provider_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
