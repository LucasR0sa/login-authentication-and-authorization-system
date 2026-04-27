# Nucleus Auth — Guidelines de Desenvolvimento

> Regras e padrões que todo contribuidor (humano ou AI) deve seguir.
> Última atualização: 2026-04-26 · v1.5.0

---

## 1. Regras Gerais de Código

### TypeScript

- `strict: true` em ambos os projetos — sem exceções
- **Zero `any`**: use `unknown` + type guard quando o tipo é incerto
- Prefixar parâmetros não usados com underscore: `(_req, res) => …`
- Toda função exportada deve ter tipos explícitos de retorno

### Estrutura

- **Um arquivo = uma responsabilidade** — não misturar conceitos
- Manter arquivos pequenos (< 150 linhas); extrair helpers se necessário
- Helpers e utilitários vão em seus próprios arquivos
- Usar imports absolutos quando configurado, relativos quando não

### Nomeação

| Tipo | Convenção | Exemplo |
|---|---|---|
| Arquivos TS/TSX | kebab-case ou PascalCase (componentes) | `auth.service.ts`, `LoginPage.tsx` |
| Funções | camelCase | `registerUser`, `handleSubmit` |
| Interfaces/Types | PascalCase | `User`, `AuthRequest` |
| Constantes | UPPER_SNAKE_CASE | `JWT_SECRET`, `BASE_URL` |
| Variáveis de ambiente | UPPER_SNAKE_CASE | `PORT`, `VITE_API_URL` |

---

## 2. Arquitetura Backend

### Camadas (ordem obrigatória)

```
Routes → Controllers → Services → Store/Repository
```

| Camada | Pode importar | NÃO pode importar |
|---|---|---|
| Routes | Controllers | Services, Store |
| Controllers | Services | Store, Express internals |
| Services | Config | Express (`req`, `res`) |
| Middlewares | Config, Services | Controllers |
| Config | `process.env` (exclusivo) | Qualquer outra camada |

### Regras de camada

1. **Controller nunca acessa o store** — sempre via service
2. **Service nunca conhece HTTP** — recebe primitivos, retorna objetos
3. **Middleware não contém lógica de negócio** — apenas cross-cutting
4. **Config é o único que lê `process.env`** — nenhum outro arquivo

---

## 3. Design System Frontend (Nucleus)

### Tokens visuais

| Token | Valor | Uso |
|---|---|---|
| Cor primária | `#6C5CE7` | Botões, links, acentos |
| Cor texto principal | `#111827` | Títulos, labels |
| Cor texto secundário | `#6B7280` | Descrições, subtextos |
| Cor borda | `#E5E7EB` | Inputs, cards |
| Cor background | `#F9FAFB` | Superfícies secundárias |
| Fonte | DM Sans (Google Fonts) | Todo o sistema |
| Border radius (cards) | `rounded-2xl` (16px) | Cards, modais |
| Border radius (inputs) | `rounded-lg` (8px) | Inputs, botões |

### Componentes core

| Componente | Variantes | Observações |
|---|---|---|
| `PrimaryButton` | default, loading | Spinner automático via prop `loading` |
| `InputField` | text, email, password | Floating label controlado |
| `GoogleButton` | — | Placeholder; não funcional ainda |
| `LeftPanel` | — | Painel dark com testimonial |

### Regras de estilo

- **Tailwind CSS** para estilização — não criar CSS custom exceto `@tailwind` directives
- **Responsividade**: mobile-first, breakpoints `sm`, `md`, `lg`
- **Acessibilidade**: `aria-pressed` em toggles, labels em inputs, contraste WCAG AA
- **Sem posicionamento absoluto** desnecessário — preferir flexbox/grid

---

## 4. Segurança

### Implementado (obrigatório manter)

