# PDV Online

Sistema de Ponto de Venda (PDV) completo para negócios de varejo, desenvolvido com arquitetura full-stack moderna.

## O que faz

O PDV Online é uma aplicação web para gerenciamento de vendas no varejo, permitindo o controle de produtos, clientes, fornecedores e usuários. O sistema possui controle de acesso baseado em papéis (administrador e vendedor) e integração com autenticação OAuth via Replit.

## Funcionalidades Principais

- **Dashboard**: Visualização de estatísticas de vendas (hoje, semana, mês), gráficos de vendas por período, produtos mais vendidos e alertas de estoque baixo
- **Ponto de Venda**: Registro de vendas com seleção de produtos, cliente opcional, cálculo automático de subtotais e validação de estoque
- **Gestão de Produtos**: Cadastro, edição e exclusão de produtos com nome, descrição, preço, estoque, categoria e fornecedor associado
- **Gestão de Clientes**: Cadastro de clientes com nome, e-mail, telefone, documento (CPF/CNPJ) e endereço
- **Gestão de Fornecedores**: Cadastro de fornecedores com nome, e-mail, telefone, CNPJ e endereço
- **Histórico de Vendas**: Consulta de vendas realizadas com filtros por data, cliente e vendedor
- **Gestão de Usuários**: Administração de usuários com controle de papéis (admin/vendedor) e status de ativação
- **Controle de Acesso**: Funcionalidades restritas por papel - administradores têm acesso completo, vendedores têm acesso limitado

## Stack Tecnológica

### Frontend
- React 18 com TypeScript
- Tailwind CSS para estilização
- Shadcn/ui (componentes baseados em Radix UI)
- TanStack Query (React Query) para gerenciamento de estado do servidor
- React Hook Form com Zod para validação de formulários
- Wouter para roteamento
- Recharts para gráficos
- Vite como bundler

### Backend
- Node.js com Express.js
- TypeScript
- Drizzle ORM para acesso ao banco de dados
- Passport.js com OpenID Connect para autenticação
- Express Session com armazenamento em PostgreSQL

### Banco de Dados
- PostgreSQL (compatível com Neon Database)

## Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd rest-express
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente (veja seção abaixo).

4. Execute as migrações do banco de dados:
```bash
npm run db:push
```

## Execução

### Modo de Desenvolvimento
```bash
npm run dev
```

### Build para Produção
```bash
npm run build
```

### Executar em Produção
```bash
npm start
```

### Verificação de Tipos
```bash
npm run check
```

## Estrutura de Pastas

```
├── client/                   # Código do frontend
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   │   ├── charts/       # Componentes de gráficos
│   │   │   ├── forms/        # Formulários (cliente, produto, fornecedor)
│   │   │   ├── layout/       # Layout (header, sidebar)
│   │   │   ├── modals/       # Modais
│   │   │   └── ui/           # Componentes UI base (shadcn/ui)
│   │   ├── hooks/            # Hooks customizados (auth, toast, mobile)
│   │   ├── lib/              # Utilitários e configurações
│   │   ├── pages/            # Páginas da aplicação
│   │   ├── App.tsx           # Componente principal
│   │   └── main.tsx          # Ponto de entrada
│   └── index.html            # Template HTML
├── server/                   # Código do backend
│   ├── db.ts                 # Configuração do banco de dados
│   ├── index.ts              # Ponto de entrada do servidor
│   ├── replitAuth.ts         # Configuração de autenticação OAuth
│   ├── routes.ts             # Definição das rotas da API
│   ├── storage.ts            # Camada de acesso a dados
│   └── vite.ts               # Configuração do Vite para dev
├── shared/                   # Código compartilhado
│   └── schema.ts             # Schemas do banco (Drizzle) e validação (Zod)
├── drizzle.config.ts         # Configuração do Drizzle Kit
├── package.json              # Dependências e scripts
├── tailwind.config.ts        # Configuração do Tailwind CSS
├── tsconfig.json             # Configuração do TypeScript
└── vite.config.ts            # Configuração do Vite
```

## Variáveis de Ambiente

As seguintes variáveis de ambiente são necessárias:

- `DATABASE_URL` - URL de conexão com o banco de dados PostgreSQL
- `SESSION_SECRET` - Chave secreta para assinatura de sessões
- `REPLIT_DOMAINS` - Domínios permitidos para autenticação (configuração Replit)
- `REPL_ID` - Identificador do Repl (configuração Replit)
- `ISSUER_URL` - URL do provedor de autenticação OpenID Connect (padrão: `https://replit.com/oidc`)
- `PORT` - Porta do servidor (padrão: 5000)

## Licença

MIT
