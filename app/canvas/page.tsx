"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { CanvasWorkspace } from "@/components/canvas-workspace";
import { Suspense } from "react";

function CanvasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("id");
  // You may want to fetch the project by id here if needed
  return (
    <CanvasWorkspace project={{ id: projectId }} onBack={() => router.push("/dashboard")}/>
  );
}

export default function CanvasPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CanvasContent />
    </Suspense>
  );
} 