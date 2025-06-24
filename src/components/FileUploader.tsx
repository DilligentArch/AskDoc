'use client';
import { supabase } from '@/lib/supabaseClient';
import { CircleArrowDown, RocketIcon, Loader2, CheckCircle } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { generateEmbeddings } from "../actions/generateEmbeddings";
import { startTransition } from "react";
export default function FileUploader() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fileUrls, setFileUrls] = useState<string[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!isSignedIn || !user?.id) {
      setErrorMsg('You must be signed in to upload.');
      setStatus('error');
      return;
    }
    setErrorMsg(null);
    setStatus('uploading');

    let lastFileId = '';  // track ID for redirect

    try {
      const newUrls: string[] = [];

      for (const file of acceptedFiles) {
        const fileId = uuidv4();
        lastFileId = fileId;
        const path = `users/${user.id}/files/${fileId}_${file.name}`;

        // 1️⃣ upload
        const { data: up, error: ue } = await supabase
          .storage.from('pdf-chat').upload(path, file, { cacheControl: '3600', upsert: false });
        if (ue) throw new Error(ue.message);

        // 2️⃣ url
        const { data: ud, error: ude } = supabase
          .storage.from('pdf-chat').getPublicUrl(up.path);
        if (ude) throw new Error(ude.message);
        const publicUrl = ud.publicUrl;

        // 3️⃣ metadata
        const { error: de } = await supabase
          .from('files')
          .insert({
            user_id: user.id,
            file_name: file.name,
            file_path: up.path,
            url: publicUrl,
            size: file.size,
          });
        if (de) throw new Error(de.message);
        startTransition(() => {
          generateEmbeddings(fileId);
        });
        newUrls.push(publicUrl);
      }

      setFileUrls(urls => [...urls, ...newUrls]);
      setStatus('success');

      // 🚀 Redirect to dashboard/files/[id]
      router.push(`/dashboard/files/${lastFileId}`);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message);
      setStatus('error');
    }
  }, [isSignedIn, user, router]);

  const { getRootProps, getInputProps, isDragActive, isFocused, isDragAccept } = useDropzone({
    onDrop, maxFiles: 1, accept: { 'application/pdf': ['.pdf'] }
  });

  return (
    <div className="flex flex-col gap-4 items-center max-w-7xl mx-auto justify-center">
      <div
        {...getRootProps()}
        className={`
          relative p-10 border-2 border-dashed mt-10 w-[90%] border-indigo-600
          text-indigo-600 rounded-lg h-96 flex items-center justify-center
          ${isFocused || isDragAccept ? 'bg-indigo-300' : 'bg-indigo-100'}
        `}
      >
        <input {...getInputProps()} />

        {/* Status overlay */}
        {status === 'uploading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-100/90">
            <Loader2 className="h-16 w-16 animate-spin text-indigo-600" />
            <p className="mt-2 text-indigo-600">Uploading…</p>
          </div>
        )}
        {status === 'success' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-100/90">
            <CheckCircle className="h-16 w-16 text-indigo-600" />
            <p className="mt-2 text-indigo-600">Upload successful!</p>
          </div>
        )}
        {status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-100/80">
            <p className="text-red-600">{errorMsg}</p>
          </div>
        )}

        {/* Default drag UI */}
        {status === 'idle' && (
          <div className="flex flex-col justify-center items-center">
            {isDragActive ? (
              <>
                <RocketIcon className="h-20 w-20 animate-bounce" />
                <p>Drop the file here…</p>
              </>
            ) : (
              <>
                <CircleArrowDown className="h-20 w-20 animate-bounce" />
                <p>Drag &amp; drop a PDF here, or click to select</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
