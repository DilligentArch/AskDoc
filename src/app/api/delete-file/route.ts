import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { fileId } = await req.json();

  if (!fileId) return NextResponse.json({ error: "Missing fileId" }, { status: 400 });

  // Get file info from DB first
  const { data: fileRecord, error: fetchError } = await supabase
    .from("files")
    .select("*")
    .eq("id", fileId)
    .single();

  if (fetchError || !fileRecord) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // 1️⃣ Delete from Supabase Storage
  const { error: storageError } = await supabase
    .storage
    .from("pdf-chat")
    .remove([fileRecord.file_path]);

  if (storageError) {
    return NextResponse.json({ error: "Storage deletion failed" }, { status: 500 });
  }

  // 2️⃣ Delete from DB
  const { error: dbError } = await supabase
    .from("files")
    .delete()
    .eq("id", fileId);

  if (dbError) {
    return NextResponse.json({ error: "Database deletion failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
