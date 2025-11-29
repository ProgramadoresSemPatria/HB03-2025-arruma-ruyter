import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const installationId = requestUrl.searchParams.get('installation_id')

  console.log('🔍 [AUTH CALLBACK] Request URL:', requestUrl.href)
  console.log('🔍 [AUTH CALLBACK] Installation ID:', installationId)

  // Get the authenticated user (Supabase already handled OAuth via client-side PKCE)
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError) {
    console.error('❌ [AUTH CALLBACK] Error getting user:', authError)
    return NextResponse.redirect(new URL('/?error=auth_failed', requestUrl.origin))
  }

  console.log('✅ [AUTH CALLBACK] User authenticated:', user?.id)
  console.log('🔍 [AUTH CALLBACK] User metadata:', JSON.stringify(user?.user_metadata, null, 2))

  // If we have both a user and installation_id, save the installation
  if (user && installationId) {
    console.log('🚀 [INSTALLATION] Starting installation save process...')

    try {
      const adminClient = createAdminClient()
      console.log('✅ [INSTALLATION] Admin client created')

      // Extract GitHub account info from user metadata
      const githubUsername = user.user_metadata?.user_name || user.user_metadata?.preferred_username
      const accountType = user.user_metadata?.account_type || 'User'

      console.log('📊 [INSTALLATION] Extracted data:', {
        installation_id: installationId,
        parsed_installation_id: parseInt(installationId),
        account_login: githubUsername,
        account_type: accountType,
        owner_user_id: user.id
      })

      // Insert or update the installation record in the database
      const { data: insertData, error: installationError } = await adminClient
        .from('installations')
        .upsert({
          installation_id: parseInt(installationId),
          account_login: githubUsername,
          account_type: accountType,
          owner_user_id: user.id,
        }, {
          onConflict: 'installation_id'
        })
        .select()

      console.log('📊 [INSTALLATION] Upsert result:', {
        success: !installationError,
        data: insertData,
        error: installationError
      })

      if (installationError) {
        console.error('❌ [INSTALLATION] Error saving installation:', installationError)
        console.error('❌ [INSTALLATION] Error details:', JSON.stringify(installationError, null, 2))
        return NextResponse.redirect(
          new URL(
            '/?error=installation_save_failed&message=' +
            encodeURIComponent('Failed to save installation. Please try again.'),
            requestUrl.origin
          )
        )
      }

      console.log('✅ [INSTALLATION] Installation saved successfully!')
    } catch (error) {
      console.error('❌ [INSTALLATION] Caught exception:', error)
      console.error('❌ [INSTALLATION] Exception details:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
      return NextResponse.redirect(
        new URL(
          '/?error=installation_error&message=' +
          encodeURIComponent('An error occurred while setting up the installation.'),
          requestUrl.origin
        )
      )
    }
  } else {
    console.log('⚠️ [INSTALLATION] Skipping installation save - User:', !!user, '| Installation ID:', !!installationId)
  }

  console.log('🔄 [AUTH CALLBACK] Redirecting to dashboard...')
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
}

