````markdown
# gymgante

## 🚀 Como iniciar o projeto

1. Clone o repositório:
```bash
git clone <link-do-projeto>
````

2. Acesse o projeto e mude para a branch `develop`:

```bash
git switch develop
git pull
```

3. Instale as dependências:

```bash
npm install
```

4. Copie a .env
```bash
EXPO_PUBLIC_FIREBASE_API_KEY=""
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=""
EXPO_PUBLIC_DATABASE_URL="",
EXPO_PUBLIC_PROJECT_ID="",
EXPO_PUBLIC_STORAGE_BUCKET="",
EXPO_PUBLIC_MESSAGING_SENDER_ID="",
EXPO_PUBLIC_APP_ID=""
EXPO_PUBLIC_MEASUREMENT_ID=""
```

---

## ✏️ Fazendo alterações

1. Crie uma nova branch:

```bash
git switch -c "nome-da-sua-branch"
```

2. Faça suas alterações, adicione e envie:

```bash
git add .
git commit -m "sua mensagem"
git push origin nome-da-sua-branch
```

