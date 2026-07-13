import { useNavigate } from "react-router";
import { NavagrahaHero } from "@/components/home/NavagrahaHero";
import { ShopConsultCards } from "@/components/home/ShopConsultCards";
import { HowItsMade } from "@/components/home/HowItsMade";
import { ProductsAndCombos } from "@/components/home/ProductsAndCombos";
import { WhyAroham } from "@/components/home/WhyAroham";
import { VideoTestimonials } from "@/components/home/VideoTestimonials";
import { CommunityComments } from "@/components/home/CommunityComments";
import { Newsletter } from "@/components/home/Newsletter";
import { useState, useEffect } from "react";
import { COMBOS } from "@/constants/data";
import { ArohamProduct } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";

export function HomePage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<ArohamProduct[]>([]);

  useEffect(() => {
    api("/products")
      .then(data => setProducts(data))
      .catch(err => console.error("Failed to load products", err));
  }, []);

  const goToShop = () => navigate("/shop");
  const goToProduct = (p: ArohamProduct) => navigate(`/shop/${p.slug}`);

  const handleAddCombo = (name: string) => {
    const combo = COMBOS.find(c => c.name === name);
    // Use first product as placeholder for combo if no exact match, though normally combo should be its own item
    if (combo && products.length > 0) { 
      addToCart({ ...products[0], name: combo.name, price: combo.price, original: combo.original }, 1); 
    }
  };

  return (
    <main>
      <NavagrahaHero onShop={goToShop} onConsult={() => navigate("/consult")} />
      <ShopConsultCards products={products} onShop={goToShop} onProductClick={goToProduct} />
      <HowItsMade />
      <ProductsAndCombos products={products} onProductClick={goToProduct} onAddToCart={p => addToCart(p)} onAddCombo={handleAddCombo} />
      <WhyAroham />
      <VideoTestimonials />
      <CommunityComments products={products} />
      <Newsletter />
    </main>
  );
}
