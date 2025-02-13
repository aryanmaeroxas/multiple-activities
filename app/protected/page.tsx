import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <ul>
          <li>
            <Link href="/protected/to-do-list">To Do List</Link>
          </li>
          <li>
            <Link href="/protected/google-drive-lite">Google Drive "Lite"</Link>
          </li>
          <li>
            <Link href="/protected/food-review">Food Review App</Link>
          </li>
          <li>
            <Link href="/protected/pokemon-review">Pokemon Review App</Link>
          </li>
          <li>
            <Link href="/protected/markdown-notes">Markdown Notes App</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
