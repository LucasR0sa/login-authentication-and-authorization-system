# Atribuições e Licenças

> Créditos a bibliotecas, recursos e ferramentas utilizados no projeto Nucleus Auth.
> Última atualização: v1.5.0 · 2026-04-26

---

## Backend — Dependências de Produção

| Pacote | Versão | Licença | Uso no projeto |
|---|---|---|---|
| [Express](https://expressjs.com/) | 4.19.x | MIT | Framework HTTP |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | 9.0.x | MIT | Geração e verificação de JWT (HS256, 1h) |
| [argon2](https://github.com/ranisalt/node-argon2) | 0.44.x | MIT | Hash de senhas (Argon2id — vencedor PHC 2015) |
| [helmet](https://helmetjs.github.io/) | 8.1.x | MIT | Headers de segurança HTTP (CSP, HSTS, etc.) |
| [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) | 8.4.x | MIT | Rate limiting para endpoints de auth |
| [cookie-parser](https://github.com/expressjs/cookie-parser) | 1.4.x | MIT | Parsing de cookies httpOnly |
| [cors](https://github.com/expressjs/cors) | 2.8.x | MIT | Middleware CORS com `credentials: true` |
| [dotenv](https://github.com/motdotla/dotenv) | 16.4.x | BSD-2-Clause | Leitura de variáveis de ambiente |

## Backend — Dependências de Desenvolvimento

| Pacote | Versão | Licença | Uso |
|---|---|---|---|
| [TypeScript](https://www.typescriptlang.org/) | 5.4.x | Apache-2.0 | Tipagem estática |
| [ts-node-dev](https://github.com/wclr/ts-node-dev) | 2.0.x | MIT | Hot reload em desenvolvimento |
| [Jest](https://jestjs.io/) | 29.x | MIT | Framework de testes |
| [ts-jest](https://kulshekhar.github.io/ts-jest/) | 29.x | MIT | Preset Jest para TypeScript |
| [Supertest](https://github.com/ladislav-zezula/supertest) | 7.0.x | MIT | Testes HTTP de integração sem servidor real |

## Frontend — Dependências de Produção

| Pacote | Versão | Licença | Uso no projeto |
|---|---|---|---|
| [React](https://react.dev/) | 18.3.x | MIT | Biblioteca de UI com Concurrent Mode |
| [react-dom](https://react.dev/) | 18.3.x | MIT | Renderizador DOM do React |
| [react-router-dom](https://reactrouter.com/) | 6.23.x | MIT | Roteamento SPA declarativo |

## Frontend — Dependências de Desenvolvimento

| Pacote | Versão | Licença | Uso |
|---|---|---|---|
| [Vite](https://vitejs.dev/) | 5.3.x | MIT | Build tool e dev server (HMR instantâneo) |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4.x | MIT | Estilização por utility classes |
| [Vitest](https://vitest.dev/) | 1.6.x | MIT | Framework de testes (compartilha config Vite) |
| [@testing-library/react](https://testing-library.com/) | 16.0.x | MIT | Testes de componentes React |
| [@testing-library/user-event](https://testing-library.com/) | 14.5.x | MIT | Simulação realista de eventos de usuário |
| [@testing-library/jest-dom](https://github.com/testing-library/jest-dom) | 6.4.x | MIT | Matchers customizados para DOM |
| [jsdom](https://github.com/jsdom/jsdom) | 24.1.x | MIT | Ambiente DOM virtual para Vitest |
| [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react) | 4.3.x | MIT | Plugin React para Vite (Fast Refresh) |

---

## Recursos de Design

| Recurso | Licença | Uso |
|---|---|---|
| [DM Sans](https://fonts.google.com/specimen/DM+Sans) | [OFL (Open Font License)](https://scripts.sil.org/OFL) | Tipografia do design system Nucleus |
| Google "G" SVG icon | Google trademark — uso informativo | Botão placeholder de OAuth (não funcional) |

> O ícone do Google é marca registrada do Google LLC. Seu uso neste projeto é
> exclusivamente ilustrativo como placeholder para futura integração OAuth.
> Não implica endosso ou afiliação com o Google.

---

## Licença do Projeto

**MIT © Lucas Rosa**

```
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```
