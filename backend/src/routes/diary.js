const express = require('express');
const router = express.Router();
const Diary = require('../models/Diary');

// Criar registro diário
router.post('/', async (req, res) => {
  try {
    const { userId, text } = req.body;

    if (!text || text.trim().length < 10) {
      return res.status(400).json({ error: 'O registro deve ter pelo menos 10 caracteres!' });
    }

    const diary = new Diary({
      userId,
      text
    });

    await diary.save();
    res.status(201).json(diary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao salvar registro' });
  }
});

// Listar registros do usuário
router.get('/:userId', async (req, res) => {
  try {
    const diaries = await Diary.find({ userId: req.params.userId })
      .sort({ date: -1 });

    res.json(diaries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar registros' });
  }
});

// Deletar registro
router.delete('/:id', async (req, res) => {
  try {
    await Diary.findByIdAndDelete(req.params.id);
    res.json({ message: 'Registro deletado!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar registro' });
  }
});

module.exports = router;