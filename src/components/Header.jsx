import React from "react";
import { Link, useNavigate } from "react-router-dom/dist";
import { useSelector } from "react-redux";

function Header() {
  const navigate = useNavigate();
  
  const user = useSelector((state) => state.auth.user);
  return (
    <>
      {/* Header */}
      <header className="bg-slate-200 shadow-md sticky top-0">
        <div className="flex justify-between items-center max-w-6xl mx-auto p-3">
          {/*  Web site name */}
          <div className="flex justify-between items-center w-96">
            <h1 className="font-bold text-sm sm:text:xl flex flex-wrap">
              <span className="text-slate-500 text-xl">Ecommerce </span>
              <span className="text-slate-700">App</span>
            </h1>

            {user && (
              <>
                <h1>
                  <Link to="/" className="text-slate-600">
                    Products
                  </Link>
                </h1>
                <h1>
                  <Link to={"/create-product"} className="text-slate-600">
                    Add Product +
                  </Link>
                </h1>
              </>
            )}
          </div>

          <ul className="flex gap-4">
            {user && (
              <>
                <li className="text-slate-600">{user.username}</li>
                <li id="add-cart">
                  <Link to="/cart">
                    <i
                      style={{ color: "#1d2f4e" }}
                      className="cursor-pointer fa-solid fa-cart-shopping fa-xl"
                      title="Add to cart"
                    ></i>
                  </Link>
                </li>
                <li>
                  <Link to="/profile">
                    <img
                      src={user.avatar}
                      alt="No Image"
                      className="rounded-full h-10 w-10 object-cover"
                    />
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </header>
    </>
  );
}

export default Header;
