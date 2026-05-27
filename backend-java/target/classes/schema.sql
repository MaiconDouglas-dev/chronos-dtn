-- 1. Aerospace Operators (Operadoras Aeroespaciais)
CREATE TABLE IF NOT EXISTS OPERADORAS_AERO (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    codigo_registro VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Satellite Nodes (Nós Satélites de Conectividade)
CREATE TABLE IF NOT EXISTS NOS_SATELLITES (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    latency_terra_ms INT NOT NULL DEFAULT 1280,
    latency_lua_ms INT NOT NULL DEFAULT 10,
    status VARCHAR(20) NOT NULL DEFAULT 'ONLINE',
    throughput_kbps INT NOT NULL DEFAULT 10240,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. DTN Bundle Retention Queue (Fila de Pacotes DTN - Roteador Tolerante a Falhas)
CREATE TABLE IF NOT EXISTS FILA_PACOTES_DTN (
    id SERIAL PRIMARY KEY,
    operadora_id INT NOT NULL,
    pacote_metadata TEXT NOT NULL,
    tamanho_kb DECIMAL(10, 2) NOT NULL,
    status_transmissao VARCHAR(30) NOT NULL DEFAULT 'QUEUED',
    retries INT NOT NULL DEFAULT 0,
    created_at BIGINT NOT NULL,
    FOREIGN KEY (operadora_id) REFERENCES OPERADORAS_AERO(id) ON DELETE CASCADE
);

-- 4. Audited Space Transactions (Transações Comerciais Auditadas)
CREATE TABLE IF NOT EXISTS TRANSACOES_AUDITADAS (
    id SERIAL PRIMARY KEY,
    operadora_id INT NOT NULL,
    vl_creditos DECIMAL(18, 4) NOT NULL,
    tm_lunar_bruto BIGINT NOT NULL,
    tm_terra_corrigido BIGINT NOT NULL,
    desvio_microssegundos BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    hash_transacao VARCHAR(64) UNIQUE NOT NULL,
    FOREIGN KEY (operadora_id) REFERENCES OPERADORAS_AERO(id) ON DELETE CASCADE
);
