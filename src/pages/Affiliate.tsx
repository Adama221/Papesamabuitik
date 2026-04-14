import React, { useState } from "react";
import { useAffiliate } from "../context/AffiliateContext";
import { Copy, Share2, TrendingUp, Users, DollarSign, LogOut } from "lucide-react";

export function Affiliate() {
  const { currentAffiliate, registerAffiliate, loginAffiliate, logoutAffiliate } = useAffiliate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentInfo, setPaymentInfo] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const success = await loginAffiliate(loginPhone);
    if (!success) {
      setLoginError("Numéro de téléphone introuvable. Veuillez vérifier ou créer un compte.");
    }
  };

  if (currentAffiliate) {
    const affiliateLink = `${window.location.origin}/?ref=${currentAffiliate.id}`;

    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-serif font-bold text-gray-900">Espace Affilié</h1>
              <p className="text-gray-500 mt-1">Bienvenue, {currentAffiliate.name}</p>
            </div>
            <button 
              onClick={logoutAffiliate}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors"
            >
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Votre lien d'affiliation global</h2>
            <div className="flex items-center gap-4">
              <input 
                type="text" 
                readOnly 
                value={affiliateLink}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-600 outline-none"
              />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(affiliateLink);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium min-w-[120px] justify-center"
              >
                {copied ? "Copié !" : <><Copy className="w-4 h-4" /> Copier</>}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Partagez ce lien. Vous toucherez une commission sur chaque vente générée ! Vous pouvez aussi générer des liens spécifiques depuis chaque page produit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-gray-500 text-sm font-medium">Gains totaux</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{currentAffiliate.earnings.toLocaleString('fr-FR')} XOF</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-gray-500 text-sm font-medium">Ventes générées</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{currentAffiliate.sales}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-gray-500 text-sm font-medium">Clics sur vos liens</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{currentAffiliate.clicks}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 md:p-12 flex flex-col justify-center bg-black text-white">
          <Share2 className="w-12 h-12 mb-6 text-[#1dcaff]" />
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">Devenez Partenaire Sama Butik</h1>
          <p className="text-gray-300 mb-8 leading-relaxed">
            Partagez nos magnifiques grands boubous 3 pièces avec votre réseau et touchez jusqu'à 10% de commission sur chaque vente réalisée via votre lien.
          </p>
          <ul className="space-y-4 text-sm text-gray-300">
            <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-[#1dcaff] rounded-full" /> Inscription gratuite et immédiate</li>
            <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-[#1dcaff] rounded-full" /> Tableau de bord en temps réel</li>
            <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-[#1dcaff] rounded-full" /> Paiement de vos gains par Wave</li>
          </ul>
        </div>

        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="flex p-1 mb-8 bg-gray-100 rounded-xl">
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${!isLogin ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Créer un compte
            </button>
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${isLogin ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              J'ai déjà un compte
            </button>
          </div>

          {!isLogin ? (
            <form onSubmit={async (e) => { 
              e.preventDefault(); 
              setRegisterError("");
              const success = await registerAffiliate(name, phone, paymentInfo); 
              if (!success) {
                setRegisterError("Erreur lors de l'inscription. Veuillez réessayer. Ce numéro est peut-être déjà utilisé.");
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Votre nom complet</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                  placeholder="Ex: Aminata Fall"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone</label>
                <input 
                  type="tel" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                  placeholder="Ex: 77 123 45 67"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numéro Wave / Orange Money (pour les paiements)</label>
                <input 
                  type="text" 
                  required
                  value={paymentInfo}
                  onChange={(e) => setPaymentInfo(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                  placeholder="Ex: Wave 77 123 45 67"
                />
              </div>
              {registerError && <p className="text-red-500 text-sm">{registerError}</p>}
              <button 
                type="submit"
                className="w-full bg-[#1dcaff] text-white font-bold py-3 rounded-xl hover:bg-[#1ab5e6] transition-colors mt-4 shadow-lg shadow-blue-100"
              >
                Générer mon lien d'affiliation
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Votre numéro de téléphone</label>
                <input 
                  type="tel" 
                  required
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                  placeholder="Ex: 77 123 45 67"
                />
              </div>
              {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
              <button 
                type="submit"
                className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors mt-4"
              >
                Accéder à mon espace
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
