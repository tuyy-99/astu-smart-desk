import React, { useState } from "react";
import { User } from "../types";
import { login, signup } from "../services/backendApi";

interface AuthProps {
  onLogin: (user: User, token: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const authData = isLogin
        ? await login(email, password)
        : await signup({ name, email, universityId, password });

      onLogin(authData.user, authData.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {isLogin ? "Use your ASTU credentials to continue" : "Join the official campus platform"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-950 dark:text-white font-bold transition-all placeholder-slate-300 dark:placeholder-slate-600"
                placeholder="John Doe"
              />
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                University ID
              </label>
              <input
                type="text"
                required
                value={universityId}
                onChange={(e) => setUniversityId(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-950 dark:text-white font-bold transition-all placeholder-slate-300 dark:placeholder-slate-600"
                placeholder="ugr/12345/20"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-950 dark:text-white font-bold transition-all placeholder-slate-300 dark:placeholder-slate-600"
              placeholder="name@astu.edu.et"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-950 dark:text-white font-bold transition-all placeholder-slate-300 dark:placeholder-slate-600"
              placeholder="********"
            />
          </div>

          {error && <div className="text-sm font-semibold text-red-500">{error}</div>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-100 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700 text-center">
          <p className="text-slate-600 dark:text-slate-400 font-bold">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-indigo-600 hover:underline ml-1">
              {isLogin ? "Create One" : "Login Now"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
