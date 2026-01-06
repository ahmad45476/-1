import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.png"; 
import { useAuth } from "../context/AuthContext";

import {
  Menu,
  X,
  User,
  Search,
  Star,
  Home,
  Compass,
  Bookmark,
} from "react-feather";

const Navbar = () => {
  const { logout } = useAuth();
  const token = localStorage.getItem('artAppToken');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "الرئيسية", path: "/", icon: <Home size={18} /> },
    { name: "استكشف", path: "/explore", icon: <Compass size={18} /> },
    { name: " الفنانيين", path: "/artists", icon: <User size={18} /> },
    ...(!token ? 
      [{ name: "تسجيل الدخول", path: "/auth", icon: <User size={18} /> }] : 
      [
        { name: "تسجيل الخروج", path: "/auth", onClick: logout, icon: <User size={18} /> },
        { name: "حسابي", path: "/profile", icon: <User size={18} /> }
      ]
    )
  ];

  const isActive = (path) => location.pathname === path;

  // دالة معالجة البحث
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsMenuOpen(false);
    }
  };

  // معالجة الضغط على مفتاح Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* الشعار */}
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="ArtWay Logo"
              className="w-10 h-10 mr-2 object-contain"
            />
            <span
              className={`text-xl font-bold ${
                scrolled ? "text-gray-800" : "text-white"
              }`}
            >
              ArtWay
            </span>
          </Link>

          {/* روابط سطح المكتب */}
          <nav className="hidden md:flex items-center space-x-reverse space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={link.onClick}
                className={`flex items-center px-3 py-2 rounded-lg transition-all ${
                  isActive(link.path)
                    ? "bg-[#d5006d] text-white"
                    : scrolled
                    ? "text-gray-700 hover:bg-gray-100"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <span className="ml-2">{link.icon}</span>
                <span>{link.name}</span>
              </Link>
            ))}

            {/* حقل البحث */}
            <div
              className={`relative ml-4 ${
                scrolled ? "bg-gray-100" : "bg-white/10"
              } rounded-full`}
            >
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  scrolled ? "text-gray-500" : "text-white"
                }`}
                size={18}
              />
              <input
                type="text"
                placeholder="ابحث عن فنانين أو أعمال"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className={`py-2 pl-10 text-right pr-4 rounded-full focus:outline-none w-64 ${
                  scrolled
                    ? "bg-gray-100"
                    : "bg-transparent text-white placeholder-white/70"
                }`}
              />
            </div>
          </nav>

          {/* زر القائمة في الجوال */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2 rounded-lg ${
              scrolled ? "text-gray-700" : "text-white"
            }`}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* قائمة الجوال */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`md:hidden ${
              scrolled ? "bg-white" : "bg-[#d5006d]"
            } shadow-lg`}
          >
            <div className="container mx-auto px-4 py-3">
              {/* حقل البحث في الجوال */}
              <form onSubmit={handleSearch}>
                <div
                  className={`relative mb-4 ${
                    scrolled ? "bg-gray-100" : "bg-white/20"
                  } rounded-full`}
                >
                  <Search
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                      scrolled ? "text-gray-500" : "text-white"
                    }`}
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="ابحث"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className={`py-2 pr-10 text-right pl-4 rounded-full focus:outline-none w-full ${
                      scrolled
                        ? "bg-gray-100"
                        : "bg-transparent text-white placeholder-white/70"
                    }`}
                  />
                </div>
              </form>

              <div className="flex flex-col space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => {
                      if (link.onClick) link.onClick();
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center px-4 py-3 rounded-lg ${
                      isActive(link.path)
                        ? scrolled
                          ? "bg-[#d5006d] text-white"
                          : "bg-white text-[#d5006d]"
                        : scrolled
                        ? "text-gray-700 hover:bg-gray-100"
                        : "text-white hover:bg-white/20"
                    }`}
                  >
                    <span className="ml-2">{link.icon}</span>
                    <span>{link.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;