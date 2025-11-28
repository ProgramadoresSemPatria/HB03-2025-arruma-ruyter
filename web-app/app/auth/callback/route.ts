import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const installationId = requestUrl.searchParams.get('installation_id')

  if (code) {
    const supabase = await createServerClient()
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      if (error.message?.includes('installation_id') || error.message?.includes('null value')) {
        return NextResponse.redirect(
          new URL(
            '/?error=installation_id_required&message=' + 
            encodeURIComponent('O installation_id é obrigatório. Por favor, faça login novamente com o installation_id na URL.'),
            requestUrl.origin
          )
        )
      }
      
      if (error.message?.includes('Database error') || error.message?.includes('saving new user')) {
        return NextResponse.redirect(
          new URL('/?error=database_error&message=' + encodeURIComponent(error.message), requestUrl.origin)
        )
      }
      return NextResponse.redirect(new URL('/?error=auth_failed', requestUrl.origin))
    }

    if (data.user && installationId) {
      try {
        const adminClient = createAdminClient()
        
        const { error: adminError } = await adminClient.auth.admin.updateUserById(
          data.user.id,
          {
            user_metadata: {
              ...data.user.user_metadata,
              installation_id: installationId,
            },
          }
        )

        if (adminError) {
          await supabase.auth.updateUser({
            data: {
              ...data.user.user_metadata,
              installation_id: installationId,
            },
          })
        }
      } catch {
        await supabase.auth.updateUser({
          data: {
            ...data.user.user_metadata,
            installation_id: installationId,
          },
        })
      }
    }
  }

  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
}

