import { addDays } from "date-fns";
import { getOpenAI } from "@/ai/openai";
import { retrieveRelevantMemories } from "@/memory";
import { aiTaskPlanSchema, onboardingSchema } from "@/lib/validation";
import { selectOnboardingTemplates } from "@/lib/task-library";

export async function generateHouseholdPlan(householdId: string, onboarding: unknown) {
  const profile = onboardingSchema.parse(onboarding);
  const relevantMemories = await retrieveRelevantMemories({
    householdId,
    query: `Onboarding plan for ${profile.homeType}, ownership ${profile.ownership}, yard ${profile.hasYard}, vehicles ${profile.hasVehicles}, preference ${profile.automationPreference}`,
    limit: 8,
  }).catch(() => []);

  const openai = getOpenAI();
  if (!openai) {
    return fallbackPlan(profile);
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are Autopilot's household planning engine. Return only JSON that matches the schema. Never invent unvalidated execution capabilities. Generate 20-30 practical household tasks.",
      },
      {
        role: "user",
        content: JSON.stringify({
          profile,
          relevantMemories,
          requiredOutput: {
            householdSummary: "string",
            profilingQuestions: ["string"],
            tasks: [
              {
                title: "string",
                description: "string",
                category: "string",
                cadence: "once|weekly|monthly|quarterly|seasonal|annual",
                season: "winter|spring|summer|fall|all",
                estimatedMinutes: 30,
                handlingModes: ["NOTIFY", "GUIDE"],
                serviceType: "nullable string",
                riskLevel: "low|medium|high",
                rationale: "string",
              },
            ],
          },
        }),
      },
    ],
  });

  const parsed = JSON.parse(completion.choices[0]?.message.content ?? "{}");
  return aiTaskPlanSchema.parse(parsed);
}

function fallbackPlan(profile: ReturnType<typeof onboardingSchema.parse>) {
  const templates = selectOnboardingTemplates(profile).slice(0, 24);
  return aiTaskPlanSchema.parse({
    householdSummary: `Autopilot created a first operating plan for a ${profile.homeType.replace("_", " ")} household using only the required onboarding facts.`,
    profilingQuestions: [
      "Which home systems are newest or recently serviced?",
      "Which recurring jobs do you already outsource?",
      "What spending amount should Autopilot auto-approve for routine jobs?",
    ],
    tasks: templates.map((template, index) => ({
      title: template.title,
      description: template.description,
      category: template.category,
      cadence: template.cadence,
      season: template.season,
      estimatedMinutes: template.estimatedMinutes,
      handlingModes: template.allowedModes,
      serviceType: template.serviceType,
      riskLevel: template.riskLevel,
      rationale: `Selected from the predefined operating library for this household profile. First due date is ${addDays(new Date(), index + 1).toISOString().slice(0, 10)}.`,
    })),
  });
}
