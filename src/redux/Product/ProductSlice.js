import { createSlice } from "@reduxjs/toolkit";

const productSlice = createSlice({
  name: "product",
  initialState: {
    products: null
  },
  reducers: {
    addProduct: (state, action) => {
      if(state.products)
        state.products = [action.payload, ...state.products];
      else
        state.products = action.payload;
      
    },
    deleteAll: (state) => {
      state.products = null;
    },
    deleteProduct: (state, action) => {
      const productIdToDelete = action.payload;
      state.products = state.products.filter(
        (product) => product.id !== productIdToDelete
      );
    },
    updateProduct: (state, action) => {
      const { newData, id } = action.payload;
      const index = state.products.findIndex(
        (product) => product.id === id
      );

      if (index !== -1) {
        state.products[index] = { ...state.products[index], ...newData };
      } else {
        console.warn(`Product with ID ${id} not found in the current state.`);
      }
    },
  },
});

export const {
  addProduct,
  deleteProduct,
  updateProduct,
  deleteAll,
  sortProductsByPrice,
  removeSort,
} = productSlice.actions;
export default productSlice.reducer;
