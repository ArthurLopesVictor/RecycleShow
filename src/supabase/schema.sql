-- =====================================================
-- RECYCLE SHOW - SCHEMA COMPLETO DO BANCO DE DADOS
-- Sistema de Minigame Familiar com Gestão de Resíduos
-- =====================================================
-- Esse aqui é o coração do banco de dados do jogo!
-- Aqui definimos todas as tabelas, funções e regras de segurança
-- que fazem o sistema funcionar direitinho.

-- Remover tabelas se existirem (para reinstalação limpa)
-- É tipo dar um ctrl+Z no banco inteiro, útil quando precisa resetar
DROP TABLE IF EXISTS historico_jogadas CASCADE;
DROP TABLE IF EXISTS ranking_familia CASCADE;
DROP TABLE IF EXISTS perfis CASCADE;
DROP FUNCTION IF EXISTS gerar_token_familiar() CASCADE;
DROP FUNCTION IF EXISTS validar_token_familiar(text) CASCADE;
DROP FUNCTION IF EXISTS atualizar_estatisticas_perfil() CASCADE;
DROP FUNCTION IF EXISTS atualizar_ranking_familia() CASCADE;
DROP FUNCTION IF EXISTS obter_ranking_familia(text) CASCADE;
DROP FUNCTION IF EXISTS obter_ranking_global(integer) CASCADE;
DROP FUNCTION IF EXISTS obter_estatisticas_gerais() CASCADE;

-- =====================================================
-- TABELA 1: PERFIS (Perfil do Jogador/Integrante)
-- =====================================================
-- Aqui ficam guardados todos os dados de cada jogador da família
-- Cada pessoa tem sua própria conta com estatísticas individuais
CREATE TABLE perfis (
    -- Identificação
    -- O id é gerado automaticamente pra cada perfil novo
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_integrante TEXT NOT NULL,
    avatar TEXT DEFAULT '👤',  -- Emoji padrão caso não escolha um
    token_familiar TEXT NOT NULL,  -- O código de 6 dígitos que une a família
    
    -- Estatísticas de Jogo
    -- Esses valores vão sendo atualizados automaticamente conforme o jogador joga
    pontos INTEGER DEFAULT 0,
    precisao DECIMAL(5,2) DEFAULT 0.00,  -- Porcentagem de acertos (0-100)
    tempo_resposta_medio DECIMAL(10,2) DEFAULT 0.00,  -- Em segundos
    total_jogadas INTEGER DEFAULT 0,
    
    -- Desempenho Detalhado por Dificuldade
    -- JSON que guarda as stats separadas por nível de dificuldade
    desempenho_por_dificuldade JSONB DEFAULT '{
        "facil": {"jogadas": 0, "acertos": 0, "precisao": 0},
        "medio": {"jogadas": 0, "acertos": 0, "precisao": 0},
        "dificil": {"jogadas": 0, "acertos": 0, "precisao": 0}
    }'::jsonb,
    
    -- Metadados
    -- Timestamps pra saber quando foi criado e última atualização
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    -- Regras que garantem que os dados estão no formato correto
    CONSTRAINT token_familiar_format CHECK (
        token_familiar ~ '^[A-Z0-9]{6}$'  -- Token tem que ser exatamente 6 caracteres maiúsculos/números
    ),
    CONSTRAINT precisao_range CHECK (precisao >= 0 AND precisao <= 100),  -- Precisão entre 0% e 100%
    CONSTRAINT pontos_positive CHECK (pontos >= 0),  -- Não pode ter pontos negativos
    CONSTRAINT total_jogadas_positive CHECK (total_jogadas >= 0)  -- Nem jogadas negativas também
);

-- Índices para performance
-- Esses índices fazem as consultas no banco ficarem rapidinhas
CREATE INDEX idx_perfis_token ON perfis(token_familiar);
CREATE INDEX idx_perfis_pontos ON perfis(pontos DESC);
CREATE INDEX idx_perfis_created ON perfis(created_at DESC);

