# 📑 Índice de Documentação - Recyclhe Show

## 🚀 Começando

| Arquivo | Descrição | Quando Usar |
|---------|-----------|-------------|
| **LEIA_ME.md** | Visão geral e início rápido | **COMECE AQUI** |
| **SETUP_RAPIDO.md** | Setup em 4 passos simples | Primeira instalação |
| **README.md** | Documentação completa | Referência detalhada |

## 🗄️ Banco de Dados

| Arquivo | Descrição | Quando Usar |
|---------|-----------|-------------|
| **supabase/schema.sql** | Schema SQL completo | Executar no Supabase |
| **supabase/README_SQL.md** | Como executar o SQL | Instruções de instalação |

## 💻 Desenvolvimento

| Arquivo | Descrição | Quando Usar |
|---------|-----------|-------------|
| **COMO_MIGRAR.md** | Migração mockData → Supabase | Migrar o frontend |
| **O_QUE_FOI_CRIADO.md** | Resumo do que foi criado | Visão geral técnica |

## 📚 Código

| Arquivo | Descrição | Uso |
|---------|-----------|-----|
| **lib/supabaseClient.ts** | Cliente TypeScript | API completa do banco |
| **lib/testSupabase.ts** | Testes automatizados | Testar funcionalidades |
| **components/DatabaseTester.tsx** | Interface de testes | Teste visual |
| **components/TesteDoBanco.tsx** | Testes alternativos | Teste simples |

## 🎯 Fluxo de Trabalho

### Para Setup Inicial:
1. **LEIA_ME.md** - Entenda o sistema
2. **SETUP_RAPIDO.md** - Configure em 4 passos
3. **supabase/README_SQL.md** - Execute o schema
4. **DatabaseTester** - Teste tudo

### Para Desenvolvimento:
1. **README.md** - Referência da API
2. **COMO_MIGRAR.md** - Migre cada componente
3. **lib/supabaseClient.ts** - Use os métodos
4. **lib/testSupabase.ts** - Teste suas mudanças

### Para Troubleshooting:
1. **README.md** - Seção "🔍 Teste de Conexão"
2. **SETUP_RAPIDO.md** - Seção "Ajuda Rápida"
3. **DatabaseTester** - Execute os testes visuais

## 📊 Estrutura de Diretórios

```
/
├── LEIA_ME.md              ⭐ START AQUI
├── INDICE.md               📑 Este arquivo
├── SETUP_RAPIDO.md         ⚡ Setup rápido
├── README.md               📖 Docs completas
├── COMO_MIGRAR.md          🔄 Guia de migração
├── O_QUE_FOI_CRIADO.md     ✅ Resumo técnico
│
├── supabase/
│   ├── schema.sql          💾 Schema do banco
│   └── README_SQL.md       📄 Como executar
│
├── lib/
│   ├── supabaseClient.ts   🔌 Cliente da API
│   ├── testSupabase.ts     🧪 Testes automáticos
│   ├── mockData.ts         📦 Dados antigos (migrar)
│   ├── apiClient.ts        📦 Cliente antigo (migrar)
│   └── ...
│
└── components/
    ├── DatabaseTester.tsx  🎮 Interface de testes
    ├── TesteDoBanco.tsx    🔬 Testes alternativos
    └── ...
```

## 🎨 Código de Cores (Prioridade)

- ⭐ **Essencial** - Leia primeiro
- ⚡ **Importante** - Leia para setup
- 📖 **Referência** - Consulte quando precisar
- 🔄 **Desenvolvimento** - Use durante migração
- 📦 **Legado** - Arquivos antigos (para migrar)

## 🔗 Links Rápidos

### Setup
- [Começar](LEIA_ME.md)
- [Setup Rápido](SETUP_RAPIDO.md)
- [Executar SQL](supabase/README_SQL.md)

### Desenvolvimento
- [API Completa](README.md#-uso-da-api-cliente-typescript)
- [Como Migrar](COMO_MIGRAR.md)
- [O que foi criado](O_QUE_FOI_CRIADO.md)

### Código
- [Cliente](lib/supabaseClient.ts)
- [Testes](lib/testSupabase.ts)
- [Schema SQL](supabase/schema.sql)

## 📞 FAQ - Qual arquivo ler?

**"Como instalar o banco?"**  
→ `SETUP_RAPIDO.md`

**"Como usar a API?"**  
→ `README.md` seção "Uso da API"

**"Como migrar do mockData?"**  
→ `COMO_MIGRAR.md`

**"O que foi criado?"**  
→ `O_QUE_FOI_CRIADO.md`

**"Como executar o SQL?"**  
→ `supabase/README_SQL.md`

**"Está dando erro, e agora?"**  
→ `README.md` seção "Teste de Conexão"  
→ `SETUP_RAPIDO.md` seção "Ajuda Rápida"

---

**Dica:** Se está perdido, comece pelo `LEIA_ME.md`
