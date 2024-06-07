import { env } from '@/env'
import axios from 'axios'
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import { Content } from 'pdfmake/interfaces'
import { Readable } from 'stream'

pdfMake.vfs = pdfFonts.pdfMake.vfs

interface Picture {
  picture: string
  cardno: string
}

async function downloadImage(url: string): Promise<string> {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' })
    return Buffer.from(response.data, 'binary').toString('base64')
  } catch (error) {
    throw new Error(`Failed to download image from ${url}: ${error}`)
  }
}
export async function createPdfWithImages(
  imageUrls: Picture[],
  edition: string,
  group: number,
) {
  // const docDefinition: TDocumentDefinitions = { content: [] }
  const defaultStyle = {
    fontSize: 10,
    alignment: 'center' as 'left' | 'right' | 'center' | 'justify',
  }
  const content: Content[] = []
  content.push({
    text: `Bolão Regional Contagem – Grupo ${group} – Edição ${edition} ${env.PDF_MESSAGE}`,
  })
  for (const { picture } of imageUrls) {
    const imageBase64 = await downloadImage(picture)
    const dataUrl = `data:image/jpeg;base64,${imageBase64}`

    content.push({
      image: dataUrl,
      fit: [500, 500],
      margin: [5, 2],
    })
  }
  return new Promise((resolve, reject) => {
    try {
      const pdfDocGenerator = pdfMake.createPdf({ content, defaultStyle })
      pdfDocGenerator.getBuffer((buffer: Uint8Array) => {
        const readableStream = new Readable()
        readableStream._read = () => {} // _read is required but you can noop it
        readableStream.push(buffer)
        readableStream.push(null)
        resolve(readableStream)
      })
    } catch (error) {
      reject(error)
    }
  })
}
