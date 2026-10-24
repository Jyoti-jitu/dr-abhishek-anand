import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/session";

export default async function PortalIndexPage() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/clinic-login");
  }

  if (user.role === "DOCTOR" || user.role === "ADMIN") {
    redirect("/portal/doctor");
  } else {
    redirect("/portal/appointments");
  }
}