-- =====================================================
-- TABELA 2: HISTORICO_JOGADAS (Logs de Minigame)
-- =====================================================
-- Aqui fica registrada cada jogada que acontece no sistema
-- É tipo um diário de tudo que os jogadores fazem nos minigames
CREATE TABLE historico_jogadas (
    -- Identificação
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jogador_id UUID NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,  -- Quem jogou
    
    -- Detalhes do Jogo
    jogo TEXT NOT NULL,  -- Qual minigame: 'quiz', 'sorting', 'memory', 'route', 'composting'
    nivel INTEGER NOT NULL DEFAULT 1,  -- De 1 a 10
    
    -- Resultado da Jogada
    acerto BOOLEAN NOT NULL,  -- Acertou ou errou?
    tempo_resposta DECIMAL(10,2) NOT NULL,  -- Quanto tempo levou em segundos
    pontuacao INTEGER NOT NULL DEFAULT 0,  -- Quantos pontos ganhou
    dificuldade TEXT NOT NULL DEFAULT 'Médio',  -- 'Fácil', 'Médio', 'Difícil'
    
    -- Dados Adicionais (flexível para cada tipo de jogo)
    -- Aqui pode guardar dados específicos de cada minigame
    dados_adicionais JSONB DEFAULT '{}'::jsonb,
    
    -- Metadados
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),  -- Quando a jogada aconteceu
    
    -- Constraints
    -- Validações pra garantir dados consistentes
    CONSTRAINT nivel_positive CHECK (nivel >= 1 AND nivel <= 10),
    CONSTRAINT tempo_resposta_positive CHECK (tempo_resposta > 0),
    CONSTRAINT pontuacao_positive CHECK (pontuacao >= 0),
    CONSTRAINT dificuldade_valida CHECK (
        dificuldade IN ('Fácil', 'Médio', 'Difícil')
    ),
    CONSTRAINT jogo_valido CHECK (
        jogo IN ('quiz', 'sorting', 'memory', 'route', 'composting')
    )
);

-- Índices para performance
CREATE INDEX idx_historico_jogador ON historico_jogadas(jogador_id);
CREATE INDEX idx_historico_timestamp ON historico_jogadas(timestamp DESC);
CREATE INDEX idx_historico_jogo ON historico_jogadas(jogo);
CREATE INDEX idx_historico_dificuldade ON historico_jogadas(dificuldade);

-- =====================================================
-- TABELA 3: RANKING_FAMILIA (Classificação Familiar)
-- =====================================================
-- Essa tabela guarda o ranking dos membros dentro de cada família
-- É usada pra mostrar quem tá arrasando na competição familiar!
CREATE TABLE ranking_familia (
    -- Identificação
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_familiar TEXT NOT NULL,  -- Qual família pertence
    nome_familia TEXT NOT NULL,  -- Nome bonitinho da família
    integrante_id UUID NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,  -- Quem é esse integrante
    
    -- Rankings
    pontuacao_total INTEGER NOT NULL DEFAULT 0,  -- Total de pontos acumulados
    ultima_jogada TIMESTAMP WITH TIME ZONE DEFAULT NOW(),  -- Última vez que jogou
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT pontuacao_total_positive CHECK (pontuacao_total >= 0),
    CONSTRAINT token_familiar_format_ranking CHECK (
        token_familiar ~ '^[A-Z0-9]{6}$'
    ),
    
    -- Unique: Um integrante só pode ter um registro no ranking
    -- Evita duplicação de dados no ranking
    UNIQUE(integrante_id)
);

-- Índices para performance
CREATE INDEX idx_ranking_token ON ranking_familia(token_familiar);
CREATE INDEX idx_ranking_pontuacao ON ranking_familia(pontuacao_total DESC);
CREATE INDEX idx_ranking_ultima_jogada ON ranking_familia(ultima_jogada DESC);

-- =====================================================
-- FUNÇÃO: GERAR TOKEN FAMILIAR
-- Gera um token único de 6 caracteres (A-Z, 0-9)
-- =====================================================
-- Essa função mágica cria os códigos de família
-- Ela fica tentando até achar um código que ninguém mais tá usando
CREATE OR REPLACE FUNCTION gerar_token_familiar()
RETURNS TEXT AS $$
DECLARE
    caracteres TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    token TEXT := '';
    i INTEGER;
    existe BOOLEAN;
