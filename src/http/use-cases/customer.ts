import { prisma } from '../../lib/prisma'

interface CreateCustomerUseCaseRequest {
  name: string
  phone: string
}

export async function createCustomerUseCase({
  name,
  phone,
}: CreateCustomerUseCaseRequest) {
  return await prisma.customer.create({
    data: {
      name,
      phone,
    },
  })
}

export async function findAllCustomerUseCase() {
  return await prisma.customer.findMany()
}

export async function findCustomerByPhoneUseCase(phone: string, name: string) {
  return await prisma.customer.findFirst({
    where: {
      phone,
      name,
    },
  })
}
