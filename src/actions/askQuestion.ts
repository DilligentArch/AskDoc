"use server";
import { Message } from "@/components/Chat";
import { adminDb } from "@/firebaseAdmin";
import { generateLangchainCompletion } from "@/lib/langchain";
import { auth } from "@clerk/nextjs/server";

export async function askQuestion(id: string, question: string) {
  auth.protect();
  const { userId } = await auth();

  const chatRef = adminDb
    .collection("users")
    .doc(userId!)
    .collection("files")
    .doc(id)
    .collection("chat");

  // fetch all messages in this chat
  const chatSnapshot = await chatRef.get();

  // filter only the human messages
  const previousHumanMessages = chatSnapshot.docs.filter(doc =>
    doc.data().role === "human"
  );

  // add the new human message
  const userMessage: Message = {
    role: "human",
    message: question,
    createdAt: new Date(),
  };
  await chatRef.add(userMessage);

  // get the AI reply
  const reply = await generateLangchainCompletion(id, question);

  // add the AI message
  const aiMessage: Message = {
    role: "ai",
    message: reply,
    createdAt: new Date(),
  };
  await chatRef.add(aiMessage);

  return { success: true, message: null };
}