BEGIN
    LOOP
        token := '';
        
        -- Gerar 6 caracteres aleatórios
        -- Pega letras e números aleatórios da string
        FOR i IN 1..6 LOOP
            token := token || substr(caracteres, floor(random() * length(caracteres) + 1)::integer, 1);
        END LOOP;
        
        -- Verificar se já existe
        -- Se já existe, tenta de novo no próximo loop
        SELECT EXISTS(SELECT 1 FROM perfis WHERE token_familiar = token) INTO existe;
        
        -- Se não existe, retornar
        -- Encontrou um código livre, retorna ele!
        IF NOT existe THEN
            RETURN token;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- =====================================================
-- FUNÇÃO: VALIDAR TOKEN FAMILIAR
-- Valida se o token tem o formato correto (6 caracteres A-Z, 0-9)
-- =====================================================
-- Função simples que checa se o token tá no formato certo
CREATE OR REPLACE FUNCTION validar_token_familiar(p_token TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN p_token ~ '^[A-Z0-9]{6}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- TRIGGER: ATUALIZAR ESTATÍSTICAS DO PERFIL
-- Atualiza automaticamente estatísticas quando uma jogada é registrada
-- =====================================================
-- Esse trigger é automático! Sempre que alguém joga, ele atualiza as stats
-- É tipo ter um assistente que fica anotando tudo pra você
CREATE OR REPLACE FUNCTION atualizar_estatisticas_perfil()
RETURNS TRIGGER AS $$
DECLARE
    total INTEGER;
    acertos INTEGER;
    soma_tempo DECIMAL;
    precisao_calc DECIMAL;
    tempo_medio_calc DECIMAL;
    desempenho JSONB;
    dif_lower TEXT;
BEGIN
    -- Obter dados do jogador
    -- Busca todas as jogadas do jogador pra calcular as estatísticas
    SELECT 
        COUNT(*)::INTEGER,
        COUNT(*) FILTER (WHERE acerto = true)::INTEGER,
        COALESCE(SUM(tempo_resposta), 0)
    INTO total, acertos, soma_tempo
    FROM historico_jogadas
    WHERE jogador_id = NEW.jogador_id;
    
    -- Calcular estatísticas
    -- Faz as contas de precis��o e tempo médio
    precisao_calc := CASE WHEN total > 0 THEN (acertos::DECIMAL / total::DECIMAL) * 100 ELSE 0 END;
    tempo_medio_calc := CASE WHEN total > 0 THEN soma_tempo / total ELSE 0 END;
    
    -- Atualizar desempenho por dificuldade
    -- Pega o JSON atual e atualiza os números da dificuldade jogada
    SELECT desempenho_por_dificuldade INTO desempenho FROM perfis WHERE id = NEW.jogador_id;
    dif_lower := LOWER(NEW.dificuldade);
    
    -- Corrige o acento do "fácil"
    IF dif_lower = 'fácil' THEN dif_lower := 'facil'; END IF;
    
    -- Incrementar jogadas da dificuldade
    desempenho := jsonb_set(
        desempenho,
        ARRAY[dif_lower, 'jogadas'],
        to_jsonb(COALESCE((desempenho->dif_lower->>'jogadas')::INTEGER, 0) + 1)
    );
    
    -- Incrementar acertos se necessário
    -- Só conta acerto se realmente acertou
    IF NEW.acerto THEN
        desempenho := jsonb_set(
            desempenho,
            ARRAY[dif_lower, 'acertos'],
            to_jsonb(COALESCE((desempenho->dif_lower->>'acertos')::INTEGER, 0) + 1)
        );
    END IF;
    
    -- Calcular precisão da dificuldade
    -- Atualiza a porcentagem de acertos naquela dificuldade específica
    desempenho := jsonb_set(
        desempenho,
        ARRAY[dif_lower, 'precisao'],
        to_jsonb(
            CASE 
                WHEN (desempenho->dif_lower->>'jogadas')::INTEGER > 0 
                THEN ROUND(
                    ((desempenho->dif_lower->>'acertos')::DECIMAL / (desempenho->dif_lower->>'jogadas')::DECIMAL) * 100,
                    2
                )
                ELSE 0
            END
        )
    );
    
    -- Atualizar perfil
    -- Salva tudo de volta no perfil do jogador
    UPDATE perfis
    SET 
        pontos = pontos + NEW.pontuacao,
        precisao = ROUND(precisao_calc, 2),
        tempo_resposta_medio = ROUND(tempo_medio_calc, 2),
        total_jogadas = total,
        desempenho_por_dificuldade = desempenho,
        updated_at = NOW()
    WHERE id = NEW.jogador_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Cria o trigger que chama a função acima
CREATE TRIGGER trigger_atualizar_estatisticas
AFTER INSERT ON historico_jogadas
FOR EACH ROW
EXECUTE FUNCTION atualizar_estatisticas_perfil();

-- =====================================================
-- TRIGGER: ATUALIZAR RANKING DA FAMÍLIA
-- Atualiza automaticamente o ranking quando uma jogada é registrada
-- =====================================================
-- Outro trigger automático que mantém o ranking sempre atualizado
-- Toda vez que alguém joga, o ranking é recalculado
CREATE OR REPLACE FUNCTION atualizar_ranking_familia()
RETURNS TRIGGER AS $$
DECLARE
    v_token TEXT;
    v_nome_familia TEXT;
    v_pontuacao INTEGER;
BEGIN
    -- Obter dados do jogador
    SELECT token_familiar, pontos INTO v_token, v_pontuacao
    FROM perfis
    WHERE id = NEW.jogador_id;
    
    -- Usar token como base do nome da família
    -- Cria um nome padrão tipo "Família ABC123"
    v_nome_familia := 'Família ' || v_token;
    
    -- Inserir ou atualizar ranking
    -- Se já existe registro, só atualiza, senão cria um novo
    INSERT INTO ranking_familia (
        token_familiar,
        nome_familia,
        integrante_id,
        pontuacao_total,
        ultima_jogada
    )
    VALUES (
        v_token,
        v_nome_familia,
        NEW.jogador_id,
        v_pontuacao,
        NOW()
    )
    ON CONFLICT (integrante_id)
    DO UPDATE SET
        pontuacao_total = v_pontuacao,
        ultima_jogada = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Cria o trigger
CREATE TRIGGER trigger_atualizar_ranking
AFTER INSERT ON historico_jogadas
FOR EACH ROW
EXECUTE FUNCTION atualizar_ranking_familia();

-- =====================================================
-- FUNÇÃO: OBTER RANKING DA FAMÍLIA
-- Retorna ranking de todos os membros de uma família específica
-- =====================================================
-- Essa função busca e ordena todos os membros da família
-- Retorna em formato de tabela com posição, nome, pontos, etc.
CREATE OR REPLACE FUNCTION obter_ranking_familia(p_token_familiar TEXT)
RETURNS TABLE (
    posicao INTEGER,
    nome_integrante TEXT,
    avatar TEXT,
    pontos INTEGER,
    precisao DECIMAL,
    ultima_jogada TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY p.pontos DESC, r.ultima_jogada DESC)::INTEGER as posicao,
        p.nome_integrante,
        p.avatar,
        p.pontos,
        p.precisao,
        r.ultima_jogada
    FROM perfis p
    JOIN ranking_familia r ON p.id = r.integrante_id
    WHERE p.token_familiar = p_token_familiar
    ORDER BY p.pontos DESC, r.ultima_jogada DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- FUNÇÃO: OBTER RANKING GLOBAL
-- Retorna ranking de todos os jogadores
-- =====================================================
-- Ranking geral do jogo inteiro! Mostra os top jogadores de todas as famílias
CREATE OR REPLACE FUNCTION obter_ranking_global(limite INTEGER DEFAULT 100)
RETURNS TABLE (
    posicao INTEGER,
    nome_integrante TEXT,
    avatar TEXT,
    token_familiar TEXT,
    pontos INTEGER,
    precisao DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY p.pontos DESC, p.updated_at DESC)::INTEGER as posicao,
        p.nome_integrante,
        p.avatar,
        p.token_familiar,
        p.pontos,
        p.precisao
    FROM perfis p
    ORDER BY p.pontos DESC, p.updated_at DESC
    LIMIT limite;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- FUNÇÃO: OBTER ESTATÍSTICAS GERAIS
-- Retorna estatísticas gerais do sistema
-- =====================================================
-- Dashboard de estatísticas do sistema todo
-- Quantos jogadores, famílias, jogadas, etc.
CREATE OR REPLACE FUNCTION obter_estatisticas_gerais()
RETURNS TABLE (
    total_jogadores BIGINT,
    total_familias BIGINT,
    total_jogadas BIGINT,
    pontuacao_media DECIMAL,
    precisao_media DECIMAL,
    jogo_mais_popular TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM perfis)::BIGINT,
        (SELECT COUNT(DISTINCT token_familiar) FROM perfis)::BIGINT,
        (SELECT COUNT(*) FROM historico_jogadas)::BIGINT,
        (SELECT COALESCE(AVG(pontos), 0) FROM perfis)::DECIMAL,
        (SELECT COALESCE(AVG(precisao), 0) FROM perfis)::DECIMAL,
        (SELECT jogo 
         FROM historico_jogadas 
         GROUP BY jogo 
         ORDER BY COUNT(*) DESC 
         LIMIT 1);
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Sistema de segurança do banco
-- Define quem pode ver e mexer em quais dados

-- Habilitar RLS nas tabelas
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_jogadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranking_familia ENABLE ROW LEVEL SECURITY;

-- Políticas para PERFIS (Todos podem ler, apenas o próprio pode atualizar)
-- Por enquanto tá liberado pra facilitar o desenvolvimento
CREATE POLICY "Perfis são visíveis para todos"
ON perfis FOR SELECT
USING (true);

CREATE POLICY "Perfis podem ser criados por todos"
ON perfis FOR INSERT
WITH CHECK (true);

CREATE POLICY "Perfis só podem ser atualizados pelo próprio integrante"
ON perfis FOR UPDATE
USING (true);

-- Políticas para HISTORICO_JOGADAS (Todos podem ler e criar)
CREATE POLICY "Histórico é visível para todos"
ON historico_jogadas FOR SELECT
USING (true);

CREATE POLICY "Histórico pode ser criado por todos"
ON historico_jogadas FOR INSERT
WITH CHECK (true);

-- Políticas para RANKING_FAMILIA (Leitura, inserção e atualização para todos)
CREATE POLICY "Ranking é visível para todos"
ON ranking_familia FOR SELECT
USING (true);

CREATE POLICY "Ranking pode ser criado por todos"
ON ranking_familia FOR INSERT
WITH CHECK (true);

CREATE POLICY "Ranking pode ser atualizado por todos"
ON ranking_familia FOR UPDATE
USING (true);

-- =====================================================
-- DADOS INICIAIS DE EXEMPLO
-- =====================================================
-- Dados de teste pra já começar com algo no banco

-- Inserir família de exemplo
INSERT INTO perfis (nome_integrante, avatar, token_familiar) VALUES
('João Silva', '👨', 'ABC123'),
('Maria Silva', '👩', 'ABC123'),
('Pedro Silva', '👦', 'ABC123');

-- Inserir algumas jogadas de exemplo
INSERT INTO historico_jogadas (jogador_id, jogo, nivel, acerto, tempo_resposta, pontuacao, dificuldade)
SELECT 
    id,
    'quiz',
    1,
    true,
    5.5,
    100,
    'Fácil'
FROM perfis
WHERE token_familiar = 'ABC123'
LIMIT 1;

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================
-- Pronto! Banco configurado e funcionando 🎮♻️

-- Exibir resumo
-- Mostra um resuminho do que foi criado
SELECT 
    'Schema criado com sucesso!' as mensagem,
    (SELECT COUNT(*) FROM perfis) as total_perfis,
    (SELECT COUNT(*) FROM historico_jogadas) as total_jogadas,
    (SELECT COUNT(*) FROM ranking_familia) as total_ranking;