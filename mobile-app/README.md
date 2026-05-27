# Chronos DTN - Console de Sincronização Relativística 🚀🌙

Bem-vindo ao **Aplicativo Móvel Chronos DTN**, o console de controle do front-end para o Gateway Financeiro e Roteador de Rede Tolerante a Falhas entre a Terra e a Lua.

Este aplicativo React Native foi construído utilizando **Expo** e **Expo Router (Roteamento baseado em arquivos)**. Ele fornece aos operadores de espaço profundo telemetria em tempo real, auditoria de tempo relativística (compensando o desvio de tempo entre a Terra e a Lua), configurações de nós de conectividade e controles sobre a fila de retenção de pacotes DTN (Delay-Tolerant Networking).

---

## 🛠️ Arquitetura e Layout de Pastas

Os arquivos do aplicativo estão estruturados de forma limpa no diretório `src/` para isolar views, componentes e serviços:

```text
mobile-app/
├── assets/                  # Ícones do app, splash e mídias
├── src/
│   ├── app/                 # Estrutura de telas do Expo Router
│   │   ├── (tabs)/          # Grupo de abas de navegação
│   │   │   ├── _layout.tsx  # Barra de abas inferior temática espacial
│   │   │   ├── index.tsx    # Dashboard (telemetria interplanetária)
│   │   │   ├── auditor.tsx  # Auditor de Tempo (registro de desvio relativístico LTC vs UTC)
│   │   │   ├── nodes.tsx    # Gerenciador CRUD de Nós Satélites de Conectividade
│   │   │   ├── buffer.tsx   # Fila de Retenção do Buffer DTN e gatilhos de transmissão
│   │   │   └── profile.tsx  # Perfil de Acesso (configuração do servidor API e token JWT)
│   │   ├── _layout.tsx    
│   │   └── index.tsx        # Tela de entrada do Expo Router
│   ├── components/          # Componentes customizados reutilizáveis e estilizados
│   │   ├── Header.tsx       # Cabeçalho da aplicação com identificação do operador
│   │   ├── SpaceBackground.tsx # Container com gradiente escuro e glows ambientais
│   │   ├── SpaceButton.tsx  # Botão customizado com estados de carregamento e variantes
│   │   ├── SpaceCard.tsx    # Cards com bordas coloridas temáticas
│   │   ├── SpaceInput.tsx   # Campo de entrada de texto com foco estilizado e erros
│   │   └── SpaceLoader.tsx  # Tela de carregamento modal para transmissões de dados
│   └── services/            # Camada de integração com APIs e armazenamento local
│       ├── api.ts           # Cliente Axios configurado com interceptores de requisição/resposta
│       ├── AppContext.tsx   # Provedor de contexto global para autenticação e telemetria
│       └── storage.ts       # Utilitário de persistência para armazenamento seguro local
```

---

## 🎨 Design Premium & Estética Espacial

O aplicativo utiliza uma estética visual de alta fidelidade ajustada ao tema de exploração e operações comerciais espaciais:
* **Esquema de Cores Cibernético:** Fundo ultra escuro azul-espacial (`#0B0E1B`), superfícies de cards transparentes translúcidas com efeito vidro (`rgba(18, 22, 40, 0.85)`), e contrastes acentuados de roxo (`#8A57FF`), ciano/azul neon (`#00F2FE`), verde neon (`#00F5A0`), amarelo âmbar (`#FFB300`) e magenta (`#FF007A`).
* **Bordas Dinâmicas de Status:** As bordas dos cards mudam dinamicamente dependendo da telemetria ou da classificação do item (ex: verde para nós `ONLINE`, amarelo para `DEGRADADO`, magenta para `OFFLINE` ou pacotes expirados).
* **Glows de Fundo Ambientais:** O componente `SpaceBackground` posiciona orbes brilhantes difusos de cores complementares atrás da interface, simulando reflexos nebulares profundos.
* **Componentes de Ação Rápida:** Campos de formulários com transições de foco elegantes e botões com spinners de carregamento integrados.

---

## 📡 Integração de Rede & Sincronização

* **Armazenamento Seguro Local:** O app armazena a URL da API do servidor e o Token JWT usando `expo-secure-store`. No ambiente Web, ele realiza um fallback automático para `localStorage` para evitar falhas de execução.
* **Interceptor de Requisição Axios:** Injeta dinamicamente a URL da API ativa e o cabeçalho `Authorization: Bearer <Token>` em todas as requisições de saída.
* **Interceptor de Resposta Axios:** Monitora a contagem de requisições globais ativas para exibir a tela de carregamento `SpaceLoader` em processos de sincronização intensiva. Erros de rede disparam avisos persistentes na tela, e respostas com código `401 Unauthorized` revogam a sessão e redirecionam o operador para a aba de autenticação.
* **Modo de Operação Duplo (Simulado / Online):** Caso o console não consiga se comunicar com o backend configurado, os serviços entram automaticamente em modo offline. O aplicativo exibe um banner indicando "Telemetria Simulada", permitindo que os operadores testem fluxos de criação de nós, transmissões de pacotes DTN e logs de desvio de tempo usando dados locais simulados.

