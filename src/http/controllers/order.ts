import { z } from 'zod'
import { FastifyRequest, FastifyReply } from 'fastify'
import {
  createOrderUseCase,
  findAllOrderUseCase,
  findAllQuotasUseCase,
  findQuotasByGroupUseCase,
  sendMessageUseCase,
} from '../use-cases/order'

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
    return reply.status(409).send(err)
  }
}

async function findQuotas(request: FastifyRequest, reply: FastifyReply) {
  const findQuotasByGroupSchema = z.object({
    groupid: z.string().default(''),
  })
  const { groupid } = findQuotasByGroupSchema.parse(request.query)

  if (groupid) {
    try {
      const orders = await findQuotasByGroupUseCase(groupid)
      return reply.status(201).send(orders)
    } catch (err) {
      return reply.status(409).send()
    }
  } else {
    try {
      const orders = await findAllQuotasUseCase()
      return reply.status(201).send(orders)
    } catch (err) {
      return reply.status(409).send()
    }
  }
}

async function sendMessage(request: FastifyRequest, reply: FastifyReply) {
  const findQuotasByGroupSchema = z.object({
    ogid: z.coerce.number(),
  })
  const { ogid } = findQuotasByGroupSchema.parse(request.body)
  try {
    const message = await sendMessageUseCase(ogid)
    return reply.status(201).send(message)
  } catch (error) {
    return reply.status(409).send(error)
  }
}

export { createOrder, findAllOrder, findQuotas, sendMessage }
