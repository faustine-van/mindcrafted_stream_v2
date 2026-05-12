'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const displayName = formData.get('display_name') as string

  await supabase.auth.updateUser({
    data: { display_name: displayName },
  })

  revalidatePath('/profile')
}

export async function changePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirm = formData.get('confirm_password') as string

  if (password !== confirm) return { error: 'Passwords do not match' }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message }

  return { success: true }
}

export async function deleteAccount(): Promise<{ error: string } | void> {

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')


  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('deleteAccount: SUPABASE_SERVICE_ROLE_KEY is not set')
    return { error: 'Server configuration error. Please contact support.' }
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )


  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)

  if (deleteError) {
    console.error('deleteAccount: admin.deleteUser failed —', deleteError.message)
    return { error: deleteError.message }
  }

  // Only sign out + redirect after confirmed deletion
  await supabase.auth.signOut()
  redirect('/')
}