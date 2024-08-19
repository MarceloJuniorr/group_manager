import { z } from 'zod'
import { FastifyRequest, FastifyReply } from 'fastify'
import {
  createEditionUseCase,
  findAllEditionActiveUseCase,
  findAllEditionUseCase,
} from '../use-cases/edition'

async function createEdition(request: FastifyRequest, reply: FastifyReply) {
  const createEditionBodySchema = z.object({
    edition: z.string(),
    value: z.number(),
    groupQtty: z.number(),
    sorteio: z.string(),
    groupLimit: z.number(),
    cardboardLimit: z.number(),
  })
  const data = createEditionBodySchema.parse(request.body)

  try {
    await createEditionUseCase(data)
    return reply.status(201).send()
  } catch (err) {
    return reply.status(409).send()
  }
}

async function findAllActiveEdition(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const editions = await findAllEditionActiveUseCase()

    return reply.status(201).send(editions)
  } catch (err) {
    return reply.status(409).send()
  }
}

async function findAllEdition(_request: FastifyRequest, reply: FastifyReply) {
  try {
    const editions = await findAllEditionUseCase()

    return reply.status(201).send(editions)
  } catch (err) {
    return reply.status(409).send()
  }
}

export { createEdition, findAllActiveEdition, findAllEdition }
