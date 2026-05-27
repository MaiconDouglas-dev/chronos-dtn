-- Chronos DTN - Simulated Persistence DDL Schema (PostgreSQL/MySQL Compatible)
-- Designed for the Lunar-Earth Interplanetary Financial & Network Router

-- 1. Aerospace Operators (Operadoras Aeroespaciais)
CREATE TABLE OPERADORAS_AERO (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    codigo_registro VARCHAR(50) UNIQUE NOT NULL, -- e.g. LUNAR-X, ESA-LUNAR, NASA-CLPS
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Satellite Nodes (Nós Satélites de Conectividade)
CREATE TABLE NOS_SATELLITES (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL, -- e.g. LOP-G Relay, Lunar Pathfinder, Falcon-Relay
    latency_terra_ms INT NOT NULL DEFAULT 1280, -- Nominal roundtrip Earth-Moon is ~2.56s (1.28s one way)
    latency_lua_ms INT NOT NULL DEFAULT 10,     -- Orbit to surface latency
    status VARCHAR(20) NOT NULL DEFAULT 'ONLINE', -- ONLINE, DEGRADED, OFFLINE
    throughput_kbps INT NOT NULL DEFAULT 10240, -- Max transfer rate
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. DTN Bundle Retention Queue (Fila de Pacotes DTN - Roteador Tolerante a Falhas)
CREATE TABLE FILA_PACOTES_DTN (
    id SERIAL PRIMARY KEY,
    operadora_id INT NOT NULL,
    pacote_metadata TEXT NOT NULL, -- JSON formatted data containing Bundle Protocol headers
    tamanho_kb DECIMAL(10, 2) NOT NULL,
    status_transmissao VARCHAR(30) NOT NULL DEFAULT 'QUEUED', -- QUEUED, IN_TRANSIT, DELIVERED, EXPIRED, RETRYING
    retries INT NOT NULL DEFAULT 0,
    created_at BIGINT NOT NULL, -- Microseconds since Unix Epoch (UTC/LTC standard)
    FOREIGN KEY (operadora_id) REFERENCES OPERADORAS_AERO(id) ON DELETE CASCADE
);

-- 4. Audited Space Transactions (Transações Comerciais Auditadas)
CREATE TABLE TRANSACOES_AUDITADAS (
    id SERIAL PRIMARY KEY,
    operadora_id INT NOT NULL,
    vl_creditos DECIMAL(18, 4) NOT NULL, -- High-fidelity financial transaction credits
    tm_lunar_bruto BIGINT NOT NULL,      -- Microseconds since Epoch (Measured by Lunar Local Clock)
    tm_terra_corrigido BIGINT NOT NULL,  -- Microseconds since Epoch (Compensated Earth Time)
    desvio_microssegundos BIGINT NOT NULL, -- Calculated relativistic drift (tm_lunar_bruto - tm_terra_corrigido)
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, AUDITED, REJECTED
    hash_transacao VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 for audit trail integrity
    FOREIGN KEY (operadora_id) REFERENCES OPERADORAS_AERO(id) ON DELETE CASCADE
);

-- ==========================================
-- Initial Seed Data for Simulation
-- ==========================================

-- Populate Operators
INSERT INTO OPERADORAS_AERO (nome, codigo_registro, status) VALUES 
('Aether Lunar Logistics', 'AETHER-LUN-01', 'ACTIVE'),
('Selene Financial Corp', 'SELENE-FIN-02', 'ACTIVE'),
('Artemis Relay Consortium', 'ARTEMIS-REL-03', 'ACTIVE');

-- Populate Satellite Nodes
INSERT INTO NOS_SATELLITES (nome, latency_terra_ms, latency_lua_ms, status, throughput_kbps) VALUES
('LunaPath-1 (Orbital Relay)', 1320, 8, 'ONLINE', 25600),
('LOP-G Gateway Comms', 1280, 5, 'ONLINE', 102400),
('Shackleton Surface Base', 1410, 2, 'DEGRADED', 512),
('LunaRelay-4 (Far Side)', 1550, 15, 'ONLINE', 4096);

-- Populate a few DTN queued packets
INSERT INTO FILA_PACOTES_DTN (operadora_id, pacote_metadata, tamanho_kb, status_transmissao, retries, created_at) VALUES
(1, '{"bundle_id":"dtn://selene.luna/trans-001","destination":"dtn://earth.gateway/finance","payload_hash":"a4f6d7...","priority":"HIGH"}', 12.50, 'QUEUED', 0, 1779900000000000),
(2, '{"bundle_id":"dtn://selene.luna/trans-002","destination":"dtn://earth.gateway/finance","payload_hash":"c9b2e1...","priority":"MEDIUM"}', 85.20, 'IN_TRANSIT', 1, 1779900001000000);

-- Populate audit logs (Demonstrating ~56 microseconds per day drift)
-- Supposing reference epoch is 1779900000000000 microseconds (about 2026 local simulation time)
-- Transaction 1: 1 day after reference epoch. Raw Lunar time shows 56 microseconds ahead of compensated Earth time.
INSERT INTO TRANSACOES_AUDITADAS (operadora_id, vl_creditos, tm_lunar_bruto, tm_terra_corrigido, desvio_microssegundos, status, hash_transacao) VALUES
(1, 15000.0000, 1779986400000056, 1779986400000000, 56, 'AUDITED', '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'),
-- Transaction 2: 10 days after reference epoch. Drift is 560 microseconds.
(2, 450.2500, 1780764000000560, 1780764000000000, 560, 'AUDITED', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
