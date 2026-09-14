import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../context/CartContext";

interface NavProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Navbar({ onNavigate, currentPage }: NavProps) {
  const { theme, toggleTheme } = useTheme();
  const { count, setIsOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dark = theme === "dark";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? dark
            ? "bg-noir-900/98 backdrop-blur-md border-b border-white/8 shadow-lg shadow-black/20"
            : "bg-white/98 backdrop-blur-md border-b border-black/8 shadow-sm"
          : dark
            ? "bg-noir-900/80 backdrop-blur-sm border-b border-white/5"
            : "bg-white/90 backdrop-blur-sm border-b border-black/5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => onNavigate("home")}
          className={`font-display text-xl font-medium tracking-[0.25em] uppercase transition-colors ${dark ? "text-white" : "text-noir-900"}`}
        >
          Maison Noir
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {["Home", "Collection", "About"].map((item) => (
            <button
              key={item}
              onClick={() => onNavigate(item.toLowerCase())}
              className={`font-body text-xs tracking-widest uppercase transition-colors ${
                currentPage === item.toLowerCase()
                  ? "text-gold"
                  : dark
                    ? "text-noir-100 hover:text-white"
                    : "text-noir-700 hover:text-noir-900"
              }`}
            >
              {item}
            </button>
          ))}
          <button
            onClick={() => onNavigate("track-order")}
            className={`font-body text-xs tracking-widest uppercase transition-colors ${
              currentPage === "track-order"
                ? "text-gold"
                : dark
                  ? "text-noir-100 hover:text-white"
                  : "text-noir-700 hover:text-noir-900"
            }`}
          >
            Track Order
          </button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-6">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={`w-8 h-8 flex items-center justify-center transition-colors ${dark ? "text-noir-300 hover:text-gold" : "text-noir-500 hover:text-gold"}`}
            aria-label="Toggle theme"
          >
            {dark ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* Search */}
          <button
            className={`w-8 h-8 flex items-center justify-center transition-colors ${dark ? "text-noir-200 hover:text-gold" : "text-noir-600 hover:text-gold"}`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          {/* Cart */}
          <button
            onClick={() => setIsOpen(true)}
            className={`relative flex items-center gap-2 font-body text-xs tracking-widest uppercase transition-colors ${dark ? "text-noir-200 hover:text-gold" : "text-noir-600 hover:text-gold"}`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-gold text-noir-900 text-[10px] flex items-center justify-center font-medium">
                {count}
              </span>
            )}
          </button>

          {/* Mobile menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden w-8 h-8 flex items-center justify-center ${dark ? "text-white" : "text-noir-800"}`}
          >
            {menuOpen ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className={`md:hidden border-t ${dark ? "bg-noir-900 border-white/5" : "bg-white border-black/5"}`}
        >
          <div className="px-6 py-6 flex flex-col gap-6">
            {["Home", "Collection", "About"].map((item) => (
              <button
                key={item}
                onClick={() => {
                  onNavigate(item.toLowerCase());
                  setMenuOpen(false);
                }}
                className={`text-left font-body text-sm tracking-widest uppercase ${dark ? "text-noir-200" : "text-noir-700"}`}
              >
                {item}
              </button>
            ))}
            <button
              onClick={() => {
                onNavigate("track-order");
                setMenuOpen(false);
              }}
              className={`text-left font-body text-sm tracking-widest uppercase ${dark ? "text-noir-200" : "text-noir-700"}`}
            >
              Track Order
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
