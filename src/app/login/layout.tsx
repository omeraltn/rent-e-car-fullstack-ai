import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/");
  }

  return <>{children}</>;
}

