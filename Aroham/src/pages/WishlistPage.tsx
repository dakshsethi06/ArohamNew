import { useNavigate } from "react-router";
import { X, Heart, ShoppingBag } from "lucide-react";
import { MAROON, GOLD, IVORY, SANS, SERIF, PRICE_FONT } from "@/constants/theme";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

export function WishlistPage() {
  const navigate = useNavigate();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToBag = (product: any) => {
    addToCart(product, 1, true);
    removeFromWishlist(product.id);
  };

  return (
    <div style={{ background: "#FAF7F2", minHeight: "100vh", fontFamily: SANS }} className="pt-28 pb-16 px-4 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-b border-black/[0.06] pb-4 flex items-baseline gap-3">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ fontFamily: SERIF, color: MAROON }}>
            My Wishlist
          </h1>
          <span className="text-sm font-medium text-amber-900/60" style={{ fontFamily: SANS }}>
            {wishlist.length} {wishlist.length === 1 ? "item" : "items"}
          </span>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-black/[0.06] shadow-sm max-w-lg mx-auto p-8">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4" style={{ color: "#E74C3C" }}>
              <Heart size={32} />
            </div>
            <h2 className="text-lg font-bold mb-2" style={{ fontFamily: SERIF, color: MAROON }}>
              Your Wishlist is Empty
            </h2>
            <p className="text-xs text-amber-900/70 mb-6 max-w-xs mx-auto">
              Explore our temple-energized sacred products and tap the heart icon to save your favorites here.
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all hover:opacity-90 shadow-md"
              style={{ background: `linear-gradient(135deg,${MAROON},#7A2A30)`, color: IVORY }}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {wishlist.map(product => {
              const discountPct = Math.round((1 - product.price / product.original) * 100);
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl overflow-hidden border border-black/[0.08] shadow-sm flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  {/* Top Image Section with Close X */}
                  <div>
                    <div
                      className="relative aspect-[3/4] bg-amber-50 overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/shop/${product.slug}`)}
                    >
                      <img
                        src={product.img}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <button
                        aria-label="Remove from wishlist"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWishlist(product.id);
                        }}
                        className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-white transition-all z-10"
                      >
                        <X size={15} />
                      </button>
                    </div>

                    {/* Details */}
                    <div className="p-3.5">
                      <h3
                        className="text-xs sm:text-sm font-semibold truncate mb-1 cursor-pointer hover:underline"
                        style={{ fontFamily: SERIF, color: MAROON }}
                        onClick={() => navigate(`/shop/${product.slug}`)}
                      >
                        {product.name}
                      </h3>
                      {product.subtitle && (
                        <p className="text-[11px] text-amber-900/60 truncate mb-2">{product.subtitle}</p>
                      )}

                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-sm font-bold" style={{ fontFamily: PRICE_FONT, color: MAROON }}>
                          Rs.{product.price.toLocaleString("en-IN")}
                        </span>
                        {product.original > product.price && (
                          <>
                            <span className="text-xs line-through opacity-50" style={{ fontFamily: PRICE_FONT, color: "#9A8A78" }}>
                              Rs.{product.original.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[11px] font-bold text-orange-600">
                              ({discountPct}% OFF)
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Move to Bag Button */}
                  <button
                    onClick={() => handleMoveToBag(product)}
                    className="w-full py-3.5 border-t border-gray-100 text-xs font-bold tracking-wider hover:bg-rose-50 transition-colors uppercase flex items-center justify-center gap-1.5 mt-2"
                    style={{ color: "#E74C3C" }}
                  >
                    <ShoppingBag size={14} />
                    <span>MOVE TO BAG</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
