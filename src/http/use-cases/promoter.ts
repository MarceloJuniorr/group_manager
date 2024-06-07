import { prisma } from '../../lib/prisma'

interface CreatePromoterUseCaseRequest {
  name: string
  phone: string
}

export async function createPromoterUseCase({
  name,
  phone,
}: CreatePromoterUseCaseRequest) {
  await prisma.promoter.create({
    data: {
      name,
      phone,
    },
  })
}

export async function findAllPromoterUseCase() {
  return await prisma.promoter.findMany()
}
