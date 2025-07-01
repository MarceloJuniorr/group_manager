// server.ts

import { app } from './app'
import { env } from './env'
// Acesse o servidor HTTP subjacente do Fastif

// Inicia o servidor HTTP usando Fastify
app.listen({ host: '0.0.0.0', port: env.PORT }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server started on ${address} 🚀`)
})
