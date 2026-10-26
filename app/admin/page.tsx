import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePageContext } from "@/permissions/page-context";

export default async function AdminPage() {
  const { user } = await requirePageContext();
  if (user.role !== "owner" && user.role !== "admin") redirect("/dashboard");
  const areas = [
    ["Jobs", "/admin/jobs"],
    ["Technicians", "/admin/technicians"],
    ["Service capabilities", "/admin/capabilities"],
    ["Households", "/admin/households"],
  ];

  return (
    <AppShell section="Admin">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {areas.map(([label, href]) => (
          <Link key={href} href={href}>
            <Card className="transition-colors hover:bg-muted">
              <CardHeader><CardTitle>{label}</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground">Manage {label.toLowerCase()} with tenant-scoped controls.</CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
