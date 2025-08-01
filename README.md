# E-Financeira - Sistema de Gestão Financeira

Sistema completo de gestão financeira desenvolvido com **Bun**, **React**, **TypeScript**, **PostgreSQL** e **Drizzle ORM**, baseado em modelo UML bem definido.

## 🚀 Características

- **Frontend moderno**: React 18 + TypeScript + Tailwind CSS
- **Backend performático**: Bun runtime com hot reload
- **Banco de dados**: PostgreSQL com Drizzle ORM
- **Arquitetura baseada em UML**: Implementação fiel ao diagrama de classes
- **Interface responsiva**: Design moderno e intuitivo
- **Gestão completa**: Transações, Contas, Categorias e Relatórios

## 📋 Funcionalidades

### Gestão de Transações
- ✅ Criar, editar e excluir transações
- ✅ Campos completos: data/hora, terceiro, valor, descrição, endereço, dados da fatura
- ✅ Relacionamento entre transações
- ✅ Busca avançada com filtros
- ✅ Movimentação entre contas
- ✅ Atualização de categorias

### Gestão de Contas
- ✅ Contas de Débito e Crédito
- ✅ Cálculo automático de saldos
- ✅ Listagem de transações por conta
- ✅ Relatórios mensais por conta

### Gestão de Categorias
- ✅ Categorias personalizáveis
- ✅ Organização de transações
- ✅ Relatórios por categoria

### Relatórios
- ✅ Resumo mensal por conta
- ✅ Totalizadores por tipo de conta
- ✅ Percentuais e análises
- ✅ Filtros por período

## 🛠️ Tecnologias

- **Runtime**: Bun
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Bun server
- **Banco de dados**: PostgreSQL
- **ORM**: Drizzle ORM + Drizzle Kit
- **Validação**: Zod
- **Formulários**: React Hook Form
- **Ícones**: Lucide React
- **Utilitários**: clsx, tailwind-merge

## 📦 Instalação

### Pré-requisitos

1. **Bun** (versão 1.0+)
```bash
curl -fsSL https://bun.sh/install | bash
```

2. **PostgreSQL** (versão 12+)
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql

# Windows
# Baixe o instalador oficial do PostgreSQL
```

### Configuração do Banco de Dados

1. **Criar banco de dados**:
```bash
sudo -u postgres psql
CREATE DATABASE e_financeira;
CREATE USER efi_user WITH ENCRYPTED PASSWORD 'sua_senha_aqui';
GRANT ALL PRIVILEGES ON DATABASE e_financeira TO efi_user;
\q
```

2. **Configurar variável de ambiente**:
```bash
# Crie um arquivo .env na raiz do projeto
echo "DATABASE_URL=postgresql://efi_user:sua_senha_aqui@localhost:5432/e_financeira" > .env
```

### Instalação do Projeto

1. **Clone o repositório**:
```bash
git clone <url-do-repositorio>
cd e-financeira
```

2. **Instale as dependências**:
```bash
bun install
```

3. **Execute as migrações do banco**:
```bash
bun run db:generate
bun run db:push
```

4. **Inicie o servidor de desenvolvimento**:
```bash
bun run dev
```

5. **Acesse a aplicação**:
```
http://localhost:3000
```

## 🎯 Como Usar

### Primeiro Acesso

1. **Criar Categorias**: Comece criando categorias como "Alimentação", "Transporte", "Lazer", etc.
2. **Criar Contas**: Adicione suas contas bancárias (Débito/Crédito)
3. **Registrar Transações**: Comece a registrar suas transações financeiras

### Fluxo de Trabalho

1. **Aba Transações**: Visualize e gerencie todas as transações
2. **Aba Contas**: Gerencie suas contas bancárias
3. **Aba Categorias**: Organize suas categorias de gastos
4. **Aba Relatórios**: Analise seus dados financeiros

## 🗄️ Estrutura do Banco de Dados

O sistema implementa fielmente o modelo UML com as seguintes entidades:

### TransactionCategory
- `id` (UUID, PK)
- `name` (String)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Account
- `id` (UUID, PK)
- `name` (String)
- `accountType` (Enum: Debit/Credit)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Transaction
- `id` (UUID, PK)
- `dateTime` (DateTime)
- `thirdParty` (String)
- `value` (Decimal)
- `address` (String, opcional)
- `description` (String)
- `invoiceData` (String, opcional)
- `accountId` (UUID, FK)
- `categoryId` (UUID, FK)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### TransactionRelations (Auto-relacionamento)
- `parentTransactionId` (UUID, FK)
- `relatedTransactionId` (UUID, FK)

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
bun run dev          # Inicia servidor de desenvolvimento

# Produção
bun run start        # Inicia servidor de produção

# Banco de dados
bun run db:generate  # Gera migrações
bun run db:push      # Aplica migrações
bun run db:migrate   # Executa migrações
bun run db:studio    # Abre Drizzle Studio
```

## 🏗️ Arquitetura

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes base (Button, Tabs, etc.)
│   ├── AccountForm.tsx
│   ├── AccountList.tsx
│   ├── CategoryForm.tsx
│   ├── CategoryList.tsx
│   ├── TransactionForm.tsx
│   ├── TransactionList.tsx
│   └── MonthlySummary.tsx
├── db/                 # Configuração do banco
│   ├── index.ts        # Conexão Drizzle
│   └── schema.ts       # Schema do banco
├── services/           # Serviços de negócio
│   ├── AccountService.ts
│   ├── TransactionCategoryService.ts
│   └── TransactionService.ts
├── types/              # Tipos TypeScript
│   └── index.ts
├── utils/              # Utilitários
│   ├── cn.ts
│   └── formatters.ts
├── styles/             # Estilos CSS
│   └── index.css
├── App.tsx             # Componente principal
├── index.tsx           # Entry point React
├── index.html          # Template HTML
└── server.tsx          # Servidor Bun
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique se o PostgreSQL está rodando
2. Confirme se as variáveis de ambiente estão corretas
3. Execute `bun run db:push` para aplicar as migrações
4. Verifique os logs do console para erros específicos

---

**E-Financeira** - Sistema de Gestão Financeira Moderno e Eficiente 💰📊
