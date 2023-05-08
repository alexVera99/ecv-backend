# ecv-backend

 Backend for Virtual Communications Subject project at UPF. It's in charge of providing mainly Websocket connection to synchronize a 3D real-time application called [Beyond Performance Music (BPM) Arena](https://github.com/alexVera99/3d-virtual-environment). Also, it provides authentication capabilities for the users of the application.

## Setup the server

First, install node dependencies

``npm install``

Create an environment file by using the `.env.example` file:

``cp .env.example .env``

Yoy may modify the values if needed.

Now, you can start the backend server by executing:

``node src/index.js``

If you want a MySQL database and a server with NodeJS installed, you may use Docker Compose. But before, delete the `node_modules` folder since docker compose will
install it for you. The reason of this is `bcrypt`. To use it, it should be installed
in the docker virtual machine instead of the host machine (aka. your computer).

``docker compose up -d``
