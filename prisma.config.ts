import { defineConfig } from 'prisma/config'

export default defineConfig({
  // Seed configuration
  seed: {
    command: 'tsx prisma/seed.ts',
  },

  // Generator configuration
  generator: {
    provider: 'prisma-client-js',
    output: '../node_modules/@prisma/client',
    previewFeatures: [],
  },

  // Database configuration (pulled from .env)
  datasource: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL,
  },
})
