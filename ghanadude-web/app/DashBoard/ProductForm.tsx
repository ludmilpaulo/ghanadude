"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/slices/authSlice";
import { RootState } from "@/redux/store";
import { updateProduct, createProduct, fetchCategories } from "@/services/adminService";
import dynamic from "next/dynamic"; // for dynamic import

// Dynamically import React-Quill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

import "react-quill/dist/quill.snow.css"; // import styles

interface Category {
  id: number;
  name: string;
}

interface ProductFormProps {
  product?: any;
  onClose: () => void;
  loadProducts: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onClose, loadProducts }) => {
  const [name, setName] = useState(product?.name || "");
  const [category, setCategory] = useState(product?.category || "");
  const [newCategory, setNewCategory] = useState("");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product?.price || "");
  const [stock, setStock] = useState(product?.stock || "");
  const [images, setImages] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isClient, setIsClient] = useState(false);

  const user = useSelector((state: RootState) => selectUser(state));
  const token = user?.token;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsClient(true); // Only run on client-side
    }

    // Fetch categories
    const fetchData = async () => {
      const fetchedCategories: Category[] = await fetchCategories();
      setCategories(fetchedCategories);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("name", name);

    if (newCategory.trim()) {
      formData.append("category", newCategory.trim());
    } else {
      formData.append("category", category);
    }

    formData.append("description", description);
    formData.append("price", price);
    formData.append("stock", stock);

    if (images) {
      for (let i = 0; i < images.length; i++) {
        formData.append("uploaded_images", images[i]);
      }
    }

    try {
      if (product) {
        await updateProduct(product.id, formData);
      } else {
        await createProduct(formData);
      }
      setLoading(false);
      alert("Product successfully added/updated.");
      onClose();
      loadProducts();
    } catch (error) {
      setLoading(false);
      alert("Failed to add/update product. Please try again.");
    }
  };

  return (
    <div className="relative p-5 bg-white shadow-lg rounded-lg">
      {loading && (
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-bold">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="text-sm font-bold">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border rounded">
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-bold">Or Enter New Category</label>
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Type new category name"
          />
        </div>

        {/* Only render ReactQuill if it's client-side */}
        {isClient && (
          <div>
            <label className="text-sm font-bold">Description</label>
            <ReactQuill value={description} onChange={setDescription} className="w-full" />
          </div>
        )}

        <div>
          <label className="text-sm font-bold">Price</label>
          <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="text-sm font-bold">Stock</label>
          <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="text-sm font-bold">Images</label>
          <input type="file" multiple onChange={(e) => setImages(e.target.files)} className="w-full p-2 border rounded" />
        </div>

        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
          {product ? "Update Product" : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
