import { createPdfWithImages } from '@/lib/utils'
import { prisma } from '../../lib/prisma'
import { env } from '@/env'
import { s3Client } from '../../lib/aws'
import { Upload } from '@aws-sdk/lib-storage'
import { Readable } from 'stream'

interface CreateCardboardUseCaseRequest {
  groupid: string
  cardno: string
  picture: string
}

export async function createCardboardUseCase({
  groupid,
  cardno,
  picture,
}: CreateCardboardUseCaseRequest) {
  const limit = await prisma.cardboard.count({
    where: {
      groupid,
    },
  })

  if (limit === env.CARDBOARD_LIMIT) {
    throw new Error(`The group already has ${env.CARDBOARD_LIMIT} tables.`)
  }

  const verifyAlreadyExistsCardboard = await prisma.cardboard.findFirst({
    where: { cardno },
  })

  if (verifyAlreadyExistsCardboard) {
    throw new Error('Cardboard Already Exists.')
  }

  //
  const base64Data = picture.replace(/^data:image\/\w+;base64,/, '')
  const buffer = Buffer.from(base64Data, 'base64')

  const params = {
    Bucket: env.AWS_BUCKET, // substitua pelo nome do seu bucket
    Key: `${cardno}.JPG`, // nome do arquivo a ser salvo no S3
    Body: buffer,
    ContentEncoding: 'base64', // necessário para base64
    ContentType: 'image/jpeg', // ou o tipo de imagem adequado
  }

  const upload = new Upload({
    client: s3Client,
    params,
  })

  const pictureUrl = (await upload.done()).Location
  if (pictureUrl === undefined) {
    throw new Error('Failed upload to S3')
  }
  //

  const cardboard = await prisma.cardboard.create({
    data: {
      groupid,
      cardno,
      picture: pictureUrl,
    },
  })
  console.log(`cardboard created`)

  if (limit === 9) {
    const cardboards = await prisma.cardboard.findMany({
      where: { groupid },
    })

    const editionGroup: { edition: string; seqno: number }[] =
      await prisma.$queryRaw`
    SELECT e.edition, g.seqno  FROM editions e inner join groups g ON (e.id = g.editionid) where g.id = ${groupid}`

    console.log(editionGroup)

    const pdfStream = await createPdfWithImages(
      cardboards,
      editionGroup[0].edition,
      editionGroup[0].seqno,
    )

    const paramsPdf = {
      Bucket: env.AWS_BUCKET,
      Key: `pdf/${groupid}.pdf`,
      Body: pdfStream as Readable, // Ensure the type matches
      ContentType: 'application/pdf',
    }
    const uploadPdf = new Upload({
      client: s3Client,
      params: paramsPdf,
    })

    const pdfUrl = (await uploadPdf.done()).Location
    if (pdfUrl === undefined) {
      throw new Error('Failed upload PDF to S3 bucket')
    }

    await prisma.group.updateMany({
      where: {
        id: groupid,
      },
      data: {
        pdf: pdfUrl,
      },
    })
  }

  return cardboard
}

export async function findAllCardboardGroupUseCase(groupid: string) {
  return await prisma.cardboard.findMany({
    where: {
      groupid,
    },
  })
}
