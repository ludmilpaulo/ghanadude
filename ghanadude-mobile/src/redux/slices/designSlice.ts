import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface DesignState {
  brandLogo: string | null;
  customDesign: string | null;
  designerProduct: string | null;
}

const initialState: DesignState = {
  brandLogo: null,
  customDesign: null,
  designerProduct: null,
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
    clearDesign: (state) => {
      state.brandLogo = null;
      state.customDesign = null;
      state.designerProduct = null;
    },
  },
});

export const { setBrandLogo, setCustomDesign, setDesignerProduct, clearDesign } =
  designSlice.actions;

export const selectDesign = (state: RootState) => state.design;

export default designSlice.reducer;
