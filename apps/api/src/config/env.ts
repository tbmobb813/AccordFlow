import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.string().default('3000')
});

export const env = envSchema.parse(process.env);
