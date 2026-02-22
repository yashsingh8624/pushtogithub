import { Product } from "@/types/store";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Plus, Minus, Eye } from "lucide-react";
import { toast } from "sonner";

interface Props {
  product: Product;
  index: number;
  onZoom: (src: string) => void;
}

export default function ProductCard({ product, index, onZoom }: Props) {
  const { addToCart } = useCart();
  const moq = product.minimumOrder || 1;
  const [qty, setQty] = useState(moq);
  const outOfStock = product.stock !== undefined && product.stock <= 0;
  const maxStock = product.stock;

  const handleAdd = () => {
    if (outOfStock) return;
    if (qty < moq) {
      toast.error(`Minimum order quantity is ${moq} pieces.`);
      return;
    }
    if (maxStock !== undefined && qty > maxStock) {
      toast.error(`Only ${maxStock} pieces available in stock.`);
      return;
    }
    addToCart(product, qty);
    setQty(moq);
    toast.success(`${product.name} added to cart!`);
  };

  const handleQtyChange = (newQty: number) => {
    const min = Math.max(1, newQty);
    if (maxStock !== undefined && min > maxStock) {
      toast.error(`Only ${maxStock} in stock.`);
      setQty(maxStock);
      return;
    }
    setQty(min);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="group bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300"
    >
      <div className="relative overflow-hidden aspect-[4/5] rounded-t-xl">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://res.cloudinary.com/demo/image/upload/sample.jpg";
          }}
        />
        <button
          onClick={() => onZoom(product.image_url)}
          className="absolute top-3 right-3 bg-card/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Eye className="h-4 w-4 text-foreground" />
        </button>
        {outOfStock && (
          <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
            <span className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md font-semibold text-sm">
              Out of Stock
            </span>
          </div>
        )}
        {product.season && product.season !== "all" && (
          <span className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-xs px-2.5 py-1 rounded-full capitalize font-medium">
            {product.season}
          </span>
        )}
        {maxStock !== undefined && maxStock > 0 && maxStock <= 10 && (
          <span className="absolute bottom-3 left-3 bg-accent text-accent-foreground text-xs px-2.5 py-1 rounded-full font-medium">
            Only {maxStock} left
          </span>
        )}
      </div>

      <div className="p-4 space-y-3 text-center">
        <h3 className="font-display text-lg font-semibold text-card-foreground truncate">
          {product.name}
        </h3>

        <p className="text-2xl font-extrabold text-primary">₹{product.price}</p>

        {moq > 1 && (
          <p className="text-xs text-muted-foreground">
            Min. order: <span className="font-semibold text-foreground">{moq} pcs</span>
          </p>
        )}

        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleQtyChange(qty - 1)}
            className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:bg-secondary hover:border-primary transition-all"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-base font-semibold">{qty}</span>
          <button
            onClick={() => handleQtyChange(qty + 1)}
            className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:bg-secondary hover:border-primary transition-all"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-all shadow-button disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
}
