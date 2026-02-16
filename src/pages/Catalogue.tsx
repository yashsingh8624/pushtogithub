import { useState, useMemo } from "react";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import ImageZoomModal from "@/components/ImageZoomModal";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const SEASONS = ["all", "summer", "winter", "rainy"];

export default function Catalogue() {
  const { products, loading } = useProducts();
  const [filter, setFilter] = useState("all");
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      filter === "all"
        ? products
        : products.filter((p) => p.season === filter),
    [products, filter]
  );

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl md:text-4xl font-bold text-center mb-8"
        >
          Our Collection
        </motion.h1>

        {/* Filters */}
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {SEASONS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-5 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                filter === s
                  ? "bg-primary text-primary-foreground shadow-button"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">No products found.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i}
                onZoom={setZoomSrc}
              />
            ))}
          </div>
        )}
      </div>

      <ImageZoomModal src={zoomSrc} onClose={() => setZoomSrc(null)} />
    </div>
  );
}
