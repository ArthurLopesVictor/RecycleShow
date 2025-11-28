# 🔧 Instruções de Configuração do Supabase

## ⚠️ IMPORTANTE: Configuração Necessária

Para o sistema funcionar corretamente, você precisa executar o script SQL no seu projeto Supabase.

## 📋 Passo a Passo

### 1️⃣ Acessar o Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Abra o projeto: **mnauxgnvtzgslgabxqos**

### 2️⃣ Executar o Script SQL

1. No painel lateral esquerdo, clique em **SQL Editor** (ícone de banco de dados)
2. Clique em **+ New Query** (ou "Nova Consulta")
3. Abra o arquivo `/supabase/schema.sql` deste projeto
4. **COPIE TODO O CONTEÚDO** do arquivo `schema.sql`
5. **COLE** no editor SQL do Supabase
6. Clique em **Run** (ou pressione Ctrl+Enter / Cmd+Enter)

### 3️⃣ Verificar Instalação

Após executar o script, você deve ver uma mensagem de sucesso com:

```
Schema criado com sucesso!
total_perfis: 3
total_jogadas: 1
total_ranking: 3
```

### 4️⃣ Testar a Aplicação

1. Recarregue a aplicação
2. Na tela inicial, você verá um componente de **"Teste de Geração de Token"**
3. Clique em **"Executar Teste"**
4. Se tudo estiver correto, você verá:
   - ✅ Token gerado com sucesso
   - ✅ Token válido
   - ❌ Token NÃO existe no DB (isso é esperado!)

## 🎯 O que o Script SQL Cria

O script `schema.sql` cria:

### 📊 Tabelas
- **perfis** - Dados dos jogadores e suas estatísticas
- **historico_jogadas** - Registro de todas as partidas
- **ranking_familia** - Ranking por família

### ⚡ Funções
- **gerar_token_familiar()** - Gera tokens únicos de 6 caracteres
- **validar_token_familiar()** - Valida formato dos tokens
- **atualizar_estatisticas_perfil()** - Atualiza stats automaticamente
- **atualizar_ranking_familia()** - Atualiza ranking automaticamente
- **obter_ranking_familia()** - Busca ranking de uma família
- **obter_ranking_global()** - Busca ranking global
- **obter_estatisticas_gerais()** - Estatísticas do sistema

### 🔒 Segurança
- Row Level Security (RLS) configurado
- Políticas de acesso para cada tabela

### 📝 Dados de Exemplo
- Família de teste com código **ABC123**
- 3 membros de exemplo (João, Maria e Pedro Silva)
- 1 jogada de exemplo

## 🐛 Solução de Problemas

### Problema: "Erro ao gerar token"

**Causa:** A função SQL `gerar_token_familiar()` não foi criada

**Solução:** Execute o script SQL conforme instruções acima

### Problema: Token gerado mas não aparece

**Causa:** Pode haver erro de comunicação com o banco

**Solução:** 
1. Abra o Console do navegador (F12)
2. Verifique erros no console
3. Teste com o componente "Teste de Geração de Token"

### Problema: "Permission denied"

**Causa:** Políticas RLS muito restritivas

**Solução:** Verifique se as políticas foram criadas corretamente pelo script

## 🚀 Fallback Automático

O sistema possui um **fallback automático**:

- Se a função SQL não estiver disponível, o token será gerado no **frontend**
- Você verá um aviso no console: "Função SQL não disponível, gerando token no frontend"
- O sistema continuará funcionando normalmente

## 📞 Suporte

Se você continuar tendo problemas:

1. Verifique o arquivo `/supabase/schema.sql`
2. Confirme que o script foi executado sem erros
3. Verifique as tabelas criadas no Supabase:
   - Vá em **Table Editor**
   - Você deve ver: `perfis`, `historico_jogadas`, `ranking_familia`

## ✅ Checklist de Verificação

- [ ] Script SQL executado no Supabase
- [ ] Tabelas criadas (perfis, historico_jogadas, ranking_familia)
- [ ] Funções criadas (veja na aba "Database" > "Functions")
- [ ] Teste de token passou com sucesso
- [ ] Consegue criar uma família
- [ ] Consegue criar um jogador
- [ ] Consegue jogar os minigames

---

**Última atualização:** Novembro 2024
**Versão do Schema:** 1.0
