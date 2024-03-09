// productSlice.js
import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cartList: [], // Updated list based on sorting/filtering
  },
  reducers: {
    addToCart: (state, action) => {
      const productIdToAdd = action.payload.id;

      // Check if the product already exists in the cart
      const isProductInCart = state.cartList.some(
        (item) => item.id === productIdToAdd
      );

      if (!isProductInCart) {
        // If the product is not already in the cart, add it
        state.cartList = [action.payload, ...state.cartList];
      } 
    },
    removeFromCart: (state, action) => {
      const productIdToDelete = action.payload;

      state.cartList = state.cartList.filter(
        (product) => product.id !== productIdToDelete
      );
    },
  },
});

export const { addToCart, removeFromCart } = cartSlice.actions;
export default cartSlice.reducer;
