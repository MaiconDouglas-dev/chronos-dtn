-- Chronos DTN - Banco de Dados de Persistência Simulada (Compatível com PostgreSQL/MySQL)
-- Projetado para o Roteador Financeiro e de Rede Tolerante a Falhas entre a Terra e a Lua

-- 1. Operadoras Aeroespaciais
CREATE TABLE OPERADORAS_AERO (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    codigo_registro VARCHAR(50) UNIQUE NOT NULL, -- Ex: LUNAR-X, ESA-LUNAR, NASA-CLPS
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVO', -- ATIVO, INATIVO
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Nós Satélites de Conectividade (Retransmissores)
CREATE TABLE NOS_SATELLITES (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL, -- Ex: LOP-G Relay, Lunar Pathfinder
    latencia_terra_ms INT NOT NULL DEFAULT 1280, -- Latência Terra-Lua nominal de ida e volta é ~2.56s (1.28s ida)
    latencia_lua_ms INT NOT NULL DEFAULT 10,     -- Latência da órbita para a superfície lunar
    status VARCHAR(20) NOT NULL DEFAULT 'ONLINE', -- ONLINE, DEGRADADO, OFFLINE
    taxa_transferencia_kbps INT NOT NULL DEFAULT 10240, -- Largura de banda máxima
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Fila de Pacotes DTN (Roteador de Store-and-Forward)
CREATE TABLE FILA_PACOTES_DTN (
    id SERIAL PRIMARY KEY,
    operadora_id INT NOT NULL,
    metadata_pacote TEXT NOT NULL, -- JSON contendo cabeçalhos do Bundle Protocol
    tamanho_kb DECIMAL(10, 2) NOT NULL,
    status_transmissao VARCHAR(30) NOT NULL DEFAULT 'ENFILEIRADO', -- ENFILEIRADO, EM_TRANSITO, ENTREGUE, EXPIRADO, RETENTANDO
    tentativas INT NOT NULL DEFAULT 0,
    criado_em_us BIGINT NOT NULL, -- Microssegundos desde o Unix Epoch (Padrão UTC/LTC)
    FOREIGN KEY (operadora_id) REFERENCES OPERADORAS_AERO(id) ON DELETE CASCADE
);

-- 4. Transações Comerciais Auditadas
CREATE TABLE TRANSACOES_AUDITADAS (
    id SERIAL PRIMARY KEY,
    operadora_id INT NOT NULL,
    valor_creditos DECIMAL(18, 4) NOT NULL, -- Alta fidelidade financeira de créditos transacionados
    tempo_lunar_bruto_us BIGINT NOT NULL,   -- Microssegundos medidos pelo relógio local lunar
    tempo_terra_corrigido_us BIGINT NOT NULL, -- Microssegundos compensados para a Terra
    desvio_microssegundos BIGINT NOT NULL,  -- Desvio relativístico calculado (tempo_lunar_bruto - tempo_terra_corrigido)
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE', -- PENDENTE, AUDITADA, REJEITADA
    hash_transacao VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 para integridade da trilha de auditoria
    FOREIGN KEY (operadora_id) REFERENCES OPERADORAS_AERO(id) ON DELETE CASCADE
);

-- ==========================================
-- Dados de Semente Iniciais (Seed Data)
-- ==========================================

-- Popula Operadoras
INSERT INTO OPERADORAS_AERO (nome, codigo_registro, status) VALUES 
('Aether Lunar Logistics', 'AETHER-LUN-01', 'ATIVO'),
('Selene Financial Corp', 'SELENE-FIN-02', 'ATIVO'),
('Artemis Relay Consortium', 'ARTEMIS-REL-03', 'ATIVO');

-- Popula Nós Satélites
INSERT INTO NOS_SATELLITES (nome, latencia_terra_ms, latencia_lua_ms, status, taxa_transferencia_kbps) VALUES
('LunaPath-1 (Retransmissor Orbital)', 1320, 8, 'ONLINE', 25600),
('LOP-G Gateway Comms', 1280, 5, 'ONLINE', 102400),
('Base de Superfície Shackleton', 1410, 2, 'DEGRADED', 512),
('LunaRelay-4 (Lado Oculto)', 1550, 15, 'ONLINE', 4096);

-- Popula Fila de Pacotes DTN
INSERT INTO FILA_PACOTES_DTN (operadora_id, metadata_pacote, tamanho_kb, status_transmissao, tentativas, criado_em_us) VALUES
(1, '{"bundle_id":"dtn://selene.luna/trans-001","destination":"dtn://earth.gateway/finance","payload_hash":"a4f6d7...","priority":"HIGH"}', 12.50, 'ENFILEIRADO', 0, 1779900000000000),
(2, '{"bundle_id":"dtn://selene.luna/trans-002","destination":"dtn://earth.gateway/finance","payload_hash":"c9b2e1...","priority":"MEDIUM"}', 85.20, 'EM_TRANSITO', 1, 1779900001000000);

-- Popula Transações Auditadas (desvio simulado de 56 microssegundos por dia)
-- Época de referência: 1779900000000000 microssegundos
-- Transação 1: 1 dia após a época de referência. Relógio lunar mostra 56 microssegundos adiantados.
INSERT INTO TRANSACOES_AUDITADAS (operadora_id, valor_creditos, tempo_lunar_bruto_us, tempo_terra_corrigido_us, desvio_microssegundos, status, hash_transacao) VALUES
(1, 15000.0000, 1779986400000056, 1779986400000000, 56, 'AUDITADA', '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'),
-- Transação 2: 10 dias após a época de referência. Desvio acumulado de 560 microssegundos.
(2, 450.2500, 1780764000000560, 1780764000000000, 560, 'AUDITADA', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
