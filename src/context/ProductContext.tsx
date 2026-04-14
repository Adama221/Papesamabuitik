import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, initialProducts } from '../data/products';
import { pb } from '../pocketbase';

interface ProductContextType {
  products: Product[];
  isLoading: boolean;
  coverImage: string;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
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
    const loadData = async () => {
      try {
        // Load products
        const records = await pb.collection('products').getFullList({
          sort: '-created',
        });
        
        const formattedProducts = records.map(record => ({
          id: record.id,
          name: record.name,
          description: record.description,
          price: record.price,
          currency: record.currency,
          image: record.image,
          images: record.images || [],
          stock: record.stock,
          category: record.category,
          wave_payment_link: record.wave_payment_link,
          om_payment_link: record.om_payment_link,
          commission: record.commission
        })) as Product[];
        
        setProducts(formattedProducts);

        // Load cover image from settings collection
        try {
          const settings = await pb.collection('settings').getFirstListItem('key="coverImage"');
          if (settings && settings.value) {
            setCoverImage(settings.value);
          }
        } catch (e) {
          console.log("Cover image setting not found in PocketBase, using default.");
        }
      } catch (e) {
        console.error("Erreur lors du chargement depuis PocketBase. Assurez-vous que le serveur est lancé et les collections créées.", e);
        // Fallback to local storage if PB fails
        const savedProducts = localStorage.getItem('sbc_products');
        if (savedProducts) {
          try {
            setProducts(JSON.parse(savedProducts));
          } catch (err) {
            setProducts(initialProducts);
          }
        } else {
          setProducts(initialProducts);
        }
        
        const savedCover = localStorage.getItem('sbc_cover_image');
        if (savedCover) {
          setCoverImage(savedCover);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Subscribe to real-time updates
    pb.collection('products').subscribe('*', function (e) {
      loadData();
    }).catch(e => {
      console.error("Impossible de s'abonner aux mises à jour PocketBase", e);
    });

    return () => {
      pb.collection('products').unsubscribe('*').catch(e => {});
    };
  }, []);

  // Sync to localStorage as backup
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('sbc_products', JSON.stringify(products));
    }
  }, [products, isLoading]);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      await pb.collection('products').create(product);
    } catch (e) {
      console.error("Erreur ajout produit PocketBase:", e);
      // Fallback local
      const newProduct = { ...product, id: `prod_${Date.now()}` } as Product;
      setProducts(prev => [...prev, newProduct]);
    }
  };

  const updateProduct = async (id: string, updatedProduct: Partial<Product>) => {
    try {
      await pb.collection('products').update(id, updatedProduct);
    } catch (e) {
      console.error("Erreur mise à jour produit PocketBase:", e);
      // Fallback local
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedProduct } : p));
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await pb.collection('products').delete(id);
    } catch (e) {
      console.error("Erreur suppression produit PocketBase:", e);
      // Fallback local
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const updateCoverImage = async (image: string) => {
    setCoverImage(image);
    localStorage.setItem('sbc_cover_image', image);
    try {
      try {
        const setting = await pb.collection('settings').getFirstListItem('key="coverImage"');
        await pb.collection('settings').update(setting.id, { value: image });
      } catch (e) {
        await pb.collection('settings').create({ key: "coverImage", value: image });
      }
    } catch (e) {
      console.error("Erreur mise à jour cover PocketBase:", e);
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
