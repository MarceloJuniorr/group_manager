import { FastifyInstance } from 'fastify'
import { createUser } from './controllers/user'
import { createPromoter, findAllPromoter } from './controllers/promoter'
import { createCustomer, findAllCustomer } from './controllers/customer'
import {
  createOrder,
  findAllOrder,
  findQuotas,
  sendMessage,
  deleteOrder,
} from './controllers/order'

import {
  createEdition,
  findAllActiveEdition,
  findAllEdition,
  updateSaleEdition,
} from './controllers/edition'
import {
  createCardboard,
  findAllCardboardByGroup,
} from './controllers/cardboard'

export async function appRoutes(app: FastifyInstance) {
  // Rotas de usuário
  app.post('/api/users', createUser)
  // Rotas de promotores
  app.post('/api/promoters', createPromoter)
  app.get('/api/promoters', findAllPromoter)
  // Rotas de clientes
  app.post('/api/customers', createCustomer)
  app.get('/api/customers', findAllCustomer)
  // Rotas de edição
  app.post('/api/editions', createEdition)
  app.get('/api/editions/active', findAllActiveEdition)
  app.get('/api/editions', findAllEdition)
  app.post('/api/editions/sale', updateSaleEdition)

  // Rotas de cartelas
  app.post('/api/cardboards', createCardboard)
  app.get('/api/cardboards', findAllCardboardByGroup)
  // Rotas de Vendas
  app.post('/api/orders', createOrder)
  app.get('/api/orders', findAllOrder)
  app.get('/api/quotas', findQuotas)
  app.post('/api/message', sendMessage)
  app.delete('/api/orders', deleteOrder)
}
