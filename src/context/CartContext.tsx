import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Product } from '../data/products';
import { useProducts } from './ProductContext';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalPrice: number;
  totalCommission: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { products } = useProducts();
  
  // Store only { productId, quantity } in state/localStorage to always use fresh product data
  const [cartState, setCartState] = useState<{id: string, quantity: number}[]>(() => {
    try {
      const saved = localStorage.getItem('sbc_cart_v2');
      if (saved) return JSON.parse(saved);
      
      // Migration from old cart format
      const oldSaved = localStorage.getItem('sbc_cart');
      if (oldSaved) {
        const parsed = JSON.parse(oldSaved);
        return parsed.map((item: any) => ({ id: item.product.id, quantity: item.quantity }));
      }
      return [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sbc_cart_v2', JSON.stringify(cartState));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cartState]);

  // Derive cartItems by combining cartState with fresh products data
  const cartItems = useMemo(() => {
    if (products.length === 0) return []; // Wait for products to load
    
    return cartState
      .map(item => {
        const product = products.find(p => p.id === item.id);
        if (!product) return null;
        // Ensure quantity doesn't exceed current stock
        const validQuantity = Math.min(item.quantity, product.stock);
        return validQuantity > 0 ? { product, quantity: validQuantity } : null;
      })
      .filter((item): item is CartItem => item !== null);
  }, [cartState, products]);

  const addToCart = (product: Product, quantity = 1) => {
    setCartState(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        const newQuantity = Math.min(existing.quantity + quantity, product.stock);
        return prev.map(item => item.id === product.id ? { ...item, quantity: newQuantity } : item);
      }
      return [...prev, { id: product.id, quantity: Math.min(quantity, product.stock) }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartState(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const product = products.find(p => p.id === productId);
    const maxStock = product ? product.stock : 0;
    
    setCartState(prev => prev.map(item => {
      if (item.id === productId) {
        return { ...item, quantity: Math.min(quantity, maxStock) };
      }
      return item;
    }));
  };

  const clearCart = () => setCartState([]);

  const totalPrice = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const totalCommission = cartItems.reduce((acc, item) => acc + ((item.product.price * item.product.commission / 100) * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalPrice, totalCommission }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
