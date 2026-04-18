// / → middleware redirects to /ko or /en before this renders.
// This page is a fallback only.
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/ko");
}
