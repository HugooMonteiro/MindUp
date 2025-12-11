Aplicativo mobile para registro diário de pensamentos, feed comunitário e suporte emocional.
Sobre • Funcionalidades • Tecnologias • Instalação • Como Usar
</div>

📱 Sobre
O MindUp é um aplicativo mobile desenvolvido para ajudar pessoas a cuidarem da sua saúde mental através de:

📝 Registro Diário: Espaço privado para expressar pensamentos e sentimentos
🌟 Feed Comunitário: Compartilhe experiências positivas e apoie outras pessoas
💬 Interações Sociais: Sistema de curtidas e comentários
🔒 Privacidade: Dados criptografados e protegidos

✨ Funcionalidades
✅ Implementadas

 Sistema completo de autenticação (Cadastro, Login, Recuperação de senha)
 Validações robustas em múltiplas camadas
 Registro diário privado por usuário
 Feed comunitário com posts públicos
 Sistema de curtidas (1 por usuário)
 Sistema de comentários
 Senhas criptografadas com bcrypt
 Autenticação JWT
 Banco de dados MongoDB Atlas (cloud)
 API RESTful completa
 Interface responsiva e intuitiva

 🛠️ Tecnologias
Frontend

React Native
Expo
JavaScript

Backend

Node.js
Express.js
MongoDB + Mongoose
JWT (jsonwebtoken)
bcrypt
CORS

Infraestrutura

MongoDB Atlas (Cloud Database)

📦 Instalação
Pré-requisitos

Node.js (v14 ou superior)
npm ou yarn
Conta no MongoDB Atlas
Expo Go (para testar no celular)

1. Clonar repositório
 git clone https://github.com/seu-usuario/mindup-app.git
cd mindup-app

2. Configurar Backend
cd backend
npm install

Crie um arquivo .env na pasta backend:
PORT=3000
MONGODB_URI=sua_connection_string_do_mongodb_atlas
JWT_SECRET=sua_chave_secreta_jwt

Como obter o MongoDB URI:

Acesse MongoDB Atlas
Crie um cluster gratuito
Crie um usuário do banco
Pegue a connection string em "Connect" → "Connect your application"

Inicie o backend:
npm run dev

3. Configurar Frontend
Abra outro terminal:
cd frontend
npm install

Edite frontend/services/api.js e configure o endereço da API:
// Para testes no navegador:
const API_URL = 'http://localhost:3000/api';

// Para testes no celular, use o IP da sua máquina:
const API_URL = 'http://192.168.x.x:3000/api';

Inicie o frontend:
npx expo start

🚀 Como Usar
1. Testar no navegador
Aperte w no terminal do Expo
2. Testar no celular

Instale o app Expo Go (Android / iOS)
Escaneie o QR Code que aparece no terminal

3. Fluxo de uso

Cadastre-se no app
Faça login
Crie seu primeiro registro diário
Publique algo no feed comunitário
Curta e comente posts de outros usuários

📂 Estrutura do Projeto
mindup-app/
├── backend/
│   ├── src/
│   │   ├── models/      # Schemas do MongoDB
│   │   ├── routes/      # Endpoints da API
│   │   └── server.js    # Servidor principal
│   ├── .env.example     # Modelo de variáveis de ambiente
│   └── package.json
│
├── frontend/
│   ├── services/
│   │   └── api.js       # Chamadas à API
│   ├── assets/          # Imagens e ícones
│   ├── App.js           # Componente principal
│   └── package.json
│
└── README.md

🔐 Segurança

✅ Senhas criptografadas com bcrypt (salt rounds: 10)
✅ Autenticação via JWT (expiração: 7 dias)
✅ Validações em múltiplas camadas (frontend + backend)
✅ CORS configurado
✅ Variáveis de ambiente para dados sensíveis
✅ Dados privados filtrados por usuário

📊 API Endpoints
Autenticação
POST /api/auth/register  - Cadastrar usuário
POST /api/auth/login     - Fazer login
POST /api/auth/recover   - Recuperar senha

Registro Diário
POST   /api/diary          - Criar registro
GET    /api/diary/:userId  - Listar registros do usuário
DELETE /api/diary/:id      - Deletar registro

Feed
POST   /api/posts              - Criar post
GET    /api/posts              - Listar posts
POST   /api/posts/:id/like     - Curtir/Descurtir
POST   /api/posts/:id/comment  - Adicionar comentário
DELETE /api/posts/:id          - Deletar post