- [x] Senhas hasheadas com **Argon2id** (`argon2.hash` / `argon2.verify`)
- [x] JWT com expiração de 1h (HS256)
- [x] Token JWT em **cookie httpOnly** (SameSite=Strict) — não usar `localStorage`
- [x] `credentials: 'include'` em **todos** os `fetch()` do frontend
- [x] Logout via `POST /auth/logout` — servidor limpa o cookie
- [x] Auth dual-mode: middleware aceita cookie httpOnly **ou** `Authorization: Bearer`
- [x] Erro de login genérico ("Invalid credentials") — não revelar se email/senha é o erro
- [x] CORS restrito a `http://localhost:5173` com `credentials: true`
- [x] `.env` no `.gitignore` — nunca commitar segredos
- [x] `config/env.ts` é o **único** arquivo que lê `process.env`
- [x] Fail-fast: processo aborta em produção se `JWT_SECRET` ausente
- [x] Rate limiting: login 10/15min · registro 5/hora (retorna 429)
- [x] `helmet` ativo — 11 headers de segurança (CSP, HSTS, X-Frame-Options...)
- [x] Validação de email no backend (regex) — não confiar só no frontend
- [x] Validação de senha no backend: ≥8 chars, 1 maiúscula, 1 minúscula, 1 número
- [x] `sanitizeName()`: remove `<script>`, `<style>` e tags HTML do campo `name`
- [x] Normalização de email: `.toLowerCase()` antes de armazenar e comparar

### Pendentes (próximas versões)

- [ ] Refresh tokens (par access + refresh)
- [ ] HTTPS obrigatório em produção
- [ ] Origens CORS via `.env` (hoje hardcoded)

---

## 5. Testes

### Metodologia: TDD (Red → Green → Refactor)

1. **RED** — escrever o teste; rodar; ver falhar
2. **GREEN** — menor código possível para passar
3. **REFACTOR** — limpar, mantendo testes verdes

### Cobertura mínima: 80%

| Camada | Meta |
|---|---|
| `services/` | 100% |
| `controllers/` | ≥ 90% |
| `middlewares/` | 100% |
| `components/` | ≥ 80% |
| `pages/` | ≥ 80% |

### Configurações obrigatórias

- `jest.setTimeout(30000)` no backend — Argon2 é intencionalmente mais lento por design
- Adicionar `cookieParser()` ao `buildApp()` nos testes de integração
- Envolver páginas com `<MemoryRouter>` nos testes de componentes React

### Anti-padrões proibidos

- ❌ Testar implementação interna (`component.state.foo`)
- ❌ Mockar `argon2` ou `jsonwebtoken` em testes unitários — são a regra sendo testada
- ❌ Testar classes CSS/Tailwind — testar comportamento
- ❌ Snapshots gigantes de DOM
- ❌ Código sem teste correspondente
- ❌ `fetch()` diretamente em páginas/componentes — sempre via `services/api.ts`
- ❌ `localStorage` para armazenar token — o cookie httpOnly é gerenciado pelo browser

---

## 6. Git & Commits

### Conventional Commits

```
feat: adicionar endpoint de logout
fix: corrigir validação de email no register
test: adicionar testes para middleware authenticate
docs: atualizar ARCHITECTURE.md com diagrama de fluxo
refactor: extrair validação para helper
```

### Checklist pré-commit

- [ ] `npm test` passa em backend e frontend (0 falhas)
- [ ] `npx tsc --noEmit` sem erros
- [ ] Nenhum `any` introduzido
- [ ] Nenhum segredo commitado
- [ ] Nova função exportada tem pelo menos 1 teste
- [ ] Novo endpoint tem teste de sucesso **e** de erro
- [ ] Documentação atualizada se API mudou

---

## 7. Performance

### Backend

- Evitar operações síncronas bloqueantes no event loop
- `argon2.hash` e `argon2.verify` são async — sempre usar `await`
- Respostas JSON mínimas — não enviar dados desnecessários
- Não retornar `passwordHash` em nenhuma resposta

### Frontend

- Componentes declarados **fora** de outros componentes
- `useEffect` com array de dependências correto
- Evitar re-renders desnecessários (state lifting consciente)
- Lazy loading de rotas quando o app crescer
