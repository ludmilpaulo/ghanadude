import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface DesignState {
  brandLogo: string | null;
  customDesign: string | null;
  designerProduct: string | null;
  brandLogoQty: number;
  customDesignQty: number;
}

const initialState: DesignState = {
  brandLogo: null,
  customDesign: null,
  designerProduct: null,
  brandLogoQty: 1,
  customDesignQty: 1,
};

const designSlice = createSlice({
  name: 'design',
  initialState,
  reducers: {
    setBrandLogo: (state, action: PayloadAction<string | null>) => {
      state.brandLogo = action.payload;
    },
    setCustomDesign: (state, action: PayloadAction<string | null>) => {
      state.customDesign = action.payload;
    },
    setDesignerProduct: (state, action: PayloadAction<string | null>) => {
      state.designerProduct = action.payload;
    },
    setBrandLogoQty: (state, action: PayloadAction<number>) => {
      state.brandLogoQty = action.payload;
    },
    setCustomDesignQty: (state, action: PayloadAction<number>) => {
      state.customDesignQty = action.payload;
    },
    clearDesign: (state) => {
      state.brandLogo = null;
      state.customDesign = null;
      state.designerProduct = null;
      state.brandLogoQty = 1;
      state.customDesignQty = 1;
    },
  },
});

export const {
  setBrandLogo,
  setCustomDesign,
  setDesignerProduct,
  setBrandLogoQty,
  setCustomDesignQty,
  clearDesign,
} = designSlice.actions;

export const selectDesign = (state: RootState) => state.design;

export default designSlice.reducer;
