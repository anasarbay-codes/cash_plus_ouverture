-- ============================================================
-- Cash Plus — Gestion des Ouvertures
-- Script de création de la base + données de démo
-- MySQL 8 — exécuter avec : mysql -u root < DB/seed.sql
-- ============================================================

-- 1) Création de la base
DROP DATABASE IF EXISTS cash_plus_ouverture;
CREATE DATABASE cash_plus_ouverture
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE cash_plus_ouverture;

-- 2) Tables

CREATE TABLE users (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  name            VARCHAR(255) NOT NULL,
  email           VARCHAR(255) NOT NULL UNIQUE,
  role            VARCHAR(31)  NOT NULL,
  password_hash   VARCHAR(255) NOT NULL
);

CREATE TABLE prospections (
  id               BIGINT PRIMARY KEY AUTO_INCREMENT,
  owner_name       VARCHAR(255) NOT NULL,
  phone            VARCHAR(255) NOT NULL,
  lead_source      VARCHAR(31)  NOT NULL,
  assigned_agent_id BIGINT      NOT NULL,
  national_id      VARCHAR(255),
  address          VARCHAR(255),
  city             VARCHAR(255),
  notes            TEXT,
  state            VARCHAR(31)  NOT NULL,
  rejection_reason TEXT,
  CONSTRAINT fk_prospection_agent FOREIGN KEY (assigned_agent_id) REFERENCES users(id)
);

CREATE TABLE demandes_ouverture (
  id                BIGINT PRIMARY KEY AUTO_INCREMENT,
  reference         VARCHAR(255) NOT NULL UNIQUE,
  request_date      DATE         NOT NULL,
  submitted_date    DATE,
  owner_name        VARCHAR(255),
  owner_phone       VARCHAR(255),
  owner_email       VARCHAR(255),
  address           VARCHAR(255),
  city              VARCHAR(255),
  area_sqm          DECIMAL(19,2),
  agency_category   VARCHAR(31),
  state             VARCHAR(31)  NOT NULL,
  rejection_reason  TEXT,
  prospection_id    BIGINT,
  assigned_agent_id BIGINT       NOT NULL,
  CONSTRAINT fk_demande_prospection FOREIGN KEY (prospection_id) REFERENCES prospections(id),
  CONSTRAINT fk_demande_agent FOREIGN KEY (assigned_agent_id) REFERENCES users(id)
);

CREATE TABLE suivis_ouverture (
  id                  BIGINT PRIMARY KEY AUTO_INCREMENT,
  reference           VARCHAR(255) NOT NULL UNIQUE,
  agency_name         VARCHAR(255),
  address             VARCHAR(255),
  city                VARCHAR(255),
  legal_documents_ready BOOLEAN NOT NULL DEFAULT FALSE,
  fit_out_ready         BOOLEAN NOT NULL DEFAULT FALSE,
  network_setup_ready   BOOLEAN NOT NULL DEFAULT FALSE,
  compliance_checked    BOOLEAN NOT NULL DEFAULT FALSE,
  installation_done     BOOLEAN NOT NULL DEFAULT FALSE,
  start_date            DATE,
  state                 VARCHAR(31)  NOT NULL,
  demande_id            BIGINT,
  assigned_agent_id     BIGINT       NOT NULL,
  CONSTRAINT fk_suivi_demande FOREIGN KEY (demande_id) REFERENCES demandes_ouverture(id),
  CONSTRAINT fk_suivi_agent FOREIGN KEY (assigned_agent_id) REFERENCES users(id)
);

CREATE TABLE demande_photos (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  file_path   VARCHAR(255) NOT NULL,
  uploaded_at DATETIME     NOT NULL,
  demande_id  BIGINT       NOT NULL,
  CONSTRAINT fk_demande_photo FOREIGN KEY (demande_id) REFERENCES demandes_ouverture(id)
);

CREATE TABLE suivi_photos (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  file_path   VARCHAR(255) NOT NULL,
  uploaded_at DATETIME     NOT NULL,
  suivi_id    BIGINT       NOT NULL,
  CONSTRAINT fk_suivi_photo FOREIGN KEY (suivi_id) REFERENCES suivis_ouverture(id)
);

-- 3) Données de démo
-- Mot de passe commun de tous les comptes : password123
-- Hash BCrypt : $2a$10$Ox.7YaRItqGsLKMBDolR3O8LFmn54KAcQQIOEI.tkBctQZ4b/8q3C

