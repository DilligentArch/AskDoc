'use client';

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  id: string;
  name: string;
  downloadUrl: string;
  size: number;
};

export default function Document({ id, name, downloadUrl, size }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/delete-file`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: id }),
      });

      if (!res.ok) throw new Error("Failed to delete file");

      router.refresh(); // revalidate Documents list
    } catch (e) {
      console.error("Delete error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex flex-col w-64 h-80 rounded-xl bg-white drop-shadow-md justify-between p-4 text-gray-400 cursor-pointer transform hover:scale-105 group transition-all"
    >
      <div onClick={() => router.push(`/dashboard/files/${id}`)} className="flex-1 cursor-pointer">
        <h2 className="text-lg font-semibold truncate">{name}</h2>
        <p className="text-sm">Size: {(size / 1024).toFixed(2)} KB</p>
      </div>

      <div className="flex justify-between mt-4">
        {/* <button
          onClick={() => router.push(`/dashboard/files/${id}`)}
          className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600"
        >
          View
        </button> */}
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-red-500 hover:text-red-700"
          title="Delete"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
