import { z } from 'zod'
import { FastifyRequest, FastifyReply } from 'fastify'
import { createOrderUseCase, findAllOrderUseCase } from '../use-cases/order'

async function createOrder(request: FastifyRequest, reply: FastifyReply) {
  const createOrderBodySchema = z.object({
    promoterid: z.string(),
    amount: z.number(),
    customer: z.object({
      name: z.string(),
      phone: z.string(),
    }),
  })
  const data = createOrderBodySchema.parse(request.body)

  try {
    const order = await createOrderUseCase(data)
    return reply.status(201).send(order)
  } catch (err) {
    return reply.status(409).send()
  }
}

async function findAllOrder(_request: FastifyRequest, reply: FastifyReply) {
  try {
    const orders = await findAllOrderUseCase()
    return reply.status(201).send(orders)
  } catch (err) {
    return reply.status(409).send()
  }
}

export { createOrder, findAllOrder }
