'use client';
import { supabase } from '@/lib/supabaseClient';
import { CircleArrowDown, RocketIcon } from 'lucide-react';
import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
function FileUploader() {
  const [uploading,setUploading]=useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [fileUrls, setFileUrls] = useState<string[]>([])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
  setErrorMsg(null)
  setUploading(true)

  try {
    const newUrls: string[] = []

    for (const file of acceptedFiles) {
      const filePath = `${Date.now()}_${file.name}`

      // 1️⃣ Upload
      const { data, error: uploadError } = await supabase
        .storage
        .from('pdf-chat')          // ← same bucket name
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        // wrap in a real Error for catch to pick up
        throw new Error(uploadError.message)
      }

      // 2️⃣ Get public URL
      const { publicURL, error: urlError } = supabase
        .storage
        .from('pdf-chat')          // ← same bucket
        .getPublicUrl(data.path)

      if (urlError) {
        throw new Error(urlError.message)
      }

      newUrls.push(publicURL)
    }

    setFileUrls((urls) => [...urls, ...newUrls])
  } catch (err: any) {
    console.error('Upload error:', err)
    setErrorMsg(err.message || 'An unknown error occurred')
  } finally {
    setUploading(false)
  }
}, [])

  const { getRootProps, getInputProps, isDragActive, isFocused, isDragAccept } = useDropzone({ onDrop })

  return (
    <div className='flex flex-col gap-4 itmes-center max-w-7xl mx-auto justify-center  '>
      <div {...getRootProps()}
        className={`p-10 border-2 border-dashed mt-10 w-[90%] border-indigo-600 text-indigo-600 rounded-lg h-96 flex items-center justify-center mx-auto ${isFocused || isDragAccept ? "bg-indigo-300" : "bg-indigo-100"}`}
      >
        <input {...getInputProps()} />
        <div className='flex flex-col justify-center items-center'>
          {
            isDragActive ? (
              <>
                <RocketIcon className='h-20 w-20 animate-bounce'/>
                <p>Drop the file here..</p>
              </>

            ) : (
              <>
              <CircleArrowDown className='h-20 w-20 animate-bounce'/>
              <p>Drag and  drop some files here or click to select files</p>
              </>
            )
          }
        </div>




      </div>
    </div>
  )
}

export default FileUploader