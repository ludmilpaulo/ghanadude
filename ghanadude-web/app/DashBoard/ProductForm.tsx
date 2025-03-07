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
  images?: FileList | { id: number; image: string }[];
  on_sale?: boolean;
  discount_percentage?: number;
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
  const { register, handleSubmit, setValue, watch, getValues } = useForm<Product>();
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

  // Handle form submission
  const onSubmit = async () => {
    setLoading(true);
    const formData = new FormData();

    // Function to clean and trim values, with added logic for handling numbers
    const cleanValue = (value: string | string[] | number | undefined) => {
      if (Array.isArray(value)) {
        return value.length > 0 ? value[0].toString().trim() : "";
      } else if (typeof value === "number") {
        return value.toString();
      }
      return value ? value.toString().trim() : "";
    };

    formData.append("name", cleanValue(watch("name")));
    formData.append("category", cleanValue(watch("category")));
    formData.append("description", cleanValue(watch("description")));
    formData.append("price", cleanValue(watch("price"))); // Ensure valid number
    formData.append("stock", cleanValue(watch("stock"))); // Ensure valid integer
    formData.append("season", cleanValue(watch("season"))); // Ensure no [""]

    // Handling images
    const images = watch("images");
    if (images && images instanceof FileList) {
        for (let i = 0; i < images.length; i++) {
            formData.append("images", images[i]);
        }
    }

    // Handle on_sale and discount_percentage logic
    const onSale = watch("on_sale");
    if (onSale) {
      const discountPercentage = watch("discount_percentage");
      if (discountPercentage && discountPercentage > 0 && discountPercentage <= 100) {
        const price = getValues("price");
        const discountedPrice = price - (price * discountPercentage) / 100;
        formData.append("price", discountedPrice.toString()); // Apply discount to price
      } else {
        alert("Please enter a valid discount percentage.");
        setLoading(false);
        return;
      }
    }
    console.log("on_sale:", watch("on_sale"));
    console.log("discount_percentage:", watch("discount_percentage"));


    // Debugging: Log the actual values being sent
    console.log("FormData being sent:");
    for (const pair of formData.entries()) {
        console.log(`${pair[0]}:`, pair[1]);
    }

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
        <input {...register("name", { required: true })} placeholder="Product Name" className="w-full p-2 border rounded" />

        <select {...register("category", { required: true })} className="w-full p-2 border rounded">
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

        <input type="number" {...register("price", { required: true, valueAsNumber: true })} placeholder="Price" className="w-full p-2 border rounded" />
        <input type="number" {...register("stock", { required: true, valueAsNumber: true })} placeholder="Stock" className="w-full p-2 border rounded" />

        <select {...register("season")} className="w-full p-2 border rounded">
          <option value="">Select Season</option>
          {SEASON_CHOICES.map((season) => (
            <option key={season.value} value={season.value}>{season.label}</option>
          ))}
        </select>

        <input type="file" {...register("images")} multiple className="w-full p-2 border rounded" />

        <div>
          <label>
            <input 
              type="checkbox" 
              {...register("on_sale")} 
              className="mr-2"
            />
            On Sale
          </label>
        </div>

        {watch("on_sale") && (
          <div>
            <label>Discount Percentage</label>
            <input
              type="number"
              {...register("discount_percentage")}
              className="w-full p-2 border rounded"
              placeholder="Discount Percentage"
              min={1}
              max={100}
            />
          </div>
        )}

        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
          {product ? "Update Product" : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
