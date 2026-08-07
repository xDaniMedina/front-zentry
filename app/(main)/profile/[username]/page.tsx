import { fetchAPI } from "@/lib/api";
import ProfileClient from "./ProfileCliente";   
export default function ProfilePage({ params }: { params: { username: string } }) {
  return <ProfileClient username={params.username} initialData={null} />;
}

