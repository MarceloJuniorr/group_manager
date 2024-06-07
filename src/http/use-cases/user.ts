import { prisma } from '../../lib/prisma'

interface CreateUserUseCaseRequest {
  name: string
  email: string
  pass: string
}

export async function createUserUseCase({
  name,
  email,
  pass,
}: CreateUserUseCaseRequest) {
  await prisma.user.create({
    data: {
      name,
      email,
      pass,
    },
  })
}
