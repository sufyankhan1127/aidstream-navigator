import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const key = process.env.GOOGLE_API_KEY;
const url = "https://generativelanguage.googleapis.com/v1beta/models?key=" + key;

console.log("Checking available models for your API Key...");

async function check() {
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.error) {
      console.error("API Error:", data.error.message);
    } else if (data.models) {
      console.log("\n? AVAILABLE MODELS:");
      data.models.forEach(m => {
        if (m.supportedGenerationMethods.includes("generateContent")) {
          console.log(" - " + m.name.replace("models/", ""));
        }
      });
    } else {
      console.log("Unknown response:", data);
    }
  } catch (e) {
    console.error("Network error:", e);
  }
}

check();
