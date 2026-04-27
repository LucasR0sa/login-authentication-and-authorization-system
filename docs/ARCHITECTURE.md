# Nucleus Auth — Visão Arquitetural Completa

> Documento de referência arquitetural do projeto Nucleus Auth.
> Última atualização: 2026-04-26 · v1.5.0

---

## 1. Visão Geral do Sistema

O Nucleus Auth é um sistema de **autenticação e autorização** baseado em JWT (JSON Web Tokens).
Resolve um problema fundamental em qualquer aplicação web: **como garantir que apenas usuários autorizados acessem recursos protegidos**.

### O que o sistema faz

| Capacidade | Descrição |
|---|---|
| **Registro** | Cria identidade digital do usuário com senha criptografada (Argon2id) |
| **Login** | Valida credenciais, emite JWT em cookie httpOnly (sem acesso JS) |
| **Proteção de rotas** | Middleware verifica cookie ou header Bearer; válido → acessa; inválido → bloqueado |
| **Logout** | Servidor limpa o cookie; cliente perde acesso imediatamente |
| **Sessão sem estado** | Nenhum dado de sessão no servidor; tudo codificado no JWT |

### Analogia simples

```
Usuário → faz login → servidor grava crachá (JWT) em cofre fechado (cookie httpOnly) →
browser envia cofre automaticamente a cada requisição → 
se válido → entra → se expirado/inválido → porta bloqueada
```

---

