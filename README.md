# ?? AidStream Navigator (SDG 11)

AidStream Navigator is an AI-powered platform helping citizens discover government welfare schemes and NGO benefits tailored to their specific life situations. It uses **Supabase Vector Search** to find relevant database matches and **Google Gemini AI (1.5 Flash)** to analyze eligibility and generate step-by-step guides.

---

## ?? Quick Setup

1. **Install Dependencies**
   ```bash
   npm install
Environment Variables (.env.local)

env

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GOOGLE_API_KEY=your-new-project-key  # Must use gemini-1.5-flash compatible key
Database Setup (Supabase SQL)
Run this in Supabase SQL Editor:

SQL

create extension if not exists vector;

create table schemes (
  id bigserial primary key,
  title text not null,
  description text not null,
  category text not null,
  embedding vector(768)
);

create or replace function match_schemes (
  query_embedding vector(768),
  match_threshold float,
  match_count int
) returns table (
  id bigint, title text, description text, category text, similarity float
) language plpgsql as $$
begin
  return query
  select id, title, description, category, 1 - (embedding <=> query_embedding) as similarity
  from schemes
  where 1 - (embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
end;
$$;
Seed Data

Bash

node scripts/seed.mjs
Run Application

Bash

npm run dev
?? Test Examples & Outcomes
Use these personas to test the AI's logic. Enter these details into the form at http://localhost:3000.

?? Scenario 1: The Job Seeker
Input:

Age: 34
Location: Chicago, IL
Employment: Unemployed
Income: No Income
Need: "I lost my job recently and I have 2 kids. I need money for food and rent."
Expected Outcome:

Scheme 1: Unemployment Assistance Program
Reason: Matches "lost job recently" and "Unemployed" status.
Scheme 2: SNAP (Food Stamps)
Reason: Matches "No Income" and need for "food".
Documents Listed: Termination letter, Bank statements, Proof of residence.
?? Scenario 2: The Struggling Student
Input:

Age: 21
Location: Boston, MA
Employment: Student
Income: Low
Need: "I can't afford groceries because my tuition is too high."
Expected Outcome:

Scheme: SNAP (Supplemental Nutrition Assistance)
Reason: Students meeting specific low-income criteria often qualify for food assistance.
Scheme: Medicaid (Possibly)
Reason: Low income bracket.
?? Scenario 3: Elderly & Housing
Input:

Age: 68
Location: Florida
Employment: Retired
Income: Low
Need: "My landlord is increasing rent and I have high medical bills."
Expected Outcome:

Scheme 1: Section 8 Housing Choice Voucher
Reason: Matches "Low income", "Retired/Elderly", and "Rent" issues.
Scheme 2: Medicaid / Medicare
Reason: Matches age (65+) and "medical bills".
?? Troubleshooting
Error    Cause    Fix
404 Not Found    Code using old model name (gemini-pro)    Ensure route.ts uses gemini-1.5-flash.
429 Quota Exceeded    API Key limit reached    Create a NEW API Key in a NEW Google Cloud Project.
No matches found    Database empty or threshold too high    Run node scripts/seed.mjs or lower match_threshold in route.ts.
Text not visible    Dark mode conflicts    Ensure globals.css and layout.tsx enforce correct text colors (fixed in UI update).
?? Architecture
Form Input: User submits profile.
Embedding: text-embedding-004 converts profile to vector.
Vector Search: Supabase finds top 5 relevant schemes.
RAG (Retrieval Augmented Generation):
Prompt = User Profile + DB Matches.
Model = gemini-1.5-flash analyzes eligibility.
Output: JSON response rendered as UI Cards.
