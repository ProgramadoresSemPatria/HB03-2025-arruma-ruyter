import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// GET - Fetch bot configuration for the user
export async function GET() {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('🔍 [BOT CONFIG GET] User:', user)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('📊 [BOT CONFIG GET] Fetching config for user:', user.id)

    const adminClient = createAdminClient()

    // Fetch the bot config for this user
    const { data, error } = await adminClient
      .from('bot_configs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ [BOT CONFIG GET] Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch configuration', details: error },
        { status: 500 }
      )
    }

    console.log('✅ [BOT CONFIG GET] Config fetched:', data)
    return NextResponse.json({ data: data || null })
  } catch (error) {
    console.error('❌ [BOT CONFIG GET] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Save bot configuration
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('🔍 [BOT CONFIG POST] User:', user)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { model_names, installation_id } = body

    console.log('📊 [BOT CONFIG POST] Save config request:', {
      user_id: user.id,
      model_names,
      installation_id,
    })

    if (!model_names || !Array.isArray(model_names)) {
      return NextResponse.json(
        { error: 'model_names must be an array' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Check if config already exists for this user
    const { data: existingConfig } = await adminClient
      .from('bot_configs')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    let result

    if (existingConfig) {
      // Update existing config
      console.log('🔄 [BOT CONFIG POST] Updating existing config:', existingConfig.id)
      const { data, error } = await adminClient
        .from('bot_configs')
        .update({
          model_name: model_names,
          installation_id: installation_id,
        })
        .eq('id', existingConfig.id)
        .select()
        .single()

      if (error) {
        console.error('❌ [BOT CONFIG POST] Update error:', error)
        return NextResponse.json(
          { error: 'Failed to update configuration', details: error },
          { status: 500 }
        )
      }

      result = data
    } else {
      // Create new config
      console.log('✨ [BOT CONFIG POST] Creating new config')
      const { data, error } = await adminClient
        .from('bot_configs')
        .insert({
          user_id: user.id,
          model_name: model_names,
          installation_id: installation_id,
        })
        .select()
        .single()

      if (error) {
        console.error('❌ [BOT CONFIG POST] Insert error:', error)
        return NextResponse.json(
          { error: 'Failed to create configuration', details: error },
          { status: 500 }
        )
      }

      result = data
    }

    console.log('✅ [BOT CONFIG POST] Config saved:', result)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('❌ [BOT CONFIG POST] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

