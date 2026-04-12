import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../data/products';

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

const getAuthHeaders = () => {
  const token = localStorage.getItem('sbc_admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [coverImage, setCoverImage] = useState<string>("/cover.jpg");

  useEffect(() => {
    setIsLoading(true);
    fetch('/api/products')
      .then(async res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          return res.json();
        } else {
          throw new Error("Expected JSON response");
        }
      })
      .then(data => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch products:", err);
        setIsLoading(false);
      });

    fetch('/api/settings/cover')
      .then(async res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          return res.json();
        } else {
          throw new Error("Expected JSON response");
        }
      })
      .then(data => {
        if (data.coverImage) setCoverImage(data.coverImage);
      })
      .catch(err => console.error("Failed to fetch cover image:", err));
  }, []);

  const addProduct = async (product: Product) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(product)
      });
      if (res.ok) {
        setProducts(prev => [...prev, product]);
      }
    } catch (err) {
      console.error("Failed to add product:", err);
    }
  };

  const updateProduct = async (id: string, updatedProduct: Partial<Product>) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedProduct)
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedProduct } : p));
      }
    } catch (err) {
      console.error("Failed to update product:", err);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  const updateCoverImage = async (image: string) => {
    try {
      const res = await fetch('/api/settings/cover', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ coverImage: image })
      });
      if (res.ok) {
        setCoverImage(image);
      }
    } catch (err) {
      console.error("Failed to update cover image:", err);
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
