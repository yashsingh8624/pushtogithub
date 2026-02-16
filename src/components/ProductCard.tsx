import { Product } from "@/types/store";
import { useCart } from "@/context/CartContext";
import { useDealerAuth } from "@/context/DealerAuthContext";
import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Plus, Minus, Eye, Lock } from "lucide-react";
import { toast } from "sonner";

interface Props {
  product: Product;
  index: number;
  onZoom: (src: string) => void;
}

export default function ProductCard({ product, index, onZoom }: Props) {
  const { addToCart } = useCart();
  const { isDealer } = useDealerAuth();
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
      className="group bg-card rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300"
    >
      <div className="relative overflow-hidden aspect-[4/5]">
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

      <div className="p-4 space-y-3">
        <h3 className="font-display text-lg font-semibold text-card-foreground truncate">
          {product.name}
        </h3>

        {isDealer ? (
          <p className="text-xl font-bold text-primary">₹{product.price}</p>
        ) : (
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-medium">
              Login for wholesale price
            </span>
          </div>
        )}

        {moq > 1 && (
          <p className="text-xs text-muted-foreground">
            Min. order: <span className="font-semibold text-foreground">{moq} pcs</span>
          </p>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleQtyChange(qty - 1)}
            className="h-8 w-8 rounded-md border flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-8 text-center text-sm font-medium">{qty}</span>
          <button
            onClick={() => handleQtyChange(qty + 1)}
            className="h-8 w-8 rounded-md border flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>

        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-md font-medium text-sm hover:opacity-90 transition-opacity shadow-button disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
}
