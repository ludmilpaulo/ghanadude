import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface DesignState {
  brandLogo: string | null
  customDesign: string | null
  brandLogoQty: number
  customDesignQty: number
}

const initialState: DesignState = {
  brandLogo: null,
  customDesign: null,
  brandLogoQty: 0,
  customDesignQty: 0
}

const designSlice = createSlice({
  name: 'design',
  initialState,
  reducers: {
    setBrandLogo: (state, action: PayloadAction<string | null>) => {
      state.brandLogo = action.payload
    },
    setCustomDesign: (state, action: PayloadAction<string | null>) => {
      state.customDesign = action.payload
    },
    setBrandLogoQty: (state, action: PayloadAction<number>) => {
      state.brandLogoQty = action.payload
    },
    setCustomDesignQty: (state, action: PayloadAction<number>) => {
      state.customDesignQty = action.payload
    },
    clearDesign: (state) => {
      state.brandLogo = null
      state.customDesign = null
      state.brandLogoQty = 0
      state.customDesignQty = 0
    }
  }
})

export const {
  setBrandLogo,
  setCustomDesign,
  setBrandLogoQty,
  setCustomDesignQty,
  clearDesign
} = designSlice.actions

export default designSlice.reducer
