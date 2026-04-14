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

export const initialProducts: Product[] = [];
