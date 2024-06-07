import { z } from 'zod'
import { FastifyRequest, FastifyReply } from 'fastify'
import { createUserUseCase } from '../use-cases/user'

export async function createUser(request: FastifyRequest, reply: FastifyReply) {
  const createUserBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    pass: z.string().min(6),
  })
  const data = createUserBodySchema.parse(request.body)

  try {
    createUserUseCase(data)
  } catch (err) {
    return reply.status(409).send()
  }
  return reply.status(201).send()
}
