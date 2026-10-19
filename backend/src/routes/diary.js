const express = require('express');
const router = express.Router();
const Diary = require('../models/Diary');
const auth = require('../middleware/auth');

// Todas as rotas do diário exigem login
router.use(auth);

// Criar registro diário (o dono vem do token, não do corpo da requisição)
router.post('/', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length < 10) {
      return res.status(400).json({ error: 'O registro deve ter pelo menos 10 caracteres!' });
    }

    const diary = new Diary({
      userId: req.userId,
      text
    });

    await diary.save();
    res.status(201).json(diary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao salvar registro' });
  }
});

// Listar registros do usuário (só os próprios)
router.get('/:userId', async (req, res) => {
  try {
    if (req.params.userId !== req.userId) {
      return res.status(403).json({ error: 'Você não tem permissão para ver esses registros.' });
    }

    const diaries = await Diary.find({ userId: req.userId })
      .sort({ date: -1 });

    res.json(diaries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar registros' });
  }
});

// Deletar registro (só se for do usuário logado)
router.delete('/:id', async (req, res) => {
  try {
    const diary = await Diary.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!diary) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }

    res.json({ message: 'Registro deletado!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar registro' });
  }
});

module.exports = router;
