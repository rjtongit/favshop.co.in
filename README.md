<!-- PROJECT ARCHITECTURE -->
favshop.co.in/
│
├── .gitignore
├── README.md
│
├── admin/
│   ├── src/
│   ├── angular.json
│   ├── package.json
│   └── package-lock.json
│
├── user/
│   ├── src/
│   ├── angular.json
│   ├── package.json
│   └── package-lock.json
│
└── backend/
    ├── app/
    ├── .env
    ├── .env.example
    ├── requirements.txt
    ├── README.md
    └── seed.py
<!-- Dockerize ARCHITECTURE -->
favshop.co.in/
├── backend/
│   ├── Dockerfile
│   ├── requirements-docker.txt
│   ├── .dockerignore
│   └── ...
│
├── user/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .dockerignore
│   └── ...
│
└── admin/
    ├── Dockerfile
    ├── nginx.conf
    ├── .dockerignore
    └── ...
<!-- DEPLOYMENT ARCHITECTURE -->
                    GitHub
                       │
                 CI/CD Pipeline
                       │
              ┌────────┴────────┐
              ↓                 ↓
          Angular             FastAPI
          Frontend            Backend
              │                 │
              │            ┌────┴─────┐
              │            │          │
              │          RAG       AI Model
              │            │          │
              │          FAISS    Azure OpenAI
              │
              └──────────────┬─────────────
                             ↓
                         Favshop