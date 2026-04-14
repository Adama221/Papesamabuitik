import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

export function Confirmation() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-gray-900 mb-4">
          Commande Initiée !
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Merci pour votre confiance. Si vous n'avez pas encore finalisé le paiement sur Wave, vous allez recevoir un lien par SMS.
        </p>
        <Link 
          to="/"
          className="inline-block w-full bg-black text-white font-medium py-4 rounded-full hover:bg-gray-800 transition-colors"
        >
          Retour à la boutique
        </Link>
      </div>
    </div>
  );
}
