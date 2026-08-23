import { getConversations } from "@/lib/actions/messages";
import MessagesClient from "./MessagesClient";

export default async function MessagesPage() {
  const result = await getConversations();
  const initialConversations = result.success && result.data ? result.data : [];

  return <MessagesClient initialConversations={initialConversations} />;
}


