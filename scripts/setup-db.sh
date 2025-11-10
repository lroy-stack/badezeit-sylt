#!/bin/bash

# Database setup script for Badezeit Sylt
# This script initializes the database schema and seeds initial data

set -e

echo "🔧 Setting up database..."

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Push schema to database (creates tables if they don't exist)
echo "🗄️  Applying database schema..."
npx prisma db push --skip-generate

# Optional: Seed database with initial data
if [ "$1" == "--seed" ]; then
  echo "🌱 Seeding database..."
  npm run db:seed
fi

echo "✅ Database setup complete!"
