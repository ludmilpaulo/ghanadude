import { RootState } from "../store";

// redux/selectors.ts
export const selectFilteredProducts = (
  state: RootState,
  category: string,
  query: string,
  gender: string
) => {
  let items = [...state.products.products];

  if (category !== "all") {
    items = items.filter(p => p.category?.toLowerCase() === category.toLowerCase());
  }

  if (gender !== "all") {
    items = items.filter(p => p.gender?.toLowerCase() === gender.toLowerCase());
  }

  if (query) {
    items = items.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
  }

  return items;
};
