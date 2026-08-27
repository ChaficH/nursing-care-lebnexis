-- ============================================================
-- SMART HOME HEALTHCARE PLATFORM
-- PostgreSQL Database Schema
-- ============================================================

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM (
    'patient',
    'provider',
    'admin'
);

CREATE TYPE provider_status AS ENUM (
    'pending',
    'active',
    'suspended',
    'inactive'
);

CREATE TYPE request_status AS ENUM (
    'pending',
    'matching',
    'matched',
    'accepted',
    'rejected',
    'cancelled',
    'completed'
);

CREATE TYPE urgency_level AS ENUM (
    'low',
    'normal',
    'high'
);

CREATE TYPE appointment_status AS ENUM (
    'requested',
    'confirmed',
    'rejected',
    'cancelled',
    'completed',
    'no_show'
);

CREATE TYPE gender_type AS ENUM (
    'male',
    'female',
    'other',
    'prefer_not_to_say'
);

-- ============================================================
-- USERS
-- Authentication and common user information
-- ============================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email VARCHAR(255) NOT NULL UNIQUE,
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

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);


-- ============================================================
-- PATIENTS
-- Additional information specific to patients
-- ============================================================

CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL UNIQUE
        REFERENCES users(id)
        ON DELETE CASCADE,

    date_of_birth DATE,

    gender gender_type,

    address TEXT,

    city VARCHAR(100),

    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),

    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(30),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_patients_location
    ON patients(latitude, longitude);


-- ============================================================
-- PROVIDERS
-- Healthcare professional profiles
-- ============================================================

CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL UNIQUE
        REFERENCES users(id)
        ON DELETE CASCADE,

    professional_title VARCHAR(150),

    bio TEXT,

    years_of_experience INTEGER
        CHECK (years_of_experience >= 0),

    status provider_status NOT NULL DEFAULT 'pending',

    profile_image_url TEXT,

    address TEXT,

    city VARCHAR(100),

    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),

    is_verified BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_providers_user_id ON providers(user_id);
CREATE INDEX idx_providers_status ON providers(status);
CREATE INDEX idx_providers_location
    ON providers(latitude, longitude);


-- ============================================================
-- SERVICES
-- Types of healthcare services offered
-- ============================================================

CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL UNIQUE,

    description TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- Initial services
INSERT INTO services (name, description)
VALUES
    ('Nursing', 'Home nursing and nursing care services'),
    ('Physiotherapy', 'Home physiotherapy and rehabilitation services'),
    ('Mental Health', 'Home-based mental health support services');


-- ============================================================
-- PROVIDER SERVICES
-- Many-to-many relationship between providers and services
-- ============================================================

CREATE TABLE provider_services (
    provider_id UUID NOT NULL
        REFERENCES providers(id)
        ON DELETE CASCADE,

    service_id UUID NOT NULL
        REFERENCES services(id)
        ON DELETE CASCADE,

    specialization TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (provider_id, service_id)
);

CREATE INDEX idx_provider_services_service
    ON provider_services(service_id);


-- ============================================================
-- PROVIDER AVAILABILITY
-- Weekly recurring availability
-- ============================================================

CREATE TABLE provider_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    provider_id UUID NOT NULL
        REFERENCES providers(id)
        ON DELETE CASCADE,

    day_of_week INTEGER NOT NULL
        CHECK (day_of_week BETWEEN 0 AND 6),

    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    is_available BOOLEAN NOT NULL DEFAULT TRUE,

    CHECK (end_time > start_time)
);

CREATE INDEX idx_provider_availability_provider
    ON provider_availability(provider_id);

CREATE INDEX idx_provider_availability_day
    ON provider_availability(day_of_week);


-- ============================================================
-- CARE REQUESTS
-- Patient requests for home healthcare
-- ============================================================

CREATE TABLE care_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    patient_id UUID NOT NULL
        REFERENCES patients(id)
        ON DELETE CASCADE,

    description TEXT NOT NULL,

    urgency urgency_level NOT NULL DEFAULT 'normal',

    status request_status NOT NULL DEFAULT 'pending',

    preferred_date DATE,
    preferred_start_time TIME,
    preferred_end_time TIME,

    address TEXT,

    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_care_requests_patient
    ON care_requests(patient_id);

