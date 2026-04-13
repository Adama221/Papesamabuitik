import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../data/products';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface ProductContextType {
  products: Product[];
  isLoading: boolean;
  coverImage: string;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateCoverImage: (image: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [coverImage, setCoverImage] = useState<string>("/cover.jpg");
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setIsAuthReady(true);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;

    setIsLoading(true);
    
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const productsData: Product[] = [];
      snapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(productsData);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
      setIsLoading(false);
    });

    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'cover'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().coverImage) {
        setCoverImage(docSnap.data().coverImage);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/cover');
    });

    return () => {
      unsubscribeProducts();
      unsubscribeSettings();
    };
  }, [isAuthReady]);

  const addProduct = async (product: Product) => {
    try {
      const docRef = doc(db, 'products', product.id);
      await setDoc(docRef, product);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `products/${product.id}`);
    }
  };

  const updateProduct = async (id: string, updatedProduct: Partial<Product>) => {
    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, updatedProduct);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `products/${id}`);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const docRef = doc(db, 'products', id);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
    }
  };

  const updateCoverImage = async (image: string) => {
    try {
      const docRef = doc(db, 'settings', 'cover');
      await setDoc(docRef, { coverImage: image }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'settings/cover');
    }
  };

  return (
    <ProductContext.Provider value={{ products, isLoading, coverImage, addProduct, updateProduct, deleteProduct, updateCoverImage }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error("useProducts must be used within ProductProvider");
  return context;
};
