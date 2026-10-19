# MindUp

Aplicativo mobile para registro diário de pensamentos, feed comunitário e apoio emocional entre usuários.

## Sobre

O MindUp ajuda as pessoas a cuidarem da saúde mental no dia a dia:

- **Registro diário:** espaço privado para escrever pensamentos e sentimentos
- **Feed comunitário:** compartilhe experiências positivas e apoie outras pessoas
- **Interações:** curtidas e comentários nos posts
- **Privacidade:** cada registro diário só aparece para o seu autor

> O MindUp não substitui acompanhamento psicológico ou médico.

## Funcionalidades

- Cadastro, login e recuperação de senha
- Validações no app e na API
- Registro diário privado por usuário
- Feed com posts públicos
- Curtidas (uma por usuário) e comentários
- **Carta do Dia**: jogo diário de 3 cartas virtuais. Cada pessoa recebe 3 mensagens de apoio diferentes por dia (banco com mais de 400 frases) e pode compartilhar a carta escolhida no feed
- API RESTful com banco MongoDB Atlas na nuvem

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| App | React Native, Expo (SDK 57), JavaScript |
| API | Node.js, Express, Mongoose, JWT (`jsonwebtoken`), bcrypt, CORS |
| Banco de dados | MongoDB Atlas |

## Como rodar

Pré-requisitos: Node.js 22 (versão LTS), npm ou yarn, uma conta gratuita no MongoDB Atlas e, para testar no celular, o app Expo Go.

### 1. Clonar o repositório

```bash
git clone https://github.com/HugooMonteiro/MindUp.git
cd MindUp
```

### 2. Configurar e iniciar a API

```bash
cd backend
npm install
```

Crie um arquivo `.env` na pasta `backend` (use o `.env.example` como modelo):

```
PORT=3000
MONGODB_URI=sua_connection_string_do_mongodb_atlas
JWT_SECRET=uma_chave_secreta_longa
```

Para obter a `MONGODB_URI`: crie um cluster gratuito no MongoDB Atlas, crie um usuário do banco e copie a connection string em **Connect**.

```bash
npm run dev
```

### 3. Configurar e iniciar o app

Em outro terminal:

```bash
cd frontend
npm install
```

```bash
npx expo start
```

- **Navegador:** aperte `w` (abre em `http://localhost:8081`).
- **Celular:** instale o app **Expo Go** e escaneie o QR Code (no iPhone, pela câmera; no Android, pelo próprio Expo Go). O celular e o notebook precisam estar na mesma rede Wi-Fi, e o firewall deve permitir o Node em redes privadas.

O app descobre sozinho o endereço da API (backend na porta 3000). Se precisar forçar outro endereço, crie o arquivo `frontend/.env` com:

```
EXPO_PUBLIC_API_URL=http://SEU_ENDERECO:3000/api
```

> O Expo Go só abre projetos da mesma versão de SDK que ele. Quando o Expo Go das lojas passar para um SDK mais novo, atualize o projeto com `npx expo install expo@latest --fix`.

## Como usar

1. Cadastre-se e faça login
2. Crie seu primeiro registro diário
3. Publique algo no feed comunitário
4. Curta e comente os posts de outras pessoas
5. Abra a **Carta do Dia** no menu, escolha uma das três cartas e compartilhe a mensagem com a comunidade

## Estrutura do projeto

```
MindUp/
├── backend/
│   ├── src/
│   │   ├── models/      schemas do MongoDB
│   │   ├── routes/      endpoints da API
│   │   └── server.js    servidor principal
│   ├── .env.example     modelo de variáveis de ambiente
│   └── package.json
└── frontend/
    ├── screens/         telas (Carta do Dia)
    ├── data/frases.js   banco de frases das cartas
    ├── utils/cartas.js  sorteio das 3 cartas por pessoa e por dia
    ├── services/api.js  chamadas à API
    ├── assets/          imagens e ícones
    ├── App.js           componente principal
    ├── index.js         ponto de entrada do Expo
    ├── app.json         configuração do Expo
    └── package.json
```

## Segurança

- Senhas guardadas como hash com bcrypt (10 rounds)
- Autenticação com JWT (expira em 7 dias)
- Validações no app e na API
- CORS configurado
- Segredos em variáveis de ambiente, fora do repositório
- Registros privados filtrados por usuário

## API

| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/api/auth/register` | Cadastrar usuário |
| POST | `/api/auth/login` | Fazer login |
| POST | `/api/auth/recover` | Recuperar senha |
| POST | `/api/diary` | Criar registro diário |
| GET | `/api/diary/:userId` | Listar registros do usuário |
| DELETE | `/api/diary/:id` | Apagar registro |
| POST | `/api/posts` | Criar post |
| GET | `/api/posts` | Listar posts |
| POST | `/api/posts/:id/like` | Curtir ou descurtir |
| POST | `/api/posts/:id/comment` | Comentar |
| DELETE | `/api/posts/:id` | Apagar post |

## Prints

<!-- Futuramente -->

## Autor

Hugo de Oliveira Monteiro — [LinkedIn](https://www.linkedin.com/in/hugo-de-oliveira-monteiro-78ba39291)
