import { redirect } from "next/navigation";

import { ChatClient } from "@/components/chat-client";
import { DashboardShell } from "@/components/dashboard-shell";
import { getCurrentUser } from "@/lib/auth";

export default async function ChatPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardShell
      title="AI assistant"
      role={user.role === "student" ? "student" : "admin"}
      userName={user.name}
    >
      <ChatClient />
    </DashboardShell>
  );
}
