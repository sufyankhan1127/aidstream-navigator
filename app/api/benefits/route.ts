import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserProfileSchema } from "@/types";

// Note: We initialize clients INSIDE the function to prevent Build Errors
// on platforms like Render/Vercel during static analysis.

export async function POST(req: NextRequest) {
  try {
    console.log("1. Request Received");

    // 1. Validate Env Vars at Runtime (not Build time)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const googleKey = process.env.GOOGLE_API_KEY;

    if (!supabaseUrl || !serviceKey || !googleKey) {
      console.error("MISSING ENV VARS");
      return NextResponse.json({ error: "Server Configuration Error: Missing Keys" }, { status: 500 });
    }

    // 2. Initialize Clients
    const supabase = createClient(supabaseUrl, serviceKey);
    const genAI = new GoogleGenerativeAI(googleKey);

    // 3. Parse Body
    const body = await req.json();
    const profile = UserProfileSchema.parse(body);

    // 4. Embed User Profile
    const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const userContext = `Age: ${profile.age}, Status: ${profile.employmentStatus}, Need: ${profile.needs}`;
    const { embedding } = await embedModel.embedContent(userContext);

    // 5. Search Database
    const { data: matches, error } = await supabase.rpc("match_schemes", {
      query_embedding: embedding.values,
      match_threshold: 0.3,
      match_count: 5,
    });
    
    if (error) throw new Error("Database Error: " + error.message);
    console.log(`2. Found ${matches?.length || 0} matches in DB`);

    // 6. Generate Content
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Act as a social worker.
      User Profile: ${JSON.stringify(profile)}
      Schemes: ${JSON.stringify(matches)}
      
      Task: Return a JSON object with the best schemes for this user.
      Format: { "schemes": [{ "schemeName": "string", "summary": "string", "eligibilityReason": "string", "steps": ["string"], "documents": ["string"] }] }
      Rules: JSON ONLY. No markdown blocks. If no matches, return { "schemes": [] }.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Clean JSON
    const cleaned = text.replace(/```json|```/g, "").trim();
    
    return NextResponse.json(JSON.parse(cleaned));

  } catch (err: any) {
    console.error("API Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
