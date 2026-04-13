import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, setDoc, getDocs, query, where, onSnapshot } from 'firebase/firestore';

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
        // Set up real-time listener for the logged-in affiliate
        const unsubscribe = onSnapshot(doc(db, 'affiliates', currentAffiliate.id), (docSnap) => {
          if (docSnap.exists()) {
            setCurrentAffiliate({ id: docSnap.id, ...docSnap.data() } as AffiliateUser);
          }
        }, (error) => {
          console.error("Failed to listen to affiliate updates", error);
        });
        return () => unsubscribe();
      } else {
        localStorage.removeItem('sbc_affiliate_user');
      }
    } catch (e) {
      console.error("Failed to save affiliate to localStorage", e);
    }
  }, [currentAffiliate?.id]); // Only re-run if ID changes

  const registerAffiliate = async (name: string, phone: string, payment_info: string) => {
    try {
      // Check if phone already exists
      const q = query(collection(db, 'affiliates'), where('phone', '==', phone));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return false; // Phone already registered
      }

      const id = `aff_${Date.now()}`;
      const newAffiliate = {
        name,
        phone,
        payment_info,
        earnings: 0,
        sales: 0,
        clicks: 0,
        status: 'pending'
      };
      
      await setDoc(doc(db, 'affiliates', id), newAffiliate);
      setCurrentAffiliate({ id, ...newAffiliate });
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'affiliates');
      return false;
    }
  };

  const loginAffiliate = async (phone: string) => {
    try {
      const q = query(collection(db, 'affiliates'), where('phone', '==', phone));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        setCurrentAffiliate({ id: docSnap.id, ...docSnap.data() } as AffiliateUser);
        return true;
      }
      return false;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'affiliates');
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
