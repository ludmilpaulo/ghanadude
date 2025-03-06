import React, { useEffect, useState } from "react";
import { Transition } from "@headlessui/react";
import ProductForm from "./ProductForm";
import { deleteProduct, fetchProducts } from "@/services/adminService";
import Image from "next/image";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  images: string[];
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const productsData = await fetchProducts();
      console.log("product data", productsData);
  
      const formattedProducts = productsData.map((product: Product) => ({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        images: Array.isArray(product.images) ? product.images : [],
      }));
  
      setProducts(formattedProducts);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: number) => {
    await deleteProduct(id);
    setProducts(products.filter((product) => product.id !== id));
  };

  const handleAddProduct = () => {
    setCurrentProduct(null);
    setShowPopup(true);
  };

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setShowPopup(true);
  };

  const closeModal = () => {
    setShowPopup(false);
    loadData();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Products</h1>

      <Transition show={loading}>
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div className="w-16 h-16 border-t-4 border-b-4 border-white rounded-full animate-spin"></div>
        </div>
      </Transition>

      {error && <p className="text-red-500">Error: {error}</p>}

      <button className="bg-blue-500 text-white px-4 py-2 mb-4 rounded" onClick={handleAddProduct}>
        Add New Product
      </button>

      <table className="w-full table-auto bg-white shadow-md rounded">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="px-4 py-2">Image</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2">Price</th>
            <th className="px-4 py-2">Stock</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b">
              <td className="px-4 py-2">
                {product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    width={64}
                    height={64}
                    className="object-cover rounded"
                  />
                ) : (
                  <span>No Image</span>
                )}
              </td>
              <td className="px-4 py-2">{product.name}</td>
              <td className="px-4 py-2">{product.category}</td>
              <td className="px-4 py-2">{product.price.toFixed(2)}</td>
              <td className="px-4 py-2">{product.stock}</td>
              <td className="px-4 py-2">
                <button className="bg-green-500 text-white px-4 py-2 mr-2 rounded" onClick={() => handleEditProduct(product)}>
                  Edit
                </button>
                <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={() => handleDelete(product.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 overflow-auto">
          <div className="bg-white p-8 rounded shadow-md w-1/2 overflow-auto max-h-full">
            <button className="bg-red-500 text-white px-4 py-2 rounded mb-4" onClick={() => setShowPopup(false)}>
              Close
            </button>
            <ProductForm product={currentProduct} onClose={closeModal} loadProducts={loadData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
