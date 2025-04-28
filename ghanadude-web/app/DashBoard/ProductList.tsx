import React, { useEffect, useState } from "react";
import ProductForm from "./ProductForm";
import { deleteProduct, fetchProducts } from "@/services/adminService";
import Image from "next/image";

interface Product {
  id: number;
  name: string;
  category: string;
  gender?: string;
  price: number;
  stock: number;
  on_sale: boolean;
  bulk_sale: boolean;
  images?: { id: number; image: string }[];
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const PRODUCTS_PER_PAGE = 5;

  const loadProducts = async () => {
    setLoading(true);
    try {
      const productsData = await fetchProducts();
      console.log("product data", productsData);
      setProducts(productsData);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const confirmAndDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(id);
      loadProducts();
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    loadProducts();
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE,
  );

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-semibold">Products</h1>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or category"
            className="border rounded px-4 py-2 w-full sm:w-64"
          />
          <button
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            onClick={() => {
              setCurrentProduct(null);
              setModalOpen(true);
            }}
          >
            Add New Product
          </button>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-30 z-50">
          <div className="animate-spin h-12 w-12 border-4 border-t-blue-500 border-gray-300 rounded-full"></div>
        </div>
      )}

      {error && <p className="text-red-600 mb-4">Error: {error}</p>}

      <div className="overflow-auto rounded shadow">
        <table className="w-full bg-white text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">On Sale</th>
              <th className="px-4 py-3">Bulk Sale</th>
              <th className="px-4 py-3">Gender</th>
              <th className="px-4 py-3">Actions</th>
             

            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((product) => (
              <tr key={product.id} className="even:bg-gray-50">
                <td className="px-4 py-3">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0].image}
                      alt={product.name}
                      width={60}
                      height={60}
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 italic">No Image</span>
                  )}
                </td>
                <td className="px-4 py-3 font-medium">{product.name}</td>
                <td className="px-4 py-3">{product.category}</td>
                <td className="px-4 py-3">R{product.price}</td>
                <td className="px-4 py-3">{product.stock}</td>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={product.on_sale} readOnly />
                </td>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={product.bulk_sale} readOnly />
                </td>
                <td className="px-4 py-3 capitalize">{product.gender || "Unisex"}</td>

                <td className="px-4 py-3 flex gap-2">
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition"
                    onClick={() => {
                      setCurrentProduct(product);
                      setModalOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
                    onClick={() => confirmAndDelete(product.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-2 mt-6">
        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (page) => (
            <button
              key={page}
              className={`px-3 py-1 border rounded shadow-sm text-sm font-medium transition ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-800 hover:bg-blue-100"
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ),
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 overflow-auto">
          <div className="bg-white p-8 rounded shadow-md w-11/12 sm:w-2/3 lg:w-1/2 max-h-screen overflow-y-auto">
            <button
              className="bg-red-500 text-white px-4 py-2 rounded mb-4"
              onClick={closeModal}
            >
              Close
            </button>
            <ProductForm
              product={currentProduct}
              onClose={closeModal}
              loadProducts={loadProducts}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
