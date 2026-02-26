"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CancelRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/help/return-refund?type=cancel");
  }, [router]);
  return null;
}
