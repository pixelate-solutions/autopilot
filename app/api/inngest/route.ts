import { serve } from "inngest/next";
import { inngest, functions } from "@/server/services/inngest";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});
