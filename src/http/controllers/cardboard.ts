import { z } from 'zod'
import { FastifyRequest, FastifyReply } from 'fastify'
import {
  createCardboardUseCase,
  findAllCardboardGroupUseCase,
} from '../use-cases/cardboard'

async function createCardboard(request: FastifyRequest, reply: FastifyReply) {
  const createCardboardBodySchema = z.object({
    groupid: z.string(),
    cardno: z.string(),
    picture: z.string(),
  })
  const data = createCardboardBodySchema.parse(request.body)

  try {
    const cardboard = await createCardboardUseCase(data)
    return reply.status(201).send(cardboard)
  } catch (err) {
    return reply.status(409).send()
  }
}

async function findAllCardboardByGroup(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const findAllCardboardGroupBodySchema = z.object({
    groupid: z.string(),
  })
  const { groupid } = findAllCardboardGroupBodySchema.parse(request.query)

  try {
    const cardboards = await findAllCardboardGroupUseCase(groupid)
    return reply.status(201).send(cardboards)
  } catch (err) {
    return reply.status(409).send()
  }
}

export { createCardboard, findAllCardboardByGroup }
