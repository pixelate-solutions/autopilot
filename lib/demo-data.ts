import { addDays } from "date-fns";
import { PREDEFINED_TASK_TEMPLATES } from "@/lib/task-library";

export const demoHousehold = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Sample Household",
  zip: "48226",
  autoApprovalLimitCents: 15000,
};

export const demoTasks = PREDEFINED_TASK_TEMPLATES.slice(0, 12).map((template, index) => ({
  id: `22222222-2222-4222-8222-${String(index).padStart(12, "0")}`,
  ...template,
  dueAt: addDays(new Date(), index + 1),
  handlingMode: index % 4 === 0 ? "AUTOPILOT" : index % 3 === 0 ? "GUIDE" : "NOTIFY",
  autopilotEnabled: Boolean(template.serviceType) && index % 3 !== 1,
}));

export const demoJobs = [
  {
    id: "33333333-3333-4333-8333-000000000001",
    serviceType: "hvac",
    status: "scheduled",
    estimateCents: 18200,
    assignee: "Alex Rivera",
    window: "Tomorrow, 9:00 AM",
  },
  {
    id: "33333333-3333-4333-8333-000000000002",
    serviceType: "handyman",
    status: "approval_required",
    estimateCents: 64000,
    assignee: "Northline Home Services",
    window: "Pending approval",
  },
];

export const demoTechnicians = [
  { name: "Alex Rivera", serviceTypes: ["hvac", "smart_home"], radius: 18, availability: "Open today" },
  { name: "Morgan Chen", serviceTypes: ["plumbing", "electrical"], radius: 25, availability: "2 slots tomorrow" },
  { name: "Sam Patel", serviceTypes: ["handyman", "appliance_repair"], radius: 20, availability: "Booked" },
];

export const demoCapabilities = [
  { serviceType: "hvac", available: true, coverage: "482", technicians: 1 },
  { serviceType: "plumbing", available: true, coverage: "482, 481", technicians: 1 },
  { serviceType: "roofing", available: false, coverage: "Not launched", technicians: 0 },
  { serviceType: "landscaping", available: true, coverage: "482", technicians: 0 },
];
