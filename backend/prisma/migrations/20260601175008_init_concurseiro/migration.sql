-- Tabela de usuários
CREATE TABLE usuarios (
    id_usuario INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cpf CHAR(11) NOT NULL UNIQUE,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cidade VARCHAR(100),
    estado CHAR(2),
    perfil_publico BOOLEAN DEFAULT TRUE
);

-- Tabela de bancas
CREATE TABLE bancas (
    id_banca INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
);

-- Tabela de concursos
CREATE TABLE concurso (
    id_concurso INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_banca INT NOT NULL,
    cargo VARCHAR(150) NOT NULL,
    banca VARCHAR(100),
    local VARCHAR(150),
    data DATE,
    url_edital VARCHAR(255),
    qtd_candidatos INT DEFAULT 0,

    CONSTRAINT fk_concurso_banca
        FOREIGN KEY (id_banca)
        REFERENCES bancas(id_banca)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- Tabela de relacionamento (candidatos_concurso)
CREATE TABLE candidatos_concurso (
    id_usuario INT NOT NULL,
    id_concurso INT NOT NULL,
    data_inscricao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id_usuario, id_concurso),

    CONSTRAINT fk_candidatos_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_candidatos_concurso
        FOREIGN KEY (id_concurso)
        REFERENCES concurso(id_concurso)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


-- 1. Criação da Função que gerencia a contagem de candidatos por concurso (Gatilho)
CREATE FUNCTION fn_atualiza_qtd_candidatos()
RETURNS TRIGGER AS $$
BEGIN
    -- Se um novo registro foi inserido na tabela candidatos_concurso
    IF (TG_OP = 'INSERT') THEN
        UPDATE concurso
        SET qtd_candidatos = qtd_candidatos + 1
        WHERE id_concurso = NEW.id_concurso;
        RETURN NEW;

    -- Se um registro foi deletado da tabela candidatos_concurso
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE concurso
        SET qtd_candidatos = qtd_candidatos - 1
        WHERE id_concurso = OLD.id_concurso;
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 2. Criação do Trigger de Inserção
CREATE TRIGGER tg_candidato_inserido
AFTER INSERT ON candidatos_concurso
FOR EACH ROW
EXECUTE FUNCTION fn_atualiza_qtd_candidatos();

-- 3. Criação do Trigger de Remoção
CREATE TRIGGER tg_candidato_deletado
AFTER DELETE ON candidatos_concurso
FOR EACH ROW
EXECUTE FUNCTION fn_atualiza_qtd_candidatos();
