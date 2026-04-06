-- Initial schema migration
-- This migration sets up the complete PSO database schema.
-- If tables already exist (migrated from existing DB), Flyway baseline will skip this.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS administrator (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    balance_amount DECIMAL(15,2) DEFAULT 0,
    email_address VARCHAR,
    phone_number VARCHAR NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teacher (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    email_address VARCHAR,
    phone_number VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES parent(id),
    name VARCHAR NOT NULL,
    phone_number VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS session_rate (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES course(id),
    teacher_id UUID REFERENCES teacher(id),
    student_id UUID REFERENCES student(id),
    teacher_amount_per_hour DECIMAL(15,2),
    parent_amount_per_hour DECIMAL(15,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parent_invoice (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES parent(id),
    year INT,
    month INT,
    current_balance_amount DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(parent_id, year, month)
);

CREATE TABLE IF NOT EXISTS session (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES parent_invoice(id) ON DELETE RESTRICT,
    student_id UUID REFERENCES student(id) ON DELETE RESTRICT,
    course_id UUID REFERENCES course(id) ON DELETE RESTRICT,
    teacher_id UUID REFERENCES teacher(id) ON DELETE RESTRICT,
    bill_year INT,
    bill_month INT,
    session_start_timestamp TIMESTAMPTZ,
    duration_hour DECIMAL(5,2),
    parent_amount DECIMAL(15,2),
    teacher_amount DECIMAL(15,2),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parent_payment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES parent(id),
    insert_timestamp TIMESTAMPTZ DEFAULT NOW(),
    source VARCHAR,
    payment_timestamp TIMESTAMPTZ,
    amount DECIMAL(15,2),
    description TEXT
);

CREATE TABLE IF NOT EXISTS parent_invoice_payment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES parent_invoice(id) ON DELETE CASCADE,
    year INT,
    month INT,
    payment_timestamp TIMESTAMPTZ,
    amount DECIMAL(15,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teacher_salary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    insert_timestamp TIMESTAMPTZ DEFAULT NOW(),
    year INT,
    month INT,
    teacher_id UUID REFERENCES teacher(id) ON DELETE CASCADE,
    amount DECIMAL(15,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
