import {
  fetchCategories,
  fetchSizes,
  updateProduct,
  createProduct,
} from "@/services/adminService";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Transition } from "@headlessui/react";

interface Size {
  id: number;
  name: string;
}

interface Product {
  id?: number;
  name: string;
  gender?: string;
  category: string;
  description?: string;
  price: number;
  stock: number;
  season?: string;
  images?: { id: number; image: string }[];
  on_sale?: boolean;
  bulk_sale?: boolean;
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

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onClose,
  loadProducts,
}) => {
  const { register, handleSubmit, watch, reset } = useForm<Product>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [existingImages, setExistingImages] = useState<Product["images"]>([]);
  const [newImages, setNewImages] = useState<FileList | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [newSize, setNewSize] = useState("");
  const [loading, setLoading] = useState(false);

  const GENDER_CHOICES = [
    { value: "unisex", label: "Unisex" },
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
  ];
  

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [fetchedCategories, fetchedSizes] = await Promise.all([
          fetchCategories(),
          fetchSizes(),
        ]);
        setCategories(fetchedCategories);
        setSizes(fetchedSizes);
      } catch (error) {
        console.error("Error loading categories or sizes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (product) {
      reset(product);
      setExistingImages(product.images || []);
    }
  }, [product, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewImages(e.target.files);
  };

  const onSubmit = async (data: Product) => {
    const formData = new FormData();
    setLoading(true);

    try {
      formData.append("name", data.name.trim());
      formData.append("category", newCategory.trim() || data.category.trim());
      formData.append("description", data.description?.trim() || "");
      formData.append("price", data.price.toString());
      formData.append("stock", data.stock.toString());
      formData.append("season", data.season || "");
      formData.append("on_sale", data.on_sale ? "true" : "false");
      formData.append("bulk_sale", data.bulk_sale ? "true" : "false");
      formData.append("gender", data.gender || "unisex");


      if (data.on_sale) {
        formData.append(
          "discount_percentage",
          data.discount_percentage?.toString() || "0",
        );
      }

      const combinedSizes = data.sizes || [];
      if (newSize.trim()) combinedSizes.push(newSize.trim());
      combinedSizes.forEach((size) => formData.append("sizes", size));

      existingImages?.forEach((img) =>
        formData.append("existing_images", img.id.toString()),
      );

      if (newImages) {
        Array.from(newImages).forEach((file) =>
          formData.append("images", file),
        );
      }

      if (product?.id) {
        await updateProduct(product.id, formData);
      } else {
        await createProduct(formData);
      }

      alert("Product successfully saved.");
      onClose();
      loadProducts();
    } catch (error) {
      console.error(error);
      alert("Failed to save product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl p-6">
      <h2 className="text-2xl font-semibold mb-4">
        {product ? "Update Product" : "Add New Product"}
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          {...register("name", { required: true })}
          className="w-full border rounded p-2"
          placeholder="Product Name"
        />

        <select {...register("category")} className="w-full border rounded p-2">
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>

        <input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="Or enter new category name"
        />

        <select {...register("season")} className="w-full border rounded p-2">
          <option value="">Select Season</option>
          {SEASON_CHOICES.map((season) => (
            <option key={season.value} value={season.value}>
              {season.label}
            </option>
          ))}
        </select>

        <select {...register("gender")} className="w-full border rounded p-2">
        <option value="">Select Gender</option>
        {GENDER_CHOICES.map((gender) => (
          <option key={gender.value} value={gender.value}>
            {gender.label}
          </option>
        ))}
      </select>

        <textarea
          {...register("description")}
          className="w-full border rounded p-2"
          placeholder="Description"
          rows={4}
        />

        <input
          type="number"
          {...register("price", { required: true })}
          className="w-full border rounded p-2"
          placeholder="Price"
        />
        <input
          type="number"
          {...register("stock", { required: true })}
          className="w-full border rounded p-2"
          placeholder="Stock"
        />

        <div className="flex items-center gap-4">
          <label>
            <input type="checkbox" {...register("on_sale")} /> On Sale
          </label>
          <label>
            <input type="checkbox" {...register("bulk_sale")} /> Bulk Sale
          </label>
        </div>

        {watch("on_sale") && (
          <input
            type="number"
            {...register("discount_percentage")}
            className="w-full border rounded p-2"
            placeholder="Discount %"
          />
        )}

        <div>
          <p className="font-medium">Select Sizes:</p>
          <div className="flex gap-4 flex-wrap">
            {sizes.map((size) => (
              <label key={size.id} className="flex gap-1 items-center">
                <input
                  type="checkbox"
                  value={size.name}
                  {...register("sizes")}
                />
                {size.name}
              </label>
            ))}
          </div>
          <input
            type="text"
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
            className="w-full border rounded p-2 mt-2"
            placeholder="Or enter new size name"
          />
        </div>

        <input
          type="file"
          multiple
          onChange={handleImageChange}
          className="w-full border rounded p-2"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded font-semibold hover:bg-blue-600 disabled:opacity-50"
        >
          {product ? "Update" : "Create"}
        </button>
      </form>

      <Transition
        show={loading}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div className="w-16 h-16 border-t-4 border-b-4 border-white rounded-full animate-spin" />
        </div>
      </Transition>
    </div>
  );
};

export default ProductForm;
