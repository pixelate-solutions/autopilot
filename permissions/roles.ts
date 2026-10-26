import type { UserRole } from "@/lib/types";

export function companyOwnerEmails() {
  return (process.env.COMPANY_OWNER_EMAILS ?? process.env.COMPANY_OWNER_EMAIL ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function roleForEmail(email: string | null | undefined): UserRole {
  return email && companyOwnerEmails().includes(email.toLowerCase()) ? "owner" : "customer";
}

export function canManageEmployees(role: UserRole) {
  return role === "owner" || role === "admin";
}
