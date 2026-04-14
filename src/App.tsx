/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { WhatsAppButton } from "./components/WhatsAppButton";
import { Home } from "./pages/Home";
import { ProductPage } from "./pages/ProductPage";
import { Confirmation } from "./pages/Confirmation";
import { Admin } from "./pages/Admin";
import { Affiliate } from "./pages/Affiliate";
import { CartPage } from "./pages/CartPage";
import { AffiliateProvider, useAffiliate } from "./context/AffiliateContext";
import { CartProvider } from "./context/CartContext";

export default function App() {
  return (
    <AffiliateProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AffiliateProvider>
  );
}

function AppContent() {
  const location = useLocation();
  const { trackClick } = useAffiliate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const ref = searchParams.get('ref');
    
    if (ref) {
      try {
        const lastTracked = sessionStorage.getItem(`tracked_click_${ref}`);
        if (!lastTracked) {
          trackClick(ref);
          sessionStorage.setItem(`tracked_click_${ref}`, 'true');
        }
        // Store the ref in localStorage so we can credit them for sales later
        localStorage.setItem('sbc_current_ref', ref);
      } catch (e) {
        console.error("Storage access denied or full", e);
      }
    }
  }, [location, trackClick]);

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-white">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/confirmation" element={<Confirmation />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/affiliate" element={<Affiliate />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
  );
}
