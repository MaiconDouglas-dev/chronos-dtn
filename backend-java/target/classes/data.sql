-- Reset database sequences and clear tables for idempotent seeding
SET REFERENTIAL_INTEGRITY FALSE;
TRUNCATE TABLE TRANSACOES_AUDITADAS RESTART IDENTITY;
TRUNCATE TABLE FILA_PACOTES_DTN RESTART IDENTITY;
TRUNCATE TABLE NOS_SATELLITES RESTART IDENTITY;
TRUNCATE TABLE OPERADORAS_AERO RESTART IDENTITY;
SET REFERENTIAL_INTEGRITY TRUE;

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

-- Populate DTN queued packets
INSERT INTO FILA_PACOTES_DTN (operadora_id, metadata_pacote, tamanho_kb, status_transmissao, tentativas, criado_em_us) VALUES
(1, '{"bundle_id":"dtn://selene.luna/trans-001","destination":"dtn://earth.gateway/finance","payload_hash":"a4f6d7...","priority":"HIGH"}', 12.50, 'QUEUED', 0, 1779900000000000),
(2, '{"bundle_id":"dtn://selene.luna/trans-002","destination":"dtn://earth.gateway/finance","payload_hash":"c9b2e1...","priority":"MEDIUM"}', 85.20, 'IN_TRANSIT', 1, 1779900001000000);

-- Populate audited transactions
INSERT INTO TRANSACOES_AUDITADAS (operadora_id, valor_creditos, tempo_lunar_bruto_us, tempo_terra_corrigido_us, desvio_microssegundos, status, hash_transacao) VALUES
(1, 15000.0000, 1779986400000056, 1779986400000000, 56, 'AUDITED', '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'),
(2, 450.2500, 1780764000000560, 1780764000000000, 560, 'AUDITED', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
