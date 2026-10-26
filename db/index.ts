import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { Signer } from "@aws-sdk/rds-signer";
import { fromIni } from "@aws-sdk/credential-providers";
import * as schema from "@/db/schema";

let client: ReturnType<typeof postgres> | undefined;
let signer: Signer | undefined;

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required for database operations.");
  }

  const parsed = new URL(url);
  client ??= postgres(url, {
    max: 10,
    prepare: false,
    ssl: shouldUseSsl(url) ? "require" : false,
    password: shouldUseIamAuth()
      ? async () => getIamAuthToken(parsed)
      : parsed.password,
  });

  return drizzle(client, { schema });
}

function shouldUseIamAuth() {
  return process.env.DATABASE_AUTH_MODE === "iam" || process.env.RDS_IAM_AUTH === "true";
}

async function getIamAuthToken(url: URL) {
  signer ??= new Signer({
    hostname: url.hostname,
    port: Number(url.port || 5432),
    username: decodeURIComponent(url.username),
    region: process.env.AWS_REGION ?? "us-east-1",
    credentials: process.env.DATABASE_AWS_PROFILE
      ? fromIni({ profile: process.env.DATABASE_AWS_PROFILE })
      : undefined,
  });

  return signer.getAuthToken();
}

function shouldUseSsl(url: string) {
  if (process.env.DATABASE_SSL) return process.env.DATABASE_SSL !== "false";
  return !/localhost|127\.0\.0\.1/.test(url);
}
