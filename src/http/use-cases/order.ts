import { prisma } from '../../lib/prisma'
import { createCustomerUseCase, findCustomerByPhoneUseCase } from './customer'

interface ICustomer {
  name: string
  phone: string
}

interface CreateOrderUseCaseRequest {
  promoterid: string
  customer: ICustomer
  amount: number
}
interface GroupsAvalible {
  groupid: string
  seqno: number
  pdf: string
  ordergroupCount: number
}

export async function createOrderUseCase({
  promoterid,
  customer,
  amount,
}: CreateOrderUseCaseRequest) {
  let customerExists = await findCustomerByPhoneUseCase(customer.phone)
  if (!customerExists) {
    customerExists = await createCustomerUseCase(customer)
  }
  const order = await prisma.order.create({
    data: {
      promoterid,
      customerid: customerExists.id,
      amount,
    },
  })
  const activeEdition = await prisma.edition.findFirst({
    where: {
      active: true,
    },
  })
  if (!activeEdition) {
    throw new Error(`Not have active edition`)
  }
  const groups: GroupsAvalible[] = await prisma.$queryRaw`
    SELECT g.id AS groupid, g.seqno, g.pdf , COUNT(og.id) AS ordergroupCount
    FROM groups AS g
    LEFT JOIN ordergroups AS og ON g.id = og.groupid
    WHERE g.editionid = ${activeEdition.id}
    GROUP BY g.id
    HAVING COUNT(og.id) < 10
    ORDER BY g.seqno`

  if (!groups) {
    throw new Error(`Sem grupos disponíveis`)
  }
  const orderGroups: { group: number; groupid: string }[] = []
  for (let index = 0; index < amount; index++) {
    const group = groups[index]
    const orderGroup = await prisma.orderGroups.create({
      data: {
        orderid: order.id,
        groupid: group.groupid,
      },
    })
    if (!orderGroup) {
      throw new Error(`Erro ao inserir orderGroup`)
    }
    const formatGroup = {
      group: group.seqno,
      groupid: group.groupid,
      pdf: group.pdf,
      message: `https://wa.me/+55${customerExists.phone}?text=Ol%C3%A1,%20Obrigado%20por%20participar%20do%20nosso%20bol%C3%A3o!%0A%0ASegue%20as%20cartelas%20da%20sua%20cota%3A%20https%3A%2F%2Fgroupmanager.s3.sa-east-1.amazonaws.com%2Fpdf%2F${group.groupid}.pdf`,
    }
    orderGroups.push(formatGroup)
  }
  const formatedReturn = {
    edition: activeEdition.edition,
    value: activeEdition.value,
    groups: orderGroups,
  }
  console.log(formatedReturn)

  return formatedReturn
}

export async function findAllOrderUseCase() {
  const order = await prisma.$queryRaw`
SELECT
  o.id AS transacao,
  p.name AS promoter,
  p.id AS promoterid,
  c.name AS customer,
  c.id AS customerid,
  o.amount,
  e.edition
FROM orders o
  INNER JOIN promoters p ON (p.id = o.promoterid)
  INNER JOIN customers c ON (c.id = o.customerid)
  INNER JOIN ordergroups og ON (o.id = og.orderid)
  INNER JOIN groups g ON (og.groupid = g.id)
  INNER JOIN editions e ON (g.editionid = e.id)
GROUP BY 
  o.id, 
  p.name, 
  p.id, 
  c.name, 
  c.id, 
  o.amount, 
  e.edition;`
  return order
}
