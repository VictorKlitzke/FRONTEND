# Configuração Manual do Repositório GitHub

Este documento contém instruções para configurar manualmente algumas propriedades do repositório GitHub que não podem ser automatizadas via código.

## ⚙️ Configurações a Realizar

### 1. Atualizar Descrição do Repositório

1. Acesse a página principal do repositório no GitHub
2. Clique no ícone de engrenagem ⚙️ ao lado de "About" (no canto superior direito)
3. No campo "Description", adicione:
   ```
   Aplicação web em React + TypeScript para gerenciamento de agendas - Frontend do sistema Agenda Pro
   ```
4. Clique em "Save changes"

### 2. Adicionar Topics ao Repositório

Na mesma seção "About":

1. No campo "Topics", adicione os seguintes topics (um por vez):
   - `react`
   - `typescript`
   - `vite`
   - `frontend`
   - `agenda`
   - `tailwindcss`
   - `zustand`
   - `react-hook-form`
   - `radix-ui`

2. Clique em "Save changes"

### 3. Configurar GitHub Pages (Opcional)

Se desejar publicar a aplicação via GitHub Pages:

1. Vá em "Settings" > "Pages"
2. Em "Source", selecione a branch desejada (geralmente `main` ou `gh-pages`)
3. Clique em "Save"

### 4. Configurar Proteção de Branch (Recomendado)

Para proteger a branch `main`:

1. Vá em "Settings" > "Branches"
2. Clique em "Add rule" ou edite a regra existente
3. Em "Branch name pattern", digite `main`
4. Marque as seguintes opções:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
     - Adicione o check "build" (do workflow CI)
   - ✅ Require conversation resolution before merging
   - ✅ Do not allow bypassing the above settings
5. Clique em "Create" ou "Save changes"

### 5. Configurar Labels (Opcional)

Adicionar labels personalizadas para melhor organização:

1. Vá em "Issues" > "Labels"
2. Clique em "New label" para cada uma:
   - `bug` (vermelho) - Algo não está funcionando
   - `enhancement` (azul claro) - Nova funcionalidade ou requisição
   - `documentation` (azul escuro) - Melhorias em documentação
   - `good first issue` (roxo) - Boa para iniciantes
   - `help wanted` (verde) - Ajuda extra é necessária
   - `question` (rosa) - Pergunta ou dúvida

### 6. Configurar Secrets (Se Necessário)

Para configurar variáveis de ambiente secretas para GitHub Actions:

1. Vá em "Settings" > "Secrets and variables" > "Actions"
2. Clique em "New repository secret"
3. Adicione os secrets necessários (ex: tokens de API, chaves de deploy, etc.)

### 7. Configurar Equipe e Colaboradores

Para adicionar colaboradores:

1. Vá em "Settings" > "Collaborators and teams"
2. Clique em "Add people" ou "Add teams"
3. Pesquise e adicione os membros com as permissões apropriadas

## ✅ Verificação

Após realizar as configurações acima, verifique:

- [ ] Descrição do repositório está visível na página principal
- [ ] Topics aparecem abaixo da descrição
- [ ] Workflow CI está executando nas Pull Requests
- [ ] Branch protection rules estão ativos
- [ ] Labels estão criadas e disponíveis

## 📝 Notas

- Algumas configurações podem requerer permissões de administrador no repositório
- As configurações de proteção de branch são especialmente importantes para repositórios em produção
- Revise periodicamente as configurações de segurança e acesso ao repositório

---

**Data de Criação:** 2026-02-16  
**Última Atualização:** 2026-02-16
