# Frontend Agenda Pro

Aplicação web em React + TypeScript para gerenciamento de agendas - Frontend do sistema Agenda Pro.

[![CI](https://github.com/VK-Tech-software/frontend-agenda-pro/workflows/CI/badge.svg)](https://github.com/VK-Tech-software/frontend-agenda-pro/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Sobre o Projeto

O **Frontend Agenda Pro** é uma aplicação moderna desenvolvida com React e TypeScript que consome a API Agenda Pro para fornecer uma interface intuitiva e responsiva para gerenciamento de agendamentos. A aplicação utiliza as melhores práticas e tecnologias mais recentes do ecossistema React.

## 🖼️ Screenshots

_Em breve: Capturas de tela da aplicação_

## 🚀 Tecnologias

Este projeto foi construído utilizando as seguintes tecnologias:

- **[React](https://react.dev/) 19.2.0** - Biblioteca JavaScript para construção de interfaces
- **[TypeScript](https://www.typescriptlang.org/) 5.9.3** - Superset JavaScript com tipagem estática
- **[Vite](https://vite.dev/) (rolldown-vite 7.2.5)** - Build tool e dev server extremamente rápido
- **[TailwindCSS](https://tailwindcss.com/) 4.1.18** - Framework CSS utility-first
- **[React Router DOM](https://reactrouter.com/) 7.11.0** - Roteamento para aplicações React
- **[Zustand](https://zustand-demo.pmnd.rs/) 5.0.9** - Gerenciamento de estado leve e escalável
- **[React Hook Form](https://react-hook-form.com/) 7.71.0** - Formulários performáticos com validação
- **[Zod](https://zod.dev/) 4.3.5** - Schema validation com TypeScript-first
- **[Radix UI](https://www.radix-ui.com/)** - Componentes UI acessíveis e sem estilo
- **[Axios](https://axios-http.com/) 1.13.2** - Cliente HTTP baseado em Promises
- **[Lucide React](https://lucide.dev/) 0.562.0** - Ícones para React

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

- **Node.js** 18 ou superior ([Download](https://nodejs.org/))
- **pnpm** (recomendado) ou npm/yarn

Para instalar o pnpm globalmente:
```bash
npm install -g pnpm
```

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/VK-Tech-software/frontend-agenda-pro.git
cd frontend-agenda-pro
```

2. Instale as dependências:
```bash
pnpm install
```

## ⚙️ Configuração

1. Crie o arquivo de variáveis de ambiente:
```bash
cp .env.example .env
```

2. Configure a variável `VITE_MS_API` no arquivo `.env` com a URL da API:
```bash
VITE_MS_API=http://localhost:8080
```

## 🚀 Executando o Projeto

### Modo de Desenvolvimento
Execute a aplicação em modo de desenvolvimento com hot-reload:
```bash
pnpm dev
```
A aplicação estará disponível em [http://localhost:5173](http://localhost:5173)

### Build para Produção
Compile a aplicação para produção:
```bash
pnpm build
```
Os arquivos otimizados serão gerados na pasta `dist/`

### Lint
Execute o linter para verificar a qualidade do código:
```bash
pnpm lint
```

### Preview
Visualize localmente o build de produção:
```bash
pnpm preview
```

## 📁 Estrutura do Projeto

```
frontend-agenda-pro/
├── .github/                # Configurações do GitHub (workflows, templates)
├── public/                 # Arquivos públicos estáticos
├── src/
│   ├── app/                # Configuração de rotas e aplicação
│   ├── assets/             # Imagens, ícones e arquivos estáticos
│   ├── components/         # Componentes reutilizáveis
│   │   └── ui/             # Componentes de UI (Radix UI/shadcn)
│   ├── feature/            # Funcionalidades organizadas por domínio
│   │   ├── auth/           # Autenticação
│   │   ├── dashboard/      # Dashboard
│   │   └── service/        # Serviços/Agendamentos
│   ├── hooks/              # Custom React Hooks
│   ├── layouts/            # Layouts da aplicação
│   ├── lib/                # Utilitários e configurações
│   ├── shared/             # Código compartilhado
│   ├── index.css           # Estilos globais
│   └── main.tsx            # Ponto de entrada da aplicação
├── .env.example            # Exemplo de variáveis de ambiente
├── .gitignore              # Arquivos ignorados pelo Git
├── components.json         # Configuração do shadcn/ui
├── eslint.config.js        # Configuração do ESLint
├── index.html              # HTML principal
├── package.json            # Dependências e scripts
├── tsconfig.json           # Configuração do TypeScript
├── vite.config.ts          # Configuração do Vite
└── README.md               # Este arquivo
```

## 🤝 Como Contribuir

Contribuições são sempre bem-vindas! Para contribuir com o projeto:

1. Leia o guia de contribuição em [CONTRIBUTING.md](CONTRIBUTING.md)
2. Fork o projeto
3. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
4. Commit suas mudanças (`git commit -m 'feat: Adiciona MinhaFeature'`)
5. Push para a branch (`git push origin feature/MinhaFeature`)
6. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📧 Contato

VK-Tech-software - [@VK-Tech-software](https://github.com/VK-Tech-software)

Link do Projeto: [https://github.com/VK-Tech-software/frontend-agenda-pro](https://github.com/VK-Tech-software/frontend-agenda-pro)

---

Desenvolvido com ❤️ por [VK-Tech-software](https://github.com/VK-Tech-software)
