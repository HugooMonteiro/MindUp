const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// Criar post
router.post('/', async (req, res) => {
  try {
    const { userId, userName, text } = req.body;

    if (!text || text.trim().length < 5) {
      return res.status(400).json({ error: 'O post deve ter pelo menos 5 caracteres!' });
    }

    const post = new Post({
      userId,
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
    const { userId } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }

    const alreadyLiked = post.likedBy.includes(userId);

    if (alreadyLiked) {
      post.likes -= 1;
      post.likedBy = post.likedBy.filter(id => id.toString() !== userId);
    } else {
      post.likes += 1;
      post.likedBy.push(userId);
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
    const { userId, userName, text } = req.body;

    if (!text || text.trim().length < 2) {
      return res.status(400).json({ error: 'O comentário deve ter pelo menos 2 caracteres!' });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }

    post.comments.push({
      userId,
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

// Deletar post
router.delete('/:id', async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deletado!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar post' });
  }
});

module.exports = router;