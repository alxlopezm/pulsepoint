CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE business_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO business_units (name) VALUES
  ('Finance'), ('R&D'), ('Manufacturing'), ('GI'),
  ('Infrastructure'), ('Customer Experience'), ('Security');

CREATE TABLE initiatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  owner VARCHAR NOT NULL,
  business_unit_id UUID REFERENCES business_units(id),
  priority VARCHAR NOT NULL CHECK (priority IN ('High', 'Medium', 'Low')),
  status VARCHAR NOT NULL DEFAULT 'Requested' CHECK (status IN ('Requested', 'In Design', 'In Assessment', 'Approved', 'In Development')),
  type VARCHAR NOT NULL CHECK (type IN ('Technology Request', 'Enterprise Architecture Governance', 'Enterprise Architecture Growth')),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id UUID REFERENCES initiatives(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE next_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id UUID REFERENCES initiatives(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  responsible VARCHAR,
  due_date DATE,
  start_date DATE,
  completed_date DATE,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'started', 'completed')),
  created_at TIMESTAMP DEFAULT NOW()
);
