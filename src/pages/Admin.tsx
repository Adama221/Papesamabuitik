import React, { useState } from "react";
import { useProducts } from "../context/ProductContext";
import { Package, Users, DollarSign, ShoppingCart, LogOut, Plus, Trash2, Edit, Image as ImageIcon, X, Check } from "lucide-react";
import { Product } from "../data/products";

export function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('sbc_admin_token');
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'affiliates' | 'settings'>('dashboard');
  const [affiliates, setAffiliates] = useState<any[]>([]);
  
  const { products, addProduct, updateProduct, deleteProduct, coverImage, updateCoverImage } = useProducts();

  React.useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/affiliates', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sbc_admin_token')}` }
      })
      .then(async res => {
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('sbc_admin_token');
            setIsAuthenticated(false);
            return []; // Return empty array to avoid breaking the chain
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          return res.json();
        } else {
          const text = await res.text();
          throw new Error(`Expected JSON, got ${contentType}: ${text.substring(0, 50)}`);
        }
      })
      .then(data => {
        if (Array.isArray(data)) {
          setAffiliates(data);
        }
      })
      .catch(err => console.error("Failed to fetch affiliates:", err));
    }
  }, [isAuthenticated]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [affiliateToDelete, setAffiliateToDelete] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAffiliateModalOpen, setIsAffiliateModalOpen] = useState(false);
  const [editingAffiliate, setEditingAffiliate] = useState<any>(null);
  const [affiliateFormData, setAffiliateFormData] = useState({
    name: "", phone: "", payment_info: "", earnings: 0, sales: 0, clicks: 0, status: "pending"
  });
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    currency: "XOF",
    image: "",
    images: [],
    stock: 0,
    category: "Homme",
    wave_payment_link: "",
    om_payment_link: "",
    commission: 10
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const contentType = res.headers.get("content-type");
      if (res.ok) {
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const data = await res.json();
          localStorage.setItem('sbc_admin_token', data.token);
          setIsAuthenticated(true);
          setError("");
        }
      } else {
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const data = await res.json();
          setError(data.error || "Identifiants incorrects");
        } else {
          setError("Identifiants incorrects");
        }
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ 
          ...formData, 
          image: base64String, 
          images: [base64String] 
        });
      };
      reader.readAsDataURL(file);
    }
    // Reset input value so the same file can be selected again
    e.target.value = '';
  };

  const openAddModal = () => {
    setFormError("");
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: 0,
      currency: "XOF",
      image: "",
      images: [],
      stock: 0,
      category: "Homme",
      wave_payment_link: "",
      om_payment_link: "",
      commission: 10
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setFormError("");
    setEditingProduct(product);
    setFormData(product);
    setIsModalOpen(true);
  };

  const openEditAffiliateModal = (affiliate: any) => {
    setEditingAffiliate(affiliate);
    setAffiliateFormData({
      name: affiliate.name || "",
      phone: affiliate.phone || "",
      payment_info: affiliate.payment_info || "",
      earnings: affiliate.earnings || 0,
      sales: affiliate.sales || 0,
      clicks: affiliate.clicks || 0,
      status: affiliate.status || "pending"
    });
    setIsAffiliateModalOpen(true);
  };

  const handleSaveAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAffiliate) return;
    try {
      const res = await fetch(`/api/affiliates/${editingAffiliate.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sbc_admin_token')}` 
        },
        body: JSON.stringify(affiliateFormData)
      });
      if (res.ok) {
        setAffiliates(affiliates.map(a => a.id === editingAffiliate.id ? { ...a, ...affiliateFormData } : a));
        setIsAffiliateModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to update affiliate:", err);
    }
  };

  const handleVerifyAffiliate = async (id: string) => {
    try {
      const res = await fetch(`/api/affiliates/${id}/verify`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sbc_admin_token')}` }
      });
      if (res.ok) {
        setAffiliates(affiliates.map(a => a.id === id ? { ...a, status: 'verified' } : a));
      }
    } catch (err) {
      console.error("Failed to verify affiliate:", err);
    }
  };

  const confirmDeleteAffiliate = async () => {
    if (!affiliateToDelete) return;
    try {
      const res = await fetch(`/api/affiliates/${affiliateToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sbc_admin_token')}` }
      });
      if (res.ok) {
        setAffiliates(affiliates.filter(a => a.id !== affiliateToDelete));
        setAffiliateToDelete(null);
      }
    } catch (err) {
      console.error("Failed to delete affiliate:", err);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Validation
    if (!formData.name?.trim()) {
      setFormError("Le nom du produit est requis.");
      return;
    }
    if (!formData.price || formData.price <= 0) {
      setFormError("Le prix doit être supérieur à 0.");
      return;
    }
    if (formData.stock === undefined || formData.stock < 0) {
      setFormError("Le stock ne peut pas être négatif.");
      return;
    }
    if (!formData.image) {
      setFormError("Une image principale est requise.");
      return;
    }
    if (!formData.description?.trim()) {
      setFormError("La description est requise.");
      return;
    }
    if (!formData.wave_payment_link?.trim()) {
      setFormError("Le lien de paiement Wave est requis.");
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      const newProduct: Product = {
        ...(formData as Product),
        id: `prod_${Date.now()}`
      };
      addProduct(newProduct);
    }
    setIsModalOpen(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-serif font-bold text-gray-900">Espace Admin</h1>
            <p className="text-gray-500 text-sm mt-2">Connectez-vous pour gérer Sama Butik</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Utilisateur</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                placeholder="Nom d'utilisateur"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                placeholder="••••••"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button 
              type="submit"
              className="w-full bg-black text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition-colors mt-4"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <h1 className="text-2xl font-serif font-bold text-gray-900">Administration</h1>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-white rounded-lg p-1 border border-gray-200">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'dashboard' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Tableau de bord
              </button>
              <button 
                onClick={() => setActiveTab('products')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'products' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Produits
              </button>
              <button 
                onClick={() => setActiveTab('affiliates')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'affiliates' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Affiliés
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'settings' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Paramètres
              </button>
            </div>
            
            <button 
              onClick={() => {
                localStorage.removeItem('sbc_admin_token');
                setIsAuthenticated(false);
              }}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors ml-4"
            >
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-gray-500 text-sm font-medium">Ventes du jour</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">0 XOF</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-gray-500 text-sm font-medium">Commandes</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-gray-500 text-sm font-medium">Produits actifs</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">{products.length}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-gray-500 text-sm font-medium">Affiliés</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">{affiliates.length}</p>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h3 className="text-lg font-medium text-gray-900">Commandes récentes</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="px-6 py-4 font-medium">ID</th>
                      <th className="px-6 py-4 font-medium">Client</th>
                      <th className="px-6 py-4 font-medium">Produit</th>
                      <th className="px-6 py-4 font-medium">Montant</th>
                      <th className="px-6 py-4 font-medium">Statut Wave</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {/* Les vraies commandes apparaîtront ici */}
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        Aucune commande pour le moment
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Gestion des Produits</h3>
              <button 
                onClick={openAddModal}
                className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Ajouter
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-6 py-4 font-medium">Image</th>
                    <th className="px-6 py-4 font-medium">Nom</th>
                    <th className="px-6 py-4 font-medium">Prix</th>
                    <th className="px-6 py-4 font-medium">Stock</th>
                    <th className="px-6 py-4 font-medium">Commission</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                      <td className="px-6 py-4">{product.price.toLocaleString('fr-FR')} {product.currency}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">{product.commission}%</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => openEditModal(product)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setProductToDelete(product.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        Aucun produit trouvé. Ajoutez votre premier produit.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'affiliates' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-lg font-medium text-gray-900">Gestion des Affiliés</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-6 py-4 font-medium">ID</th>
                    <th className="px-6 py-4 font-medium">Nom</th>
                    <th className="px-6 py-4 font-medium">Téléphone</th>
                    <th className="px-6 py-4 font-medium">Infos Paiement</th>
                    <th className="px-6 py-4 font-medium">Gains (XOF)</th>
                    <th className="px-6 py-4 font-medium">Ventes</th>
                    <th className="px-6 py-4 font-medium">Clics</th>
                    <th className="px-6 py-4 font-medium">Statut</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {affiliates.map((affiliate) => (
                    <tr key={affiliate.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-medium text-gray-900">{affiliate.id}</td>
                      <td className="px-6 py-4">{affiliate.name}</td>
                      <td className="px-6 py-4">{affiliate.phone || '-'}</td>
                      <td className="px-6 py-4">{affiliate.payment_info || '-'}</td>
                      <td className="px-6 py-4 font-semibold text-green-600">{affiliate.earnings.toLocaleString('fr-FR')}</td>
                      <td className="px-6 py-4">{affiliate.sales}</td>
                      <td className="px-6 py-4">{affiliate.clicks}</td>
                      <td className="px-6 py-4">
                        {affiliate.status === 'verified' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Vérifié</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">En attente</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {affiliate.status !== 'verified' && (
                            <button 
                              onClick={() => handleVerifyAffiliate(affiliate.id)}
                              className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                              title="Vérifier"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => openEditAffiliateModal(affiliate)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setAffiliateToDelete(affiliate.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {affiliates.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                        Aucun affilié inscrit pour le moment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Paramètres de la boutique</h3>
            
            <div className="max-w-xl">
              <label className="block text-sm font-medium text-gray-700 mb-2">Image de couverture (Accueil)</label>
              <div className="mt-1 flex justify-center border-2 border-gray-300 border-dashed rounded-xl relative overflow-hidden group bg-gray-50 min-h-[16rem]">
                {coverImage ? (
                  <>
                    <img src={coverImage} alt="Cover Preview" className="w-full h-auto max-h-[400px] object-contain opacity-70 group-hover:opacity-40 transition-opacity" />
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
                      <p className="text-sm text-gray-900 font-medium bg-white/90 px-4 py-2 rounded-lg shadow-sm">Changer l'image de couverture</p>
                    </div>
                  </>
                ) : (
                  <div className="space-y-1 text-center flex flex-col items-center justify-center w-full py-12">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <span className="relative cursor-pointer bg-white rounded-md font-medium text-black hover:text-gray-700 focus-within:outline-none">
                        <span>Télécharger une image</span>
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG jusqu'à 5MB</p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        updateCoverImage(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                    e.target.value = '';
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">Cette image sera affichée en grand sur la page d'accueil.</p>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8 relative">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-serif font-bold text-gray-900">
                {editingProduct ? "Modifier le produit" : "Ajouter un produit"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="p-6 space-y-6">
              {formError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prix (XOF)</label>
                      <input 
                        type="number" 
                        required
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                      <input 
                        type="number" 
                        required
                        min="0"
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                      >
                        <option value="Homme">Homme</option>
                        <option value="Femme">Femme</option>
                        <option value="Enfant">Enfant</option>
                        <option value="Accessoires">Accessoires</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Commission (%)</label>
                      <input 
                        type="number" 
                        min="0"
                        max="100"
                        value={formData.commission}
                        onChange={(e) => setFormData({...formData, commission: Number(e.target.value)})}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image principale</label>
                    <div className="mt-1 flex justify-center border-2 border-gray-300 border-dashed rounded-xl relative overflow-hidden group bg-gray-50 min-h-[12rem]">
                      {formData.image ? (
                        <>
                          <img src={formData.image} alt="Preview" className="w-full h-auto max-h-[300px] object-contain opacity-70 group-hover:opacity-40 transition-opacity" />
                          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
                            <p className="text-sm text-gray-900 font-medium bg-white/90 px-3 py-1.5 rounded-lg shadow-sm">Changer l'image</p>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-1 text-center flex flex-col items-center justify-center w-full py-8">
                          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <span className="relative cursor-pointer bg-white rounded-md font-medium text-black hover:text-gray-700 focus-within:outline-none">
                              <span>Télécharger un fichier</span>
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG jusqu'à 5MB</p>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lien de paiement Wave</label>
                    <input 
                      type="url" 
                      value={formData.wave_payment_link}
                      onChange={(e) => setFormData({...formData, wave_payment_link: e.target.value})}
                      placeholder="https://pay.wave.com/..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lien de paiement Orange Money (Optionnel)</label>
                    <input 
                      type="url" 
                      value={formData.om_payment_link || ""}
                      onChange={(e) => setFormData({...formData, om_payment_link: e.target.value})}
                      placeholder="Lien marchand OM..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-black text-white font-medium hover:bg-gray-800 transition-colors"
                >
                  {editingProduct ? "Mettre à jour" : "Créer le produit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">Confirmer la suppression</h3>
            <p className="text-gray-500 mb-6">Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setProductToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={() => {
                  deleteProduct(productToDelete);
                  setProductToDelete(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Affiliate Confirmation Modal */}
      {affiliateToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">Confirmer la suppression</h3>
            <p className="text-gray-500 mb-6">Êtes-vous sûr de vouloir supprimer cet affilié ? Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setAffiliateToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={confirmDeleteAffiliate}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Affiliate Modal */}
      {isAffiliateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8 relative">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-serif font-bold text-gray-900">
                Modifier l'affilié
              </h2>
              <button 
                onClick={() => setIsAffiliateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSaveAffiliate} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                  <input 
                    type="text" 
                    required
                    value={affiliateFormData.name}
                    onChange={(e) => setAffiliateFormData({...affiliateFormData, name: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input 
                    type="text" 
                    value={affiliateFormData.phone}
                    onChange={(e) => setAffiliateFormData({...affiliateFormData, phone: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Infos Paiement (Wave/OM)</label>
                  <input 
                    type="text" 
                    value={affiliateFormData.payment_info}
                    onChange={(e) => setAffiliateFormData({...affiliateFormData, payment_info: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select 
                    value={affiliateFormData.status}
                    onChange={(e) => setAffiliateFormData({...affiliateFormData, status: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  >
                    <option value="pending">En attente</option>
                    <option value="verified">Vérifié</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gains (XOF)</label>
                  <input 
                    type="number" 
                    value={affiliateFormData.earnings}
                    onChange={(e) => setAffiliateFormData({...affiliateFormData, earnings: Number(e.target.value)})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ventes</label>
                  <input 
                    type="number" 
                    value={affiliateFormData.sales}
                    onChange={(e) => setAffiliateFormData({...affiliateFormData, sales: Number(e.target.value)})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clics</label>
                  <input 
                    type="number" 
                    value={affiliateFormData.clicks}
                    onChange={(e) => setAffiliateFormData({...affiliateFormData, clicks: Number(e.target.value)})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setIsAffiliateModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-black text-white font-medium hover:bg-gray-800 transition-colors"
                >
                  Mettre à jour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
