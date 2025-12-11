const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Registrar usuário
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, age } = req.body;

    // Validações
    if (!name || !email || !password || !age) {
      return res.status(400).json({ error: 'Preencha todos os campos!' });
    }

    if (name.trim().length < 3) {
      return res.status(400).json({ error: 'O nome deve ter pelo menos 3 caracteres!' });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Email inválido!' });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ error: 'Email já cadastrado!' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 8 caracteres!' });
    }

    if (age < 13 || age > 120) {
      return res.status(400).json({ error: 'Idade inválida!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      age
    });

    await user.save();

    res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao cadastrar usuário' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Preencha email e senha!' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Email ou senha incorretos!' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou senha incorretos!' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Recuperar senha
router.post('/recover', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Digite seu email!' });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Email inválido!' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Email não encontrado!' });
    }

    res.json({ message: 'Email de recuperação enviado!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao recuperar senha' });
  }
});

module.exports = router;