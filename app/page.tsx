"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserProfileSchema } from "@/types";
import { ArrowRight, Sparkles, MapPin, User, Briefcase, DollarSign } from "lucide-react";

const Label = ({ children, icon: Icon }: { children: React.ReactNode; icon?: any }) => (
  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
    {Icon && <Icon className="w-4 h-4 text-indigo-600" />}
    {children}
  </label>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    {...props} 
    className="w-full p-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium placeholder:text-slate-400" 
  />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="relative">
    <select 
      {...props} 
      className="w-full p-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none transition-all font-medium"
    >
      {props.children}
    </select>
    <div className="absolute right-3 top-3.5 pointer-events-none text-slate-500">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
    </div>
  </div>
);

export default function LandingPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      const fieldErrors: Record<string, string> = {};
      // FIXED: Use .issues instead of .errors
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
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
            <p className="text-indigo-100 text-sm font-bold uppercase tracking-wider">Sustainable Communities • SDG 11</p>
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
              {errors.age && <p className="text-red-500 text-xs mt-1 font-bold">{errors.age}</p>}
            </div>
            <div>
              <Label icon={User}>Dependents</Label>
              <Input name="dependents" type="number" placeholder="0" />
            </div>
          </div>

          <div>
            <Label icon={MapPin}>Location</Label>
            <Input name="location" placeholder="e.g. Bangalore, Karnataka" />
            {errors.location && <p className="text-red-500 text-xs mt-1 font-bold">{errors.location}</p>}
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
              className="w-full p-4 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none h-32 resize-none transition-all placeholder:text-slate-400 font-medium"
              placeholder="e.g. I am a student looking for a scholarship or part-time work to support my studies."
            ></textarea>
            {errors.needs && <p className="text-red-500 text-xs mt-1 font-bold">{errors.needs}</p>}
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
