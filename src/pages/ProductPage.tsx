import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { useAffiliate } from "../context/AffiliateContext";
import { useCart } from "../context/CartContext";
import { ShieldCheck, Truck, ArrowLeft, Share2, Copy, Check, ShoppingCart } from "lucide-react";

export function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, isLoading } = useProducts();
  const { currentAffiliate } = useAffiliate();
  const { addToCart, cartItems } = useCart();
  const product = products.find(p => p.id === id);
  const [activeImage, setActiveImage] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const cartItem = cartItems.find(item => item.product.id === product?.id);
  const cartQuantity = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = !product || product.stock <= 0;
  const isMaxQuantityReached = product && cartQuantity >= product.stock;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-serif mb-4">Produit introuvable</h2>
        <button onClick={() => navigate('/')} className="text-gray-500 hover:text-black underline">
          Retour à l'accueil
        </button>
      </div>
    );
  }

  const productImages = product.images && product.images.length > 0 ? product.images : [product.image];

  // Handle affiliate parameter if present
  const searchParams = new URLSearchParams(window.location.search);
  const ref = searchParams.get('ref');
  
  const handleAddToCart = () => {
    addToCart(product);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleBuyNow = () => {
    addToCart(product);
    navigate('/cart');
  };

  return (
    <div className="bg-white min-h-screen pt-8 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden">
              <img 
                src={productImages[activeImage] || product.image} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {productImages.length > 1 && (
              <div className="grid grid-cols-2 gap-4">
                {productImages.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-black' : 'border-transparent hover:border-gray-200'}`}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-center">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-500 uppercase tracking-wider">{product.category}</span>
              {product.stock > 0 ? (
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">En stock ({product.stock})</span>
              ) : (
                <span className="text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full">Rupture de stock</span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            <p className="text-2xl font-medium text-gray-900 mb-8">
              {product.price.toLocaleString('fr-FR')} {product.currency}
            </p>
            
            <div className="prose prose-sm text-gray-600 mb-10">
              <p>{product.description}</p>
            </div>

            <div className="space-y-6 mb-10">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Truck className="w-5 h-5 text-gray-400" />
                <span>Livraison: Dakar (1000 XOF) / Régions (2000 XOF)</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <ShieldCheck className="w-5 h-5 text-gray-400" />
                <span>Paiement sécurisé via Wave{product.om_payment_link ? ' et Orange Money' : ''}</span>
              </div>
            </div>

            {/* Affiliate Share Section */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-10 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <Share2 className="w-5 h-5 text-blue-500" />
                <h3 className="font-medium text-gray-900">Programme d'affiliation</h3>
              </div>
              
              {currentAffiliate ? (
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    Partagez ce produit et gagnez <span className="font-bold text-black">{product.commission}%</span> de commission !
                  </p>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={`${window.location.origin}/product/${product.id}?ref=${currentAffiliate.id}`}
                      className="flex-1 bg-white border border-gray-200 text-gray-600 text-sm py-2.5 px-4 rounded-xl outline-none"
                    />
                    <button 
                      onClick={() => {
                        const link = `${window.location.origin}/product/${product.id}?ref=${currentAffiliate.id}`;
                        navigator.clipboard.writeText(link);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="bg-black text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                      {copied ? <><Check className="w-4 h-4" /> Copié !</> : <><Copy className="w-4 h-4" /> Copier</>}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    Gagnez <span className="font-bold text-black">{product.commission}%</span> de commission sur chaque vente en partageant ce produit.
                  </p>
                  <button 
                    onClick={() => navigate('/affiliate')}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 underline"
                  >
                    Devenir affilié gratuitement
                  </button>
                </div>
              )}
            </div>

            <div className="mt-auto space-y-3 relative">
              {!isOutOfStock ? (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={isMaxQuantityReached}
                    className={`w-full border-2 border-black font-bold text-lg py-4 px-8 rounded-full transition-all duration-300 flex items-center justify-center gap-2 ${isMaxQuantityReached ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-50'}`}
                  >
                    <ShoppingCart className="w-5 h-5" /> 
                    {isMaxQuantityReached ? 'Quantité maximum atteinte' : 'Ajouter au panier'}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={isMaxQuantityReached}
                    className={`w-full font-bold text-lg py-4 px-8 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${isMaxQuantityReached ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'}`}
                  >
                    Acheter maintenant
                  </button>
                </div>
              ) : (
                <button
                  disabled
                  className="w-full font-bold text-lg py-4 px-8 rounded-full bg-gray-200 text-gray-500 cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Indisponible
                </button>
              )}
              <p className="text-center text-xs text-gray-400 mt-4">
                {!isOutOfStock ? "Paiement 100% sécurisé." : "Ce produit est actuellement en rupture de stock."}
              </p>

              {/* Toast Notification */}
              <div className={`absolute -top-16 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full font-medium shadow-lg transition-all duration-300 whitespace-nowrap ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                Produit ajouté au panier !
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
