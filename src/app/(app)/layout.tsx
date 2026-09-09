import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import { BottomNav, SidebarNav } from "@/components/nav-links";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader session={session} />
      <div className="mx-auto flex w-full max-w-5xl flex-1">
        <aside className="hidden w-56 shrink-0 border-l border-border md:block">
          <div className="sticky top-[57px]">
            <SidebarNav />
          </div>
        </aside>
        <main className="min-w-0 flex-1 px-4 pb-24 pt-4 md:px-6 md:pb-8">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
