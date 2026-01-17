import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { 
  Home, Video, MessageSquare, ListMusic, User, LogIn, Search, Menu, X 
} from "lucide-react";

export default function Header() {
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn); // Assuming auth slice exists
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  // --- Search Handler ---
  const handleSearch = (e) => {
    // Only navigate when "Enter" is pressed and text is not empty
    if (e.key === "Enter" && searchText.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchText.trim())}`);
      setIsMobileMenuOpen(false); // Close mobile menu if open
    }
  };

  // --- Navigation Config ---
  const navItems = [
    { name: "Home", path: "/", icon: <Home size={20} />, active: true },
    { name: "Videos", path: "/videos", icon: <Video size={20} />, active: true },
    { name: "Community", path: "/tweets", icon: <MessageSquare size={20} />, active: true },
    { name: "Library", path: "/playlist", icon: <ListMusic size={20} />, active: true },
    { name: "Profile", path: "/account", icon: <User size={20} />, active: isLoggedIn }, // Only show if logged in
    { name: "Login", path: "/auth", icon: <LogIn size={20} />, active: !isLoggedIn }, // Only show if NOT logged in
  ];

  const logoUrl = "https://www.dotnetwebacademy.com/img/thumbnails/twitterclone-1080p.jpg";

  return (
    <header className="sticky top-0 z-50 w-full bg-[#121212]/90 backdrop-blur-md border-b border-gray-800 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* --- LEFT: Logo --- */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-all duration-300">
            <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="hidden md:block text-lg font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
            Stream<span className="text-blue-500">X</span>
          </span>
        </Link>

        {/* --- CENTER: Search Bar (Desktop) --- */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search videos, posts, creators..."
            className="block w-full pl-10 pr-4 py-2 bg-[#1e1e1e] border border-gray-700 rounded-full text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* --- RIGHT: Navigation Icons --- */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              item.active && (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium
                    ${isActive 
                      ? "text-blue-400 bg-blue-500/10" 
                      : "text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
                    }`
                  }
                  title={item.name}
                >
                  {item.icon}
                  <span className="hidden lg:block">{item.name}</span>
                </NavLink>
              )
            ))}
          </div>

          {/* Mobile Search Icon (Toggles Overlay or Navigate) */}
          <button 
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => navigate('/search')} // Simple mobile search UX
          >
            <Search size={22} />
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-gray-400 hover:text-white transition"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </div>

      {/* --- MOBILE MENU OVERLAY --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-[#121212] border-b border-gray-800 p-4 animate-in slide-in-from-top-5 duration-200 shadow-xl">
          {/* Mobile Search Input */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Search..."
              className="w-full bg-[#1e1e1e] border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Mobile Nav Links */}
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              item.active && (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                      : "text-gray-400 hover:bg-[#2a2a2a] hover:text-white"
                    }`
                  }
                >
                  {item.icon}
                  {item.name}
                </NavLink>
              )
            ))}
          </div>
        </div>
      )}
    </header>
  );
}