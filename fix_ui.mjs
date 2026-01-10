import fs from 'fs';
import path from 'path';

// 1. APP/LAYOUT.TSX (Modern Font)
const layoutContent = \import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AidStream Navigator",
  description: "AI-Powered Welfare Discovery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={outfit.className + " bg-gray-50 text-gray-900 antialiased"}>
        {children}
      </body>
    </html>
  );
}
\;

// 2. APP/PAGE.TSX (Landing Page)
const pageContent = \"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserProfileSchema } from "@/types";
import { ArrowRight, Sparkles, MapPin, User, Briefcase, DollarSign } from "lucide-react";

const Label = ({ children, icon: Icon }: { children: React.ReactNode; icon?: any }) => (
  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
    {Icon && <Icon className="w-4 h-4 text-indigo-500" />}
    {children}
  </label>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    {...props} 
    className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium placeholder:text-gray-400" 
  />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="relative">
    <select 
      {...props} 
      className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none transition-all font-medium"
    >
      {props.children}
    </select>
    <div className="absolute right-3 top-3.5 pointer-events-none text-gray-500">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
    </div>
  </div>
);

export default function LandingPage() {
  const router = useRouter();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      age: formData.get("age"),
      location: formData.get("location"),
      employmentStatus: formData.get("employmentStatus"),
      incomeLevel: formData.get("incomeLevel"),
      dependents: formData.get("dependents"),
      needs: formData.get("needs"),
    };

    const result = UserProfileSchema.safeParse(data);

    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    const query = encodeURIComponent(JSON.stringify(result.data));
    router.push('/results?q=' + query);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-teal-50 flex items-center justify-center p-4 md:p-8">
      <div className="max-w-2xl w-full bg-white shadow-2xl shadow-indigo-100/50 rounded-3xl overflow-hidden border border-white/50 backdrop-blur-sm">
        
        <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-indigo-600 to-blue-500 opacity-90"></div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-yellow-300" /> AidStream Navigator
            </h1>
            <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider">Sustainable Communities • SDG 11</p>
            <p className="mt-4 text-indigo-50 text-lg max-w-md mx-auto leading-relaxed">
              Describe your situation, and our AI will find the government schemes you qualify for.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label icon={User}>Age</Label>
              <Input name="age" type="number" placeholder="e.g. 24" />
              {errors.age && <p className="text-red-500 text-xs mt-1 font-medium">{errors.age}</p>}
            </div>
            <div>
              <Label icon={User}>Dependents</Label>
              <Input name="dependents" type="number" placeholder="0" />
            </div>
          </div>

          <div>
            <Label icon={MapPin}>Location</Label>
            <Input name="location" placeholder="e.g. Bangalore, Karnataka" />
            {errors.location && <p className="text-red-500 text-xs mt-1 font-medium">{errors.location}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label icon={Briefcase}>Employment Status</Label>
              <Select name="employmentStatus">
                <option value="Unemployed">Unemployed</option>
                <option value="Employed">Employed</option>
                <option value="Student">Student</option>
                <option value="Retired">Retired</option>
                <option value="Self-Employed">Self-Employed</option>
              </Select>
            </div>
            <div>
              <Label icon={DollarSign}>Income Level</Label>
              <Select name="incomeLevel">
                <option value="Low">Low Income</option>
                <option value="No Income">No Income</option>
                <option value="Medium">Medium Income</option>
                <option value="High">High Income</option>
              </Select>
            </div>
          </div>

          <div>
            <Label icon={Sparkles}>What do you need help with?</Label>
            <textarea
              name="needs"
              className="w-full p-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none h-32 resize-none transition-all placeholder:text-gray-400 font-medium"
              placeholder="e.g. I am a student looking for a scholarship or part-time work to support my studies."
            ></textarea>
            {errors.needs && <p className="text-red-500 text-xs mt-1 font-medium">{errors.needs}</p>}
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-indigo-200 active:scale-[0.98] flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">Analyzing... <span className="animate-spin">?</span></span>
            ) : (
              <>Find My Benefits <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
\;

// 3. APP/RESULTS/PAGE.TSX (Modern Results)
const resultsContent = \"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FileText, CheckCircle, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 text-indigo-600 font-medium">Loading interface...</div>}>
      <ResultsContent />
    </Suspense>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const query = searchParams.get("q");
      if (!query) { setLoading(false); setApiError("Missing user data."); return; }

      try {
        const userProfile = JSON.parse(decodeURIComponent(query));
        const res = await fetch("/api/benefits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userProfile),
        });

        const result = await res.json();
        if (!res.ok || result.error) {
          setApiError(result.error || "Request failed");
          setData([]);
          return;
        }

        setData(result.schemes || []);
      } catch (err) {
        setApiError(err?.message || "Unexpected client error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-3 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your Matches</h1>
              <p className="text-gray-500 font-medium">Based on your profile analysis</p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-dashed border-gray-300">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-800 font-semibold text-lg animate-pulse">Consulting AI & Database...</p>
            <p className="text-gray-400 text-sm mt-2">This may take a few seconds</p>
          </div>
        ) : apiError ? (
          <div className="bg-red-50 p-8 rounded-2xl border border-red-100 text-center">
            <h2 className="text-xl font-bold text-red-700 mb-2">Something went wrong</h2>
            <p className="text-red-600 whitespace-pre-wrap font-mono text-sm bg-white/50 p-4 rounded-lg inline-block text-left">{apiError}</p>
            <div className="mt-6">
              <Link href="/" className="inline-flex items-center gap-2 bg-white border border-red-200 text-red-700 font-semibold py-2 px-6 rounded-full hover:bg-red-50 transition">Try Again</Link>
            </div>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-200 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">No specific matches found.</h2>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">Our AI couldn't find a perfect match in the database for your specific situation.</p>
            <Link href="/" className="inline-block mt-6 text-indigo-600 font-bold hover:underline">Refine Search</Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {data.map((scheme, idx) => (
              <div key={idx} className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-gray-100 overflow-hidden flex flex-col hover:-translate-y-1 transition-transform duration-300">
                <div className="bg-indigo-600 p-6 relative">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShieldCheck className="w-24 h-24 text-white" />
                  </div>
                  <div className="relative z-10">
                    <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full mb-3 backdrop-blur-md">
                      Highly Recommended
                    </span>
                    <h2 className="text-xl font-bold text-white leading-tight">{scheme.schemeName}</h2>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-gray-600 font-medium leading-relaxed mb-6">{scheme.summary}</p>
                  
                  <div className="mb-6 bg-teal-50 p-4 rounded-xl border border-teal-100">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-teal-600" />
                      <p className="text-sm font-bold text-teal-900 uppercase tracking-wide">Eligibility Match</p>
                    </div>
                    <p className="text-teal-800 text-sm font-medium leading-snug">{scheme.eligibilityReason}</p>
                  </div>

                  <div className="space-y-6 mt-auto">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">1</span>
                        Next Steps
                      </h3>
                      <ul className="space-y-2">
                        {scheme.steps.map((step, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0"></span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                         <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">2</span>
                         Required Documents
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {scheme.documents.map((doc, i) => (
                          <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg border border-gray-200">
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
\;

function writeFile(pathStr, content) {
  try {
    fs.writeFileSync(pathStr, content, 'utf8');
    console.log('? Updated: ' + pathStr);
  } catch (err) {
    console.error('? Error writing ' + pathStr + ':', err.message);
  }
}

console.log('?? Applying UI updates...');
writeFile(path.join('app', 'layout.tsx'), layoutContent);
writeFile(path.join('app', 'page.tsx'), pageContent);
writeFile(path.join('app', 'results', 'page.tsx'), resultsContent);
console.log('? Done! Restart your server (npm run dev).');
