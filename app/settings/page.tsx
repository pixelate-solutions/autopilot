import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <AppShell section="Settings">
      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Billing Rules</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Small jobs: auto-charge only when under the approval limit.</p>
            <p>Medium jobs: approval required before scheduling.</p>
            <p>Large jobs: deposit first, final charge after completion.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Automation</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Default mode: GUIDE</p>
            <p>Auto-approval limit: $150</p>
            <p>Learning: enabled with feedback and behavior tracking.</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
