import {
  getFriendsAction,
  getPendingFriendRequestsAction,
  getSentFriendRequestsAction,
  getFriendSuggestionsAction,
} from "@/lib/actions/friends";
import FriendsClient from "./FriendsClient";

export const dynamic = 'force-dynamic';

export default async function FriendsPage() {
  const [friendsRes, pendingRes, sentRes, suggestionsRes] = await Promise.all([
    getFriendsAction(false),
    getPendingFriendRequestsAction(),
    getSentFriendRequestsAction(),
    getFriendSuggestionsAction(12),
  ]);

  return (
    <FriendsClient
      initialFriends={friendsRes.data || []}
      initialPending={pendingRes.data || []}
      initialSent={sentRes.data || []}
      initialSuggestions={suggestionsRes.data || []}
    />
  );
}
