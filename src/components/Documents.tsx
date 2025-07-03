'use server'

import { auth } from "@clerk/nextjs/server";
 // this is a server-side Supabase client
import PlaceholderDocument from "./PlaceholderDocument";
import Document from "./Document";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

export default async function Documents() {
  auth.protect();
  const { userId } = await auth();

  if (!userId) {
    return <div className="text-center text-red-500">You must be logged in to view documents.</div>;
  }

 

  const { data: files, error } = await supabase
    .from("files")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false }); // optional: latest uploads first

  if (error) {
    console.error("Supabase fetch error:", error.message);
    return <div className="text-center text-red-500">Failed to load files.</div>;
  }

  return (
    <div className="flex flex-wrap p-5 bg-gray-100 justify-center lg:justify-start rounded-sm gap-5 max-w-7xl mx-auto">
      {files?.map(file => (
        <Document
          key={file.id}
          id={file.id}
          name={file.file_name}
          downloadUrl={file.url}
          size={file.size}
        />
      ))}

      <PlaceholderDocument />
    </div>
  );
}
