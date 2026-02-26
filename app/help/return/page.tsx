"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ReturnRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/help/return-refund?type=return");
  }, [router]);
  return null;
}
