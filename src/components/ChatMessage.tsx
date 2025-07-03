'use client';

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Message } from "./Chat";
import ReactMarkdown from 'react-markdown';
import { BotIcon, Loader2Icon } from "lucide-react";

function ChatMessage({ message }: { message: Message }) {
    const isHuman = message.role === "human";
    const { user } = useUser();

    return (
        <div className={`flex items-start ${isHuman ? 'flex-row-reverse' : 'flex-row'} space-x-2 ${isHuman ? 'space-x-reverse' : ''}`}>  

            {/* Avatar */}
            <div >
                {isHuman ? (
                    user?.imageUrl && (
                        <Image
                            src={user.imageUrl}
                            alt={user.fullName || "User Avatar"}
                            width={40}
                            height={40}
                            className="rounded-full"
                        />
                    )
                ) : (
                    <div className="bg-indigo-600 flex items-center justify-center w-10 h-10 rounded-full">
                        <BotIcon className="w-7 h-7 text-white" />
                    </div>
                )}
            </div>

            {/* Message Bubble */}
            <div className={`max-w-[80%] p-3 rounded-lg ${isHuman ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}` }>
                {message.message === "Thinking…" ? (
                    <div className="flex items-center justify-center">
                        <Loader2Icon className="animate-spin h-5 w-5 text-white" />
                    </div>
                ) : (
                    <ReactMarkdown>{message.message}</ReactMarkdown>
                )}
            </div>
        </div>
    );
}

export default ChatMessage;
