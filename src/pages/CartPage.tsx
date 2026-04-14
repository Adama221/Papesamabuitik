import React from 'react';
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductContext";
import { useAffiliate } from "../context/AffiliateContext";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingCart } from "lucide-react";

export function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, totalPrice, totalCommission, clearCart } = useCart();
  const { isLoading } = useProducts();
  const { trackSale } = useAffiliate();

  const wavePaymentUrl = `https://pay.wave.com/m/M_RwXuK52gDPiA/c/sn/?amount=${totalPrice}`;
  const omPaymentLink = cartItems.find(item => item.product.om_payment_link)?.product.om_payment_link;

  const handlePaymentClick = async () => {
    try {
      const ref = localStorage.getItem('sbc_current_ref');
      if (ref && totalCommission > 0) {
        trackSale(ref, totalCommission);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
          <ShoppingCart className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-3">Votre panier est vide</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">Découvrez notre collection et trouvez les pièces parfaites pour vous.</p>
        <Link to="/" className="bg-black text-white px-8 py-3.5 rounded-full font-medium hover:bg-gray-800 transition-all hover:scale-105 shadow-lg">
          Continuer mes achats
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Votre Panier</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.product.id} className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                <div className="w-32 h-32 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 text-center sm:text-left w-full">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{item.product.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{item.product.category}</p>
                  <div className="flex items-center justify-center sm:justify-start gap-4">
                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors">
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="w-10 text-center font-medium text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)} 
                        disabled={item.quantity >= item.product.stock}
                        className={`p-2 rounded-r-lg transition-colors ${item.quantity >= item.product.stock ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(item.product.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="text-xl font-bold text-gray-900 sm:text-right">
                  {(item.product.price * item.quantity).toLocaleString('fr-FR')} XOF
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Résumé de la commande</h3>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{totalPrice.toLocaleString('fr-FR')} XOF</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Livraison</span>
                  <span>Calculé à l'étape suivante</span>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900">{totalPrice.toLocaleString('fr-FR')} XOF</span>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href={wavePaymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handlePaymentClick}
                  className="w-full bg-[#1dcaff] hover:bg-[#1ab5e6] text-white font-bold text-lg py-4 px-6 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  Payer avec Wave
                </a>
                {omPaymentLink && (
                  <a
                    href={omPaymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handlePaymentClick}
                    className="w-full bg-[#FF7900] hover:bg-[#e66d00] text-white font-bold text-lg py-4 px-6 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    Payer avec Orange Money
                  </a>
                )}
              </div>
              <p className="text-center text-xs text-gray-400 mt-4">
                Paiement 100% sécurisé.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
