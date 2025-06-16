// hooks/useUpload.ts
'use client'

import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabaseClient'

export default function useUpload() {
  const { user, isSignedIn } = useUser()
  const [status, setStatus] = useState<string | null>(null)
  const [url, setUrl] = useState<string | null>(null)

  const handleUpload = async (file: File) => {
    if (!isSignedIn || !user) throw new Error('Sign in required.')

    const id = uuidv4()
    const path = `users/${user.id}/files/${id}_${file.name}`

    setStatus('Uploading…')
    const { data: uploadData, error: upErr } = await supabase
      .storage
      .from('pdf-chat')
      .upload(path, file)

    if (upErr) throw upErr

    setStatus('Generating URL…')
    // If bucket is private, you’d use createSignedUrl here.
    const { publicURL, error: urlErr } = supabase
      .storage
      .from('pdf-chat')
      .getPublicUrl(uploadData.path)

    if (urlErr) throw urlErr

    setStatus('Saving metadata…')
    const { error: dbErr } = await supabase
      .from('files')
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_path: uploadData.path,
        url: publicURL,
        size: file.size,
      })

    if (dbErr) throw dbErr

    setUrl(publicURL)
    setStatus('Done')
    return publicURL
  }

  return { status, url, handleUpload }
}
