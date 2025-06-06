"use client";
import { HandwritingGenerator } from "@/components/HandwritingGenerator";
import { useRouter } from "next/navigation";

export default function GeneratorPage() {
  const router = useRouter();
  return (
    <div className="p-4">
      <div className="mb-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          ← Back to Dashboard
        </button>
      </div>
      <HandwritingGenerator />
    </div>
  );
} 