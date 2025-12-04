-- =====================================================
-- CORREÇÃO DAS POLÍTICAS RLS (Row Level Security)
-- Execute este script no Supabase SQL Editor para corrigir
-- o erro: "new row violates row-level security policy"
-- =====================================================
-- Esse script aqui resolve aquele erro chato que aparece
-- quando o banco bloqueia operações por causa das regras de segurança
-- É tipo destrancar as portas certas pro sistema funcionar

-- Remover políticas antigas do ranking_familia (se existirem)
-- Primeiro a gente limpa as regras antigas
DROP POLICY IF EXISTS "Ranking é visível para todos" ON ranking_familia;
DROP POLICY IF EXISTS "Ranking pode ser criado por todos" ON ranking_familia;
DROP POLICY IF EXISTS "Ranking pode ser atualizado por todos" ON ranking_familia;

-- Recriar políticas com permissões corretas
-- Agora cria de novo com as permissões certas

-- Política de SELECT (leitura)
-- Todo mundo pode ver o ranking
CREATE POLICY "Ranking é visível para todos"
ON ranking_familia FOR SELECT
USING (true);

-- Política de INSERT (criação) - NECESSÁRIA para o trigger
-- Permite que o sistema crie novos registros no ranking
CREATE POLICY "Ranking pode ser criado por todos"
ON ranking_familia FOR INSERT
WITH CHECK (true);

-- Política de UPDATE (atualização) - NECESSÁRIA para o trigger
-- Permite que o sistema atualize os registros existentes
CREATE POLICY "Ranking pode ser atualizado por todos"
ON ranking_familia FOR UPDATE
USING (true);

-- Verificar se as políticas foram criadas corretamente
-- Essa query mostra todas as políticas ativas na tabela
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'ranking_familia'
ORDER BY policyname;

-- Mensagem de sucesso
-- Se chegou até aqui, deu tudo certo! 🎉
SELECT 'Políticas RLS corrigidas com sucesso! ✅' AS status;