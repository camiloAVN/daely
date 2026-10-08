import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DashboardView } from "@/components/DashboardView";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "DAELY · Dashboard",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const session = await getSession();
  if (!session) redirect("/");

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, phone: true, email: true, instagram: true, createdAt: true },
  });

  return <DashboardView leads={leads} adminEmail={session.user.email} />;
}

function DashboardSkeleton() {
  return (
    <main className="stage-bg flex min-h-dvh flex-1 items-center justify-center">
      <p className="dots text-[10px] uppercase tracking-[0.5em] text-silver/60">Cargando</p>
    </main>
  );
}
