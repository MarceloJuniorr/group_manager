import { z } from 'zod'
import { FastifyRequest, FastifyReply } from 'fastify'
import {
  createCustomerUseCase,
  findAllCustomerUseCase,
} from '../use-cases/customer'

async function createCustomer(request: FastifyRequest, reply: FastifyReply) {
  const createCustomerBodySchema = z.object({
    name: z.string(),
    phone: z.string(),
  })
  const data = createCustomerBodySchema.parse(request.body)

  try {
    const customer = createCustomerUseCase(data)
    return reply.status(201).send(customer)
  } catch (err) {
    return reply.status(409).send()
  }
}

async function findAllCustomer(_request: FastifyRequest, reply: FastifyReply) {
  try {
    const customers = await findAllCustomerUseCase()
    return reply.status(201).send(customers)
  } catch (err) {
    return reply.status(409).send()
  }
}

export { createCustomer, findAllCustomer }
