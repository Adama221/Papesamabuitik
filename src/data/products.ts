export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  images: string[];
  stock: number;
  category: string;
  wave_payment_link: string;
  om_payment_link?: string;
  commission: number;
}

// Les produits sont maintenant gérés dynamiquement via la base de données (SQLite/Firebase)
export const products: Product[] = [];
