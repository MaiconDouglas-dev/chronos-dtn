# ChronosDTN Backend (.NET 8 Web API)

Welcome to the **ChronosDTN Web API** backend. This project is built using **.NET 8** and adheres to **Clean Architecture** principles. It provides satellite node management (CRUD) and DTN (Delay-Tolerant Networking) packet queue management, backed by a SQLite database with automatic migrations and audit logs.

---

## 🏗️ Project Architecture

The solution is divided into four main projects:

1. **ChronosDTN.Domain**
   - Contains core entities and domain logic.
   - Entities:
     - `Operator` (`OPERADORAS_AERO` table): Represents flight/mission operations control centers (e.g., NASA, ESA).
     - `SatelliteNode` (`NOS_SATELLITES` table): Represents ground or satellite transceiver nodes.
     - `DtnPackage` (`FILA_PACOTES_DTN` table): Represents packages queued for delay-tolerant routing.
     - `AuditedTransaction` (`TRANSACOES_AUDITADAS` table): Holds audit records for queue operations.
   - Microsecond timestamps are stored as `long` values to ensure high precision across all entities.

2. **ChronosDTN.Application**
   - Contains business logic, DTOs, and interface definitions.
   - Scaffolds services like `SatelliteNodeService` and `DtnQueueService`.
   - Defines `IChronosDtnDbContext` to invert the dependency on the database layer.

3. **ChronosDTN.Infrastructure**
   - Deals with external concerns such as databases and EF Core.
   - Implements `ChronosDtnDbContext` mapping domain entities to uppercase relational tables and columns.
   - Configures the 1:N relationship between `Operator` and `DtnPackage`.
   - Includes migrations and a `DbInitializer` class to automatically apply migrations and seed initial data (NASA, ESA, JAXA operators, and default satellite nodes) on app startup.

4. **ChronosDTN.API**
   - The presentation layer: controllers, middlewares, and configuration.
   - **Authentication**: Configured with JWT Bearer Token validation using the HMAC-256 key: `ChronosDtnSecretKeySpaceSecurityKey123!`.
   - **Exception Handling**: Implements a custom global exception handling middleware that catches system errors and transforms them into standard JSON problem payloads (e.g., mapping `KeyNotFoundException` to `404 Not Found`).
   - **Controllers**:
     - `AuthController`: Generates valid JWT tokens using the space security secret key.
     - `SatelliteNodeController`: CRUD endpoints for managing satellite transceivers (secured).
     - `DtnQueueController`: Queue endpoints to list, enqueue, and dequeue packages with audit logging (secured).

---

## 🛠️ Requirements

- **.NET 8.0 SDK** (or higher)
- **EF Core CLI Tools** (`dotnet ef`)

Ensure the EF Core CLI tools are installed globally:
```bash
dotnet tool install --global dotnet-ef
```

---

## 🚀 How to Run the Application

### 1. Build the Solution
Compile all projects in the solution:
```bash
dotnet build
```

### 2. Apply/Run Migrations
The database migrations are already prepared. They will run **automatically** on application startup! 
However, if you want to manually create or apply new migrations:

- **Add a new migration:**
  ```bash
  dotnet ef migrations add <MigrationName> --project ChronosDTN.Infrastructure --startup-project ChronosDTN.API
  ```
- **Manually update the database:**
  ```bash
  dotnet ef database update --project ChronosDTN.Infrastructure --startup-project ChronosDTN.API
  ```

This creates a SQLite database file called `ChronosDTN.db` inside the `ChronosDTN.API` project folder.

### 3. Run the Web API
Start the API project:
```bash
dotnet run --project ChronosDTN.API\ChronosDTN.API.csproj
```

The server will start listening. By default, it runs on:
- **HTTP**: `http://localhost:5156`

---

## 📝 API Documentation & Testing

When the application is running, open your browser and navigate to:
**`http://localhost:5156`**

This serves the **Swagger UI** directly at the root route. You can explore and test all API endpoints interactively.

### 🔑 Authentication Flow
Since the CRUD and Queue endpoints are protected by JWT authentication:
1. Make a `POST` request to `/api/auth/token` with the following JSON payload:
   ```json
   {
     "username": "mission-control-admin"
   }
   ```
2. Copy the generated `Token` from the response body.
3. In Swagger UI, click the **Authorize** button at the top right.
4. Enter the token in the input field.
5. Now you can make authorized requests to `/api/SatelliteNode` and `/api/DtnQueue`.
