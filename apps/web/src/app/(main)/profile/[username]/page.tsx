import type { Metadata } from "next";
import ProfilePage from "./ProfilePage";

export const metadata: Metadata = {
  title: "Profile",
};

export default function Page({ params }: { params: { username: string } }) {
  return <ProfilePage username={params.username} />;
}
