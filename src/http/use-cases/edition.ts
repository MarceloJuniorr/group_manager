import { getNumberByIndex } from '@/lib/utils'
import { prisma } from '../../lib/prisma'
import { Group } from '@prisma/client'

interface ICreateEditionUseCaseRequest {
  edition: string
  value: number
  groupQtty: number
  sorteio: string
  groupLimit: number
  cardboardLimit: number
}
interface IFormatEditions {
  edition: string
  value: number
  sorteio: string
  groupLimit: number
  cardboardLimit: number
  groups: Group[]
}

export async function createEditionUseCase({
  edition,
  value,
  groupQtty,
  sorteio,
  groupLimit,
  cardboardLimit
}: ICreateEditionUseCaseRequest) {
  try {
    const { id } = await prisma.edition.create({
      data: {
        edition,
        value,
        sorteio,
        group_limit: groupLimit,
        cardboard_limit: cardboardLimit,

      },
    })
    if (id) {
      for (let index = 1; index <= groupQtty; index++) {
        const seqno = getNumberByIndex(index)
        await prisma.group.create({
          data: {
            seqno,
            editionid: id,
          },
        })
      }
    }
    await prisma.edition.updateMany({
      where: {
        NOT: {
          id,
        },
      },
      data: {
        active: false,
      },
    })
  } catch (err) {
    console.error(err)
  }
}

// Busca todas as edições Ativas
export async function findAllEditionActiveUseCase() {
  const editions = await prisma.edition.findMany()
  const formatEditions: IFormatEditions[] = []
  for (let index = 0; index < editions.length; index++) {
    const edition = editions[index]
    if (edition.active) {
      const groups = await prisma.group.findMany({
        where: {
          editionid: edition.id,
        },
        orderBy: {
          seqno: 'asc',
        },
      })

      formatEditions.push({
        edition: edition.edition,
        value: edition.value,
        sorteio: edition.sorteio,
        groupLimit: edition.group_limit,
        cardboardLimit: edition.cardboard_limit,
        groups,
      })
    }
  }
  return formatEditions
}

export async function findAllEditionUseCase() {
  const editions = await prisma.edition.findMany({
    orderBy: { edition: 'desc' },
  })
  const formatEditions: IFormatEditions[] = []
  for (let index = 0; index < editions.length; index++) {
    const edition = editions[index]

    const groups = await prisma.group.findMany({
      where: {
        editionid: edition.id,
      },
      orderBy: {
        seqno: 'asc',
      },
    })

    formatEditions.push({
      edition: edition.edition,
      value: edition.value,
      sorteio: edition.sorteio,
      groupLimit: edition.group_limit,
      cardboardLimit: edition.cardboard_limit,
      groups,
    })
  }
  return formatEditions
}
