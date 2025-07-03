// components/Chat.tsx
'use client';

import { useUser } from '@clerk/nextjs';
import { FormEvent, useEffect, useRef, useState, useTransition } from 'react';
import { collection, orderBy, query } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { db } from '@/firebase';
import { askQuestion } from '@/actions/askQuestion';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2Icon } from 'lucide-react';
import ChatMessage from './ChatMessage';

export type Message = {
  id?: string;
  role: 'human' | 'ai' | 'placeholder';
  message: string;
  createdAt: Date;
};

export default function Chat({ id: fileId }: { id: string }) {
  const { user } = useUser();
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const bottmOfChatRef = useRef<HTMLDivElement>(null);

  // 1) Subscribe to Firestore chat subcollection
  const chatQuery = user
    ? query(
        collection(db, 'users', user.id, 'files', fileId, 'chat'),
        orderBy('createdAt', 'asc')
      )
    : null;

  const [snapshot, loading, error] = useCollection(chatQuery);

  // 2) Keep local copy of messages
  const [messages, setMessages] = useState<Message[]>([]);
  useEffect(() => {
    if (bottmOfChatRef.current) {
      bottmOfChatRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (!snapshot) return;

    // Map all docs to Message[]
    const newMessages = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        role: data.role,
        message: data.message,
        createdAt: data.createdAt.toDate(),
      } as Message;
    });

    setMessages(newMessages);
  }, [snapshot]);

  // 3) Handle form submit
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;
    setInput('');

    // Add a placeholder so the UI shows "Thinking…"
    setMessages(msgs => [
      ...msgs,
      { role: 'human', message: q, createdAt: new Date() },
      { role: 'ai', message: 'Thinking…', createdAt: new Date() },
    ]);

    startTransition(async () => {
      const { success } = await askQuestion(fileId, q);
      if (!success) {
        // Replace the last placeholder if it fails
        setMessages(msgs =>
          msgs.slice(0, -1).concat({
            role: 'ai',
            message: 'Oops, something went wrong.',
            createdAt: new Date(),
          })
        );
      }
    });
  };

  return (
    <div className="flex flex-col h-full overflow-scroll">
      <div className="flex-1 w-full">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2Icon className="animate-spin text-indigo-600" />
          </div>
        ) : (
          <div >
            {messages.length === 0 && (
              <ChatMessage
                key={'placeholder'}
                message={{
                  role: 'ai',
                  message: 'Ask me anything about the document!',
                  createdAt: new Date(),
                }}
              />
            )}

            {messages.map((message, index) => (
              <ChatMessage
                key={message.id || index}
                message={message}
              />
            ))}

            <div ref={bottmOfChatRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex sticky bottom-0 space-x-2 p-5 bg-indigo-600/75">
        <Input
          placeholder="Ask a question…"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <Button type="submit" disabled={!input || isPending}>
          {isPending ? <Loader2Icon className="animate-spin text-indigo-600" /> : 'Ask'}
        </Button>
      </form>
    </div>
  );
}
