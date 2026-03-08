import type { ReactNode } from "react";

import Footer from "@/components/Footer";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <Topbar />
      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-0 px-4 pb-10 pt-4 md:gap-6">
        <Sidebar />
        <main className="flex-1">
          <div className="space-y-6">{children}</div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

