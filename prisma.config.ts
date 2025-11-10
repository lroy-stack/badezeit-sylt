import { defineConfig } from 'prisma/config'
import path from 'node:path'

export default defineConfig({
  // Schema location
  schema: path.join('prisma', 'schema.prisma'),

  // Migrations configuration with seed command
  migrations: {
    path: path.join('prisma', 'migrations'),
    seed: 'tsx prisma/seed.ts',
  },
})
