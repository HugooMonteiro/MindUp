import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  FlatList, StyleSheet, Alert, ScrollView, Image, ActivityIndicator
} from 'react-native';
import { authAPI, diaryAPI, postsAPI } from './services/api';

export default function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [screen, setScreen] = useState('login');
  const [loggedUser, setLoggedUser] = useState(null);
  const [recoverEmail, setRecoverEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados para Registro Diário
  const [dailyText, setDailyText] = useState('');
  const [diaries, setDiaries] = useState([]);

  // Estados para Feed
  const [posts, setPosts] = useState([]);
  const [postText, setPostText] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentingPostId, setCommentingPostId] = useState(null);

  // Carregar dados quando entrar em uma tela
  useEffect(() => {
    if (screen === 'diary' && loggedUser) {
      loadDiaries();
    }
    if (screen === 'feed') {
      loadPosts();
    }
  }, [screen, loggedUser]);

  const loadDiaries = async () => {
    setLoading(true);
    const result = await diaryAPI.getAll(loggedUser.id);
    if (!result.error) {
      setDiaries(result);
    }
    setLoading(false);
  };

  const loadPosts = async () => {
    setLoading(true);
    const result = await postsAPI.getAll();
    if (!result.error) {
      setPosts(result);
    }
    setLoading(false);
  };

  const registerUser = async () => {
    if (!name || !email || !password || !age) {
      setErrorMessage('❌ Preencha todos os campos!');
      return;
    }

    if (name.trim().length < 3) {
      setErrorMessage('❌ O nome deve ter pelo menos 3 caracteres!');
      return;
    }

    if (!email.includes('@')) {
      setErrorMessage('❌ Email inválido! Deve conter @');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('❌ A senha deve ter pelo menos 8 caracteres!');
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      setErrorMessage('❌ Idade inválida! Deve ser entre 13 e 120 anos.');
      return;
    }

    setLoading(true);
    const result = await authAPI.register(name, email, password, age);
    setLoading(false);

    if (result.error) {
      setErrorMessage(`❌ ${result.error}`);
    } else {
      setErrorMessage('');
      Alert.alert('Sucesso', 'Usuário cadastrado com sucesso!');
      setName(''); setEmail(''); setPassword(''); setAge('');
      setScreen('login');
    }
  };

  const loginUser = async () => {
    if (!email || !password) {
      setErrorMessage('❌ Preencha email e senha!');
      return;
    }

    setLoading(true);
    const result = await authAPI.login(email, password);
    setLoading(false);

    if (result.error) {
      setErrorMessage(`❌ ${result.error}`);
    } else {
      setLoggedUser(result.user);
      setErrorMessage('');
      setScreen('menu');
      setEmail(''); setPassword('');
    }
  };

  const recoverPassword = async () => {
    if (!recoverEmail) {
      setErrorMessage('❌ Digite seu email!');
      return;
    }

    if (!recoverEmail.includes('@')) {
      setErrorMessage('❌ Email inválido! Deve conter @');
      return;
    }

    setLoading(true);
    const result = await authAPI.recover(recoverEmail);
    setLoading(false);

    if (result.error) {
      setErrorMessage(`❌ ${result.error}`);
    } else {
      setErrorMessage('');
      Alert.alert('Recuperação de senha', result.message);
      setRecoverEmail('');
      setScreen('login');
    }
  };

  const createDiary = async () => {
    if (!dailyText.trim()) {
      setErrorMessage('❌ Escreva algo antes de salvar!');
      return;
    }

    if (dailyText.trim().length < 10) {
      setErrorMessage('❌ O registro deve ter pelo menos 10 caracteres!');
      return;
    }

    setLoading(true);
    const result = await diaryAPI.create(loggedUser.id, dailyText);
    setLoading(false);

    if (result.error) {
      setErrorMessage(`❌ ${result.error}`);
    } else {
      setDailyText('');
      setErrorMessage('');
      Alert.alert("Sucesso", "Registro salvo com sucesso!");
      loadDiaries();
    }
  };

  const createPost = async () => {
    if (!postText.trim()) {
      setErrorMessage('❌ Escreva algo antes de publicar!');
      return;
    }

    if (postText.trim().length < 5) {
      setErrorMessage('❌ O post deve ter pelo menos 5 caracteres!');
      return;
    }

    setLoading(true);
    const result = await postsAPI.create(loggedUser.id, loggedUser.name, postText);
    setLoading(false);

    if (result.error) {
      setErrorMessage(`❌ ${result.error}`);
    } else {
      setPostText('');
      setErrorMessage('');
      Alert.alert('Sucesso', 'Post publicado com sucesso!');
      loadPosts();
    }
  };

  const likePost = async (postId) => {
    const result = await postsAPI.like(postId, loggedUser.id);
    if (!result.error) {
      loadPosts(); // Recarrega os posts para atualizar curtidas
    }
  };

  const addComment = async (postId) => {
    if (!commentText.trim()) {
      setErrorMessage('❌ Escreva um comentário!');
      return;
    }

    if (commentText.trim().length < 2) {
      setErrorMessage('❌ O comentário deve ter pelo menos 2 caracteres!');
      return;
    }

    setLoading(true);
    const result = await postsAPI.comment(postId, loggedUser.id, loggedUser.name, commentText);
    setLoading(false);

    if (result.error) {
      setErrorMessage(`❌ ${result.error}`);
    } else {
      setCommentText('');
      setCommentingPostId(null);
      setErrorMessage('');
      loadPosts();
    }
  };

  // Componente de Loading
  const LoadingSpinner = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#8E8DBE" />
      <Text style={styles.loadingText}>Carregando...</Text>
    </View>
  );

  // ---------- TELAS ----------

  if (screen === 'login') {
    return (
      <View style={styles.container}>
        <Image source={require('./assets/logo.jpeg')} style={styles.logo} />

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <Text style={styles.label}>Email</Text>
        <TextInput 
          placeholder="Seu Email" 
          placeholderTextColor="#ddd"
          style={styles.input} 
          value={email} 
          onChangeText={(text) => {
            setEmail(text);
            setErrorMessage('');
          }} 
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput 
          placeholder="Sua senha" 
          placeholderTextColor="#ddd"
          secureTextEntry 
          style={styles.input} 
          value={password} 
          onChangeText={(text) => {
            setPassword(text);
            setErrorMessage('');
          }} 
        />

        <TouchableOpacity onPress={() => {
          setScreen('recover');
          setErrorMessage('');
        }}>
          <Text style={styles.link}>Esqueceu sua senha?</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={loginUser}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Acessar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => {
          setScreen('register');
          setErrorMessage('');
        }}>
          <Text style={styles.buttonText}>Cadastrar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (screen === 'register') {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <Text style={styles.label}>Nome</Text>
        <TextInput 
          placeholder="Seu Nome" 
          placeholderTextColor="#ddd" 
          style={styles.input} 
          value={name} 
          onChangeText={(text) => {
            setName(text);
            setErrorMessage('');
          }} 
        />

        <Text style={styles.label}>Email</Text>
        <TextInput 
          placeholder="Seu Email" 
          placeholderTextColor="#ddd" 
          style={styles.input} 
          value={email} 
          onChangeText={(text) => {
            setEmail(text);
            setErrorMessage('');
          }} 
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput 
          placeholder="Sua senha (mínimo 8 caracteres)" 
          placeholderTextColor="#ddd" 
          secureTextEntry 
          style={styles.input} 
          value={password} 
          onChangeText={(text) => {
            setPassword(text);
            setErrorMessage('');
          }} 
        />

        <Text style={styles.label}>Idade</Text>
        <TextInput 
          placeholder="Sua idade" 
          placeholderTextColor="#ddd" 
          style={styles.input} 
          value={age} 
          onChangeText={(text) => {
            setAge(text);
            setErrorMessage('');
          }} 
          keyboardType="numeric" 
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={registerUser}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Salvar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {
          setScreen('login');
          setErrorMessage('');
        }}>
          <Text style={styles.link}>Voltar</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (screen === 'recover') {
    return (
      <View style={styles.container}>
        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <Text style={styles.label}>Recuperar Senha</Text>
        <TextInput 
          placeholder="Seu Email" 
          placeholderTextColor="#ddd" 
          style={styles.input} 
          value={recoverEmail} 
          onChangeText={(text) => {
            setRecoverEmail(text);
            setErrorMessage('');
          }} 
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={recoverPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Recuperar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {
          setScreen('login');
          setErrorMessage('');
        }}>
          <Text style={styles.link}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (screen === 'menu') {
    return (
      <View style={styles.container}>
        <Text style={[styles.label, { fontSize: 22, marginBottom: 30 }]}>Bem-vindo, {loggedUser?.name}! 💜</Text>

        <TouchableOpacity style={styles.button} onPress={() => setScreen('diary')}>
          <Text style={styles.buttonText}>📝 Registro Diário</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => setScreen('feed')}>
          <Text style={styles.buttonText}>🌟 Feed Comunitário</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => setScreen('chatbot')}>
          <Text style={styles.buttonText}>💬 Chatbot</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: '#E57373' }]} onPress={() => {
          setLoggedUser(null);
          setScreen('login');
        }}>
          <Text style={styles.buttonText}>Sair</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (screen === 'diary') {
    return (
      <View style={styles.container}>
        <ScrollView>
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <Text style={[styles.label, { fontSize: 20, marginBottom: 10 }]}>Como foi seu dia?</Text>
          <Text style={styles.subtitle}>Escreva seus pensamentos e sentimentos</Text>
          
          <TextInput 
            style={[styles.input, { height: 120, textAlignVertical: 'top' }]} 
            placeholder="Escreva aqui..." 
            placeholderTextColor="#ddd"
            value={dailyText} 
            onChangeText={(text) => {
              setDailyText(text);
              setErrorMessage('');
            }}
            multiline
          />

          <TouchableOpacity 
            style={styles.button} 
            onPress={createDiary}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Salvar</Text>
            )}
          </TouchableOpacity>

          <Text style={[styles.label, { marginTop: 20, marginBottom: 10 }]}>Meus Registros</Text>
          
          {loading ? (
            <LoadingSpinner />
          ) : diaries.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum registro ainda. Comece a escrever!</Text>
          ) : (
            <FlatList 
              data={diaries}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <View style={styles.diaryItem}>
                  <Text style={styles.diaryDate}>
                    {new Date(item.date).toLocaleDateString('pt-BR')}
                  </Text>
                  <Text style={styles.diaryText}>{item.text}</Text>
                </View>
              )}
            />
          )}

          <TouchableOpacity onPress={() => {
            setScreen('menu');
            setErrorMessage('');
          }} style={{ marginTop: 20 }}>
            <Text style={styles.link}>← Voltar ao Menu</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  if (screen === 'feed') {
    return (
      <View style={styles.container}>
        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <Text style={[styles.label, { fontSize: 20, marginBottom: 10 }]}>Feed Comunitário 🌟</Text>
        <Text style={styles.subtitle}>Compartilhe sua jornada de bem-estar</Text>

        <View style={styles.postInputContainer}>
          <TextInput 
            style={[styles.input, { height: 80, textAlignVertical: 'top', marginBottom: 10 }]} 
            placeholder="Compartilhe algo positivo..." 
            placeholderTextColor="#ddd"
            value={postText} 
            onChangeText={(text) => {
              setPostText(text);
              setErrorMessage('');
            }}
            multiline
          />
          <TouchableOpacity 
            style={styles.smallButton} 
            onPress={createPost}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Publicar</Text>
            )}
          </TouchableOpacity>
        </View>

        {loading && posts.length === 0 ? (
          <LoadingSpinner />
        ) : (
          <FlatList 
            data={posts}
            keyExtractor={item => item._id}
            renderItem={({ item }) => {
              const userLiked = item.likedBy?.includes(loggedUser.id);
              const isCommenting = commentingPostId === item._id;
              
              return (
                <View style={styles.postItem}>
                  <View style={styles.postHeader}>
                    <Text style={styles.postAuthor}>{item.userName}</Text>
                    <Text style={styles.postDate}>
                      {new Date(item.date).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                  <Text style={styles.postText}>{item.text}</Text>
                  
                  <View style={styles.postActions}>
                    <TouchableOpacity 
                      style={[styles.actionButton, userLiked && styles.likedButton]} 
                      onPress={() => likePost(item._id)}
                    >
                      <Text style={[styles.actionText, userLiked && styles.likedText]}>
                        {userLiked ? '💜' : '🤍'} {item.likes} Curtidas
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => {
                        setCommentingPostId(isCommenting ? null : item._id);
                        setCommentText('');
                        setErrorMessage('');
                      }}
                    >
                      <Text style={styles.actionText}>
                        💬 {item.comments?.length || 0} Comentários
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {item.comments && item.comments.length > 0 && (
                    <View style={styles.commentsSection}>
                      {item.comments.map(comment => (
                        <View key={comment._id} style={styles.commentItem}>
                          <Text style={styles.commentAuthor}>{comment.userName}</Text>
                          <Text style={styles.commentText}>{comment.text}</Text>
                          <Text style={styles.commentDate}>
                            {new Date(comment.date).toLocaleDateString('pt-BR')}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {isCommenting && (
                    <View style={styles.commentInputContainer}>
                      <TextInput 
                        style={styles.commentInput}
                        placeholder="Escreva um comentário..."
                        placeholderTextColor="#999"
                        value={commentText}
                        onChangeText={(text) => {
                          setCommentText(text);
                          setErrorMessage('');
                        }}
                        multiline
                      />
                      <TouchableOpacity 
                        style={styles.commentButton}
                        onPress={() => addComment(item._id)}
                      >
                        <Text style={styles.commentButtonText}>Enviar</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhum post ainda.</Text>
                <Text style={styles.emptyText}>Seja o primeiro a compartilhar!</Text>
              </View>
            }
          />
        )}

        <TouchableOpacity onPress={() => {
          setScreen('menu');
          setErrorMessage('');
        }} style={{ marginTop: 10 }}>
          <Text style={styles.link}>← Voltar ao Menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (screen === 'chatbot') {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Chatbot em construção...</Text>
        <Text style={styles.subtitle}>Em breve você poderá conversar com nosso assistente de bem-estar!</Text>
        <TouchableOpacity onPress={() => setScreen('menu')} style={{ marginTop: 20 }}>
          <Text style={styles.link}>← Voltar ao Menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

// ---------- ESTILOS ----------
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#E7EDED' 
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 20,
    resizeMode: 'contain'
  },
  label: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
    textAlign: 'center',
    color: '#6C63A6',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
    color: '#8E8DBE',
  },
  input: { 
    backgroundColor: '#8E8DBE',
    color: '#fff',
    padding: 15,
    marginBottom: 20,
    borderRadius: 10,
  },
  button: {
    backgroundColor: '#8E8DBE',
    padding: 15,
    borderRadius: 25,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: { 
    color: '#6C63A6', 
    marginTop: 10, 
    textAlign: 'center',
    fontSize: 16,
  },
  diaryItem: { 
    backgroundColor: '#fff',
    padding: 15, 
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  diaryDate: {
    fontSize: 12,
    color: '#6C63A6',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  diaryText: {
    fontSize: 14,
    color: '#333',
  },
  smallButton: {
    backgroundColor: '#8E8DBE',
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  postInputContainer: {
    marginBottom: 20,
  },
  postItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  postAuthor: {
    fontWeight: 'bold',
    color: '#6C63A6',
    fontSize: 16,
  },
  postDate: {
    fontSize: 12,
    color: '#999',
  },
  postText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  postActions: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 5,
  },
  actionButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  actionText: {
    fontSize: 14,
    color: '#6C63A6',
  },
  likedButton: {},
  likedText: {
    fontWeight: 'bold',
    color: '#8E8DBE',
  },
  commentsSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  commentItem: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentAuthor: {
    fontWeight: 'bold',
    color: '#6C63A6',
    fontSize: 13,
    marginBottom: 3,
  },
  commentText: {
    fontSize: 13,
    color: '#333',
    marginBottom: 3,
  },
  commentDate: {
    fontSize: 11,
    color: '#999',
  },
  commentInputContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    color: '#333',
  },
  commentButton: {
    backgroundColor: '#8E8DBE',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  commentButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginVertical: 5,
  },
  errorBox: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#8E8DBE',
    fontSize: 14,
  },
});