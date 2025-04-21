import React from "react";
import Image from "next/image";

interface Product {
  month: string;
  product_name: string;
  product_image: string | null;
}

interface Props {
  labels: string[];
  topProducts: Product[];
}

const TopProductGrid: React.FC<Props> = ({ labels, topProducts }) => {
  return (
    <>
      <h3 className="text-lg font-semibold mt-6 mb-2">🏆 Top Products</h3>
      <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        {labels.map((label) => {
          const product = topProducts.find((p) => p.month === label);
          return (
            <li key={label} className="bg-gray-100 p-3 rounded text-center">
              <div className="font-semibold mb-1">{label}</div>
              {product ? (
                <>
                  {product.product_image ? (
                    <Image
                      src={product.product_image}
                      alt={product.product_name}
                      width={60}
                      height={60}
                      className="mx-auto my-2 object-cover rounded"
                    />
                  ) : (
                    <div className="italic text-gray-400">No image</div>
                  )}
                  <div className="font-medium">{product.product_name}</div>
                </>
              ) : (
                <div className="italic text-gray-400">No data</div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default TopProductGrid;
