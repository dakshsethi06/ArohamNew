import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { ArohamProduct } from "@/types/product";
import { DEFAULT_PRODUCTS } from "@/constants/products";

export function useProducts() {
  const [products, setProducts] = useState<ArohamProduct[]>(DEFAULT_PRODUCTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cached = sessionStorage.getItem("aroham_products_cache");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error("Failed to parse cached products", e);
      }
    }

    api("/products")
      .then((data: ArohamProduct[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
          sessionStorage.setItem("aroham_products_cache", JSON.stringify(data));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Using default products fallback:", err);
        setLoading(false);
      });
  }, []);

  return { products, loading };
}
