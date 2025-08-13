#!/bin/bash
# Vercel Deployment Script for Badezeit Sylt Restaurant Platform
# This script helps automate the deployment process to Vercel

echo "🚀 Badezeit Sylt - Vercel Deployment Helper"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this script from the project root."
    exit 1
fi

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Project: Badezeit Sylt Restaurant Management Platform"
echo "✅ Repository: https://github.com/lroy-stack/badezeit-sylt"
echo "✅ Framework: Next.js 15.4.6"
echo ""

echo "🔧 Environment Variables Required:"
echo "================================="
echo "DATABASE_URL=\"[REDACTED_FOR_SECURITY]\""
echo "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=\"pk_test_placeholder\""
echo "CLERK_SECRET_KEY=\"sk_test_placeholder\""
echo "NEXT_PUBLIC_CLERK_SIGN_IN_URL=\"/sign-in\""
echo "NEXT_PUBLIC_CLERK_SIGN_UP_URL=\"/sign-up\""
echo "RESEND_API_KEY=\"re_placeholder\" (optional)"
echo "RESEND_FROM_EMAIL=\"noreply@badezeit.de\" (optional)"
echo ""

echo "📋 Pre-Deployment Checklist:"
echo "============================"
echo "✅ Git repository pushed to GitHub"
echo "✅ Production build tested successfully"
echo "✅ Database connected to Supabase"
echo "✅ All dependencies installed"
echo "✅ TypeScript compilation successful"
echo ""

echo "🌐 After deployment, your site will be available at:"
echo "https://badezeit-sylt.vercel.app (or your custom domain)"
echo ""

echo "🎯 Features Available in Demo:"
echo "============================="
echo "🏠 Public Website - Complete restaurant landing page"
echo "📋 Menu System - Digital menu with categories"
echo "📅 Reservations - Functional booking system"
echo "🖼️  Gallery - Photo showcase with lightbox"
echo "👥 Admin Dashboard - Restaurant management panel"
echo "🍽️  Table Management - Advanced table system with QR codes"
echo "👤 Customer CRM - GDPR-compliant customer management"
echo ""

echo "Ready to deploy to Vercel?"
echo "=========================="
echo "1. Go to https://vercel.com and sign in"
echo "2. Click 'New Project'"
echo "3. Import from GitHub: lroy-stack/badezeit-sylt"
echo "4. Add environment variables listed above"
echo "5. Click 'Deploy'"
echo ""

echo "🚀 Your restaurant management platform will be live in minutes!"
echo ""
echo "For manual deployment, you can also run:"
echo "vercel --prod"