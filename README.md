
# 🚀 TaskFlow

Sistema Web de gerenciamento de tarefas desenvolvido
com C#, ASP.NET Core e Entity Framework Core.

## 📌 Sobre o projeto

O TaskFlow é uma aplicação de gerenciamento de tarefas
criada para praticar desenvolvimento Full Stack com .NET.

O projeto faz parte dos meus estudos para me tornar
Desenvolvedor C#/.NET.

## 🛠️ Tecnologias utilizadas

### Backend
- C#
- .NET 10
- ASP.NET Core Minimal APIs
- Entity Framework Core
- SQLite

### Frontend
- HTML5
- CSS3
- JavaScript
- Fetch API

## ✅ Funcionalidades

- Criar tarefas
- Listar tarefas
- Editar título e categoria
- Marcar tarefas como concluídas
- Excluir tarefas
- Organizar tarefas por categorias
- Definir prioridade Baixa, Média ou Alta
- Filtrar tarefas por categoria
- Dashboard com estatísticas
- Modo claro e escuro
- Interface responsiva

## 📂 Categorias

- 🏠 Pessoal
- 💼 Trabalho
- 📚 Estudos

## 🌐 Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /tarefas | Listar tarefas |
| POST | /tarefas | Criar tarefa |
| PUT | /tarefas/{id} | Editar tarefa |
| PUT | /tarefas/{id}/concluir | Concluir tarefa |
| DELETE | /tarefas/{id} | Excluir tarefa |

## ▶️ Como executar

### Requisitos

- .NET SDK 10
- Git

Clone o repositório:

```bash
git clone URL_DO_REPOSITORIO
```

Entre na pasta do projeto e execute:

```bash
dotnet restore
dotnet ef database update
dotnet run
```

Observação: para utilizar `dotnet ef`, é necessário
ter a ferramenta dotnet-ef instalada e compatível
com a versão do Entity Framework Core do projeto.

Acesse o endereço informado pelo terminal.

## 📚 Aprendizados

Durante o desenvolvimento pratiquei:

- Criação de APIs REST
- Métodos HTTP
- CRUD
- Programação assíncrona
- Entity Framework Core
- Migrations
- Persistência de dados
- Comunicação entre frontend e backend
- JavaScript e manipulação do DOM
- Desenvolvimento responsivo

## 🚧 Próximas melhorias

- Datas de vencimento
- Alertas de tarefas atrasadas
- Filtros avançados
- Testes automatizados
- Autenticação de usuários
- Publicação online

## 👨‍💻 Objetivo

Projeto desenvolvido para aprendizado,
prática e construção de portfólio profissional.
