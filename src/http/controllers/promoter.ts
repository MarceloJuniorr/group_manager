import { z } from 'zod'
import { FastifyRequest, FastifyReply } from 'fastify'
import {
  createPromoterUseCase,
  findAllPromoterUseCase,
} from '../use-cases/promoter'

async function createPromoter(request: FastifyRequest, reply: FastifyReply) {
  const createPromoterBodySchema = z.object({
    name: z.string(),
    phone: z.string(),
  })
  const data = createPromoterBodySchema.parse(request.body)

  try {
    createPromoterUseCase(data)
    return reply.status(201).send()
  } catch (err) {
    return reply.status(409).send()
  }
}

async function findAllPromoter(_request: FastifyRequest, reply: FastifyReply) {
  try {
    const promoters = await findAllPromoterUseCase()
    return reply.status(201).send(promoters)
  } catch (err) {
    return reply.status(409).send()
  }
}

export { createPromoter, findAllPromoter }