CREATE INDEX idx_care_requests_status
    ON care_requests(status);

CREATE INDEX idx_care_requests_date
    ON care_requests(preferred_date);


-- ============================================================
-- CARE REQUEST SERVICES
-- Services identified/requested for a care request
-- ============================================================

CREATE TABLE care_request_services (
    care_request_id UUID NOT NULL
        REFERENCES care_requests(id)
        ON DELETE CASCADE,

    service_id UUID NOT NULL
        REFERENCES services(id)
        ON DELETE CASCADE,

    confidence_score DECIMAL(5,4),

    source VARCHAR(20) DEFAULT 'user'
        CHECK (source IN ('user', 'ai')),

    PRIMARY KEY (care_request_id, service_id),

    CHECK (
        confidence_score IS NULL
        OR (
            confidence_score >= 0
            AND confidence_score <= 1
        )
    )
);

CREATE INDEX idx_request_services_service
    ON care_request_services(service_id);


-- ============================================================
-- AI ANALYSIS
-- Stores AI-assisted analysis of a care request
-- ============================================================

CREATE TABLE ai_request_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    care_request_id UUID NOT NULL UNIQUE
        REFERENCES care_requests(id)
        ON DELETE CASCADE,

    model_name VARCHAR(100),

    detected_service VARCHAR(100),

    urgency VARCHAR(50),

    structured_data JSONB,

    generated_summary TEXT,

    disclaimer TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_analysis_request
    ON ai_request_analysis(care_request_id);


-- ============================================================
-- PROVIDER REQUESTS
-- Tracks requests sent to specific providers
-- ============================================================

CREATE TABLE provider_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    care_request_id UUID NOT NULL
        REFERENCES care_requests(id)
        ON DELETE CASCADE,

    provider_id UUID NOT NULL
        REFERENCES providers(id)
        ON DELETE CASCADE,

    status appointment_status NOT NULL DEFAULT 'requested',

    distance_km DECIMAL(8,2),

    provider_response_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (care_request_id, provider_id)
);

CREATE INDEX idx_provider_requests_provider
    ON provider_requests(provider_id);

CREATE INDEX idx_provider_requests_request
    ON provider_requests(care_request_id);


-- ============================================================
-- APPOINTMENTS
-- Confirmed/requested home-care visits
-- ============================================================

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    care_request_id UUID NOT NULL
        REFERENCES care_requests(id)
        ON DELETE CASCADE,

    patient_id UUID NOT NULL
        REFERENCES patients(id)
        ON DELETE CASCADE,

    provider_id UUID NOT NULL
        REFERENCES providers(id)
        ON DELETE CASCADE,

    scheduled_date DATE NOT NULL,

    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    address TEXT,

    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),

    status appointment_status NOT NULL DEFAULT 'requested',

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (end_time > start_time)
);

CREATE INDEX idx_appointments_patient
    ON appointments(patient_id);

CREATE INDEX idx_appointments_provider
    ON appointments(provider_id);

CREATE INDEX idx_appointments_date
    ON appointments(scheduled_date);

CREATE INDEX idx_appointments_status
    ON appointments(status);


-- ============================================================
-- REVIEWS
-- Future MVP feature
-- ============================================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    appointment_id UUID NOT NULL UNIQUE
        REFERENCES appointments(id)
        ON DELETE CASCADE,

    patient_id UUID NOT NULL
        REFERENCES patients(id)
        ON DELETE CASCADE,

    provider_id UUID NOT NULL
        REFERENCES providers(id)
        ON DELETE CASCADE,

    rating INTEGER NOT NULL
        CHECK (rating BETWEEN 1 AND 5),

    comment TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_provider
    ON reviews(provider_id);


-- ============================================================
-- UPDATED_AT TRIGGER
-- Automatically updates updated_at columns
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


CREATE TRIGGER patients_updated_at
BEFORE UPDATE ON patients
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


CREATE TRIGGER providers_updated_at
BEFORE UPDATE ON providers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


CREATE TRIGGER care_requests_updated_at
BEFORE UPDATE ON care_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


CREATE TRIGGER appointments_updated_at
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
