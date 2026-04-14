import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, initialProducts } from '../data/products';

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

  useEffect(() => {
    // Load products from localStorage
    const savedProducts = localStorage.getItem('sbc_products');
    if (savedProducts) {
      try {
        setProducts(JSON.parse(savedProducts));
      } catch (e) {
        setProducts(initialProducts);
      }
    } else {
      setProducts(initialProducts);
    }

    // Load cover image from localStorage
    const savedCover = localStorage.getItem('sbc_cover_image');
    if (savedCover) {
      setCoverImage(savedCover);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('sbc_products', JSON.stringify(products));
    }
  }, [products, isLoading]);

  const addProduct = async (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const updateProduct = async (id: string, updatedProduct: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedProduct } : p));
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const updateCoverImage = async (image: string) => {
    setCoverImage(image);
    localStorage.setItem('sbc_cover_image', image);
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