---

## ⚡ Instruções de Execução

Siga os passos abaixo para configurar e executar a aplicação no seu ambiente:

### 1. Pré-requisitos
Certifique-se de ter o Node.js (v18+) e o npm instalados. Verifique as versões com os comandos:
```bash
node -v
npm -v
```

### 2. Inicialização do Console
A partir do diretório do aplicativo móvel, execute o comando para iniciar o servidor Expo:
```bash
npm start
```
*Ou execute diretamente nas plataformas de sua preferência:*
* **Navegador Web:** Digite `w` no terminal ou execute `npm run web`.
* **Emulador/Dispositivo Android:** Digite `a` ou execute `npm run android`.
* **Simulador iOS:** Digite `i` ou execute `npm run ios`.

### 3. Conexão & Autenticação
Ao abrir o console:
1. Vá até a aba **Acesso** (Perfil).
2. Configure a URL do servidor de API ativo (ex: `http://localhost:8080/api` para Java ou `http://localhost:5246/api` para .NET. Use `http://10.0.2.2:8080/api` ou similar caso esteja rodando em emulador Android).
3. Utilize o botão **Ping** para diagnosticar o status da conexão.
4. No formulário de Login do Operador, digite o código de registro (ex: `AETHER-LUN-01` ou `SELENE-FIN-02`) e clique em **Autenticar** para iniciar a sua sessão operacional autorizada.

---

## 🧪 Roteiro de Testes Passo a Passo (Manual QA)

Para verificar o funcionamento completo das integrações e recursos, siga o roteiro de testes abaixo:

### Teste 1: Validação do Modo de Simulação Offline (Sem API)
1. Abra o aplicativo e vá em qualquer tela sem configurar a conexão com o servidor.
2. Certifique-se de que o banner amarelo **"Modo de Telemetria Simulada (Cache Local Offline)"** é exibido.
3. Acesse a aba **Nós Satélites** e adicione um nó. Verifique se ele aparece na lista com a borda no status correto (`ONLINE`, `DEGRADADO`, etc.).
4. Acesse a aba **Auditor de Tempo** e clique em **Auditar Agora**. Verifique a geração dinâmica de um cálculo relativístico com desvio em microssegundos.

### Teste 2: Diagnóstico de Conexão (Ping)
1. Certifique-se de que o backend desejado (Java ou .NET) está rodando no host.
2. Na aba **Acesso**, insira a URL correta:
   * **Web Browser (Local):** `http://localhost:8080/api` (Java) ou `http://localhost:5246/api` (C#).
   * **Android Emulator:** `http://10.0.2.2:8080/api` (Java) ou `http://10.0.2.2:5246/api` (C#).
3. Clique em **Salvar URL do Gateway**.
4. Clique em **Diagnóstico Ping**. A telemetria deve mudar para **ONLINE** (com indicador de latência em milissegundos).

### Teste 3: Autenticação com JWT
1. Com a conexão online estabelecida, insira o código de operador `AETHER-LUN-01` no formulário de login (senha: `password`).
2. Clique em **Autenticar & Sincronizar**.
3. O card de sessão mudará para verde indicando **"Sessão de Operador Autorizada"** com status **"JWT ATIVO"**.
4. Navegue para o **Dashboard**. O banner amarelo de simulação desaparecerá, provando que o app está sincronizado em tempo real com o backend.

### Teste 4: CRUD de Nós Satélites (Online)
1. Na aba **Nós Satélites**, clique em **Ativar Novo Nó**.
2. Preencha os campos (Nome, Latências, Throughput e Status) e clique em **Ativar & Sincronizar**.
3. Verifique se o registro foi salvo no banco de dados através da listagem atualizada.
4. Clique em **Configurar** em um nó comercial existente, alterne seu status para `DEGRADADO` e salve. A borda do card deve mudar para laranja/amarelo âmbar instantaneamente.
5. Clique em **Descomissionar** para excluir o nó. O item sumirá da lista e do banco de dados.

### Teste 5: Fila DTN & Store-and-Forward (Online)
1. Vá na aba **Fila DTN**. Você verá os pacotes retidos na fila com status **AGUARDANDO** (cor roxa).
2. Clique no botão de transmissão individual de um pacote ou em **Transmitir Fila (Sincronizar)**.
3. A animação de sincronização `SpaceLoader` será acionada e o status mudará para **ENTREGUE** ou **EM TRÂNSITO** (ciano).

### Teste 6: Dilatação Relativística em Microssegundos (Online)
1. Na aba **Auditor de Tempo**, clique no botão **Auditar Carimbo**.
2. O app enviará o carimbo de data/hora atual lunar ao backend Java, que fará o cálculo e registrará a transação no banco de dados.
3. Um novo log será adicionado ao histórico, exibindo a hora lunar bruta, a hora compensada da Terra e o desvio temporal relativístico exato em microssegundos (ex: `+56.02 μs` por dia de operação simulada).
