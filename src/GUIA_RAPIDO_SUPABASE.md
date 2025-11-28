# 🚀 Guia Rápido de Configuração do Supabase

## ⚠️ Você está vendo o alerta "Configuração Necessária"?

Não se preocupe! É só seguir este guia rápido de 5 minutos e tudo funcionará perfeitamente.

---

## 📋 O Que Você Precisa Fazer

O sistema **Recycle Show** usa o Supabase para armazenar dados (perfis, pontuações, histórico de jogos, etc.). 
Antes de jogar, você precisa **criar as tabelas do banco de dados**.

---

## 🔧 Passo a Passo (5 minutos)

### **1️⃣ Abra o SQL Editor do Supabase**

Clique aqui para abrir: [Supabase SQL Editor](https://supabase.com/dashboard/project/mnauxgnvtzgslgabxqos/sql/new)

> 💡 **Dica:** Se pedir login, faça login com sua conta Supabase

---

### **2️⃣ Abra o arquivo `supabase/schema.sql`**

No seu projeto, localize e abra o arquivo:
```
📁 supabase/
  └── 📄 schema.sql
```

---

### **3️⃣ Copie TODO o conteúdo**

- Abra o arquivo `schema.sql`
- Pressione `Ctrl + A` (ou `Cmd + A` no Mac) para selecionar tudo
- Pressione `Ctrl + C` (ou `Cmd + C` no Mac) para copiar

---

### **4️⃣ Cole no SQL Editor**

- Volte para o SQL Editor do Supabase (que você abriu no passo 1)
- Clique na área de texto grande
- Pressione `Ctrl + V` (ou `Cmd + V` no Mac) para colar

---

### **5️⃣ Execute o Script**

- Clique no botão verde **"Run"** (canto superior direito)
  - **OU** pressione `Ctrl + Enter` (ou `Cmd + Enter` no Mac)

---

### **6️⃣ Aguarde o Sucesso**

- Você verá uma mensagem **"Success. No rows returned"** no canto inferior direito
- Isso é NORMAL e significa que tudo foi criado corretamente! ✅

---

### **7️⃣ Recarregue a Aplicação**

- Volte para a aplicação Recycle Show
- Pressione `F5` ou clique no botão **"Recarregar Página"**
- Pronto! Agora você pode criar sua família e jogar! 🎮

---

## ❓ Problemas Comuns

### "Erro de autenticação"
- Verifique se você está logado no Supabase
- Verifique se o projeto ID está correto (deve ser `mnauxgnvtzgslgabxqos`)

### "Failed to fetch"
- Verifique sua conexão com a internet
- Tente desativar bloqueadores de anúncios/extensões do navegador

### "Tabela já existe"
- Isso é OK! Significa que você já executou o script antes
- Você pode continuar usando normalmente

### Ainda não funciona?
1. Abra o console do navegador (F12)
2. Vá para a aba "Console"
3. Procure por mensagens de erro em vermelho
4. Tire um print e peça ajuda mostrando o erro

---

## 📚 Documentação Completa

Para instruções mais detalhadas, veja:
- `INSTRUCOES_SUPABASE.md` - Instruções completas com prints
- `COMO_USAR.md` - Como usar o sistema após configurar

---

## ✅ Como Saber Se Está Funcionando?

Depois de configurar corretamente:

1. ✅ Você não verá mais o alerta laranja "Configuração Necessária"
2. ✅ Você conseguirá criar uma família
3. ✅ Você conseguirá criar perfis de jogadores
4. ✅ Seus dados e pontuações serão salvos

---

## 🎮 Depois de Configurar

Você poderá:
- ✨ Criar famílias com código único
- 👥 Adicionar múltiplos jogadores
- 🎯 Jogar os 5 minigames
- 🏆 Ver ranking familiar
- 📊 Exportar métricas de jogo

---

**Boa sorte e divirta-se reciclando! ♻️🌍💚**
