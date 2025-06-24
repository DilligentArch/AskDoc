import { ChatOpenAI } from "@langchain/openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { OpenAIEmbeddings } from "@langchain/openai";
// import { createStuffDocumentionChain } from "@langchain/core/chains";
// import { ChatPromptTemplate } from "@langchain/core/prompts";
// import { createRetrievalChain } from "@langchain/core/chains";
// import { createHistoryAwareRetriever } from "@langchain/chains/history_aware_retriever";
// import { HumanMessage, AIMessage } from "@langchain/core/messages";
import pineconeClient from "./pinecone"
import { PineconeStore } from "@langchain/pinecone";
import { Index, RecordMetadata } from "@pinecone-database/pinecone";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabaseClient";




const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4o",
});
export const indexName = "chat-with-pdf";

export async function generatDocs(docId:string){
   const { userId } = await auth();
  if (!userId) throw new Error("User not found");
  //fetching the download url from the supabase
  // 1️⃣ Lookup the signed URL in Supabase by matching the docId prefix in file_path
  const { data: fileRow, error: fileErr } = await supabase
    .from("files")
    .select("url")
    .eq("user_id", userId)
    .like("file_path", `users/${userId}/files/${docId}_%`)
    .single();

  if (fileErr || !fileRow?.url) {
    throw new Error("Download URL not found for document ID " + docId);
  }
    
   const downloadUrl = fileRow.url;
  console.log("Downloading PDF from URL:", downloadUrl);

  




  // 2️⃣ Fetch the PDF blob
  const response = await fetch(downloadUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF: ${response.statusText}`);
  }
  const blob = await response.blob();

  // 3️⃣ Load & split
  console.log("Loading PDF document");
  const loader = new PDFLoader(blob);
  const docs = await loader.load();

  console.log("Splitting document into chunks");
  const splitter = new RecursiveCharacterTextSplitter();
  return await splitter.splitDocuments(docs);

}

export async function namespaceExists(index:Index<RecordMetadata>,namespace:string){
  if(namespace==null) throw new Error("No namespace value provided");
  const {namespaces}=await index.describeIndexStats();
  return namespace?.[namespace]!=undefined

}

export async function generateEmbeddingsInPineconeVectorStore(docId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("User not found");
  let pineconeVectorStore;
  const embeddings = new OpenAIEmbeddings();

const index = pineconeClient.index(indexName);

const  namespaceAlreadyExists=await namespaceExists(index,docId);

if(namespaceAlreadyExists){
  console.log(`Namespace ${docId} already exists, reusing existing embeddings`);

  pineconeVectorStore=await PineconeStore.fromExistingIndex(embeddings,{
    pineconeIndex:index,
    namespace:docId,
  })
  return pineconeVectorStore;
}
else {
  //if the namespace does not exist ,download the pdf from supabase via the Download URL & generate the embeddings and store them in the pinecone vector store
   


    const splitDocs = await generatDocs(docId);
  console.log("Creating Pinecone Vector Store");
  const store = await PineconeStore.fromDocuments(splitDocs, embeddings, {
    pineconeIndex: index,
    namespace: docId,
  });
  console.log("Pinecone Vector Store created successfully");
  return store;
}


}




 