## 2. Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USUÁRIO (Navegador)                            │
│                     http://localhost:5173                                │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    FRONTEND — React 18 + Vite + Tailwind                │
│                                                                         │
│   ┌────────────┐    ┌──────────────┐    ┌──────────────┐                │
│   │   pages/   │───▶│ components/  │───▶│ services/    │                │
│   │            │    │              │    │   api.ts     │                │
│   │ Login      │    │ InputField   │    │              │                │
│   │ Register   │    │ PrimaryBtn   │    │ register()   │                │
│   │ Dashboard  │    │ GoogleBtn    │    │ login()      │                │
│   │ ForgotPwd  │    │ LeftPanel    │    │ logout()     │                │
│   └────────────┘    └──────────────┘    │ getMe()      │                │
│                                         └──────┬───────┘                │
│                                                │ credentials: 'include' │
└────────────────────────────────────────────────┼────────────────────────┘
                                                 │
                            fetch() com cookies httpOnly automáticos
                                                 │
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    BACKEND — Node 20 + Express + TypeScript              │
│                     http://localhost:3000                                │
│                                                                         │
│   ┌────────────────────────────────────────────────────────────────┐    │
│   │  Middleware Stack (server.ts)                                  │    │
│   │  helmet → cors(credentials:true) → json → cookieParser         │    │
│   │  → loginLimiter (10/15min) → registerLimiter (5/1h)           │    │
│   └──────────────────────────────┬─────────────────────────────────┘    │
│                                  ▼                                      │
│   ┌────────────┐    ┌──────────────┐    ┌──────────────┐                │
│   │  routes/   │───▶│ controllers/ │───▶│  services/   │                │
│   │            │    │              │    │              │                │
│   │ POST       │    │ register()   │    │ registerUser │                │
│   │ /auth/*    │    │ login()      │    │ loginUser    │                │
│   │ GET        │    │ logout()     │    │ getUserById  │                │
│   │ /user/me   │    └──────────────┘    └──────┬───────┘                │
│   └────────────┘           ▲                   │                        │
│                            │                   ▼                        │
│                    ┌───────────────┐    ┌──────────────┐                │
│                    │ middlewares/  │    │  In-Memory   │                │
│                    │ authenticate  │    │    Store     │                │
│                    │ cookie|Bearer │    │  User[]      │                │
│                    └───────────────┘    └──────────────┘                │
│                                                                         │
│   ┌────────────┐                                                        │
│   │  config/   │                                                        │
│   │  env.ts    │◄─── process.env (único ponto de leitura)              │
│   └────────────┘                                                        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Fluxo de Autenticação (Sequência Completa)

### 3.1 Registro

```
Cliente                       Backend
  │                              │
  │  POST /auth/register         │
  │  { name, email, password }   │
  │─────────────────────────────▶│
  │                              │── sanitizeName() remove HTML/XSS
  │                              │── normaliza email (toLowerCase)
  │                              │── valida formato email (regex)
  │                              │── valida senha (≥8 chars, maiúsc, minúsc, número)
  │                              │── verifica email duplicado
  │                              │── argon2.hash(password)  ← Argon2id
  │                              │── users.push(user)
  │  201 { id, name, email }     │
  │◀─────────────────────────────│
```

### 3.2 Login

```
Cliente                       Backend
  │                              │
  │  POST /auth/login            │
  │  { email, password }         │
  │─────────────────────────────▶│
  │                              │── normaliza email (toLowerCase)
  │                              │── busca user por email
  │                              │── argon2.verify(hash, password)  ← Argon2id
  │                              │── jwt.sign({ id, email }, secret, 1h)
  │  200 { token }               │
  │  Set-Cookie: token=...; HttpOnly; SameSite=Strict
  │◀─────────────────────────────│
  │                              │
  │── cookie salvo pelo browser  │
  │   (JS não pode ler o valor)  │
```

### 3.3 Acesso a Rota Protegida

```
Cliente                       Backend
  │                              │
  │  GET /user/me                │
  │  Cookie: token=<jwt>  ← enviado automaticamente pelo browser
  │─────────────────────────────▶│
  │                              │── middleware extrai token do cookie
  │                              │   (fallback: Authorization: Bearer)
  │                              │── jwt.verify(token, secret)
  │                              │── req.userId = payload.id
  │                              │── service busca user por id
  │  200 { id, name, email }     │
  │◀─────────────────────────────│
```

### 3.4 Logout

```
Cliente                       Backend
  │                              │
  │  POST /auth/logout           │
  │  Cookie: token=<jwt>         │
  │─────────────────────────────▶│
  │                              │── res.clearCookie('token')
  │  200 { message: "Logged out" }│
  │  Set-Cookie: token=; Max-Age=0
  │◀─────────────────────────────│
  │                              │
  │── browser descarta cookie    │
  │── navigate('/login')         │
```

### 3.5 Token Expirado / Inválido

```
Cliente                       Backend
  │                              │
  │  GET /user/me                │
  │  Cookie: token=<expired>     │
  │─────────────────────────────▶│
  │                              │── jwt.verify lança JsonWebTokenError
  │  401 { error: "..." }        │
  │◀─────────────────────────────│
  │                              │
  │── navigate('/login')         │
```

---

## 4. Camadas da Aplicação (Backend)

A arquitetura segue o padrão **Layered Architecture** com separação rígida de responsabilidades:

```
          ┌──────────────────────────────────────┐
          │            HTTP Request               │
          └──────────────────┬───────────────────┘
                             ▼
    ┌─────────────────────────────────────────────────┐
    │  MIDDLEWARE STACK (server.ts)                    │
    │  helmet · cors · json · cookieParser             │
    │  loginLimiter · registerLimiter                  │
    └──────────────────────┬──────────────────────────┘
                           ▼
    ┌─────────────────────────────────────────────────┐
    │  ROUTES                                          │
    │  Responsabilidade: Mapear HTTP verb + path       │
    │  Depende de: Controllers                         │
    │  Exemplo: router.post('/login', login)           │
    └──────────────────────┬──────────────────────────┘
                           ▼
    ┌─────────────────────────────────────────────────┐
    │  CONTROLLERS                                     │
    │  Responsabilidade: Validar entrada + HTTP codes  │
    │  Emite/limpa cookies httpOnly                    │
    │  Depende de: Services                            │
    └──────────────────────┬──────────────────────────┘
                           ▼
    ┌─────────────────────────────────────────────────┐
    │  SERVICES                                        │
    │  Responsabilidade: Regra de negócio pura         │
    │  argon2.hash/verify · jwt.sign · sanitizeName()  │
    │  Depende de: Config                              │
    └──────────────────────┬──────────────────────────┘
                           ▼
    ┌─────────────────────────────────────────────────┐
    │  IN-MEMORY STORE                                 │
    │  Responsabilidade: Persistência (temporária)     │
    │  Tipo: User[] módulo-escopado                    │
    └─────────────────────────────────────────────────┘

    ── Cross-cutting ──────────────────────────────────
    ┌─────────────────────────────────────────────────┐
    │  MIDDLEWARES                                     │
    │  authenticate: extrai cookie httpOnly ou Bearer  │
    │  jwt.verify → injeta req.userId downstream       │
    └─────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────┐
    │  CONFIG                                          │
    │  config/env.ts: único leitor de process.env      │
    │  Fail-fast em produção se JWT_SECRET ausente     │
    └─────────────────────────────────────────────────┘
```

### Regra de Ouro

> **Uma camada nunca pula a próxima.** Controller não fala com store.
> Service não conhece `req`/`res`. Middleware não contém regra de negócio.

---

## 5. Stack Tecnológico

### Backend

| Categoria | Tecnologia | Versão | Justificativa |
|---|---|---|---|
| Runtime | Node.js | 20.x LTS | Suporte nativo a `fetch`, ES2022 completo |
| Linguagem | TypeScript | 5.4.x | `strict: true` habilitado |
| Framework | Express | 4.19.x | Mínimo, maduro, amplamente suportado |
| Autenticação | jsonwebtoken | 9.0.x | HS256, expiração de 1h |
| Hashing | argon2 | 0.44.x | **Argon2id** — vencedor PHC 2015, resistente a GPU |
| Cookies | cookie-parser | 1.4.x | Parsing de cookies httpOnly |
| Headers de segurança | helmet | 8.1.x | 11 headers: CSP, HSTS, X-Frame-Options, etc. |
| Rate limiting | express-rate-limit | 8.4.x | 10 logins/15min · 5 registros/hora |
| CORS | cors | 2.8.x | `credentials: true` + origem restrita |
| Variáveis de ambiente | dotenv | 16.4.x | Carrega `.env` em desenvolvimento |
| Dev reload | ts-node-dev | 2.0.x | Hot reload + TS em memória |
| Testes unitários | Jest + ts-jest | 29.x | Padrão de facto para Node |
| Testes HTTP | Supertest | 7.0.x | Testa Express sem subir servidor real |

### Frontend

| Categoria | Tecnologia | Versão | Justificativa |
|---|---|---|---|
| Framework | React + react-dom | 18.3.x | Concurrent rendering |
| Build tool | Vite | 5.3.x | HMR instantâneo, ESM nativo |
| Linguagem | TypeScript | 5.4.x | `strict: true`, `noUnusedLocals: true` |
| Estilo | Tailwind CSS | 3.4.x | Design system via utility classes |
| Roteamento | react-router-dom | 6.23.x | API declarativa v6 |
| Testes unitários | Vitest | 1.6.x | Compartilha config do Vite |
| Testes DOM | @testing-library/react | 16.0.x | Testa comportamento, não implementação |
| Ambiente testes | jsdom | 24.1.x | DOM virtual para Vitest |

---

## 6. Modelo de Dados

### User (Backend — In-Memory)

```typescript
interface User {
  id: string;           // sequencial: "1", "2", "3"...
  name: string;         // sanitizado (sem HTML); max 100 chars
  email: string;        // normalizado (.toLowerCase()); chave de lookup
  passwordHash: string; // Argon2id hash — NUNCA retornado pela API
}
```

### JWT Payload

```typescript
interface JwtPayload {
  id: string;    // User.id
  email: string; // User.email
  iat: number;   // issued at (automático)
  exp: number;   // expira em 1h (automático)
}
```

### Cookie de Sessão

```
Set-Cookie: token=<jwt>; HttpOnly; SameSite=Strict; Path=/; Max-Age=3600
            ↑           ↑          ↑                           ↑
            JWT        JS não lê  CSRF protection           1 hora
```

`Secure` ativado somente quando `NODE_ENV === 'production'`.

### Contrato da API (Shapes HTTP)

| Endpoint | Request Body | Auth | Response (sucesso) | Response (erro) |
|---|---|---|---|---|
| `POST /auth/register` | `{ name, email, password }` | Não | `201 { id, name, email }` | `400 { error }` |
| `POST /auth/login` | `{ email, password }` | Não | `200 { token }` + Set-Cookie | `401 { error }` |
| `POST /auth/logout` | — | Não | `200 { message }` + clear cookie | — |
| `GET /user/me` | — (cookie automático) | Cookie ou Bearer | `200 { id, name, email }` | `401 { error }` |

---

## 7. Segurança

### Medidas Implementadas (v1.5.0)

| Aspecto | Implementação | Detalhes |
|---|---|---|
| **Hashing de senhas** | Argon2id via `argon2` | Vencedor PHC 2015; resistente a GPU/ASIC |
| **Tokens JWT** | HS256, expiração 1h | Stateless; secret fail-fast em produção |
| **Armazenamento de token** | Cookie httpOnly + SameSite=Strict | JS não pode ler; proteção automática contra XSS e CSRF |
| **Rate limiting** | express-rate-limit | Login: 10/15min · Registro: 5/hora → 429 |
| **Headers de segurança** | helmet (11 headers) | CSP, HSTS, X-Frame-Options, X-Content-Type-Options... |
| **CORS** | `credentials: true` + origem única | Apenas `http://localhost:5173`; cookies cross-origin |
| **Validação de email** | Regex no backend | Garante formato antes de qualquer operação |
| **Validação de senha** | Policy no backend | ≥8 chars, 1 maiúscula, 1 minúscula, 1 número |
| **Sanitização XSS** | `sanitizeName()` | Remove `<script>`, `<style>` e tags HTML do campo `name` |
| **Normalização de email** | `.toLowerCase()` | Antes de armazenar e comparar |
| **Erros genéricos** | Login não revela causa | Sempre "Invalid credentials" (não diferencia email/senha) |
| **Separação de segredo** | `config/env.ts` | Único ponto de leitura de `process.env` |
| **Fail-fast JWT** | `config/env.ts` | Processo aborta em produção se `JWT_SECRET` ausente |
| **Auth dual-mode** | `auth.middleware.ts` | Aceita cookie httpOnly **ou** Authorization: Bearer |

### Riscos Residuais (próximas versões)

| Risco | Status | Mitigação sugerida |
|---|---|---|
| Store em memória (dados perdem no restart) | ⚠️ Design intencional | Migrar para PostgreSQL/MongoDB |
| Sem refresh tokens | ⚠️ Não implementado | Par access/refresh token |
| CORS hardcoded para localhost | ⚠️ Dev only | Ler origens do `.env` |
| Sem E2E automatizado | ⚠️ Não implementado | Playwright/Cypress |

---

## 8. Estrutura de Diretórios Completa

```
auth-api-node/
├── CLAUDE.md                    ◀─ contrato de trabalho do agente AI
├── README.md                    ◀─ visão rápida para novos desenvolvedores
│
├── docs/                        ◀─ documentação centralizada
│   ├── ARCHITECTURE.md          ◀─ este arquivo
│   ├── ATTRIBUTIONS.md          ◀─ créditos e licenças
│   ├── CLAUDE.md                ◀─ contexto AI para docs
│   └── Guidelines.md            ◀─ regras de desenvolvimento
│
├── backend/
│   ├── .env                     ◀─ variáveis de ambiente (gitignored)
│   ├── .gitignore
│   ├── CLAUDE.md                ◀─ contexto AI para o backend
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── __tests__/
│       │   ├── auth.service.test.ts    ◀─ 11 testes unitários
│       │   └── auth.routes.test.ts     ◀─ 13 testes de integração
│       ├── config/
│       │   └── env.ts                  ◀─ único leitor de process.env (fail-fast)
│       ├── controllers/
│       │   └── auth.controller.ts      ◀─ register + login + logout handlers
│       ├── middlewares/
│       │   └── auth.middleware.ts       ◀─ JWT guard dual-mode (cookie|Bearer)
│       ├── routes/
│       │   ├── auth.routes.ts          ◀─ POST /register, /login, /logout
│       │   └── user.routes.ts          ◀─ GET /me (protegida)
│       ├── services/
│       │   └── auth.service.ts         ◀─ regra de negócio + in-memory store
│       └── server.ts                   ◀─ entrypoint + middleware stack
│
└── frontend/
    ├── .gitignore
    ├── CLAUDE.md                ◀─ contexto AI para o frontend
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── vite.config.ts           ◀─ inclui config do Vitest
    └── src/
        ├── __tests__/
        │   ├── setup.ts                ◀─ jest-dom + cleanup
        │   ├── InputField.test.tsx     ◀─ 3 testes de componente
        │   └── api.test.ts             ◀─ 5 testes de serviço
        ├── components/
        │   ├── GoogleButton.tsx        ◀─ placeholder para OAuth
        │   ├── InputField.tsx          ◀─ floating-label controlado
        │   ├── LeftPanel.tsx           ◀─ painel escuro + testimonial
        │   └── PrimaryButton.tsx       ◀─ botão com spinner
        ├── pages/
        │   ├── DashboardPage.tsx       ◀─ rota protegida (getMe via cookie)
        │   ├── ForgotPasswordPage.tsx  ◀─ placeholder funcional
        │   ├── LoginPage.tsx           ◀─ login com validação
        │   └── RegisterPage.tsx        ◀─ registro com validação
        ├── services/
        │   └── api.ts                  ◀─ fetch tipado + credentials:include
        ├── App.tsx                     ◀─ <Routes>
        ├── index.css                   ◀─ @tailwind directives
        └── main.tsx                    ◀─ entrypoint React
```

---

## 9. Design Patterns Utilizados

| # | Padrão | Onde é aplicado | Benefício |
|---|---|---|---|
| 1 | **Layered Architecture** | routes → controllers → services → store | Separação clara de responsabilidades |
| 2 | **Dependency Inversion** | `config/env.ts` como fronteira | Trocar fonte de config sem alterar services |
| 3 | **Middleware Chain** | helmet/rate-limit/authenticate em série | Segurança desacoplada da lógica de negócio |
| 4 | **Single Responsibility** | 1 arquivo = 1 responsabilidade | Facilita teste e manutenção |
| 5 | **Guard Clause** | Early-return em validações | Menos aninhamento, mais legibilidade |
| 6 | **DTO na borda** | Controllers convertem `req.body` → primitivos | Service nunca recebe tipos impuros |
| 7 | **Pure Function** | `handleResponse<T>` sem side effects | Previsível e testável |
| 8 | **Composition** | Pages compõem `LeftPanel + InputField + ...` | Reutilização sem herança |
| 9 | **Controlled Component** | `InputField` com `value` + `onChange` | Estado previsível no React |
| 10 | **Lift State Up** | `RegisterPage` gerencia form state | Comunicação pai → filhos |
| 11 | **Error Boundary (lógico)** | `try/catch` em toda função async | Tratamento consistente de erros |
| 12 | **Factory** | `jwt.sign()` cria tokens padronizados | Formato consistente |
| 13 | **Strategy (placeholder)** | `GoogleButton` como slot para OAuth | Extensível sem quebrar existente |
| 14 | **Test Doubles** | `vi.stubGlobal('fetch', vi.fn())` | Isolamento em testes |

---

## 10. Estratégia de Testes

### Pirâmide de Testes

```
           ╱╲
          ╱  ╲          E2E (futuro)
         ╱────╲         Smoke test manual: register → login → dashboard → logout
        ╱      ╲
       ╱ Integr. ╲      auth.routes.test.ts (13 testes via Supertest)
      ╱────────────╲
     ╱              ╲
    ╱    Unitários    ╲  auth.service.test.ts (11 testes)
   ╱                    ╲ InputField.test.tsx (3 testes)
  ╱──────────────────────╲api.test.ts (5 testes)
```

**Total: 32 testes · todos verdes · cobertura ≥ 80%**

`jest.setTimeout(30000)` ativo no backend — Argon2 é intencionalmente mais lento por design.

### Cobertura esperada

| Camada | Meta | Justificativa |
|---|---|---|
| `services/` | **100%** | Regra de negócio pura — risco máximo |
| `controllers/` | **≥ 90%** | Inclui paths 400/401 |
| `middlewares/` | **100%** | Gate de segurança |
| `components/` | **≥ 80%** | Comportamento, não estilo |
| `pages/` | **≥ 80%** | Happy path + 1 erro de API |

### Comandos

```bash
# Backend
cd backend && npm test              # executa tudo
cd backend && npm run test:coverage # relatório de cobertura

# Frontend
cd frontend && npm test             # executa tudo
cd frontend && npm run test:coverage # relatório de cobertura
```

---

## 11. Como Executar

### Pré-requisitos

- Node.js 20+
- npm 9+

### Setup

```bash
# Terminal 1 — Backend
cd auth-api-node/backend
npm install
npm run dev                # → http://localhost:3000

# Terminal 2 — Frontend
cd auth-api-node/frontend
npm install
npm run dev                # → http://localhost:5173
```

> **Ambos os servidores precisam estar rodando** para o fluxo completo funcionar.

### Variáveis de Ambiente (`backend/.env`)

```env
PORT=3000
JWT_SECRET=sua_chave_secreta_aqui
```

Gerar secret seguro:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 12. Roadmap de Evolução

| Prioridade | Melhoria | Status |
|---|---|---|
| ~~🔴 Alta~~ | ~~Rate limiting (`express-rate-limit`)~~ | ✅ Implementado (v1.5.0) |
| ~~🔴 Alta~~ | ~~Headers de segurança (`helmet`)~~ | ✅ Implementado (v1.5.0) |
| ~~🔴 Alta~~ | ~~httpOnly cookies (substituir localStorage)~~ | ✅ Implementado (v1.5.0) |
| ~~🟡 Média~~ | ~~Validação de senha (complexidade)~~ | ✅ Implementado (v1.5.0) |
| ~~🟡 Média~~ | ~~Migrar Hashing para Argon2id~~ | ✅ Implementado (v1.5.0) |
| 🔴 Alta | Persistência com banco de dados (PostgreSQL) | Dados sobrevivem ao restart |
| 🟡 Média | Refresh tokens | Sessões longas sem re-login |
| 🟡 Média | `VITE_API_URL` via `.env` no frontend | Suporte a múltiplos ambientes |
| 🟢 Baixa | OAuth2 (Google) | Login social |
| 🟢 Baixa | Recuperação de senha real (email) | Fluxo completo de forgot password |
| 🟢 Baixa | E2E tests (Playwright/Cypress) | Confiança end-to-end |
