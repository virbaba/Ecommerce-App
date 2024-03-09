// authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
  },
  reducers: {
    signIn: (state, action) => {
      state.user = action.payload;
    },
    signOut: (state) => {
      state.user = null;
    },
    updateProfile: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const { signIn, signOut, updateProfile } = authSlice.actions;
export default authSlice.reducer;