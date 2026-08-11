import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export default async function ProfileRedirectPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/profile");
  }

  let username = session.user.username;

  if (!username) {
    await connectDB();
    const user = await User.findById(session.user.id).select("username").lean();
    if (user?.username) {
      username = user.username;
    }
  }

  if (username) {
    redirect(`/${username}`);
  } else {
    redirect("/creator/profile");
  }
}
