"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AidScheme } from "@/types";
import { FileText, CheckCircle, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

type ApiResult =
  | { schemes: AidScheme[] }
  | { error: string; details?: string; raw?: string };

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 text-indigo-600 font-bold">Loading interface...</div>}>
      <ResultsContent />
    </Suspense>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<AidScheme[] | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
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

        const result: ApiResult = await res.json();
        if (!res.ok || "error" in result) {
          setApiError((result as any).error || "Request failed");
          setData([]);
          return;
        }

        setData((result as any).schemes || []);
      } catch (err: any) {
        setApiError(err?.message || "Unexpected client error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-3 bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50 transition text-slate-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Matches</h1>
              <p className="text-slate-500 font-medium">Based on your profile analysis</p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-dashed border-slate-300">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-800 font-semibold text-lg animate-pulse">Consulting AI & Database...</p>
            <p className="text-slate-400 text-sm mt-2">This may take a few seconds</p>
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
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">No specific matches found.</h2>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">Our AI couldn't find a perfect match in the database for your specific situation.</p>
            <Link href="/" className="inline-block mt-6 text-indigo-600 font-bold hover:underline">Refine Search</Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {data.map((scheme, idx) => (
              <div key={idx} className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-slate-100 overflow-hidden flex flex-col hover:-translate-y-1 transition-transform duration-300">
                {/* Card Header */}
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
                
                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-slate-600 font-medium leading-relaxed mb-6">{scheme.summary}</p>
                  
                  {/* Eligibility Box */}
                  <div className="mb-6 bg-teal-50 p-4 rounded-xl border border-teal-100">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-teal-600" />
                      <p className="text-sm font-bold text-teal-900 uppercase tracking-wide">Eligibility Match</p>
                    </div>
                    <p className="text-teal-800 text-sm font-medium leading-snug">{scheme.eligibilityReason}</p>
                  </div>

                  {/* Steps */}
                  <div className="space-y-6 mt-auto">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">1</span>
                        Next Steps
                      </h3>
                      <ul className="space-y-2">
                        {scheme.steps.map((step, i) => (
                          <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"></span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Documents */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                         <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">2</span>
                         Required Documents
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {scheme.documents.map((doc, i) => (
                          <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200">
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