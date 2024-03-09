// store.js
import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import productReducer from "./Product/ProductSlice";
import authReducer from "./User/AuthSlice";
import CartReducer from "./Product/CartSlice";

const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = {
  auth: persistReducer(persistConfig, authReducer),
  product: persistReducer(persistConfig, productReducer),
  cart: persistReducer(persistConfig, CartReducer),
};

export const store = configureStore({
  reducer: rootReducer,
});

export const persistor = persistStore(store);
