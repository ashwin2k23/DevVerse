import type { Metadata } from "next";
import ProfilePage from "./ProfilePage";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = await params;
  return <ProfilePage username={resolvedParams.username} />;
}
