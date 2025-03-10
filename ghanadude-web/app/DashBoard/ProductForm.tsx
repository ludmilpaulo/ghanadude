import { fetchCategories, fetchSizes, updateProduct, createProduct } from "@/services/adminService";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

interface Size {
  id: number;
  name: string;
}

interface Product {
  id?: number;
  name: string;
  category: string;
  description?: string;
  price: number;
  stock: number;
  season?: string;
  images?: FileList | { id: number; image: string }[];
  on_sale?: boolean;
  discount_percentage?: number;
  sizes?: string[];
}

interface Category {
  id: number;
  name: string;
}

const SEASON_CHOICES = [
  { value: "summer", label: "Summer" },
  { value: "winter", label: "Winter" },
  { value: "all_seasons", label: "All Seasons" },
];

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
  loadProducts: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onClose, loadProducts }) => {
  const { register, handleSubmit, watch, reset } = useForm<Product>();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newSize, setNewSize] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const [fetchedCategories, fetchedSizes]: [Category[], Size[]] = await Promise.all([
        fetchCategories(),
        fetchSizes(),
      ]);
      setCategories(fetchedCategories);
      setSizes(fetchedSizes);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (product) {
      reset(product);
    }
  }, [product, reset]);

  const onSubmit = async (data: Product) => {
    const formData = new FormData();
    formData.append("name", data.name.trim());
    formData.append("category", newCategory || data.category.trim());
    formData.append("description", data.description?.trim() || "");
    formData.append("price", data.price.toString());
    formData.append("stock", data.stock.toString());
    formData.append("season", data.season || "");

    if (data.images instanceof FileList) {
      Array.from(data.images).forEach((file) => formData.append("images", file));
    }

    formData.append("on_sale", data.on_sale ? "true" : "false");
    if (data.on_sale) {
      formData.append("discount_percentage", data.discount_percentage?.toString() || "0");
    }

    const allSizes = newSize ? [...(data.sizes || []), newSize] : data.sizes;
    allSizes?.forEach((size) => formData.append("sizes", size));

    try {
      if (data.id) {
        await updateProduct(data.id, formData);
      } else {
        await createProduct(formData);
      }
      alert("Product successfully saved.");
      onClose();
      loadProducts();
    } catch (error) {
      console.error(error);
      alert("Failed to save product. Please try again.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl p-6">
      <h2 className="text-2xl font-semibold mb-4">
        {product ? "Update Product" : "Add New Product"}
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register("name", { required: true })} className="w-full border border-gray-300 rounded p-2" placeholder="Product Name" />

        <select {...register("category")} className="w-full border border-gray-300 rounded p-2" defaultValue="">
          <option value="">Select a category</option>
          {categories.map((cat: Category) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>

        <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Or add new category" className="w-full border border-gray-300 rounded p-2" />

        <textarea {...register("description")} className="w-full border border-gray-300 rounded p-2" placeholder="Product Description" rows={4} />

        <input type="number" {...register("price", { required: true })} className="w-full border border-gray-300 rounded p-2" placeholder="Price" />
        <input type="number" {...register("stock", { required: true })} className="w-full border border-gray-300 rounded p-2" placeholder="Stock" />

        <select {...register("season")} className="w-full border border-gray-300 rounded p-2">
          <option value="">Select Season</option>
          {SEASON_CHOICES.map(season => (
            <option key={season.value} value={season.value}>{season.label}</option>
          ))}
        </select>

        <input type="file" multiple {...register("images")} className="w-full border border-gray-300 rounded p-2" />

        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("on_sale")} />
          On Sale
        </label>

        {watch("on_sale") && (
          <input {...register("discount_percentage", { min: 1, max: 100 })} type="number" className="w-full border border-gray-300 rounded p-2" placeholder="Discount Percentage" />
        )}

        <div>
          <p className="font-medium">Select Sizes:</p>
          <div className="flex gap-4 flex-wrap">
            {sizes.map((size: Size) => (
              <label key={size.id} className="flex gap-1 items-center">
                <input type="checkbox" value={size.name} {...register("sizes")} />
                {size.name}
              </label>
            ))}
          </div>

          <input
            placeholder="Or add new size"
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 mt-2"
          />
        </div>

        <button className="w-full bg-blue-500 text-white p-2 rounded font-semibold hover:bg-blue-600 transition duration-200" type="submit">
          {product ? "Update Product" : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
