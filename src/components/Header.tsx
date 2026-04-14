import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Search, X, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { cartItems } = useCart();

  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}#products`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 mr-2 md:hidden text-gray-900"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Link to="/" className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold tracking-tight text-black">SBC</span>
              <span className="hidden sm:inline-block text-sm font-medium tracking-widest uppercase text-gray-500 mt-1">Sama Butik</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-sm font-medium text-gray-900 hover:text-gray-500 transition-colors">Accueil</Link>
            <a href="/#products" className="text-sm font-medium text-gray-900 hover:text-gray-500 transition-colors">Collection 2026</a>
            <a href="/#about" className="text-sm font-medium text-gray-900 hover:text-gray-500 transition-colors">À Propos</a>
            <Link to="/affiliate" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">Devenir Affilié</Link>
          </nav>

          <div className="flex items-center space-x-4">
            {isSearchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="pl-3 pr-8 py-1.5 text-sm border border-gray-300 rounded-full focus:outline-none focus:border-black focus:ring-1 focus:ring-black w-48 transition-all"
                  onBlur={() => {
                    if (!searchQuery.trim()) setIsSearchOpen(false);
                  }}
                />
                <button 
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-900 hover:text-gray-500 transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>
            )}
            <Link to="/cart" className="relative p-2 text-gray-900 hover:text-gray-500 transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 absolute w-full shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-1">
            <Link 
              to="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-4 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-lg"
            >
              Accueil
            </Link>
            <a 
              href="/#products" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-4 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-lg"
            >
              Collection 2026
            </a>
            <a 
              href="/#about" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-4 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-lg"
            >
              À Propos
            </a>
            <Link 
              to="/affiliate" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-4 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-lg"
            >
              Devenir Affilié
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
