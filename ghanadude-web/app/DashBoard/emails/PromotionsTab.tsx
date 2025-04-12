"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { fetchProducts } from "@/services/adminService";
import { baseAPI } from "@/utils/variables";
import { CheckCircle2, Loader2, Search } from "lucide-react";
import { motion } from "framer-motion";

interface ProductImage {
  id: number;
  image: string;
}

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  on_sale: boolean;
  bulk_sale: boolean;
  images: ProductImage[];
}

const PromotionsTab: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    try {
      const productsData = await fetchProducts();
      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const lower = search.toLowerCase();
      setFilteredProducts(
        products.filter((p) => p.name.toLowerCase().includes(lower))
      );
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, products]);

  const sendPromotion = async () => {
    if (!selectedProductId) return;
    setSending(true);
    setMessage("");
    try {
      await axios.post(`${baseAPI}/api/send-promotional-email/`, { product_id: selectedProductId });
      setMessage("✅ Promotional emails sent successfully!");
    } catch {
      setMessage("❌ Failed to send promotional emails.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">📢 Send Product Promotion</h3>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32 text-gray-500">
          <Loader2 className="animate-spin mr-2" /> Loading products...
        </div>
      ) : error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-center text-gray-500">No products found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const isSelected = selectedProductId === product.id;
            return (
              <motion.div
                key={product.id}
                className={`relative border rounded-2xl p-4 bg-white shadow-sm cursor-pointer transition duration-300 ${
                  isSelected ? "border-blue-600 ring-2 ring-blue-300" : "hover:shadow-md"
                }`}
                onClick={() => setSelectedProductId(product.id)}
                whileHover={{ scale: 1.02 }}
              >
                {isSelected && (
                  <CheckCircle2 className="absolute top-2 right-2 text-blue-600 w-6 h-6" />
                )}
                {product.images?.[0]?.image ? (
                  <Image
                    src={product.images[0].image}
                    alt={product.name}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 rounded-xl">
                    No Image
                  </div>
                )}
                <div className="mt-4">
                  <h4 className="text-lg font-semibold text-gray-900 truncate">{product.name}</h4>
                  <p className="text-sm text-gray-500">R{product.price}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="mt-10 flex flex-col items-center">
        <Button
          onClick={sendPromotion}
          disabled={sending || !selectedProductId}
          className="w-full max-w-xs bg-green-600 hover:bg-green-700 text-white"
        >
          {sending ? (
            <>
              <Loader2 className="animate-spin mr-2 w-4 h-4" /> Sending...
            </>
          ) : (
            "Send Promotion"
          )}
        </Button>

        {message && (
          <p
            className={`text-sm mt-4 ${
              message.includes("✅") ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default PromotionsTab;