INSERT INTO users (name, email, role, password_hash) VALUES
('Agent Démo',         'agent@cashplus.com',      'AGENT',     '$2a$10$Ox.7YaRItqGsLKMBDolR3O8LFmn54KAcQQIOEI.tkBctQZ4b/8q3C'),
('Karim Benali',       'karim@cashplus.com',      'AGENT',     '$2a$10$Ox.7YaRItqGsLKMBDolR3O8LFmn54KAcQQIOEI.tkBctQZ4b/8q3C'),
('Samira El Fassi',    'samira@cashplus.com',     'AGENT',     '$2a$10$Ox.7YaRItqGsLKMBDolR3O8LFmn54KAcQQIOEI.tkBctQZ4b/8q3C'),
('Validateur Démo',    'validateur@cashplus.com', 'VALIDATEUR','$2a$10$Ox.7YaRItqGsLKMBDolR3O8LFmn54KAcQQIOEI.tkBctQZ4b/8q3C'),
('Manager Démo',       'manager@cashplus.com',    'MANAGER',   '$2a$10$Ox.7YaRItqGsLKMBDolR3O8LFmn54KAcQQIOEI.tkBctQZ4b/8q3C');

-- Prospections (agent id = 1)
INSERT INTO prospections (owner_name, phone, lead_source, assigned_agent_id, national_id, address, city, notes, state) VALUES
('Karim Bensouda',   '0661234501', 'WALK_IN',   1, 'BE123456', '12 Rue Fes, Guéliz',           'Marrakech', 'Passage au bureau',              'INTERESTED'),
('Sanae Errami',     '0661234502', 'WEBSITE',   1, 'ER789012', '45 Ave Mohammed V',            'Rabat',     'Formulaire de contact',          'NEW'),
('Anas Idrissi',     '0661234503', 'FACEBOOK',  1, 'ID345678', '8 Derb Sidi Bouloukat',        'Casablanca','Message Facebook',                'CONFIRMED'),
('Naima Chakir',     '0661234504', 'PHONE',     1, 'CK901234', '23 Rue Oujda',                 'Fès',       'Appel entrant',                   'INTERESTED'),
('Rajae Tazi',       '0661234505', 'WALK_IN',   1, 'TZ567890', '67 Ave Hassan II',             'Tanger',    'Venue demander des infos',        'NEW'),
('Mohammed Chraibi', '0661234512', 'FACEBOOK',  1, 'CR789013', '83 Rue Al Atlas',              'Casablanca','Publication sur la page',           'NOT_INTERESTED'),
('Othmane Filali',   '0661234510', 'PHONE',     1, 'FL567891', '14 Rue Sidi Bouamar',          'Agadir',    'Appel pour ouverture',            'CONFIRMED');

-- Demande d'ouverture (liée à la prospection 3 — Anas Idrissi, agent 1)
INSERT INTO demandes_ouverture (reference, request_date, submitted_date, owner_name, owner_phone, owner_email, address, city, area_sqm, agency_category, state, prospection_id, assigned_agent_id) VALUES
('DO-00001', '2026-07-10', '2026-07-11', 'Anas Idrissi', '0661234503', 'anas.idrissi@email.com', '8 Derb Sidi Bouloukat', 'Casablanca', 45.50, 'STANDARD', 'VALIDATED', 3, 1),
('DO-00002', '2026-07-12', NULL,         'Karim Bensouda', '0661234501', NULL, '12 Rue Fes, Guéliz', 'Marrakech', 60.00, 'HOT_SPOT', 'DATA_COLLECTION', 1, 1),
('DO-00003', '2026-07-13', '2026-07-14', 'Othmane Filali', '0661234510', 'othmane.filali@email.com', '14 Rue Sidi Bouamar', 'Agadir', 35.00, 'RURAL', 'REJECTED', 7, 1);

-- Suivi d'ouverture (lié à la demande validée DO-00001)
INSERT INTO suivis_ouverture (reference, agency_name, address, city, legal_documents_ready, fit_out_ready, network_setup_ready, compliance_checked, installation_done, start_date, state, demande_id, assigned_agent_id) VALUES
('DO-00001', 'Agence Centre Casablanca', '8 Derb Sidi Bouloukat', 'Casablanca', TRUE, TRUE, TRUE, TRUE, TRUE, '2026-07-15', 'LIVE', 1, 1),
('DO-00002', 'Agence Guéliz', '12 Rue Fes, Guéliz', 'Marrakech', TRUE, FALSE, FALSE, FALSE, FALSE, NULL, 'PREPARATION', 2, 1);

-- Photos de démo (chemins relatifs vers le dossier uploads)
INSERT INTO demande_photos (file_path, uploaded_at, demande_id) VALUES
('demandes/1/photo1.jpg', '2026-07-11 10:15:00', 1),
('demandes/1/photo2.jpg', '2026-07-11 10:16:00', 1),
('demandes/1/photo3.jpg', '2026-07-11 10:17:00', 1);

INSERT INTO suivi_photos (file_path, uploaded_at, suivi_id) VALUES
('suivis/1/photo1.jpg', '2026-07-15 09:30:00', 1);
