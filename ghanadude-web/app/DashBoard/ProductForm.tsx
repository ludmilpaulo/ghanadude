import { fetchCategories, updateProduct, createProduct } from "@/services/adminService";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

interface Product {
  id?: number;
  name: string;
  category: string;
  description?: string;
  price: number;
  stock: number;
  season?: string;
  images?: FileList | { id: number; image: string }[]; // Union type for images
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
  const { register, handleSubmit, setValue, watch } = useForm<Product>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const fetchedCategories: Category[] = await fetchCategories();
      setCategories(fetchedCategories);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (product) {
      Object.keys(product).forEach((key) => setValue(key as keyof Product, product[key as keyof Product]));
    }
  }, [product, setValue]);

  const onSubmit = async (data: Product) => {
    setLoading(true);
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value) {
        if (key === "images" && value instanceof FileList) {
          for (const file of value) {
            formData.append("uploaded_images", file);
          }
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    try {
      if (product) {
        await updateProduct(product.id!, formData);
      } else {
        await createProduct(formData);
      }
      alert("Product successfully added/updated.");
      onClose();
      loadProducts();
    } catch (error) {
      alert("Failed to add/update product. Please try again.");
      console.error("Error:", error);
    }
    setLoading(false);
  };

  const selectedCategory = watch("category");

  return (
    <div className="relative p-5 bg-white shadow-lg rounded-lg">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register("name")} placeholder="Product Name" className="w-full p-2 border rounded" />

        <select {...register("category")} className="w-full p-2 border rounded">
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
          <option value="other">Other</option>
        </select>

        {selectedCategory === "other" && (
          <input {...register("description")} placeholder="Enter new category" className="w-full p-2 border rounded" />
        )}

        <textarea {...register("description")} placeholder="Product Description" className="w-full p-2 border rounded" rows={4} />

        <input type="text" {...register("price")} placeholder="Price" className="w-full p-2 border rounded" />
        <input type="number" {...register("stock")} placeholder="Stock" className="w-full p-2 border rounded" />

        <select {...register("season")} className="w-full p-2 border rounded">
          <option value="">Select Season</option>
          {SEASON_CHOICES.map((season) => (
            <option key={season.value} value={season.value}>{season.label}</option>
          ))}
        </select>

        <input type="file" {...register("images")} multiple className="w-full p-2 border rounded" />

        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
          {product ? "Update Product" : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
