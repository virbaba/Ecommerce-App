import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import SignUp from "./pages/Users/SignUp";
import SignIn from "./pages/Users/SignIn";
import Profile from "./pages/Users/Profile";
import ProductList from "./components/ProductList";
import CreateProduct from "./components/CreateProduct";
import Cart from "./components/Cart";

import { createContext } from "react";

export const GlobalData = createContext();
 
function App() {
  const [notificationMessage, setNotificationMessage] = useState("");

  useEffect(() => {
    // Clear the notification message after 5 seconds
    const timeoutId = setTimeout(() => {
      setNotificationMessage("");
    }, 3000);

    // Cleanup the timeout when the component unmounts or when notificationMessage changes
    return () => clearTimeout(timeoutId);
  }, [notificationMessage]);

  return (
    <>
      {notificationMessage && (
        <div
          className="p-4 mb-4 text-sm  rounded-lg bg-slate-800 text-white z-10 absolute top-5 right-5 w-96"
          role="alert"
        >
          <span className="font-medium">{notificationMessage}</span>
        </div>
      )}
      <GlobalData.Provider
        value={{ notificationMessage, setNotificationMessage }}
      >
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/create-product" element={<CreateProduct />} />
            <Route path="/cart" element={<Cart />} />

            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </BrowserRouter>
      </GlobalData.Provider>
    </>
  );
}

export default App;
