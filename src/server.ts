// server.ts

import { app } from './app'
import { env } from './env'
import { Server as SocketIOServer } from 'socket.io'
import { initialize } from './lib/whatsapp'

// Acesse o servidor HTTP subjacente do Fastify
const server = app.server

// Inicializa o Socket.IO com o servidor HTTP subjacente
const io = new SocketIOServer(server)

// Configura o evento de conexão do Socket.IO
io.on('connection', (socket) => {
  console.log('Novo cliente conectado')

  initialize(io) // Inicializa o cliente WhatsApp e passa o io

  socket.on('disconnect', () => {
    console.log('Cliente desconectado')
  })
})

// Inicia o servidor HTTP usando Fastify
app.listen({ host: '0.0.0.0', port: env.PORT }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server started on ${address} 🚀`)
})
