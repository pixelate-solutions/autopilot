import type { HandlingMode } from "@/lib/types";

export type LibraryTaskTemplate = {
  slug: string;
  title: string;
  description: string;
  category: string;
  cadence: "once" | "weekly" | "monthly" | "quarterly" | "seasonal" | "annual";
  season: "winter" | "spring" | "summer" | "fall" | "all";
  estimatedMinutes: number;
  allowedModes: HandlingMode[];
  serviceType: string | null;
  riskLevel: "low" | "medium" | "high";
  requiresYard?: boolean;
  requiresVehicle?: boolean;
  ownerOnly?: boolean;
};

const systems = [
  { key: "hvac", name: "HVAC", serviceType: "hvac", tasks: ["Replace filter", "Inspect thermostat schedule", "Clean return vents", "Check condensate line", "Book seasonal tune-up"] },
  { key: "plumbing", name: "Plumbing", serviceType: "plumbing", tasks: ["Check visible leaks", "Flush water heater", "Test shutoff valves", "Clean sink aerators", "Inspect sump pump"] },
  { key: "electrical", name: "Electrical", serviceType: "electrical", tasks: ["Test GFCI outlets", "Inspect breaker labels", "Check exterior lighting", "Replace weak bulbs", "Review surge protection"] },
  { key: "safety", name: "Safety", serviceType: null, tasks: ["Test smoke alarms", "Test carbon monoxide alarms", "Review emergency contacts", "Check fire extinguishers", "Inspect door locks"] },
  { key: "exterior", name: "Exterior", serviceType: "handyman", tasks: ["Inspect gutters", "Check roofline from ground", "Inspect caulk around windows", "Check drainage paths", "Inspect siding or masonry"] },
  { key: "yard", name: "Yard", serviceType: "landscaping", tasks: ["Schedule lawn cut", "Trim shrubs away from home", "Check irrigation zones", "Rake leaves", "Winterize outdoor spigots"], requiresYard: true },
  { key: "appliance", name: "Appliances", serviceType: "appliance_repair", tasks: ["Clean dryer vent path", "Clean refrigerator coils", "Run dishwasher cleaning cycle", "Inspect washer hoses", "Clean range hood filter"] },
  { key: "vehicle", name: "Vehicles", serviceType: "auto", tasks: ["Check tire pressure", "Schedule oil change", "Check registration renewal", "Replace wiper blades", "Prepare seasonal emergency kit"], requiresVehicle: true },
  { key: "documents", name: "Home Documents", serviceType: null, tasks: ["Update home inventory", "Review insurance coverage", "Save appliance manuals", "Record warranty dates", "Review utility usage"] },
  { key: "automation", name: "Automation", serviceType: "smart_home", tasks: ["Review smart lock batteries", "Check leak sensor status", "Update automation routines", "Review camera storage", "Test backup internet plan"] },
  { key: "pest", name: "Pest Prevention", serviceType: "pest_control", tasks: ["Inspect entry gaps", "Refresh pantry storage", "Check attic activity signs", "Schedule pest barrier", "Remove standing water"] },
  { key: "weather", name: "Weather Readiness", serviceType: "handyman", tasks: ["Prepare storm checklist", "Check snow supplies", "Inspect weather stripping", "Secure outdoor items", "Review generator readiness"] },
];

const cadences: Array<Pick<LibraryTaskTemplate, "cadence" | "season">> = [
  { cadence: "monthly", season: "all" },
  { cadence: "quarterly", season: "all" },
  { cadence: "seasonal", season: "spring" },
];

export const PREDEFINED_TASK_TEMPLATES: LibraryTaskTemplate[] = systems.flatMap((system) =>
  system.tasks.flatMap((task, taskIndex) =>
    cadences.map((cadence, cadenceIndex) => ({
      slug: `${system.key}-${task.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${cadence.cadence}-${cadence.season}`,
      title: `${task}: ${system.name}`,
      description: `${task} for the ${system.name.toLowerCase()} system, with Autopilot timing, reminders, guidance, and execution gating when a matching service exists.`,
      category: system.name,
      cadence: cadence.cadence,
      season: cadence.season,
      estimatedMinutes: 15 + taskIndex * 8 + cadenceIndex * 5,
      allowedModes: system.serviceType ? ["NOTIFY", "GUIDE", "AUTOPILOT", "IGNORE"] : ["NOTIFY", "GUIDE", "IGNORE"],
      serviceType: system.serviceType,
      riskLevel: system.serviceType ? "medium" : "low",
      requiresYard: system.requiresYard,
      requiresVehicle: system.requiresVehicle,
    })),
  ),
);

export function selectOnboardingTemplates(profile: {
  hasYard: boolean;
  hasVehicles: boolean;
  ownership: string;
  automationPreference: string;
}) {
  return PREDEFINED_TASK_TEMPLATES.filter((template) => {
    if (template.requiresYard && !profile.hasYard) return false;
    if (template.requiresVehicle && !profile.hasVehicles) return false;
    if (template.ownerOnly && profile.ownership !== "own") return false;
    return true;
  }).sort((a, b) => {
    const autopilotBias = profile.automationPreference === "autopilot_when_safe" ? 1 : 0;
    return Number(Boolean(b.serviceType)) * autopilotBias - Number(Boolean(a.serviceType)) * autopilotBias;
  });
}
