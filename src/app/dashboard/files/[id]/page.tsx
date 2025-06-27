import { supabase } from "@/lib/supabaseClient";
import { auth } from "@clerk/nextjs/server";
import PdfView from "@/components/PdfView";

async function ChatToFilePage({
    params:{id},
}:{
    params:{
        id:string;
    }
}) {
  auth.protect();
  const { userId } = await auth();
    

  // 2) Look up the URL in Supabase
  const { data: fileRow, error } = await supabase
    .from("files")
    .select("url")
    .eq("user_id", userId)
    .like("file_path", `users/${userId}/files/${id}_%`)
    .single();

  if (error || !fileRow?.url) {
    throw new Error("Could not find file with ID " + id);
  }
  const url = fileRow.url;
  return (
    <div className="grid lg:grid-cols-5 h-full  overflow-hidden">
      <div className="col-span-5 lg:col-span-2 overflow-y-auto">
       <PdfView url={url}>

       </PdfView>
      </div>
      <div className="col-span-5 lg:col-span-3 bg-gray-100 border-r-2 lg:border-indigo-600 lg:order-1 overflow-auto">
      

      </div>

    </div>
  )
}

export default ChatToFilePage