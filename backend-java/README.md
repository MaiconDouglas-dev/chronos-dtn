# Chronos DTN Gateway Web API

High-performance Spring Boot Web API for the 'Chronos DTN' system, designed for Lunar-Earth Interplanetary Financial & Network Routing.

## Technologies Used
- **Java**: 21
- **Spring Boot**: 3.2.5
- **Spring Security**: JWT Authentication and CORS Configured
- **Database**: H2 (In-Memory, running Postgres Compatibility Mode)
- **HATEOAS**: Hypermedia links for Audited Transactions
- **OpenAPI/Swagger**: API Documentation with Swagger UI

## Package Structure
- `com.chronosdtn.gateway.config`: Security, Web, and OpenAPI configurations.
- `com.chronosdtn.gateway.controller`: Auth, SatelliteNode, DtnPackage, and AuditedTransaction controllers.
- `com.chronosdtn.gateway.model`: JPA Entities (Operator, SatelliteNode, DtnPackage, AuditedTransaction).
- `com.chronosdtn.gateway.repository`: Spring Data JPA Repositories.
- `com.chronosdtn.gateway.service`: TimeAuditingService, DtnQueueService, and AuthService.
- `com.chronosdtn.gateway.dto`: Data Transfer Objects (JWTResponse, LoginRequest, NodeRequest, etc.).

## Relativistic Time Correction Formula
To compensate for Coordinated Lunar Time (LTC) running faster by **56.02 microseconds per day** relative to Earth Time (UTC/TAI), the `TimeAuditingService` implements the linear correction:

- **Reference Epoch**: `1779900000000000` microseconds
- **Formula**:
  ```java
  long delta_t = lunarRaw - referenceEpoch;
  long earthCorrected = lunarRaw - (long)(delta_t * (56.02e-6 / 86400.0));
  long drift = lunarRaw - earthCorrected;
  ```

---

## API Documentation (Endpoints)

### 1. Authentication
* **POST `/api/auth/login`**: Authenticate operator.
  * **Payload**:
    ```json
    {
      "username": "operator",
      "password": "password"
    }
    ```
  * **Response**: JWT Token.

### 2. Satellite Nodes (CRUD)
* **GET `/api/nodes`**: Retrieve all nodes.
* **GET `/api/nodes/{id}`**: Retrieve node by ID.
* **POST `/api/nodes`**: Create new node.
  * **Payload**:
    ```json
    {
      "nome": "LunaRelay-5",
      "latencyTerraMs": 1300,
      "latencyLuaMs": 8,
      "status": "ONLINE",
      "throughputKbps": 51200
    }
    ```
* **PUT `/api/nodes/{id}`**: Update node.
* **DELETE `/api/nodes/{id}`**: Delete node.

### 3. DTN Queue
* **GET `/api/packages`**: List all packets in the queue.
* **POST `/api/packages`**: Queue a new packet.
  * **Payload**:
    ```json
    {
      "operadoraId": 1,
      "pacoteMetadata": "{\"bundle_id\":\"dtn://selene.luna/trans-003\",\"priority\":\"HIGH\"}",
      "tamanhoKb": 25.40,
      "statusTransmissao": "QUEUED",
      "createdAt": 1779900000000000
    }
    ```
* **PATCH `/api/packages/{id}/status`**: Update packet status.
  * **Parameters**: `status` (String), `retries` (Integer, optional).
  * **Example**: `/api/packages/1/status?status=DELIVERED&retries=0`

### 4. Audited Transactions
* **GET `/api/transactions`**: List transactions with HATEOAS links.
* **GET `/api/transactions/{id}`**: Retrieve single transaction with self links.
* **POST `/api/transactions`**: Record and audit a space financial transaction. It automatically calculates `tmTerraCorrigido` and `desvioMicrossegundos` from the raw lunar time.
  * **Payload**:
    ```json
    {
      "operadoraId": 1,
      "vlCreditos": 5000.0,
      "tmLunarBruto": 1779986400000056,
      "hashTransacao": "8f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a09"
    }
    ```

---

## How to Build and Run

### 1. Build project:
```bash
mvn clean package
```

### 2. Run project:
```bash
mvn spring-boot:run
```

### 3. H2 Console:
Access `http://localhost:8080/h2-console` with:
- JDBC URL: `jdbc:h2:mem:chronosdb`
- Username: `sa`
- Password: `password`

### 4. OpenAPI / Swagger Documentation:
Access Swagger UI at `http://localhost:8080/swagger-ui/index.html` to view endpoints and execute test requests.
