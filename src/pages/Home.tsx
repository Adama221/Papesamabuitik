import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { useProducts } from "../context/ProductContext";
import { ArrowRight, ShieldCheck, Truck, Clock, SearchX } from "lucide-react";

export function Home() {
  const { products, coverImage, isLoading } = useProducts();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("q")?.toLowerCase() || "";
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  const handleProductClick = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    setAnimatingId(productId);
    setTimeout(() => {
      navigate(`/product/${productId}`);
    }, 300);
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery) || 
    product.description.toLowerCase().includes(searchQuery) ||
    product.category.toLowerCase().includes(searchQuery)
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={coverImage} 
            alt="Homme en Grand Boubou Traditionnel" 
            className="w-full h-full object-cover object-top"
            onError={(e) => {
              // Fallback to the default image if the local one isn't uploaded yet
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=2000";
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-medium tracking-wider mb-6 border border-white/20">
            NOUVELLE COLLECTION
          </span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 tracking-tight">
            Grand Boubou 3 Pièces
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-light">
            Style élégant, qualité premium. Célébrez avec distinction. Livraison rapide partout au Sénégal.
          </p>
          <a 
            href="#products" 
            className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-black bg-white rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-105"
          >
            Découvrir la collection
          </a>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-gray-50 py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-black">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-2">Livraison Rapide</h3>
              <p className="text-gray-500 text-sm">24h à 72h partout au Sénégal</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-blue-500">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-2">Paiement Sécurisé</h3>
              <p className="text-gray-500 text-sm">Paiement direct et simple via Wave</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-black">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-2">Support Client</h3>
              <p className="text-gray-500 text-sm">Assistance réactive sur WhatsApp</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
              {searchQuery ? `Résultats pour "${searchQuery}"` : "La Collection"}
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              {searchQuery 
                ? `${filteredProducts.length} produit(s) trouvé(s)`
                : "Des pièces uniques conçues avec des tissus premium pour sublimer votre allure."}
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
              {filteredProducts.map((product) => (
                <a 
                  key={product.id} 
                  href={`/product/${product.id}`}
                  onClick={(e) => handleProductClick(e, product.id)}
                  className={`group block transition-all duration-300 ${animatingId === product.id ? 'scale-95 opacity-75 ring-4 ring-black/5 rounded-2xl' : ''}`}
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-gray-100 mb-6">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <span className="bg-white text-black px-6 py-3 rounded-full text-sm font-medium shadow-lg flex items-center gap-2">
                        Voir les détails <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.category}</p>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {product.price.toLocaleString('fr-FR')} {product.currency}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                <SearchX className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
              <p className="text-gray-500 mb-6">Nous n'avons trouvé aucun produit correspondant à votre recherche.</p>
              <Link 
                to="/"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-black rounded-full hover:bg-gray-800 transition-colors"
              >
                Voir toute la collection
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
