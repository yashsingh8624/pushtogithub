import { useState, useEffect } from "react";
import { Product } from "@/types/store";

const SHEET_ID = "13zH_S72hBVvjZtz3VN2MXCb03IKxhi6p0SMa--UHyMA";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
const CLOUDINARY_FALLBACK = "https://res.cloudinary.com/demo/image/upload/sample.jpg";

const DEMO_PRODUCTS: Product[] = [
  { id: "d1", name: "Formal Shirt", price: 599, image_url: CLOUDINARY_FALLBACK, season: "summer" },
  { id: "d2", name: "Casual Jeans", price: 799, image_url: CLOUDINARY_FALLBACK, season: "winter" },
];

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(SHEET_URL)
      .then((res) => res.text())
      .then((text) => {
        const json = JSON.parse(text.substring(47).slice(0, -2));
        const rows = json.table.rows;

        const parsed: Product[] = rows.map((r: any) => ({
          id: r.c[0]?.v?.toString().trim() || Math.random().toString(36).substr(2, 5),
          name: r.c[1]?.v || "Unnamed Product",
          price: Number(r.c[2]?.v) || 0,
          image_url: (r.c[3]?.v || CLOUDINARY_FALLBACK).toString().trim(),
          season: (r.c[4]?.v || "all").toLowerCase().trim(),
          stock: r.c[5]?.v != null ? Number(r.c[5]?.v) : undefined,
          minimumOrder: r.c[6]?.v != null ? Number(r.c[6]?.v) : 1,
        }));

        setProducts(parsed);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Sheet error:", err);
        setProducts(DEMO_PRODUCTS);
        setError("Using demo products");
        setLoading(false);
      });
  }, []);

  return { products, loading, error };
}
