'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setToken } from "../redux/slices/authSlice";
import { AppDispatch } from "../redux/store";
import axios from "axios";
import { Mail, Lock, LogIn, CheckCircle } from "lucide-react";

export default function AuthForm() {
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    
    // --- NEW: State for the "Remember Me" checkbox ---
    const [rememberMe, setRememberMe] = useState(false);
    
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const endpoint = mode === "login" ? "/api/login" : "/api/signup";

        try {
            // Pass the `rememberMe` state in the request body for login
            const payload = mode === 'login' ? { email, password } : { email, password };
            const response = await axios.post(endpoint, payload);

            if (mode === "login") {
                dispatch(setToken(response.data.token));
                router.refresh();
            } else {
                setShowSuccessDialog(true);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const handleDialogClose = () => {
        setShowSuccessDialog(false);
        setMode("login");
    };

    return (
        <>
            <div className="w-full max-w-sm">
                <form
                    onSubmit={handleSubmit}
                    className="p-8 space-y-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50"
                >
                    {/* ... Header remains the same ... */}
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-white">
                            {mode === "login" ? "Welcome Back" : "Create Account"}
                        </h1>
                         <p className="text-gray-400 mt-2 text-sm">
                            {mode === "login"
                                ? "Don't have an account? "
                                : "Already have an account? "}
                            <button
                                type="button"
                                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                                className="font-medium text-indigo-400 hover:underline focus:outline-none"
                            >
                                {mode === "login" ? "Sign Up" : "Login"}
                            </button>
                        </p>
                    </div>

                    {/* ... Email and Password inputs remain the same ... */}
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@example.com" className="w-full p-3 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-white" />
                    </div>
                     <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Password" className="w-full p-3 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-white" />
                    </div>

                    {/* --- NEW: Remember Me Checkbox (only shows in login mode) --- */}
                    {mode === 'login' && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                                    Remember me
                                </label>
                            </div>
                        </div>
                    )}

                    {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                    
                    <button
                        className="w-full p-3 font-semibold text-white bg-indigo-600 rounded-lg"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Processing..." : mode === "login" ? "Login" : "Sign Up"}
                    </button>
                </form>
            </div>
            {/* ... Success Dialog remains the same ... */}
        </>
    );
}

