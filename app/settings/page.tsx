import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePageContext } from "@/permissions/page-context";
import { updateHouseholdSettings } from "@/server/actions/settings";
import { currency } from "@/lib/utils";

export default async function SettingsPage() {
  const { household, householdId } = await requirePageContext();

  return (
    <AppShell section="Settings">
      <form action={updateHouseholdSettings} className="grid gap-5 md:grid-cols-2">
        <input type="hidden" name="householdId" value={householdId} />
        <Card>
          <CardHeader><CardTitle>Household</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <label className="block text-sm font-medium">
              Household name
              <input name="householdName" required defaultValue={household.name} className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3" />
            </label>
            <label className="block text-sm font-medium">
              Automation preference
              <select
                name="automationPreference"
                required
                defaultValue={household.automationPreference}
                className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3"
              >
                <option value="mostly_notify">Mostly notify</option>
                <option value="guide_me">Guide me</option>
                <option value="autopilot_when_safe">Autopilot when safe</option>
              </select>
            </label>
            <label className="block text-sm font-medium">
              Auto-approval limit
              <input
                name="autoApprovalLimitDollars"
                required
                type="number"
                min="0"
                max="5000"
                step="1"
                defaultValue={Math.round(household.autoApprovalLimitCents / 100)}
                className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3"
              />
              <span className="mt-1 block text-xs text-muted-foreground">
                Current limit: {currency(household.autoApprovalLimitCents)}
              </span>
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Customer Availability</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Autopilot schedules jobs only inside these customer windows and a matching technician window.
            </p>
            <label className="block text-sm font-medium">
              Weekly windows
              <textarea
                name="customerAvailability"
                required
                rows={8}
                defaultValue={formatAvailability(household.customerAvailability)}
                className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 font-mono text-xs"
                placeholder={"mon 09:00-12:00\nwed 13:00-17:00"}
              />
            </label>
            <Button type="submit">Save settings</Button>
          </CardContent>
        </Card>
      </form>
    </AppShell>
  );
}

function formatAvailability(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => `${item.day} ${item.start}-${item.end}`).join("\n")
    : "mon 09:00-12:00\nwed 13:00-17:00";
}
