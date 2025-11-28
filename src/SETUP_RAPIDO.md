# ⚡ Setup Rápido - Recyclhe Show

## Passo 1: Supabase
1. Acesse https://supabase.com e crie uma conta
2. Crie um novo projeto
3. Copie suas credenciais:
   - **Project ID** (ex: `abcdefghij`)
   - **API Key** (anon/public) - começa com `eyJ...`

## Passo 2: Executar SQL
1. No Supabase, vá em **SQL Editor**
2. Clique em **New Query**
3. Cole o conteúdo completo de `/supabase/schema.sql`
4. Clique em **Run** (ou pressione Ctrl+Enter)
5. Aguarde a mensagem: "Schema criado com sucesso!"

## Passo 3: Configurar Código
Abra `/utils/supabase/info.tsx` e coloque suas credenciais:

```typescript
export const projectId = 'SEU_PROJECT_ID_AQUI';
export const publicAnonKey = 'SUA_ANON_KEY_AQUI';
```

## Passo 4: Testar
Execute o teste automatizado:
```typescript
import testarConexaoSupabase from './lib/testSupabase';
await testarConexaoSupabase();
```

✅ **Pronto!** Se ver "✅ Teste X passaram", o banco está funcionando.

---

## Token Familiar de Exemplo
Foi criado um token de exemplo: `ABC123` com 3 membros:
- João Silva 👨
- Maria Silva 👩  
- Pedro Silva 👦

Use para testar o sistema antes de criar sua própria família.

---

## Ajuda Rápida

### Erro: "relation does not exist"
❌ Você não executou o schema.sql
✅ Execute o passo 2 novamente

### Erro: "Invalid API key"
❌ Credenciais incorretas no info.tsx
✅ Copie novamente do Supabase Dashboard > Settings > API

### Erro: "Network error"
❌ Project ID incorreto ou projeto pausado
✅ Verifique se o projeto está ativo no Supabase

---

**Precisa de mais detalhes?** Consulte `/README.md`
