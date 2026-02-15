# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  # Frontend Agenda Pro

  Aplicação web em React + Vite para consumo da API Agenda Pro.

  ## Requisitos

  - Node.js 18+
  - pnpm (recomendado)

  ## Configuração

  1. Instale dependências:
     - `pnpm install`
  2. Crie o arquivo de ambiente:
     - copie `.env.example` para `.env`
  3. Configure `VITE_MS_API` apontando para a API.

  ## Executar

  - `pnpm dev`

  ## Build

  - `pnpm build`
```
