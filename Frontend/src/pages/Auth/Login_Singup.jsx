import React, { useState } from "react";
import { useNavigate } from "react-router";
import fetchData from "../../apiClient";
import { useDispatch } from "react-redux";
import { Login } from "../../store/feature/auth.js";
import { 
  Mail, Lock, User, Eye, EyeOff, Camera, 
  ArrowRight, Loader2, LogIn, UserPlus 
} from "lucide-react";

const AuthPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // UI State
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    fullname: ""
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);

  // Handlers
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreviewAvatar(URL.createObjectURL(file));
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setSuccess("");
    setPreviewAvatar(null);
    setAvatarFile(null);
    setFormData({ email: "", password: "", username: "", fullname: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN ---
        const response = await fetchData("POST", "http://localhost:5000/api/v1/users/login", {
          email: formData.email,
          password: formData.password,
          username: formData.username
        });
        
        const data = response.Data || response.data;

        if (response.success || response.statusCode < 400) {
          setSuccess("Welcome back! Redirecting...");
          if (data) {
            if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);
            if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
            if (data.userData) dispatch(Login(data.userData));
          }
          setTimeout(() => navigate("/"), 800);
        } else {
          throw new Error(response.message || "Login failed");
        }
      } else {
        // --- REGISTER ---
        if (!avatarFile) throw new Error("Profile picture is required.");

        const apiFormData = new FormData();
        apiFormData.append("email", formData.email);
        apiFormData.append("password", formData.password);
        apiFormData.append("username", formData.username);
        apiFormData.append("fullname", formData.fullname);
        apiFormData.append("avatar", avatarFile);

        const response = await fetchData("POST", "http://localhost:5000/api/v1/users/register", apiFormData);
        const data = response.Data || response.data;

        if (response.success || response.statusCode === 201) {
          setSuccess("Account created successfully!");
          if (data?.accessToken) {
             localStorage.setItem("accessToken", data.accessToken);
             if (data.userData) dispatch(Login(data.userData));
             setTimeout(() => navigate("/"), 1000);
          } else {
             setTimeout(() => toggleMode(), 1500);
          }
        } else {
          throw new Error(response.message || "Registration failed.");
        }
      }
    } catch (e) {

      console.error("Auth Error:", e.message);
      setError(e.message.slice(e.message.indexOf("Error: ") , e.message.indexOf("<br>")) || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex font-sans text-white">
      
      {/* LEFT SIDE - FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md space-y-8">
          
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-gray-400">
              {isLogin ? "Enter your credentials to access your account" : "Join the community and start sharing today"}
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
               <span>🎉</span> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Avatar Upload (Signup Only) */}
            {!isLogin && (
              <div className="flex justify-center mb-6 animate-in zoom-in duration-300">
                <div className="relative group cursor-pointer">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-700 group-hover:border-blue-500 transition-colors bg-[#1a1a1a]">
                    {previewAvatar ? (
                      <img src={previewAvatar} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <User size={32} />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-500 transition shadow-lg">
                    <Camera size={16} className="text-white" />
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>
            )}

            {/* Inputs Group */}
            <div className="space-y-4">
              {!isLogin && (
                <>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      name="fullname"
                      type="text"
                      placeholder="Full Name"
                      value={formData.fullname}
                      onChange={handleChange}
                      className="w-full bg-[#1e1e1e] border border-gray-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 placeholder-gray-500 outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 group-focus-within:text-blue-500 font-bold text-lg transition-colors">@</span>
                    </div>
                    <input
                      name="username"
                      type="text"
                      placeholder="Username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full bg-[#1e1e1e] border border-gray-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 placeholder-gray-500 outline-none transition-all"
                      required
                    />
                  </div>
                </>
              )}

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#1e1e1e] border border-gray-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 placeholder-gray-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-[#1e1e1e] border border-gray-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 pr-10 placeholder-gray-500 outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Sign Up"} <ArrowRight size={18} className="ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Footer Toggle */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={toggleMode}
                className="font-medium text-blue-500 hover:text-blue-400 hover:underline transition-all ml-1"
              >
                {isLogin ? "Sign up for free" : "Log in"}
              </button>
            </p>
          </div>

        </div>
      </div>

      {/* RIGHT SIDE - IMAGE (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 bg-[#0f0f0f] relative overflow-hidden items-center justify-center">
        {/* Background gradient/blob effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 text-center p-12 max-w-lg">
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
              {isLogin ? <LogIn size={40} className="text-white" /> : <UserPlus size={40} className="text-white" />}
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            {isLogin ? "Welcome to Your Dashboard" : "Join Our Community"}
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Experience a seamless hybrid platform combining the best of video streaming and social interactions.
          </p>
        </div>
      </div>

    </div>
  );
};

export default AuthPage;