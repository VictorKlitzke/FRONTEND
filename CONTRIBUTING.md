# Contribuindo para o Frontend Agenda Pro

Obrigado por considerar contribuir para o Frontend Agenda Pro! Este documento fornece diretrizes para contribuir com o projeto.

## Como Posso Contribuir?

### Reportando Bugs

Antes de criar um relatório de bug, verifique se o problema já não foi relatado. Se você encontrar um bug:

1. Use o template de issue de bug
2. Descreva o problema de forma clara e concisa
3. Inclua passos detalhados para reproduzir o bug
4. Adicione screenshots se aplicável
5. Especifique seu ambiente (SO, navegador, versão)

### Sugerindo Melhorias

Se você tem uma ideia para melhorar o projeto:

1. Use o template de feature request
2. Explique claramente a funcionalidade desejada
3. Descreva a motivação e casos de uso
4. Se possível, sugira uma implementação

### Pull Requests

1. **Fork o repositório** e crie sua branch a partir da `main`
2. **Nomeie sua branch** de forma descritiva: `feature/nova-funcionalidade` ou `fix/correcao-bug`
3. **Escreva código limpo** seguindo os padrões do projeto
4. **Teste suas mudanças** localmente antes de submeter
5. **Execute o linter** e corrija todos os warnings: `pnpm lint`
6. **Atualize a documentação** se necessário
7. **Preencha o template de PR** completamente

## Padrões de Código

### Estilo de Código

- Use TypeScript para todos os arquivos de código
- Siga as configurações do ESLint do projeto
- Use 2 espaços para indentação
- Use aspas simples para strings (quando possível)
- Adicione comentários apenas quando necessário para explicar lógica complexa

### Estrutura de Arquivos

```
src/
├── app/           # Configuração de rotas e app
├── assets/        # Imagens, ícones, etc
├── components/    # Componentes reutilizáveis
│   └── ui/        # Componentes de UI (shadcn/ui)
├── feature/       # Funcionalidades organizadas por domínio
│   └── [domain]/
│       ├── components/  # Componentes específicos
│       ├── pages/       # Páginas do domínio
│       ├── services/    # Lógica de API
│       └── stores/      # Estado (Zustand)
├── hooks/         # Custom hooks React
├── layouts/       # Layouts da aplicação
├── lib/           # Utilitários e configurações
└── shared/        # Código compartilhado
```

### Nomenclatura

- **Componentes**: PascalCase (ex: `UserProfile.tsx`)
- **Hooks**: camelCase com prefixo `use` (ex: `useAuth.ts`)
- **Utilitários**: camelCase (ex: `formatDate.ts`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `API_BASE_URL`)
- **Tipos/Interfaces**: PascalCase (ex: `UserData`)

### Commits

Siga o padrão Conventional Commits:

```
type(scope): descrição curta

Descrição detalhada (opcional)
```

**Tipos:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Mudanças em documentação
- `style`: Formatação, ponto e vírgula, etc
- `refactor`: Refatoração de código
- `test`: Adição ou correção de testes
- `chore`: Mudanças em ferramentas, configurações, etc

**Exemplos:**
```
feat(auth): adiciona login com Google
fix(dashboard): corrige exibição de dados do usuário
docs(readme): atualiza instruções de instalação
```

## Processo de Revisão

1. Um mantenedor revisará seu PR
2. Pode haver solicitações de mudanças
3. Faça as alterações solicitadas e empurre para sua branch
4. Uma vez aprovado, seu PR será mergeado

## Configuração do Ambiente de Desenvolvimento

1. Clone o repositório:
   ```bash
   git clone https://github.com/VK-Tech-software/frontend-agenda-pro.git
   cd frontend-agenda-pro
   ```

2. Instale as dependências:
   ```bash
   pnpm install
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   # Edite .env com suas configurações
   ```

4. Execute em modo de desenvolvimento:
   ```bash
   pnpm dev
   ```

## Código de Conduta

- Seja respeitoso e inclusivo
- Aceite críticas construtivas
- Foque no que é melhor para a comunidade
- Mostre empatia com outros membros da comunidade

## Dúvidas?

Se você tiver dúvidas sobre como contribuir, sinta-se à vontade para abrir uma issue com a tag `question`.

---

Obrigado por contribuir! 🚀
