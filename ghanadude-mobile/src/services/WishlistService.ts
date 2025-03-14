import { API_BASE_URL } from "./AuthService";

export const getWishlist = async (token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/wishlist/`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch wishlist");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return [];
  }
};

export const addToWishlist = async (token: string, productId: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/wishlist/add/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product_id: productId }),
    });

    if (!response.ok) {
      throw new Error("Failed to add to wishlist");
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return null;
  }
};

export const removeFromWishlist = async (token: string, productId: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/wishlist/remove/${productId}/`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to remove from wishlist");
    }

    return await response.json();
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return null;
  }
};
