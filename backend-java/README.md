# API Web do Gateway Chronos DTN

API Web Spring Boot de alta performance para o sistema 'Chronos DTN', projetada para Roteamento de Rede e Transações Financeiras Interplanetárias entre a Terra e a Lua.

## Tecnologias Utilizadas
- **Java**: 21
- **Spring Boot**: 3.2.5
- **Spring Security**: Autenticação baseada em JWT e configuração de CORS
- **Banco de Dados**: H2 (Em memória, rodando no modo de compatibilidade com PostgreSQL)
- **HATEOAS**: Links de hipermídia para recursos de Transações Auditadas
- **OpenAPI/Swagger**: Documentação da API com interface Swagger UI

## Estrutura de Pacotes
- `com.chronosdtn.gateway.config`: Configurações de Segurança, Web e OpenAPI.
- `com.chronosdtn.gateway.controller`: Controladores de Autenticação (`ControleAutenticacao`), Nós Satélites (`ControleNoSatelite`), Pacotes DTN (`ControlePacoteDtn`) e Transações Auditadas (`ControleTransacaoAuditada`).
- `com.chronosdtn.gateway.model`: Entidades JPA (`Operador`, `NoSatelite`, `PacoteDtn`, `TransacaoAuditada`).
- `com.chronosdtn.gateway.repository`: Repositórios Spring Data JPA.
- `com.chronosdtn.gateway.service`: Serviços `ServicoAuditoriaTempo`, `ServicoFilaDtn` e `ServicoAutenticacao`.
- `com.chronosdtn.gateway.dto`: Objetos de Transferência de Dados (`RespostaJwt`, `RequisicaoLogin`, `RequisicaoNo`, `RequisicaoPacoteDtn`, `RequisicaoTransacao`).

## Fórmula de Correção de Tempo Relativístico
Para compensar o fato de o Tempo Lunar Coordenado (LTC) passar mais rápido em exatamente **56.02 microssegundos por dia** em relação ao Tempo da Terra (UTC/TAI), o `ServicoAuditoriaTempo` implementa a seguinte fórmula de correção linear:

- **Época de Referência**: `1779900000000000` microssegundos
- **Fórmula**:
  ```java
  long delta_t = tempoLunarBruto - EPOCA_REFERENCIA;
  long tempoTerraCorrigido = tempoLunarBruto - (long)(delta_t * (56.02e-6 / 86400.0));
  long desvio = tempoLunarBruto - tempoTerraCorrigido;
  ```

---

## Documentação da API (Endpoints)

### 1. Autenticação
* **POST `/api/autenticacao/login`**: Autentica o operador do gateway.
  * **Corpo da Requisição**:
    ```json
    {
      "username": "operator",
      "password": "password"
    }
    ```
  * **Resposta**: Token JWT em formato JSON.

### 2. Nós Satélites (CRUD)
* **GET `/api/nos`**: Recupera todos os nós satélites.
* **GET `/api/nos/{id}`**: Recupera um nó específico por ID.
* **POST `/api/nos`**: Cria um novo nó satélite.
  * **Corpo da Requisição**:
    ```json
    {
      "nome": "LunaRelay-5",
      "latenciaTerraMs": 1300,
      "latenciaLuaMs": 8,
      "status": "ONLINE",
      "vazaoKbps": 51200
    }
    ```
* **PUT `/api/nos/{id}`**: Atualiza os dados de um nó satélite existente.
* **DELETE `/api/nos/{id}`**: Remove um nó satélite por ID.

### 3. Fila de Pacotes DTN
* **GET `/api/pacotes`**: Lista todos os pacotes atualmente na fila de retenção DTN.
* **POST `/api/pacotes`**: Adiciona um novo pacote na fila DTN.
  * **Corpo da Requisição**:
    ```json
    {
      "operadoraId": 1,
      "metadataPacote": "{\"bundle_id\":\"dtn://selene.luna/trans-003\",\"priority\":\"HIGH\"}",
      "tamanhoKb": 25.40,
      "statusTransmissao": "QUEUED",
      "criadoEmUs": 1779900000000000
    }
    ```
* **PATCH `/api/pacotes/{id}/status`**: Atualiza o status de transmissão e tentativas de entrega de um pacote.
  * **Parâmetros da Query**: `status` (String), `tentativas` (Integer, opcional).
  * **Exemplo**: `/api/pacotes/1/status?status=IN_TRANSIT&tentativas=1`

### 4. Transações Auditadas
* **GET `/api/transacoes`**: Lista todas as transações auditadas com links HATEOAS incluídos na resposta.
* **GET `/api/transacoes/{id}`**: Recupera uma transação auditada específica com links HATEOAS.
* **POST `/api/transacoes`**: Registra e audita uma transação financeira espacial. O gateway calcula de forma automática o `tempoTerraCorrigidoUs` e o `desvioMicrossegundos` relativísticos com base no tempo bruto lunar informado.
  * **Corpo da Requisição**:
    ```json
    {
      "operadoraId": 1,
      "valorCreditos": 5000.0,
      "tempoLunarBrutoUs": 1779986400000056,
      "hashTransacao": "8f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a09"
    }
    ```

---

## Como Construir e Executar o Projeto

### 1. Compilar e rodar testes:
```bash
mvn clean package
```

### 2. Iniciar a aplicação Spring Boot:
```bash
mvn spring-boot:run
```

### 3. Console do Banco de Dados H2:
Acesse `http://localhost:8080/h2-console` usando as credenciais:
- **JDBC URL**: `jdbc:h2:mem:chronosdb`
- **Username**: `sa`
- **Password**: `password`

### 4. Documentação OpenAPI / Swagger UI:
Acesse o Swagger UI em `http://localhost:8080/swagger-ui/index.html` para visualizar os endpoints detalhadamente e testar as requisições em tempo real.
