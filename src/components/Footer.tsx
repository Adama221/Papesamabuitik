import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-black text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="font-serif text-2xl font-bold tracking-tight mb-4">SBC</h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Sama Butik – Grands boubous 3 pièces élégants. Paiement sécurisé par Wave. Livraison rapide partout au Sénégal.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Liens Rapides</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-white transition-colors">Accueil</Link></li>
              <li><a href="#products" className="hover:text-white transition-colors">Boutique</a></li>
              <li><Link to="/affiliate" className="hover:text-white transition-colors">Devenir Affilié</Link></li>
              <li><Link to="/admin" className="hover:text-white transition-colors">Espace Admin</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Légal</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><span className="hover:text-white transition-colors cursor-pointer">Conditions Générales</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Politique de Confidentialité</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Retours & Échanges (7 jours)</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Réseaux Sociaux</h4>
            <div className="social flex flex-col space-y-3 text-sm text-gray-400">
              <a href="https://www.tiktok.com/@samabutikcouture" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">TikTok</a>
              <a href="https://www.instagram.com/samabutik26" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
              <a href="https://wa.me/221751059213" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp</a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">
            &copy; {new Date().getFullYear()} Sama Butik Couture. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-gray-500 text-xs font-medium">Paiements acceptés :</span>
            <span className="text-blue-400 font-bold text-sm tracking-wider">Wave</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
