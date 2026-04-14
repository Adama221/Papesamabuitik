import React, { createContext, useContext, useState, useEffect } from 'react';
import { pb } from '../pocketbase';

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
  getAllAffiliates: () => Promise<AffiliateUser[]>;
  updateAffiliate: (id: string, data: Partial<AffiliateUser>) => Promise<void>;
  deleteAffiliate: (id: string) => Promise<void>;
  trackClick: (id: string) => Promise<void>;
  trackSale: (id: string, commission: number) => Promise<void>;
}

const AffiliateContext = createContext<AffiliateContextType | undefined>(undefined);

export function AffiliateProvider({ children }: { children: React.ReactNode }) {
  const [currentAffiliate, setCurrentAffiliate] = useState<AffiliateUser | null>(() => {
    const saved = localStorage.getItem('sbc_affiliate_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (currentAffiliate) {
      localStorage.setItem('sbc_affiliate_user', JSON.stringify(currentAffiliate));
      
      pb.collection('affiliates').subscribe(currentAffiliate.id, function (e) {
        if (e.action === 'update') {
          setCurrentAffiliate(e.record as unknown as AffiliateUser);
        } else if (e.action === 'delete') {
          setCurrentAffiliate(null);
        }
      }).catch(e => {
        console.error("PocketBase subscribe error", e);
      });
      
      return () => {
        pb.collection('affiliates').unsubscribe(currentAffiliate.id).catch(e => {});
      };
    } else {
      localStorage.removeItem('sbc_affiliate_user');
    }
  }, [currentAffiliate?.id]);

  const getAllAffiliates = async (): Promise<AffiliateUser[]> => {
    try {
      const records = await pb.collection('affiliates').getFullList({ sort: '-created' });
      return records as unknown as AffiliateUser[];
    } catch (e) {
      console.error("Erreur chargement affiliés PocketBase", e);
      // Fallback local
      const saved = localStorage.getItem('sbc_all_affiliates');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (err) {
          return [];
        }
      }
      return [];
    }
  };

  const saveAllAffiliatesLocal = (affiliates: AffiliateUser[]) => {
    localStorage.setItem('sbc_all_affiliates', JSON.stringify(affiliates));
  };

  const registerAffiliate = async (name: string, phone: string, payment_info: string) => {
    try {
      try {
        await pb.collection('affiliates').getFirstListItem(`phone="${phone}"`);
        return false; // Already exists
      } catch (e) {
        // Doesn't exist, proceed
      }

      const newAffiliate = {
        name,
        phone,
        payment_info,
        earnings: 0,
        sales: 0,
        clicks: 0,
        status: 'pending'
      };
      
      const record = await pb.collection('affiliates').create(newAffiliate);
      setCurrentAffiliate(record as unknown as AffiliateUser);
      return true;
    } catch (e) {
      console.error("Erreur inscription PocketBase", e);
      // Fallback local
      const saved = localStorage.getItem('sbc_all_affiliates');
      let affiliates = [];
      if (saved) {
        try { affiliates = JSON.parse(saved); } catch (err) {}
      }
      if (affiliates.some((a: any) => a.phone === phone)) return false;
      
      const id = `aff_${Date.now()}`;
      const newAffiliate: AffiliateUser = { id, name, phone, payment_info, earnings: 0, sales: 0, clicks: 0, status: 'pending' };
      saveAllAffiliatesLocal([...affiliates, newAffiliate]);
      setCurrentAffiliate(newAffiliate);
      return true;
    }
  };

  const loginAffiliate = async (phone: string) => {
    try {
      const record = await pb.collection('affiliates').getFirstListItem(`phone="${phone}"`);
      setCurrentAffiliate(record as unknown as AffiliateUser);
      return true;
    } catch (e) {
      // Fallback local
      const saved = localStorage.getItem('sbc_all_affiliates');
      let affiliates = [];
      if (saved) {
        try { affiliates = JSON.parse(saved); } catch (err) {}
      }
      const found = affiliates.find((a: any) => a.phone === phone);
      if (found) {
        setCurrentAffiliate(found);
        return true;
      }
      return false;
    }
  };

  const logoutAffiliate = () => setCurrentAffiliate(null);

  const updateAffiliate = async (id: string, data: Partial<AffiliateUser>) => {
    try {
      await pb.collection('affiliates').update(id, data);
    } catch (e) {
      console.error("Erreur mise à jour affilié", e);
      // Fallback local
      const saved = localStorage.getItem('sbc_all_affiliates');
      let affiliates = [];
      if (saved) {
        try { affiliates = JSON.parse(saved); } catch (err) {}
      }
      const updated = affiliates.map((a: any) => a.id === id ? { ...a, ...data } : a);
      saveAllAffiliatesLocal(updated);
      if (currentAffiliate?.id === id) setCurrentAffiliate({ ...currentAffiliate, ...data });
    }
  };

  const deleteAffiliate = async (id: string) => {
    try {
      await pb.collection('affiliates').delete(id);
    } catch (e) {
      console.error("Erreur suppression affilié", e);
      // Fallback local
      const saved = localStorage.getItem('sbc_all_affiliates');
      let affiliates = [];
      if (saved) {
        try { affiliates = JSON.parse(saved); } catch (err) {}
      }
      saveAllAffiliatesLocal(affiliates.filter((a: any) => a.id !== id));
      if (currentAffiliate?.id === id) setCurrentAffiliate(null);
    }
  };

  const trackClick = async (id: string) => {
    try {
      const record = await pb.collection('affiliates').getOne(id);
      await pb.collection('affiliates').update(id, { clicks: record.clicks + 1 });
    } catch (e) {
      console.error("Erreur track click", e);
      // Fallback local
      const saved = localStorage.getItem('sbc_all_affiliates');
      let affiliates = [];
      if (saved) {
        try { affiliates = JSON.parse(saved); } catch (err) {}
      }
      const updated = affiliates.map((a: any) => a.id === id ? { ...a, clicks: a.clicks + 1 } : a);
      saveAllAffiliatesLocal(updated);
      if (currentAffiliate?.id === id) setCurrentAffiliate({ ...currentAffiliate, clicks: currentAffiliate.clicks + 1 });
    }
  };

  const trackSale = async (id: string, commission: number) => {
    try {
      const record = await pb.collection('affiliates').getOne(id);
      await pb.collection('affiliates').update(id, { 
        sales: record.sales + 1, 
        earnings: record.earnings + commission 
      });
    } catch (e) {
      console.error("Erreur track sale", e);
      // Fallback local
      const saved = localStorage.getItem('sbc_all_affiliates');
      let affiliates = [];
      if (saved) {
        try { affiliates = JSON.parse(saved); } catch (err) {}
      }
      const updated = affiliates.map((a: any) => a.id === id ? { ...a, sales: a.sales + 1, earnings: a.earnings + commission } : a);
      saveAllAffiliatesLocal(updated);
      if (currentAffiliate?.id === id) setCurrentAffiliate({ ...currentAffiliate, sales: currentAffiliate.sales + 1, earnings: currentAffiliate.earnings + commission });
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
