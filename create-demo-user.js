const { createClient } = require('@supabase/supabase-js')

// Supabase configuration - YOU NEED TO SET THESE ENVIRONMENT VARIABLES
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ayugwprhixtsfktxungq.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // This is the service role key (secret)

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required')
  console.log('🔧 Get this from your Supabase dashboard > Settings > API')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createDemoUser() {
  try {
    console.log('🚀 Creating demo user...')
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'demouser@badezeit.de',
      password: 'badezeit00',
      email_confirm: true,
      user_metadata: {
        first_name: 'Demo',
        last_name: 'Admin'
      }
    })

    if (error) {
      console.error('❌ Error creating user:', error.message)
      return
    }

    console.log('✅ Demo user created successfully!')
    console.log('📧 Email: demouser@badezeit.de')
    console.log('🔐 Password: badezeit00')
    console.log('👤 User ID:', data.user.id)
    
  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

createDemoUser()