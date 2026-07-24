import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { ArohamProduct } from "@/types/product";
import { DEFAULT_PRODUCTS } from "@/constants/products";

export function useProducts() {
  const [products, setProducts] = useState<ArohamProduct[]>(DEFAULT_PRODUCTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch latest products live from backend API
    api("/products")
      .then((data: ArohamProduct[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
          sessionStorage.setItem("aroham_products_cache", JSON.stringify(data));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Using fallback products:", err);
        const cached = sessionStorage.getItem("aroham_products_cache");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setProducts(parsed);
            }
          } catch (e) {}
        }
        setLoading(false);
      });
  }, []);

  return { products, loading };
}
