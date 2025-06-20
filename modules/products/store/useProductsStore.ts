import { create } from "zustand";
import { Product } from "../types";
import DUMMY_PRODUCTS from "@/lib/dummy-data/products.json";

interface ProductsState {
  products: Product[];
  fetchProducts: () => void;
  getProductById: (id: string) => Product | undefined;
}

export const useProductsStore = create<ProductsState>(
  (set, get) => ({
    products: [],
    fetchProducts: () => {
      // In a real app, this would be an async API call
      set({ products: DUMMY_PRODUCTS as Product[] });
    },
    // This is a helper function to easily find a product on the detail page
    getProductById: (id: string) => {
      return get().products.find((p) => p.id === id);
    },
  })
);
