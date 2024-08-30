// whatsapp.ts

import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  AnyMessageContent,
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import { Server as SocketIOServer } from 'socket.io'
import { toDataURL } from 'qrcode' // Importa o qrcode para converter em base64
import fs from 'fs' // Importa o módulo de sistema de arquivos
import path from 'path'

let sock: ReturnType<typeof makeWASocket> | undefined
let io: SocketIOServer | undefined
let blockReconnect = false // Bloqueio de novas tentativas de reconexão

// Função para limpar credenciais
async function clearCredentials() {
  const directoryPath = 'auth_info'

  if (fs.existsSync(directoryPath)) {
    const files = fs.readdirSync(directoryPath) // Lista todos os arquivos e pastas no diretório

    files.forEach((file) => {
      const filePath = path.join(directoryPath, file)
      if (fs.lstatSync(filePath).isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true }) // Remove diretórios recursivamente
      } else {
        fs.unlinkSync(filePath) // Remove arquivos
      }
    })

    console.log('Credenciais limpas. Necessário reautenticar.')
  }
}

// Função para inicializar o cliente do WhatsApp
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
      console.log(
        'QR Code recebido, exibindo no terminal e enviando para o frontend...',
      )
      try {
        const qrCodeBase64 = await toDataURL(qr)
        io.emit('qr', qrCodeBase64) // Emite o QR Code como base64 para o frontend
      } catch (error) {
        console.error('Erro ao converter QR Code para base64:', error)
      }
    }

    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error).output.statusCode

      if (reason === DisconnectReason.badSession) {
        console.log(`Bad Session File, Please Delete and Scan Again`)
      } else if (reason === DisconnectReason.connectionClosed) {
        sock = undefined
        initialize(io)
      } else if (reason === DisconnectReason.connectionLost) {
        sock = undefined

        initialize(io)
      } else if (reason === DisconnectReason.connectionReplaced) {
        console.log(
          'Connection Replaced, Another New Session Opened, Please Close Current Session First',
        )
      } else if (reason === DisconnectReason.loggedOut) {
        sock = undefined
        console.log('Device Logged Out, Please Login Again')
      } else if (reason === DisconnectReason.restartRequired) {
        console.log('Restart Required, Restarting...')
        sock = undefined
        initialize(io)
      } else if (reason === DisconnectReason.timedOut) {
        console.log('Connection TimedOut, Reconnecting...')
        sock = undefined
        initialize(io)
      } else {
        sock?.end(lastDisconnect?.error)
      }
    }
  })

  sock.ev.on('creds.update', saveCreds)

  // Adiciona listener para evento de reconexão do frontend
  io?.on('connection', (socket) => {
    // Força o envio do status atual de conexão quando um novo cliente se conecta
    socket.emit('connectionUpdate', sock ? 'connected' : 'disconnected')

    socket.on('requestStatus', () => {
      if (sock) {
        // Verifique se o WebSocket está aberto

        socket.emit('connectionUpdate', 'open')
      } else {
        socket.emit('connectionUpdate', 'disconnected')
      }
    })

    socket.on('reconnectRequest', async () => {
      console.log('Requisição de reconexão recebida do frontend.')
      clearCredentials()

      if (sock) {
        sock.end(undefined) // Fecha a conexão adequadamente usando end
        sock = undefined
      }
      blockReconnect = false // Remove o bloqueio de reconexão ao solicitar reconexão manual
      initialize(io) // Reinicializa o cliente do WhatsApp
    })
  })

  return sock
}

// Função para obter o cliente existente
export function getClient() {
  return sock
}

// Função para enviar uma mensagem
export async function sendMessage(
  customer: string,
  phone: string,
  type: 'text' | 'file',
  content: string,
): Promise<{ status: string; message: string }> {
  if (!sock) {
    throw new Error('Cliente não inicializado. Por favor, inicialize primeiro.')
  }

  try {
    const formattedPhone = `55${phone.slice(0, 2) + phone.slice(3)}@s.whatsapp.net`
    console.log(formattedPhone)

    console.log(`Enviando mensagem para ${customer} (${formattedPhone})`)

    let messageContent: AnyMessageContent

    if (type === 'text') {
      // Prepara o conteúdo da mensagem de texto
      messageContent = {
        text: content,
      }
    } else if (type === 'file') {
      // Prepara o conteúdo da mensagem de arquivo (PDF)
      messageContent = {
        document: {
          url: content, // URL do arquivo PDF
        },
        mimetype: 'application/pdf', // Define o tipo MIME para PDF
        fileName: 'Documento.pdf', // Nome do arquivo a ser exibido no WhatsApp
      }
    } else {
      throw new Error('Tipo de mensagem não suportado.')
    }

    await sock.sendMessage(formattedPhone, messageContent as AnyMessageContent)
    console.log(`Mensagem do tipo '${type}' enviada com sucesso.`)

    return {
      status: 'success',
      message: `Mensagem do tipo '${type}' enviada com sucesso.`,
    }
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
    return { status: 'error', message: 'Erro ao enviar mensagem.' }
  }
}

// Função para verificar o status da conexão
export async function isConnected(): Promise<boolean> {
  if (!sock) {
    console.log('Cliente não inicializado.')
    return false
  }

  try {
    const state = sock.ws.readyState
    return state === 1 // WebSocket connection is open
  } catch (error) {
    console.error('Erro ao verificar status da conexão:', error)
    return false
  }
}
