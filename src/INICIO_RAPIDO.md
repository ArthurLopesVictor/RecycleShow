# ⚡ Início Rápido - Recycle Show

## ⚠️ IMPORTANTE: Se Encontrar Erro de "Row-Level Security"

Se aparecer erro ao jogar mencionando "row-level security policy", execute este comando no Supabase SQL Editor:

```sql
-- Copie e cole no SQL Editor do Supabase
DROP POLICY IF EXISTS "Ranking pode ser criado por todos" ON ranking_familia;
DROP POLICY IF EXISTS "Ranking pode ser atualizado por todos" ON ranking_familia;

CREATE POLICY "Ranking pode ser criado por todos" ON ranking_familia FOR INSERT WITH CHECK (true);
CREATE POLICY "Ranking pode ser atualizado por todos" ON ranking_familia FOR UPDATE USING (true);
```

📖 Veja instruções detalhadas em `/CORRECAO_RLS.md`

---

## 🎮 Comece a Jogar em 3 Minutos!

### Passo 1: Abrir o App
```
→ Abra o navegador
→ Acesse o Recycle Show
→ Aguarde carregar
```

### Passo 2: Criar ou Entrar
```
🆕 PRIMEIRA VEZ:
   → Clique em "Criar Nova Família"
   → Digite: "Minha Família"
   → Sistema gera código: "ABC123" (anote!)
   → Crie seu jogador
   → Pronto! ✅

🔓 JÁ TEM CÓDIGO:
   → Clique em "Entrar em Família"
   → Digite o código: "ABC123"
   → Escolha ou crie jogador
   → Pronto! ✅
```

### Passo 3: Jogar!
```
→ Escolha um dos 5 minigames
→ Complete os níveis
→ Ganhe pontos
→ Suba no ranking
```

---

## 🚀 Recursos Principais

### 🎮 5 Minigames Educativos
1. **Quiz** - Perguntas sobre reciclagem
2. **Separação** - Arraste itens para lixeiras
3. **Rota** - Planeje coleta de resíduos
4. **Memória** - Pares ecológicos
5. **Compostagem** - Aprenda a compostar

### 👥 Sistema Familiar
- Token de 6 caracteres para toda família
- Cada pessoa tem seu próprio progresso
- Rankings familiar e global
- Competição saudável

### 📊 Estatísticas
- Pontos totais
- Precisão (% de acertos)
- Tempo médio de resposta
- Total de jogadas
- Desempenho por dificuldade

---

## ✨ NOVO: Adicionar Membros Facilmente!

### Sem sair do jogo:
```
1. Clique no seu avatar (canto superior direito)
2. No menu que abrir, role até o final
3. Clique em "Adicionar Membro"
4. Um diálogo abre:
   → Digite o nome
   → Escolha um avatar
   → Clique "Adicionar"
5. Pronto! Novo membro na família! 🎉
```

---

## 🔄 Trocar de Jogador

```
1. Clique no seu avatar
2. Veja todos os membros
3. Clique no membro desejado
4. Sistema carrega seus dados
```

---

## 💾 Exportar Dados

### Para análise posterior:
```
1. Role até o footer
2. Seção "Exportar Dados"
3. Clique "Baixar Métricas"
4. Escolha formato:
   → JSON (programático)
   → CSV (Excel/Planilhas)
```

---

## 🎯 Dicas Rápidas

### Para Começar Bem:
- ✅ Anote o código da família
- ✅ Compartilhe com familiares
- ✅ Comece pelos níveis fáceis
- ✅ Leia as explicações
- ✅ Use o Guia de Reciclagem

### Para Ganhar Mais Pontos:
- ✅ Responda rápido e corretamente
- ✅ Complete todos os níveis
- ✅ Jogue regularmente
- ✅ Aprenda com os erros

---

## 📱 Funciona Em:

- 💻 **Desktop** - Melhor experiência
- 📱 **Tablet** - Interface adaptada
- 📱 **Celular** - Totalmente responsivo

---

## 🔐 Segurança

### Seus dados:
- ✅ Armazenados com segurança no Supabase
- ✅ Criptografados em trânsito
- ✅ Sessão salva automaticamente
- ✅ Logout limpa dados locais

### Código da família:
- ✅ Único e gerado automaticamente
- ✅ 6 caracteres (A-Z, 0-9)
- ✅ Validado pelo banco de dados
- ✅ Necessário para adicionar membros

---

## ❓ Perguntas Frequentes

### "Esqueci meu código!"
→ Não é possível recuperar. Crie uma nova família.

### "Posso mudar o nome?"
→ Sim! (feature em desenvolvimento)

### "Quantos membros posso ter?"
→ Ilimitados! Adicione quantos quiser.

### "Perco progresso ao trocar?"
→ Não! Cada jogador mantém seu progresso.

### "Funciona offline?"
→ Não ainda, mas é uma feature planejada.

### "Como convido pessoas?"
→ Compartilhe o código de 6 caracteres!

---

## 🎓 Valores Educacionais

### O que você aprende:
- 🟢 **Verde** - Vidro
- 🔵 **Azul** - Papel/Papelão
- 🟡 **Amarelo** - Metal
- 🔴 **Vermelho** - Plástico
- ⚫ **Cinza** - Não reciclável

### Temas abordados:
- Separação correta de resíduos
- Impacto ambiental do lixo
- Tempo de decomposição
- Reciclagem e sustentabilidade
- Compostagem

---

## 🏆 Sistema de Ranking

### Familiar:
- Ver progresso de todos os membros
- Quem tem mais pontos?
- Quem é mais preciso?
- Competição amigável

### Global:
- Top 100 jogadores
- De todas as famílias
- Atualizado em tempo real
- Motivação extra!

---

## 🎨 Interface

### Cores da Reciclagem:
- 🟢 Verde predominante
- 🔵 Azul secundário
- 🟡 Amarelo destaque
- 🔴 Vermelho alertas
- ⚫ Cinza neutro

### Design:
- Moderno e limpo
- Ícones intuitivos
- Animações suaves
- Feedback visual constante

---

## ⚡ Performance

### Otimizações:
- ✅ Carregamento rápido
- ✅ Cache inteligente
- ✅ Queries otimizadas
- ✅ Loading states
- ✅ Operações assíncronas

---

## 🐛 Precisa de Ajuda?

### Documentação:
1. **Este arquivo** - Início rápido
2. `/COMO_USAR.md` - Guia completo
3. `/MIGRACAO_COMPLETA.md` - Detalhes técnicos

### Console do navegador (F12):
```javascript
// Testar conexão
await supabaseClient.gerarTokenFamiliar()

// Buscar família
await supabaseClient.obterMembrosFamilia('ABC123')
```

### Problemas comuns:
- **Não carrega:** Verifique internet
- **Erro de login:** Limpe cache e tente novamente
- **Código inválido:** Verifique se digitou correto
- **Dados não aparecem:** Recarregue a página

---

## 🎉 Pronto!

**Agora é só começar a jogar e aprender sobre reciclagem!**

### Objetivos:
- 🎯 Completar todos os 10 níveis
- 🏆 Alcançar 100% de precisão
- 👑 Ser o 1º no ranking familiar
- 🌟 Entrar no Top 100 global

---

**Divirta-se e aprenda! 🌱♻️**

*Recycle Show - Educação Ambiental Gamificada*
*© 2025 - Desenvolvido com 💚*
