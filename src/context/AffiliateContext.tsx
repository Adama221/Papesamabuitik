import React, { createContext, useContext, useState, useEffect } from 'react';

interface AffiliateUser {
  id: string;
  name: string;
  phone?: string;
  payment_info?: string;
  earnings: number;
  sales: number;
  clicks: number;
}

interface AffiliateContextType {
  currentAffiliate: AffiliateUser | null;
  registerAffiliate: (name: string, phone: string, payment_info: string) => Promise<boolean>;
  loginAffiliate: (phone: string) => Promise<boolean>;
  logoutAffiliate: () => void;
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

  const registerAffiliate = async (name: string, phone: string, payment_info: string) => {
    try {
      const res = await fetch('/api/affiliates/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, payment_info })
      });
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const data = await res.json();
          setCurrentAffiliate(data);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error("Failed to register affiliate:", err);
      return false;
    }
  };

  const loginAffiliate = async (phone: string) => {
    try {
      const res = await fetch('/api/affiliates/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const data = await res.json();
          setCurrentAffiliate(data);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error("Failed to login affiliate:", err);
      return false;
    }
  };

  const logoutAffiliate = () => setCurrentAffiliate(null);

  return (
    <AffiliateContext.Provider value={{ currentAffiliate, registerAffiliate, loginAffiliate, logoutAffiliate }}>
      {children}
    </AffiliateContext.Provider>
  );
}

export const useAffiliate = () => {
  const context = useContext(AffiliateContext);
  if (!context) throw new Error("useAffiliate must be used within AffiliateProvider");
  return context;
};
