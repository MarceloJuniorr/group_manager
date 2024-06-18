import axios from 'axios'
import { env } from '../env'

const API_KEY = env.BOTCONVERSA_APIKEY
const BASE_URL = 'https://backend.botconversa.com.br/api/v1/webhook/subscriber/'

interface User {
  id: number
  full_name: string
  created: boolean
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function createUser(
  phone: string,
  firstName: string,
  lastName: string,
): Promise<User> {
  const data = {
    phone: `55${phone}`,
    first_name: firstName,
    last_name: lastName,
  }

  try {
    const response = await axios.post(BASE_URL, data, {
      headers: {
        accept: 'application/json',
        'API-KEY': API_KEY,
        'Content-Type': 'application/json',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

interface Message {
  status: string
  message: string
}

export async function sendMessage(
  name: string,
  phone: string,
  type: 'text' | 'file',
  message: string,
): Promise<Message> {
  try {
    // Create user and get the subscriber ID
    const user = await createUser(phone, name, ' MinasCap')
    const subscriberId = user.id

    const data = {
      type,
      value: message,
    }

    const response = await axios.post(
      `${BASE_URL}${subscriberId}/send_message/`,
      data,
      {
        headers: {
          accept: 'application/json',
          'API-KEY': API_KEY,
          'Content-Type': 'application/json',
        },
      },
    )

    if (response.status === 200) {
      console.log('Message sent successfully.')
      await sleep(1000)
      return { status: 'success', message: 'Message sent successfully.' }
    } else {
      console.warn('Unexpected response:', response)
      return { status: 'error', message: 'Unexpected response from server.' }
    }
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}
