import { redirect } from "next/navigation";
import { getUser } from "@/lib/queries";

export default async function Home() {
  const user = await getUser();
  redirect(user ? "/my" : "/login");
}
