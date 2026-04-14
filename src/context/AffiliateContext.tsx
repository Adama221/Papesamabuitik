import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AffiliateUser {
  id: string;
  name: string;
  phone?: string;
  payment_info?: string;
  earnings: number;
  sales: number;
  clicks: number;
  status?: string;
}

interface AffiliateContextType {
  currentAffiliate: AffiliateUser | null;
  registerAffiliate: (name: string, phone: string, payment_info: string) => Promise<boolean>;
  loginAffiliate: (phone: string) => Promise<boolean>;
  logoutAffiliate: () => void;
  getAllAffiliates: () => AffiliateUser[];
  updateAffiliate: (id: string, data: Partial<AffiliateUser>) => void;
  deleteAffiliate: (id: string) => void;
  trackClick: (id: string) => void;
  trackSale: (id: string, commission: number) => void;
}

const AffiliateContext = createContext<AffiliateContextType | undefined>(undefined);

export function AffiliateProvider({ children }: { children: React.ReactNode }) {
  const [currentAffiliate, setCurrentAffiliate] = useState<AffiliateUser | null>(() => {
    const saved = localStorage.getItem('sbc_affiliate_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    try {
      if (currentAffiliate) {
        localStorage.setItem('sbc_affiliate_user', JSON.stringify(currentAffiliate));
      } else {
        localStorage.removeItem('sbc_affiliate_user');
      }
    } catch (e) {
      console.error("Failed to save affiliate to localStorage", e);
    }
  }, [currentAffiliate]);

  const getAllAffiliates = (): AffiliateUser[] => {
    const saved = localStorage.getItem('sbc_all_affiliates');
    return saved ? JSON.parse(saved) : [];
  };

  const saveAllAffiliates = (affiliates: AffiliateUser[]) => {
    localStorage.setItem('sbc_all_affiliates', JSON.stringify(affiliates));
  };

  const registerAffiliate = async (name: string, phone: string, payment_info: string) => {
    const affiliates = getAllAffiliates();
    if (affiliates.some(a => a.phone === phone)) {
      return false;
    }

    const id = `aff_${Date.now()}`;
    const newAffiliate: AffiliateUser = {
      id,
      name,
      phone,
      payment_info,
      earnings: 0,
      sales: 0,
      clicks: 0,
      status: 'pending'
    };
    
    saveAllAffiliates([...affiliates, newAffiliate]);
    setCurrentAffiliate(newAffiliate);
    return true;
  };

  const loginAffiliate = async (phone: string) => {
    const affiliates = getAllAffiliates();
    const found = affiliates.find(a => a.phone === phone);
    if (found) {
      setCurrentAffiliate(found);
      return true;
    }
    return false;
  };

  const logoutAffiliate = () => setCurrentAffiliate(null);

  const updateAffiliate = (id: string, data: Partial<AffiliateUser>) => {
    const affiliates = getAllAffiliates();
    const updated = affiliates.map(a => a.id === id ? { ...a, ...data } : a);
    saveAllAffiliates(updated);
    if (currentAffiliate?.id === id) {
      setCurrentAffiliate({ ...currentAffiliate, ...data });
    }
  };

  const deleteAffiliate = (id: string) => {
    const affiliates = getAllAffiliates();
    saveAllAffiliates(affiliates.filter(a => a.id !== id));
    if (currentAffiliate?.id === id) {
      setCurrentAffiliate(null);
    }
  };

  const trackClick = (id: string) => {
    const affiliates = getAllAffiliates();
    const updated = affiliates.map(a => a.id === id ? { ...a, clicks: a.clicks + 1 } : a);
    saveAllAffiliates(updated);
    if (currentAffiliate?.id === id) {
      setCurrentAffiliate({ ...currentAffiliate, clicks: currentAffiliate.clicks + 1 });
    }
  };

  const trackSale = (id: string, commission: number) => {
    const affiliates = getAllAffiliates();
    const updated = affiliates.map(a => a.id === id ? { ...a, sales: a.sales + 1, earnings: a.earnings + commission } : a);
    saveAllAffiliates(updated);
    if (currentAffiliate?.id === id) {
      setCurrentAffiliate({ ...currentAffiliate, sales: currentAffiliate.sales + 1, earnings: currentAffiliate.earnings + commission });
    }
  };

  return (
    <AffiliateContext.Provider value={{ 
      currentAffiliate, 
      registerAffiliate, 
      loginAffiliate, 
      logoutAffiliate,
      getAllAffiliates,
      updateAffiliate,
      deleteAffiliate,
      trackClick,
      trackSale
    }}>
      {children}
    </AffiliateContext.Provider>
  );
}

export const useAffiliate = () => {
  const context = useContext(AffiliateContext);
  if (!context) throw new Error("useAffiliate must be used within AffiliateProvider");
  return context;
};
