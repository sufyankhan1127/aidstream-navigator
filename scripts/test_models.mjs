import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const key = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(key);

// The most likely free models
const modelsToTest = [
  "gemini-1.5-flash",
  "gemini-2.0-flash", 
  "gemini-1.5-pro",
  "gemini-1.0-pro",
  "gemini-2.0-flash-lite-preview-02-05"
];

async function runTest() {
  console.log(" TESTING MODELS WITH YOUR API KEY...\n");

  for (const modelName of modelsToTest) {
    process.stdout.write("Testing: " + modelName + " ... ");
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      // Try to generate a tiny response
      await model.generateContent("Hi");
      
      console.log(" WORKING!");
      console.log("\n------------------------------------------------");
      console.log(" SUCCESS! Please use this model: " + modelName);
      console.log("------------------------------------------------\n");
      return; // Stop at the first one that works
    } catch (e) {
      if (e.message.includes("429")) console.log(" Quota/Limit Reached");
      else if (e.message.includes("404")) console.log(" Not Found");
      else console.log(" Error: " + e.message.split("\n")[0]);
    }
  }
  
  console.log("\n CRITICAL: No models worked.");
  console.log("Solution: Go to https://aistudio.google.com/ > Create API Key > 'Create API key in new project'.");
}

runTest();
