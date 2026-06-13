import prisma from '../config/prisma.js';

const parseId = (value) => {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error('ID inválido');
    error.statusCode = 400;
    throw error;
  }

  return id;
};

const parseDate = (value) => {
  if (!value) return undefined;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    const error = new Error('Data inválida');
    error.statusCode = 400;
    throw error;
  }

  return date;
};

const buildConcursoData = ({
  cargo,
  local,
  data,
  url_edital,
  qtd_candidatos
}) => ({
  cargo,
  local: local ?? null,
  data: parseDate(data),
  url_edital: url_edital ?? null,
  qtd_candidatos: qtd_candidatos ?? 0,
});

export const createConcurso = async (req, res) => {
  try {
    const {
      cargo,
      local,
      data,
      url_edital,
      qtd_candidatos,
      id_banca
    } = req.body;

    if (!cargo || !id_banca) {
      return res.status(400).json({ error: 'Cargo e id_banca são obrigatórios.' });
    }

    const bancaId = parseId(id_banca);

    const bancaExists = await prisma.banca.findUnique({
      where: { id_banca: bancaId },
    });

    if (!bancaExists) {
      return res.status(400).json({ error: 'Banca informada não existe.' });
    }

    const concurso = await prisma.concurso.create({
      data: {
        ...buildConcursoData({
          cargo,
          local,
          data,
          url_edital,
          qtd_candidatos,
        }),
        id_banca: bancaId,
      },
      select: {
        id_concurso: true,
        id_banca: true,
        cargo: true,
        local: true,
        data: true,
        url_edital: true,
        qtd_candidatos: true,
        bancaRef: {
          select: {
            id_banca: true,
            nome: true,
          },
        },
      },
    });

    return res.status(201).json(concurso);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Erro ao criar concurso', details: error.message });
  }
};

export const getAllConcursos = async (req, res) => {
  try {
    const concursos = await prisma.concurso.findMany({
      select: {
        id_concurso: true,
        id_banca: true,
        cargo: true,
        local: true,
        data: true,
        url_edital: true,
        qtd_candidatos: true,
        bancaRef: {
          select: {
            id_banca: true,
            nome: true,
          },
        },
      },
      orderBy: {
        id_concurso: 'asc',
      },
    });

    return res.status(200).json(concursos);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar concursos', details: error.message });
  }
};

export const getConcursoById = async (req, res) => {
  try {
    const id_concurso = parseId(req.params.id_concurso || req.params.id);

    const concurso = await prisma.concurso.findUnique({
      where: { id_concurso },
      select: {
        id_concurso: true,
        id_banca: true,
        cargo: true,
        local: true,
        data: true,
        url_edital: true,
        qtd_candidatos: true,
        bancaRef: {
          select: {
            id_banca: true,
            nome: true,
          },
        },
      },
    });

    if (!concurso) {
      return res.status(404).json({ error: 'Concurso não encontrado' });
    }

    return res.status(200).json(concurso);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Erro ao buscar concurso', details: error.message });
  }
};

export const updateConcurso = async (req, res) => {
  try {
    const id_concurso = parseId(req.params.id_concurso || req.params.id);

    const {
      cargo,
      local,
      data,
      url_edital,
      qtd_candidatos,
      id_banca
    } = req.body;

    const dataToUpdate = {};

    if (cargo !== undefined) dataToUpdate.cargo = cargo;
    if (local !== undefined) dataToUpdate.local = local;
    if (data !== undefined) dataToUpdate.data = parseDate(data);
    if (url_edital !== undefined) dataToUpdate.url_edital = url_edital;
    if (qtd_candidatos !== undefined) dataToUpdate.qtd_candidatos = qtd_candidatos;

    if (id_banca !== undefined) {
      const bancaId = parseId(id_banca);

      const bancaExists = await prisma.banca.findUnique({
        where: { id_banca: bancaId },
      });

      if (!bancaExists) {
        return res.status(400).json({ error: 'Banca informada não existe.' });
      }

      dataToUpdate.id_banca = bancaId;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({ error: 'Nenhum campo foi informado para atualização.' });
    }

    const concurso = await prisma.concurso.update({
      where: { id_concurso },
      data: dataToUpdate,
      select: {
        id_concurso: true,
        id_banca: true,
        cargo: true,
        local: true,
        data: true,
        url_edital: true,
        qtd_candidatos: true,
        bancaRef: {
          select: {
            id_banca: true,
            nome: true,
          },
        },
      },
    });

    return res.status(200).json(concurso);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Concurso não encontrado' });
    }

    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Erro ao atualizar concurso', details: error.message });
  }
};

export const deleteConcurso = async (req, res) => {
  try {
    const id_concurso = parseId(req.params.id_concurso || req.params.id);

    await prisma.concurso.delete({
      where: { id_concurso },
    });

    return res.status(200).json({ message: 'Concurso removido com sucesso!' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Concurso não encontrado' });
    }

    return res.status(500).json({ error: 'Erro ao deletar concurso', details: error.message });
  }
};
