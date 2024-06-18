import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
  PORT: z.coerce.number().default(3333),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_REGION: z.string(),
  AWS_BUCKET: z.string(),
  PDF_MESSAGE: z.string(),
  BUCKET_URL: z.string(),
  CARDBOARD_LIMIT: z.coerce.number().default(10),
  GROUP_LIMIT: z.coerce.number().default(10),
  BOTCONVERSA_APIKEY: z.string(),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('❌ Invalid environment variables', _env.error.format())
  throw new Error('Invalid Environment Variables.')
}

export const env = _env.data
