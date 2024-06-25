import { env } from '@/env'
import { prisma } from '../../lib/prisma'
import { createCustomerUseCase, findCustomerByPhoneUseCase } from './customer'

import { sendMessage } from '../../lib/whatsapp'

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

interface Quota {
  date: string
  transacao: string
  promoter: string
  promoterid: string
  customer: string
  customerid: string
  phone: string
  groupid: string
  group: number
  edition: string
  pdf: string
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
    HAVING COUNT(og.id) < ${env.GROUP_LIMIT}
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
    transaction: order.id,
    edition: activeEdition.edition,
    value: activeEdition.value,
    customer: customerExists.name,
    phone: customerExists.phone,
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
  c.phone AS phone,
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

export async function findQuotasByGroupUseCase(groupid: string) {
  const quotas = await prisma.$queryRaw`
SELECT
o.createdat as date,
  og.id AS transacao,
  p.name AS promoter,
  p.id AS promoterid,
  c.name AS customer,
  c.id AS customerid,
  c.phone AS phone,
  og.groupid,
  g.seqno as group,
  og.sended 
FROM orders o
  INNER JOIN promoters p ON (p.id = o.promoterid)
  INNER JOIN customers c ON (c.id = o.customerid)
  INNER JOIN ordergroups og ON (o.id = og.orderid)
  INNER JOIN groups g ON (og.groupid = g.id)
  INNER JOIN editions e ON (g.editionid = e.id)

WHERE og.groupid = ${groupid}
;`
  return quotas
}

export async function findAllQuotasUseCase() {
  console.log('fildAllQuotas')

  const quotas = await prisma.$queryRaw`
SELECT
  o.createdat as date,
  og.id AS transacao,
  p.name AS promoter,
  p.id AS promoterid,
  c.name AS customer,
  c.id AS customerid,
  c.phone AS phone,
  og.groupid,
  g.seqno as group,
  og.sended 
FROM orders o
  INNER JOIN promoters p ON (p.id = o.promoterid)
  INNER JOIN customers c ON (c.id = o.customerid)
  INNER JOIN ordergroups og ON (o.id = og.orderid)
  INNER JOIN groups g ON (og.groupid = g.id)
  INNER JOIN editions e ON (g.editionid = e.id)
WHERE e.active = true
ORDER BY 9,2
;`
  return quotas
}

export async function sendMessageUseCase(quotasId: number) {
  const arrayQuota: Quota[] = await prisma.$queryRaw`
  SELECT
  o.createdat as date,
  og.id AS transacao,
  p.name AS promoter,
  p.id AS promoterid,
  c.name AS customer,
  c.id AS customerid,
  c.phone AS phone,
  og.groupid,
  g.seqno as group,
  e.edition,
  g.pdf
FROM orders o
  INNER JOIN promoters p ON (p.id = o.promoterid)
  INNER JOIN customers c ON (c.id = o.customerid)
  INNER JOIN ordergroups og ON (o.id = og.orderid)
  INNER JOIN groups g ON (og.groupid = g.id)
  INNER JOIN editions e ON (g.editionid = e.id)
  WHERE og.id = ${quotasId}
  `
  const quota = arrayQuota[0]
  console.log(quota)
  const message = {
    m1: `*Olá, ${quota.customer.split(' ')[0]}!*\n*Você está participando do Bolão Regional Contagem - Minas Cap Edição ${quota.edition}, no Grupo ${quota.group},* juntamente com outras ${env.GROUP_LIMIT - 1} pessoas.\n\n*Aqui está a lista das ${env.CARDBOARD_LIMIT} cartelas* com as quais você estará concorrendo no sorteio deste domingo, dia 30 de junho.`,
    m2: quota.pdf,
    m3: `🚨 *ATENÇÃO!*\n*Para receber o resultado do sorteio, por favor, salve o meu contato!*\n_O resultado será enviado no domingo a partir das 15 horas._\n\`Em caso de premiação, entrarei em contato com você aqui pelo WhatsApp.\`\n\nObrigado pela confiança e boa sorte pra nós domingo! 🙏 Deus abençoe.`,
  }
  console.log(message)

  if (!quota.pdf) {
    throw new Error('PDF not is valid')
  }

  try {
    await sendMessage(quota.customer, quota.phone, 'text', message.m1)
    await sendMessage(quota.customer, quota.phone, 'file', message.m2)
    await sendMessage(quota.customer, quota.phone, 'text', message.m3)

    await prisma.orderGroups.updateMany({
      data: {
        sended: true,
      },
      where: {
        id: quotasId,
      },
    })
  } catch (error) {
    return { status: 'failed', message: 'Erro ao enviar menssagens!' }
  }

  return { status: 'sucess', message: 'menssagens enviadas com sucesso!' }
}

export async function deleteOrderUseCase(orderId: string) {
  if (orderId.length !== 36) {
    return { status: 'error', message: 'order ID not is UUID' }
  }
  try {
    await prisma.order.deleteMany({
      where: {
        id: orderId,
      },
    })
    await prisma.orderGroups.deleteMany({
      where: {
        orderid: orderId,
      },
    })
    return { status: 'sucess', message: 'Order deleted whith sucess' }
  } catch (error) {
    console.log(error)
    return { status: 'error', message: 'Error to deleted order' }
  }
}
