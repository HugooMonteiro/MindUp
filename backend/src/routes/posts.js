const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Todas as rotas do feed exigem login
router.use(auth);

// Busca o nome do usuário no banco (não confia no nome enviado pelo app)
async function nomeDoUsuario(userId) {
  const user = await User.findById(userId).select('name');
  return user ? user.name : null;
}

// Criar post
router.post('/', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length < 5) {
      return res.status(400).json({ error: 'O post deve ter pelo menos 5 caracteres!' });
    }

    const userName = await nomeDoUsuario(req.userId);
    if (!userName) {
      return res.status(401).json({ error: 'Usuário não encontrado. Faça login novamente.' });
    }

    const post = new Post({
      userId: req.userId,
      userName,
      text
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar post' });
  }
});

// Listar todos os posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ date: -1 })
      .limit(50);

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar posts' });
  }
});

// Curtir/Descurtir post
router.post('/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }

    const alreadyLiked = post.likedBy.some(id => id.toString() === req.userId);

    if (alreadyLiked) {
      post.likes = Math.max(0, post.likes - 1);
      post.likedBy = post.likedBy.filter(id => id.toString() !== req.userId);
    } else {
      post.likes += 1;
      post.likedBy.push(req.userId);
    }

    await post.save();
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao curtir post' });
  }
});

// Adicionar comentário
router.post('/:id/comment', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length < 2) {
      return res.status(400).json({ error: 'O comentário deve ter pelo menos 2 caracteres!' });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }

    const userName = await nomeDoUsuario(req.userId);
    if (!userName) {
      return res.status(401).json({ error: 'Usuário não encontrado. Faça login novamente.' });
    }

    post.comments.push({
      userId: req.userId,
      userName,
      text
    });

    await post.save();
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao adicionar comentário' });
  }
});

// Deletar post (só se for do usuário logado)
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!post) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }

    res.json({ message: 'Post deletado!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar post' });
  }
});

module.exports = router;
