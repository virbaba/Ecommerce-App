import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import RatingStars from "../util/RatingStars";
import { removeFromCart } from "../redux/Product/CartSlice";
import { GlobalData } from "../App";

function Cart() {
  const user = useSelector((state) => state.auth.user);
  const cartList = useSelector((state) => state.cart.cartList);
  const [loading, setLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const dispatch = useDispatch();

  const { setNotificationMessage } = useContext(GlobalData);

  // removing from cart
  const removingFromCart = (id) => {
    setLoading(true);
    dispatch(removeFromCart(id));
    setNotificationMessage("Removed Successfully")
    setLoading(false);
  };

  useEffect(() => {
    // Calculate the total price using reduce
    const newTotalPrice = cartList.reduce(
      (accumulator, product) => Number(accumulator) + Number(product.price),
      0
    );
    setTotalPrice(newTotalPrice);
  }, [cartList]);

  return (
    <>
      {user && cartList && (
        <>
          <div className="container mx-auto mt-8 p-8 bg-slate-600 rounded-lg shadow-lg">
            <div className="flex justify-between">
              <h2 className="text-2xl font-bold mb-4 text-white">Products</h2>
              <h2 className="text-2xl font-bold mb-4 text-white">
                Total Price : {totalPrice}
              </h2>
            </div>
            <ul>
              {cartList.map((product) => (
                <li
                  key={product.id}
                  className="mb-2 container mx-auto mt-4 p-8 bg-slate-200 rounded-lg shadow-lg flex justify-between"
                >
                  <div id="image-section">
                    <img
                      src={product.image}
                      alt=""
                      className="outline-none h-40 w-80"
                    />
                  </div>
                  <div
                    id="price-section"
                    className="flex flex-col justify-between w-60 container "
                  >
                    <p id="price-title">
                      <span className="text-justify text-slate-800">
                        {product.title}
                      </span>
                      <br />
                      <span className="text-slate-600">
                        Price: {product.price}
                      </span>
                    </p>
                    <p id="rating">
                      <RatingStars rating={product.rate} />
                      {" " + product.rate}
                    </p>
                  </div>
                  <div
                    id="description-section"
                    className="flex flex-col justify-between w-96 container "
                  >
                    <div id="description" className="text-justify">
                      {product.description}
                    </div>
                    <div
                      id="update-delete-addcart-section"
                      className="flex justify-between mt-5 w-60 ml-40 mr-10"
                    >
                      <div id="add-cart">
                        <button
                          className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"
                          onClick={() => removingFromCart(product.id)}
                        >
                          {loading ? "Removing..." : "Remove"}
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </>
  );
}

export default Cart;
