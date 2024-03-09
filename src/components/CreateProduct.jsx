import React, { useContext, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFirestore, addDoc, collection } from "firebase/firestore";

import { uploadBytes, ref, getStorage, getDownloadURL } from "firebase/storage";
import app from ".././firebase.js";
import { addProduct } from "../redux/Product/ProductSlice.js";
import { useNavigate } from "react-router-dom";

import { GlobalData } from "../App.jsx";

function CreateProduct() {
  const user = useSelector((state) => state.auth.user);
  const products = useSelector((state) => state.product.products);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [file, setFile] = useState(undefined);
  const titleRef = useRef(null);
  const priceRef = useRef(null);
  const ratingRef = useRef(null);
  const descriptionRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const { setNotificationMessage } = useContext(GlobalData);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  const onSubmit = async (e) => {
    e.preventDefault();

    const id = products.length + 1;
    const title = titleRef.current.value;
    const price = parseFloat(priceRef.current.value);
    const rate = parseFloat(ratingRef.current.value);
    const description = descriptionRef.current.value;

    if (!title || isNaN(price) || isNaN(rate)) {
      // Add appropriate validation logic here
      setNotificationMessage("Invalid input. Please check your data.");
      return;
    }

    try {
      setLoading(true);

      const storage = getStorage(app);
      const db = getFirestore(app);
      const productsRef = collection(db, "products");

      const storageRef = ref(storage, `${title}/${id}`);
      await uploadBytes(storageRef, file);
      const imageURL = await getDownloadURL(storageRef);

      const newProduct = {
        id,
        image: imageURL,
        title,
        price,
        rate,
        description,
      };

      await addDoc(productsRef, newProduct);
      dispatch(addProduct(newProduct));
      
      setNotificationMessage("Product created successfully.");
      navigate("/");
    } catch (err) {
      setNotificationMessage("Error in file uploading " + err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <>
        {user && (
          <div className="p-3 max-w-lg mx-auto">
            <h1 className="text-3xl font-semibold text-center my-7"></h1>
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
                onClick={() => document.getElementById("product_img").click()}
                src={file && URL.createObjectURL(file)}
                alt="product image"
                className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2 border-4"
              />

              <input
                id="title"
                type="text"
                placeholder="Title"
                className="border p-3 rounded-lg"
                required
                ref={titleRef}
              />

              <input
                id="price"
                type="number"
                placeholder="Price"
                className="border p-3 rounded-lg"
                required
                ref={priceRef}
              />

              <input
                id="rating"
                type="number"
                placeholder="Rating"
                className="border p-3 rounded-lg"
                required
                ref={ratingRef}
                step="any"
              />

              <textarea
                name=""
                id=""
                cols="30"
                rows="3"
                placeholder="Description..."
                className="border p-3 rounded-lg"
                required
                ref={descriptionRef}
              ></textarea>

              <button
                className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"
                disabled={loading}
              >
                {loading ? "Adding Product..." : "Add Product"}
              </button>
            </form>
          </div>
        )}
      </>
    </>
  );
}

export default CreateProduct;
