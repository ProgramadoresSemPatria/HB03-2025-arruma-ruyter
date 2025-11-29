import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { installation_id, user_id, github_username, account_type } = body

    console.log('📊 [API] Save installation request:', {
      installation_id,
      user_id,
      github_username,
      account_type,
    })

    if (!installation_id || !user_id) {
      console.error('❌ [API] Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from('installations')
      .upsert({
        installation_id: parseInt(installation_id),
        account_login: github_username,
        account_type: account_type,
        owner_user_id: user_id,
      }, {
        onConflict: 'installation_id'
      })
      .select()

    if (error) {
      console.error('❌ [API] Database error:', error)
      return NextResponse.json(
        { error: 'Failed to save installation', details: error },
        { status: 500 }
      )
    }

    console.log('✅ [API] Installation saved:', data)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('❌ [API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

