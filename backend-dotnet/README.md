# ChronosDTN Backend (.NET 8 Web API)

Bem-vindo ao backend **ChronosDTN Web API**. Este projeto foi desenvolvido utilizando **.NET 8** e segue os princípios da **Clean Architecture** (Arquitetura Limpa). Ele disponibiliza o gerenciamento de nós de satélites (CRUD) e o controle da fila de pacotes DTN (Delay-Tolerant Networking), integrando-se a um banco de dados SQLite com migrações automáticas e logs de auditoria.

---

## 🏗️ Arquitetura do Projeto

A solução está dividida em quatro projetos principais:

1. **ChronosDTN.Domain**
   - Contém as entidades de domínio e as regras fundamentais.
   - Entidades:
     - `Operador` (tabela `OPERADORAS_AERO`): Representa os centros de controle de operações aéreas ou missões espaciais (ex: NASA, ESA, INPE).
     - `NoSatelite` (tabela `NOS_SATELLITES`): Representa nós transceptores terrestres ou satelitais.
     - `PacoteDtn` (tabela `FILA_PACOTES_DTN`): Representa os pacotes enfileirados para roteamento tolerante a atrasos.
     - `TransacaoAuditada` (tabela `TRANSACOES_AUDITADAS`): Armazena os registros de auditoria sobre operações de fila.
   - Os timestamps em microssegundos são armazenados como valores `long` para garantir a mais alta precisão em todas as entidades.

2. **ChronosDTN.Application**
   - Contém as regras de negócio, os DTOs e as definições de interfaces.
   - Define serviços da aplicação como `ServicoNoSatelite` e `ServicoFilaDtn`.
   - Define a interface `IChronosDtnDbContext` para inverter a dependência da camada de persistência.

3. **ChronosDTN.Infrastructure**
   - Lida com aspectos de persistência de dados utilizando o Entity Framework Core.
   - Implementa a classe `ChronosDtnDbContext`, mapeando as entidades de domínio traduzidas para tabelas e colunas relacionais em maiúsculas.
   - Configura a relação 1:N entre as entidades `Operador` e `PacoteDtn`.
   - Inclui as migrations e a classe `DbInitializer` para aplicar as migrações automaticamente no início da API e semear os dados padrão (NASA, ESA, JAXA, INPE e nós iniciais).

4. **ChronosDTN.API**
   - A camada de apresentação com controllers, middlewares e configurações da aplicação.
   - **Autenticação**: Configurada com JWT Bearer Token, verificada através da chave HMAC-256 compartilhada: `ChronosDtnSecretKeySpaceSecurityKey123!`.
   - **Tratamento de Erros**: Implementa o middleware customizado `MiddlewareTratamentoErros`, que intercepta falhas e as converte em payloads padronizados RFC 7807 em JSON (por exemplo, convertendo `KeyNotFoundException` para `404 Not Found`).
   - **Controllers**:
     - `AutenticacaoController`: Rota `api/autenticacao/token` para geração de tokens JWT.
     - `NoSateliteController`: Rota `api/nosatelite` para CRUD dos transceptores (protegido).
     - `FilaDtnController`: Rota `api/filadtn` com endpoints de enfileiramento (`enfileirar`), desenfileiramento (`desenfileirar/{id}`) e listagem da fila (protegido).

---

## 🛠️ Requisitos

- **.NET 8.0 SDK** (ou superior)
- **Ferramentas CLI do EF Core** (`dotnet ef`)

Certifique-se de que a ferramenta CLI do EF Core está instalada globalmente:
```bash
dotnet tool install --global dotnet-ef
```

---

## 🚀 Como Executar a Aplicação

### 1. Compilar a Solução
Execute a compilação de todos os projetos:
```bash
dotnet build
```

### 2. Aplicar / Executar as Migrações do Banco
As migrations do banco SQLite já estão geradas e configuradas para rodar **automaticamente** assim que a API for iniciada! 
Se você desejar gerenciar as migrations manualmente usando a CLI:

- **Adicionar uma nova migração:**
  ```bash
  dotnet ef migrations add <NomeDaMigracao> --project ChronosDTN.Infrastructure --startup-project ChronosDTN.API
  ```
- **Aplicar migrações manualmente ao banco:**
  ```bash
  dotnet ef database update --project ChronosDTN.Infrastructure --startup-project ChronosDTN.API
  ```

Isso criará o arquivo SQLite `ChronosDTN.db` dentro do diretório do projeto `ChronosDTN.API`.

### 3. Executar a Web API
Inicie o projeto da API:
```bash
dotnet run --project ChronosDTN.API\ChronosDTN.API.csproj
```

O servidor começará a escutar requisições na porta HTTP padrão:
- **HTTP**: `http://localhost:5156`

---

## 📝 Documentação da API & Testes

Com a aplicação rodando, acesse em seu navegador:
**`http://localhost:5156`**

Isso disponibilizará a interface do **Swagger UI** diretamente na rota raiz. Nela você poderá explorar e disparar requisições interativas para todos os endpoints da API.

### 🔑 Fluxo de Autenticação JWT
Como os endpoints de gerenciamento de nós e fila exigem autenticação JWT Bearer:
1. Faça uma requisição `POST` para o endpoint `/api/autenticacao/token` com o seguinte payload JSON:
   ```json
   {
     "usuario": "administrador-controle-missao"
   }
   ```
2. Copie o valor de `Token` retornado na resposta HTTP.
3. No Swagger UI, clique no botão **Authorize** no canto superior direito.
4. Digite `Bearer {seu_token}` (substituindo `{seu_token}` pelo token copiado).
5. Clique em Authorize. A partir de agora, você está autenticado para testar as rotas `/api/nosatelite` e `/api/filadtn`.
