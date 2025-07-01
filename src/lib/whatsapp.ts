// whatsapp.ts

import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  AnyMessageContent,
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import { Server as SocketIOServer } from 'socket.io'
import { toDataURL } from 'qrcode'
import fs from 'fs'
import path from 'path'
import axios from 'axios'
import { config } from 'dotenv'
config()

const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || ''
const EVOLUTION_URL = process.env.EVOLUTION_URL || ''
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || ''

let sock: ReturnType<typeof makeWASocket> | undefined
let io: SocketIOServer | undefined
let blockReconnect = false

async function clearCredentials() {
  const directoryPath = 'auth_info'

  if (fs.existsSync(directoryPath)) {
    const files = fs.readdirSync(directoryPath)
    files.forEach((file) => {
      const filePath = path.join(directoryPath, file)
      if (fs.lstatSync(filePath).isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true })
      } else {
        fs.unlinkSync(filePath)
      }
    })
    console.log('Credenciais limpas. Necessário reautenticar.')
  }
}

export async function initialize(socketIO?: SocketIOServer) {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info')

  if (sock) {
    console.log('Cliente já inicializado.')
    return sock
  }

  if (blockReconnect) {
    console.warn(
      'Bloqueio de reconexão ativado. Nenhuma nova tentativa será feita.',
    )
    return
  }

  io = socketIO
  const { version, isLatest } = await fetchLatestBaileysVersion()
  console.log(`Usando versão ${version}, última versão: ${isLatest}`)

  sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    syncFullHistory: false,
  })

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update
    console.log('connection', connection)

    if (qr && io) {
      try {
        const qrCodeBase64 = await toDataURL(qr)
        io.emit('qr', qrCodeBase64)
      } catch (error) {
        console.error('Erro ao converter QR Code para base64:', error)
      }
    }

    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error).output.statusCode

      if (reason === DisconnectReason.badSession) {
        console.log(`Bad Session File, Please Delete and Scan Again`)
      } else if (
        reason === DisconnectReason.connectionClosed ||
        reason === DisconnectReason.connectionLost ||
        reason === DisconnectReason.restartRequired ||
        reason === DisconnectReason.timedOut
      ) {
        sock = undefined
        initialize(io)
      } else if (reason === DisconnectReason.connectionReplaced) {
        console.log('Connection Replaced. Please close current session first.')
      } else if (reason === DisconnectReason.loggedOut) {
        sock = undefined
        console.log('Device Logged Out. Please login again.')
      } else {
        sock?.end(lastDisconnect?.error)
      }
    }
  })

  sock.ev.on('creds.update', saveCreds)

  io?.on('connection', (socket) => {
    socket.emit('connectionUpdate', sock ? 'connected' : 'disconnected')

    socket.on('requestStatus', () => {
      socket.emit('connectionUpdate', sock ? 'open' : 'disconnected')
    })

    socket.on('reconnectRequest', async () => {
      console.log('Requisição de reconexão recebida do frontend.')
      clearCredentials()

      if (sock) {
        sock.end(undefined)
        sock = undefined
      }

      blockReconnect = false
      initialize(io)
    })
  })

  return sock
}

export function getClient() {
  return sock
}

// 🟡 Agora com parâmetro useEvolution
export async function sendMessage(
  useEvolution: boolean,
  customer: string,
  phone: string,
  type: 'text' | 'file',
  content: string,
): Promise<{ status: string; message: string }> {
  return useEvolution
    ? await sendViaEvolution(customer, phone, type, content)
    : await sendViaBaileys(customer, phone, type, content)
}

async function sendViaEvolution(
  customer: string,
  phone: string,
  type: 'text' | 'file',
  content: string,
): Promise<{ status: string; message: string }> {
  try {
    const fullPhone = `55${phone.replace(/\D/g, '')}`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = {
      number: fullPhone,
    }

    if (type === 'text') {
      payload.text = content
    } else if (type === 'file') {
      payload.file = content
      payload.filename = 'Documento.pdf'
    } else {
      throw new Error('Tipo de mensagem não suportado.')
    }

    const url =
      type === 'text'
        ? `${EVOLUTION_URL}/message/sendText/${EVOLUTION_INSTANCE}`
        : `${EVOLUTION_URL}/message/sendFile/${EVOLUTION_INSTANCE}`

    const response = await axios.post(url, payload, {
      headers: {
        apikey: EVOLUTION_API_KEY,
      },
    })
    if (response.data.success) {
      return {
        status: 'success',
        message: `Mensagem enviada via Evolution (${type}).`,
      }
    } else {
      throw new Error(response.data.message || 'Erro ao enviar mensagem.')
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Erro Evolution:', error.message || error)
    return { status: 'error', message: 'Erro ao enviar via Evolution.' }
  }
}

async function sendViaBaileys(
  customer: string,
  phone: string,
  type: 'text' | 'file',
  content: string,
): Promise<{ status: string; message: string }> {
  if (!sock) {
    throw new Error('Cliente Baileys não inicializado.')
  }

  try {
    const formattedPhone = `55${phone.replace(/\D/g, '')}@s.whatsapp.net`

    let messageContent: AnyMessageContent

    if (type === 'text') {
      messageContent = { text: content }
    } else if (type === 'file') {
      messageContent = {
        document: { url: content },
        mimetype: 'application/pdf',
        fileName: 'Documento.pdf',
      }
    } else {
      throw new Error('Tipo de mensagem não suportado.')
    }

    await sock.sendMessage(formattedPhone, messageContent as AnyMessageContent)

    return {
      status: 'success',
      message: `Mensagem enviada via Baileys (${type}).`,
    }
  } catch (error) {
    console.error('Erro Baileys:', error)
    return { status: 'error', message: 'Erro ao enviar via Baileys.' }
  }
}

export async function isConnected(): Promise<boolean> {
  if (!sock) {
    console.log('Cliente Baileys não inicializado.')
    return false
  }

  try {
    const state = sock.ws.readyState
    return state === 1
  } catch (error) {
    console.error('Erro ao verificar conexão:', error)
    return false
  }
}
