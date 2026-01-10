import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

const seedData = [
  { title: "Unemployment Assistance Program", description: "Financial aid for residents who have lost their jobs involuntarily. Provides temporary cash assistance for up to 26 weeks. Requires active job search.", category: "Financial Aid" },
  { title: "SNAP (Supplemental Nutrition Assistance)", description: "Food assistance for low-income families and individuals to buy groceries. Eligibility based on household income and size.", category: "Food Security" },
  { title: "Section 8 Housing Choice Voucher", description: "Rental assistance for very low-income families, the elderly, and the disabled to afford decent, safe, and sanitary housing in the private market.", category: "Housing" },
  { title: "Medicaid Healthcare Coverage", description: "Free or low-cost health coverage for some low-income people, families and children, pregnant women, the elderly, and people with disabilities.", category: "Healthcare" },
  { title: "WIC (Women, Infants, and Children)", description: "Special supplemental nutrition program for women, infants, and children up to age 5 who are at nutritional risk.", category: "Food Security" },
];

async function seed() {
  console.log("Starting seed...");
  for (const item of seedData) {
    console.log('Processing: ' + item.title);
    const textToEmbed = item.title + ': ' + item.description + ' Category: ' + item.category;
    const result = await model.embedContent(textToEmbed);
    const { error } = await supabase.from("schemes").insert({
      title: item.title, description: item.description, category: item.category, embedding: result.embedding.values,
    });
    if (error) console.error("Error inserting:", error);
    else console.log("Saved.");
  }
  console.log("Seeding complete.");
}
seed();
