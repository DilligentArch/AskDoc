import { ChatOpenAI } from "@langchain/openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { OpenAIEmbeddings } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain }     from "langchain/chains/retrieval";
import { createHistoryAwareRetriever }from "langchain/chains/history_aware_retriever";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import pineconeClient from "./pinecone"
import { PineconeStore } from "@langchain/pinecone";
import { Index, RecordMetadata } from "@pinecone-database/pinecone";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabaseClient";
import { adminDb } from "@/firebaseAdmin";
// import Chat from "@/components/Chat";
// import { generateEmbeddings } from "@/actions/generateEmbeddings";



const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4o",
});
export const indexName = "chat-with-pdf";

async function fetchMessageFromDb(docId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("User not found");

  // Fetch chat history from the database
  const chats=await adminDb
  .collection("users")
  .doc(userId)
  .collection("files")
  .doc(docId)
  .collection("chat")
  .orderBy("createdAt", "desc")
  .get();

  const chatHistory = chats.docs.map((doc) => {
    return doc.data().role=== "human" ? new HumanMessage(doc.data().message) : new AIMessage(doc.data().message)
  });
  console.log("Fetched chat history:", chatHistory);
  return chatHistory;
}

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
 const generateLangchainCompletion=async(docId:string,question:string)=>{
  let pineconeVectorStore;
  pineconeVectorStore=await generateEmbeddingsInPineconeVectorStore(docId);
  //create a retreiver to  search through  the vector store
  console.log("Creating retriever from Pinecone Vector Store");
  const retriever = pineconeVectorStore.asRetriever()

  //fetch the chat history from the database
  const chatHistory = await fetchMessageFromDb(docId);
  console.log("Creating history aware retriever");

  const historyAwarePrompt=ChatPromptTemplate.fromMessages([
    ...chatHistory,
    ["user", "{input}"],
    [
      "user",
      "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation. ",
    ],
  ]);
  const historyAwareRetriever = await createHistoryAwareRetriever({
    llm: model,
    retriever,
    rephrasePrompt: historyAwarePrompt,
  });
  console.log("Creating retrieval chain");
  const historyAwareRetrieverPrompt = ChatPromptTemplate.fromMessages([
    ["system", 
      "Answer the user's question based on the below context:\n\n{context}"],
    ...chatHistory,
    ["user", "{input}"],
  ]);
  //create a chain to combine the retriever and the model
  const historyAwareCombineDocsChain = await createStuffDocumentsChain({
    llm: model,
    prompt: historyAwareRetrieverPrompt,
  });
  console.log("Creating retrieval chain");
  const conversationalRetrievalChain = await createRetrievalChain({
    retriever: historyAwareRetriever,
    combineDocsChain: historyAwareCombineDocsChain,
   
  });
  const reply = await conversationalRetrievalChain.invoke({
    chat_history: chatHistory,
    input: question,
  });
  console.log(reply.answer)
  return reply.answer;
}

export { model, generateLangchainCompletion };




 

