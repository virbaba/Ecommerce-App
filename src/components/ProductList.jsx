import React, { useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  addProduct,
  deleteProduct,
  updateProduct,
} from "../redux/Product/ProductSlice";

import { addToCart } from "../redux/Product/CartSlice.js";

import axios from "axios";
import RatingStars from "../util/RatingStars";
import {
  getFirestore,
  deleteDoc,
  getDocs,
  query,
  collection,
  where,
  updateDoc,
} from "firebase/firestore";

import {
  uploadBytes,
  ref,
  getStorage,
  deleteObject,
  getDownloadURL,
} from "firebase/storage";

import app from ".././firebase.js";

import { GlobalData } from "../App.jsx";

function ProductList() {
  const [file, setFile] = useState(undefined);

  const titleRef = useRef(null);
  const priceRef = useRef(null);
  const ratingRef = useRef(null);
  const descriptionRef = useRef(null);

  const user = useSelector((state) => state.auth.user);
  const products = useSelector((state) => state.product.products);
  const cartList = useSelector((state) => state.cart.cartList);

  const [productList, setProductList] = useState([]);

  const [loading, setLoading] = useState(false);
  const { setNotificationMessage } = useContext(GlobalData);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Track the currently editing product ID
  const [editingProductId, setEditingProductId] = useState(null);

  // sort by price state
  const [isSortByPrice, setIsSortByPrice] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!products) {
        try {
          const response = await axios.get("https://fakestoreapi.com/products");

          const apiProducts = response.data.map((product) => ({
            id: product.id,
            title: product.title,
            price: product.price,
            rate: product.rating.rate,
            description: product.description,
            image: product.image,
          }));

          const firebaseProducts = await fetchFirebaseProducts();

          if (firebaseProducts && firebaseProducts.length > 0) {
            const combinedProducts = [...firebaseProducts, ...apiProducts];
            setProductList(combinedProducts);
            dispatch(addProduct(combinedProducts));
          } else {
            setProductList(apiProducts);
            dispatch(addProduct(apiProducts));
          }
        } catch (error) {
          console.error("Error fetching product data:", error);
        }
      }
    };

    const fetchFirebaseProducts = async () => {
      try {
        const db = getFirestore(app);
        const productsCollection = collection(db, "products");
        const querySnapshot = await getDocs(productsCollection);
        const productsData = querySnapshot.docs.map((doc) => {
          const data = doc.data();

          console.log("Document data:", data);

          return {
            id: data.id,
            title: data.title,
            price: data.price,
            rate: data.rate,
            description: data.description,
            image: data.image,
          };
        });

        return productsData;
      } catch (err) {
        console.log("error coming Product List", err.message);
      }
    };

    if (user) {
      fetchData();
      if (!productList) setProductList(productList);
    } else {
      navigate("/sign-in");
    }
  }, [user, navigate, dispatch, products, productList]);

  useEffect(() => {
    if (productList.length == 0) setProductList(products);
  }, []);

  const removeProduct = async (id) => {
    try {
      const db = getFirestore(app);
      const productsCollection = collection(db, "products");

      const q = query(productsCollection, where("id", "==", id));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await deleteDoc(docRef);

        const storage = getStorage(app);
        const storageRef = ref(storage, `${title}/${id}`);
        await deleteObject(storageRef);
      }

      dispatch(deleteProduct(id));
      // update also productList
      setProductList(productList.filter((product) => product.id !== id));
      setNotificationMessage("Product deleted successfully");
    } catch (error) {
      setNotificationMessage("Error deleting product: " + error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const setEditId = (id) => {
    setEditingProductId(id);
  };

  const updateProductById = async (id) => {
    const product = products.find((product) => product.id === id);

    let avatarURL = product.image;
    const title = titleRef.current.value || product.title;
    const price = priceRef.current.value || product.price;
    const rate = ratingRef.current.value || product.rate;
    const description = descriptionRef.current.value || product.description;

    let newData = {
      id,
      image: avatarURL,
      title,
      price,
      rate,
      description,
    };

    try {
      setLoading(true);
      const storage = getStorage(app);
      const db = getFirestore(app);

      const productsCollection = collection(db, "products");

      // Query the collection for documents with the specified id
      const q = query(productsCollection, where("id", "==", id));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;

        if (file) {
          const storageRef = ref(storage, `image/${id}`);

          // Upload the avatar to Firebase Storage
          await uploadBytes(storageRef, file);

          // Get the download URL of the uploaded avatar
          avatarURL = await getDownloadURL(storageRef);

          newData.image = avatarURL;
        }

        // Update the document with the new data
        await updateDoc(docRef, newData);
      }
      dispatch(updateProduct({ newData, id }));
      const index = productList.findIndex((product) => product.id === id);

      if (index !== -1) {
        let updatedProductList = [...productList];

        // Update the specific product using spread syntax
        updatedProductList[index] = {
          ...updatedProductList[index],
          ...newData,
        };

        // Update the state with the new productList
        setProductList(updatedProductList);
      }
      setEditingProductId(-1);
      setNotificationMessage("Product updated successfully.");
    } catch (err) {
      setNotificationMessage("Error updating document:" + err.message);
    } finally {
      setLoading(false);
    }
  };

  // adding product to cart
  const addingToCart = async (id) => {
    if (cartList) {
      const index = cartList.findIndex((product) => product.id === id);

      if (index !== -1) {
        setNotificationMessage("Already Added");
        return;
      }
    }
    setLoading(true);
    const product = products.find((product) => product.id === id);
    dispatch(addToCart(product));
    setNotificationMessage("Adding Successfully");
    setLoading(false);
  };

  // sort by price
  const sortByPrice = async () => {
    // Create a new array and sort it based on the price
    setIsSortByPrice(true);
    if (products) {
      // Sort the products by price
      const sortedProducts = [...products].sort((a, b) => a.price - b.price);
      // Set the sorted products to the productList state
      setProductList(sortedProducts);
      setNotificationMessage("Sorted");
    }
  };

  // removing sort
  const removingSort = () => {
    setIsSortByPrice(false);
    setProductList(products);
  };

  return (
    <>
      {user && products && (
        <>
          <div className="container mx-auto mt-8 p-8 bg-slate-600 rounded-lg shadow-lg">
            <div className="flex justify-between">
              <h2 className="text-2xl font-bold mb-4 text-white">Products</h2>
              <h2 className="text-2xl font-bold mb-4 text-white">
                <button
                  className="bg-slate-500 text-white rounded-lg p-2 uppercase hover:opacity-95 disabled:opacity-80"
                  onClick={sortByPrice}
                >
                  {loading ? "Sorting..." : "Sort by price"}
                </button>
                {isSortByPrice && (
                  <i
                    className="fa-solid fa-xmark cursor-pointer"
                    style={{ color: "white" }}
                    onClick={removingSort}
                  ></i>
                )}
              </h2>
            </div>
            <ul>
              {productList.map((product) => (
                <li
                  key={product.id}
                  className="mb-2 container mx-auto mt-4 p-8 bg-slate-200 rounded-lg shadow-lg flex justify-between"
                >
                  <div id="image-section">
                    {editingProductId === product.id ? (
                      <>
                        <input
                          type="file"
                          name="product_img"
                          id="product_img"
                          hidden
                          accept="image/*"
                          onChange={handleFileChange}
                          required
                        />
                        <img
                          onClick={() =>
                            document.getElementById("product_img").click()
                          }
                          src={file ? URL.createObjectURL(file) : product.image}
                          alt="product image"
                          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2 border-4 border-slate-700"
                        />
                      </>
                    ) : (
                      <img
                        src={product.image}
                        alt=""
                        className="outline-none h-40 w-80"
                      />
                    )}
                  </div>
                  <div
                    id="price-section"
                    className="flex flex-col justify-between w-60 container "
                  >
                    <p id="price-title">
                      {editingProductId === product.id ? (
                        <>
                          <input
                            id="title"
                            type="text"
                            placeholder="Title"
                            className="border p-3 rounded-lg"
                            required
                            ref={titleRef}
                            defaultValue={product.title}
                          />
                          <br />
                          <input
                            id="price"
                            type="number"
                            placeholder="Price"
                            className="border p-3 rounded-lg"
                            required
                            ref={priceRef}
                            defaultValue={product.price}
                          />
                        </>
                      ) : (
                        <>
                          <span className="text-justify text-slate-800">
                            {product.title}
                          </span>
                          <br />
                          <span className="text-slate-600">
                            Price: {product.price}
                          </span>
                        </>
                      )}
                    </p>
                    <p id="rating">
                      {editingProductId === product.id ? (
                        <input
                          id="rating"
                          type="number"
                          placeholder="Rating"
                          className="border p-3 rounded-lg"
                          required
                          ref={ratingRef}
                          step="any"
                          defaultValue={product.rate}
                        />
                      ) : (
                        <>
                          <RatingStars rating={product.rate} />
                          {" " + product.rate}
                        </>
                      )}
                    </p>
                  </div>
                  <div
                    id="description-section"
                    className="flex flex-col justify-between w-96 container "
                  >
                    {editingProductId === product.id ? (
                      <textarea
                        name=""
                        id=""
                        rows="3"
                        placeholder="Description..."
                        className="border p-3 rounded-lg w-11/12 "
                        required
                        ref={descriptionRef}
                        defaultValue={product.description}
                      ></textarea>
                    ) : (
                      <div id="description" className="text-justify">
                        {product.description}
                      </div>
                    )}

                    <div
                      id="update-delete-addcart-section"
                      className="flex justify-between mt-5 w-60 ml-40 mr-10"
                    >
                      {editingProductId === product.id ? (
                        <button
                          className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"
                          disabled={loading}
                          onClick={() => {
                            updateProductById(editingProductId);
                          }}
                        >
                          {loading ? "Updating Product..." : "Update Product"}
                        </button>
                      ) : (
                        <>
                          <div id="update">
                            <i
                              style={{ color: "#1d2f4e" }}
                              className="cursor-pointer fa-solid fa-pen fa-xl"
                              title="Edit"
                              onClick={() => setEditId(product.id)}
                            ></i>
                          </div>
                          <div id="delete">
                            <i
                              style={{ color: "#f50a22" }}
                              className="cursor-pointer fa-solid fa-trash fa-xl"
                              title="delete"
                              onClick={() => removeProduct(product.id)}
                            ></i>
                          </div>
                          <div id="add-remove-cart">
                            <button
                              className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"
                              onClick={() => addingToCart(product.id)}
                            >
                              {loading ? "Adding..." : "Add to Cart"}
                            </button>
                          </div>
                        </>
                      )}
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

export default ProductList;
