import fastify from 'fastify'
import { appRoutes } from './http/routes'
import fastifyStatic from '@fastify/static'
import path from 'path'

export const app = fastify()

app.register(appRoutes)
app.register(fastifyStatic, {
  root: path.join(__dirname, '../www'),
  prefix: '/', // Especifique o prefixo da rota onde o site estático será servido
})
