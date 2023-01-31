# ecv-backend

 Backend for Virtual Communications Subject project at UPF

## Setup

First, install node dependencies

``npm install``

Create an environment file by using the `.env.example` file:

``cp .env.example .env``

Yoy may modify the values if needed.

Now, you can start the backend server by executing:

``node src/index.js``

If you want a MySQL database and a server with NodeJS installed, you may use Docker Compose:

``docker compose up -d``
