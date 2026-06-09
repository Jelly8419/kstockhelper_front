import { redirect } from "next/navigation";
import { ADMIN_BASE_PATH } from "@/lib/admin/constants";

/** /console → member list. (Auth is enforced by middleware.) */
export default function ConsoleIndexPage() {
  redirect(`${ADMIN_BASE_PATH}/users`);
}
