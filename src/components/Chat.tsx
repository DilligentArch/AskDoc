'use client'

import { useUser } from "@clerk/nextjs"
import { FormEvent, useState, useTransition } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2Icon } from "lucide-react";



export type Message={
  Id?: string;
  role: "human" | "ai" | "placeholder";
  message: string;
  createAt:Date;
}

function Chat({id}:{id:string}) {
  const {user}=useUser();

  const [input, setInput] = useState<string>("");
  const [isPending,startTransition]=useTransition();
  const [message,setMessage]=useState<Message[]>([]);
  const handleSubmit=async (e:FormEvent)=>{
    e.preventDefault();
  }
  return (
    <div className="flex flex-col h-full overflow-scroll">
      <div className="flex-1 w-full"></div>


      <form onSubmit={handleSubmit} 
      className="flex sticky bottom-0 space-x-2 p-5 bg-indigo-600/75" >
        <Input
        placeholder="ask a Question...."
        value={input}
        onChange={(e)=>setInput(e.target.value)}
        ></Input>
        <Button type="submit" 
        disabled={!input|| isPending}
        >
          {
            isPending?(
              <Loader2Icon className="animate-spin text-indigo-600"></Loader2Icon>
            ):(
              "Ask"
            )
          }
          
          
          </Button>
      </form>
    </div>
  )
}

export default Chat