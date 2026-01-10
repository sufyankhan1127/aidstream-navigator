import { z } from "zod";

// --- Form Validation Schema ---
export const UserProfileSchema = z.object({
  age: z.coerce.number().min(1, "Age is required"),
  location: z.string().min(2, "City/Region is required"),
  employmentStatus: z.enum(["Employed", "Unemployed", "Student", "Retired", "Self-Employed"]),
  incomeLevel: z.enum(["Low", "Medium", "High", "No Income"]),
  dependents: z.coerce.number().min(0),
  needs: z.string().min(5, "Please describe your situation briefly"),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// --- API Response Schema ---
export interface AidScheme {
  schemeName: string;
  summary: string;
  eligibilityReason: string;
  steps: string[];
  documents: string[];
}

export interface ApiResponse {
  schemes: AidScheme[];
}
