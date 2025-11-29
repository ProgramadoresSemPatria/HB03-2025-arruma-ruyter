import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('📊 [INSTALLATIONS GET] Fetching installation for user:', user.id)

    const adminClient = createAdminClient()

    // Fetch the installation for this user
    const { data, error } = await adminClient
      .from('installations')
      .select('*')
      .eq('owner_user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ [INSTALLATIONS GET] Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch installation', details: error },
        { status: 500 }
      )
    }

    console.log('✅ [INSTALLATIONS GET] Installation fetched:', data)
    return NextResponse.json({ data: data || null })
  } catch (error) {
    console.error('❌ [INSTALLATIONS GET] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

