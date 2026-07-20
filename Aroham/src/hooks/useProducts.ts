import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { ArohamProduct } from "@/types/product";

export type { ArohamProduct };

export function useProducts() {
  const [products, setProducts] = useState<ArohamProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = sessionStorage.getItem("aroham_products_cache");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setProducts(parsed);
        setLoading(false);
        // Pre-load images from cache quietly
        parsed.forEach((p: ArohamProduct) => {
          const img = new Image();
          img.src = p.img;
        });
        return;
      } catch (e) {
        console.error("Failed to parse cached products", e);
      }
    }

    api("/products")
      .then((data: ArohamProduct[]) => {
        setProducts(data);
        sessionStorage.setItem("aroham_products_cache", JSON.stringify(data));
        setLoading(false);
        // Pre-load images
        data.forEach((p) => {
          const img = new Image();
          img.src = p.img;
        });
      })
      .catch((err) => {
        console.error("Failed to load products", err);
        setLoading(false);
      });
  }, []);

  return { products, loading };
}
