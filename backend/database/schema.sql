-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- System Settings (Admin password, ports, setup status)
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    is_setup_completed BOOLEAN DEFAULT FALSE,
    admin_password_hash VARCHAR(255),
    hl7_port INT DEFAULT 2575,
    socket_port INT DEFAULT 3001,
    hospital_name VARCHAR(255) DEFAULT 'Akıllı Hastane',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rooms (Physical rooms in the hospital)
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_number VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100),
    floor_number VARCHAR(20),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Devices (Tablets paired with rooms)
CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_name VARCHAR(100),
    mac_address VARCHAR(100) UNIQUE, -- For security/binding
    token VARCHAR(255) UNIQUE NOT NULL, -- Auth token for the tablet
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL, -- A device belongs to a room
    is_active BOOLEAN DEFAULT TRUE,
    last_seen TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff (Doctors/Nurses assigned to rooms/patients)
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'Doctor', 'Nurse', etc.
    phone_number VARCHAR(50),
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patients (Current admissions)
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mrn VARCHAR(100) UNIQUE NOT NULL, -- Medical Record Number
    visit_number VARCHAR(100) UNIQUE, -- Visit ID from HL7
    first_name VARCHAR(100), -- Will be masked in API
    last_name VARCHAR(100), -- Will be masked in API
    date_of_birth DATE,
    gender VARCHAR(20),
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    admission_date TIMESTAMP,
    discharge_date TIMESTAMP,
    assigned_doctor_id UUID REFERENCES staff(id),
    current_status VARCHAR(50) DEFAULT 'Normal', -- 'Normal', 'Ameliyatta', 'Bebek', etc.
    isolation_type VARCHAR(50), -- 'None', 'Contact', 'Droplet', etc.
    diet_info VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Logs (HL7 Message history)
CREATE TABLE IF NOT EXISTS hl7_logs (
    id SERIAL PRIMARY KEY,
    message_type VARCHAR(20), -- ADT^A01, etc.
    raw_message TEXT,
    processed_status VARCHAR(20), -- 'SUCCESS', 'ERROR'
    error_details TEXT,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial insert for settings if empty
INSERT INTO system_settings (id, is_setup_completed)
SELECT 1, FALSE
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE id = 1);
