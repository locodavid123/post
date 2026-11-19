import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function ClientPage() {
  redirect("/client/mesas");
}
