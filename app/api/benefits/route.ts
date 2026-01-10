import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserProfileSchema } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const googleKey = process.env.GOOGLE_API_KEY;

if (!supabaseUrl || !serviceKey || !googleKey) {
  console.error("MISSING ENV VARS"); 
}

const supabase = createClient(supabaseUrl || "", serviceKey || "");
const genAI = new GoogleGenerativeAI(googleKey || "");

export async function POST(req: NextRequest) {
  try {
    console.log("1. processing request...");
    const body = await req.json();
    const profile = UserProfileSchema.parse(body);

    // 1. Embed
    const userContext = "Age: " + profile.age + ", Status: " + profile.employmentStatus + ", Loc: " + profile.location + ", Need: " + profile.needs;
    const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const { embedding } = await embedModel.embedContent(userContext);

    // 2. Search DB
    const { data: matches, error } = await supabase.rpc("match_schemes", {
      query_embedding: embedding.values,
      match_threshold: 0.3,
      match_count: 4,
    });
    
    if (error) throw new Error("DB Error: " + error.message);

    console.log("2. Matches found:", matches?.length || 0);

    // 3. Generate Content
    // CHANGED TO 'gemini-flash-latest' - This is a stable alias from your list
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = 
      "Context: Social Worker AI. User Profile: " + JSON.stringify(profile) + "\n" +
      "Schemes: " + JSON.stringify(matches) + "\n" +
      "Task: Return JSON object { schemes: [{ schemeName, summary, eligibilityReason, steps:[], documents:[] }] }." +
      "If no match, return { schemes: [] }. JSON ONLY.";

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Clean and Parse
    const cleaned = text.replace(/`json|`/g, "").trim();
    return NextResponse.json(JSON.parse(cleaned));

  } catch (err: any) {
    console.error("API FAIL:", err);
    // Return the error text so you can see it in the browser
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
