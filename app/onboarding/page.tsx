import { completeOnboarding } from "@/server/actions/onboarding";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Under 2 minutes</p>
        <h1 className="text-3xl font-semibold">Set up your household plan</h1>
      </div>
      <form action={completeOnboarding} className="space-y-5 rounded-lg border border-border bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">
            Address
            <input name="address" className="h-10 w-full rounded-md border border-border bg-white px-3" placeholder="123 Main St" />
          </label>
          <label className="space-y-2 text-sm font-medium">
            ZIP
            <input name="zip" className="h-10 w-full rounded-md border border-border bg-white px-3" placeholder="48226" />
          </label>
          <label className="space-y-2 text-sm font-medium">
            Home type
            <select name="homeType" required className="h-10 w-full rounded-md border border-border bg-white px-3">
              <option value="single_family">Single family</option>
              <option value="townhome">Townhome</option>
              <option value="condo">Condo</option>
              <option value="apartment">Apartment</option>
              <option value="multi_family">Multi-family</option>
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium">
            Ownership
            <select name="ownership" required className="h-10 w-full rounded-md border border-border bg-white px-3">
              <option value="own">Own</option>
              <option value="rent">Rent</option>
              <option value="managed">Managed</option>
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium">
            Household size
            <input name="householdSize" required type="number" min="1" max="12" defaultValue="2" className="h-10 w-full rounded-md border border-border bg-white px-3" />
          </label>
          <label className="space-y-2 text-sm font-medium">
            Automation preference
            <select name="automationPreference" required className="h-10 w-full rounded-md border border-border bg-white px-3">
              <option value="mostly_notify">Mostly notify</option>
              <option value="guide_me">Guide me</option>
              <option value="autopilot_when_safe">Autopilot when safe</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-5">
          <label className="flex items-center gap-2 text-sm"><input name="hasYard" type="checkbox" /> Yard</label>
          <label className="flex items-center gap-2 text-sm"><input name="hasVehicles" type="checkbox" /> Vehicles</label>
        </div>
        <Button type="submit">Generate household plan</Button>
      </form>
    </main>
  );
}
