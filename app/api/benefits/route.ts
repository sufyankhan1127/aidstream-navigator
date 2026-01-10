import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserProfileSchema } from "@/types";

export async function POST(req: NextRequest) {
  console.log("=== API ROUTE CALLED ===");
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const googleKey = process.env.GOOGLE_API_KEY;

    if (!supabaseUrl || !serviceKey || !googleKey) {
      console.error("MISSING ENV VARS");
      return NextResponse.json(
        { error: "Server misconfigured. Missing environment variables." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const genAI = new GoogleGenerativeAI(googleKey);

    console.log("1. Parsing request...");
    const body = await req.json();
    const profile = UserProfileSchema.parse(body);

    console.log("2. Creating embedding...");
    const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const userContext = `Age: ${profile.age}, Status: ${profile.employmentStatus}, Need: ${profile.needs}`;
    const { embedding } = await embedModel.embedContent(userContext);

    console.log("3. Searching database...");
    const { data: matches, error } = await supabase.rpc("match_schemes", {
      query_embedding: embedding.values,
      match_threshold: 0.3,
      match_count: 5,
    });
    
    if (error) {
      console.error("Database error:", error);
      throw new Error("Database Error: " + error.message);
    }
    console.log(`Found ${matches?.length || 0} matches`);

    console.log("4. Generating AI response...");
    
    // CHANGED MODEL TO ONE THAT WORKS WITH YOUR API KEY
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

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
    console.log("AI response received");

    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    
    console.log("=== SUCCESS ===");
    return NextResponse.json(parsed);

  } catch (err: any) {
    console.error("=== API ERROR ===", err.message);
    return NextResponse.json({ 
      error: "Request failed", 
      details: err.message 
    }, { status: 500 });
  }
}
