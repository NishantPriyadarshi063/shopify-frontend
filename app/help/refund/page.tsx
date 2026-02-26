"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RefundRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/help/return-refund?type=refund");
  }, [router]);
  return null;
}
