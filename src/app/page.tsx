/* eslint-disable react/jsx-key */
import { Button } from "@/components/ui/button";
import {
  BrainCogIcon,
  EyeIcon,
  GlobeIcon,
  MonitorSmartphoneIcon,
  ServerCogIcon,
  ZapIcon,
} from "lucide-react"
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    name: "Store your PDF Documents",
    description: "Keep all your important PDF File files securly stored and easily accessible.",
    icon: GlobeIcon

  },
  {
    name: "Blazing Fast Responses",
    description: "Get quick and accurate responses to your PDF-related queries.",
    icon: ZapIcon
  },
  {
    name: "Chat Memorisation",
    description: "Our AI remembers your previous chats for better context.",
    icon: BrainCogIcon
  },
  {
    name: "Interactive PDF Viewer",
    description: "View and interact with your PDF files seamlessly.",
    icon: EyeIcon
  },
  {
    name: "Cloud Backup",
    description: "Never lose your documents with our secure cloud backup.",
    icon: ServerCogIcon
  },
  {
    name: "Responsive Across Devices",
    description: "Access your documents and chat on any device, anywhere.",
    icon: MonitorSmartphoneIcon
  }
]


export default function Home() {
  return (
    <main className="flex-1 overflow-scroll  p-2 lg:p-2 bg-gradient-to-bl from-white to-indigo-600">
      <div className="bg-white py-24 sm:py-32 rounded-md drop-shadow-xl">
        <div className="flex flex-col justify-center items-center mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">
              Your Interactive Document Companion
            </h2>
            <p className="mt-2 text-3xl font-bold -tracking-tight text-gray-900 sm:text-6xl">
              Transform Your PDFs into interactive Conversations
            </p>
            <p className="mt-5 text-lg leading-8 text-gray-600 ">
              Introducing{" "}
              <span className="font-bold text-indigo-600">Chat with PDF</span>
              <br></br>

              <br></br>
              Upload your document, and our chatbot will answer questions, summarize content, and help you with all your PDF needs.
              <span className="text-indigo-600"
              > Chat with Your PDF</span>{" "}
              turns static documents into {" "}
              <span className="font-bold">dynamic Conversations</span>, enhance prductivity 10x fold effortlessly.
            </p>
          </div>
          <Button asChild className="mt-10">
            <Link href="/dashboard">
              Get Started</Link>
          </Button>
        </div>
        <div className="relative overflow-hidden pt-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <Image
              alt="App Screenshot"
              src="https://i.imgur.com/VciRSTI.jpg"
              width={2432}
              height={1442}
              className="mb-[-0%] rounded-xl shadow-2xl ring-1 ring-gray-900/10"


            />
            <div aria-hidden="true" className="relative">
              <div className="absolute bottom-0 -inset-x-32  bg-gradient-to-t from-white/95 pt-[5%]"></div>

            </div>
          </div>
        </div>
        <div className="mx-auto mt-16 max-w-7xl px-6 sm:mt-20 md:mt-24 lg:px-8">
          <dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base leading-7 text-gray-600 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
            {
              features.map(feature => (
                <div className="relative pl-9">
                  <dt className="inline font-semibold text-gray-900">
                    <feature.icon
                    aria-hidden="true"
                    className="absolute left-1 top-1 h-5 w-5 text-indigo-600"
                    />
                  </dt>
                  <dd>
                    {feature.description}
                  </dd>
                </div>
              ))
            }
          </dl>
        </div>
      </div>

    </main>
  );
}
