import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signIn } from "../../redux/User/AuthSlice";

import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { useDispatch, useSelector } from "react-redux";

import { GlobalData } from "../../App";

export default function SignIn() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.auth.user);

  const { setNotificationMessage } = useContext(GlobalData);

  // dispatcher for sign in function
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const email = emailRef.current.value;
      const password = passwordRef.current.value;

      const db = getFirestore();
      const usersCollection = collection(db, "sign_up");
      const emailQuery = query(usersCollection, where("email", "==", email));
      const emailSnapshot = await getDocs(emailQuery);

      if (!emailSnapshot.empty) {
        const userDoc = emailSnapshot.docs[0];
        const storedPassword = userDoc.data().password;

        // Simulate password comparison (replace this with actual secure comparison logic)
        const isPasswordMatch = password === storedPassword;

        if (isPasswordMatch) {
          // Password matches, sign in successful
          // Dispatch the signIn action to update Redux store
          dispatch(signIn(userDoc.data()));
           
          setNotificationMessage("Sign In Successfully");
          // Navigate to a protected page or home page after successful sign-in
          navigate("/");
        } else {
          // Password doesn't match
          setNotificationMessage("Incorrect password");
          // You can display an error message to the user
        }
      } else {
        // Email doesn't exist
        setNotificationMessage("User not found");
        // display an error message to the user or navigate to the sign-up page
        navigate("/sign-up");
      }
    } catch (error) {
      // Handle errors
      setNotificationMessage("Error signing in: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Check if the user is already signed in, and redirect to the home page if true
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">Sign In</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="email"
          className="border p-3 rounded-lg"
          id="email"
          ref={emailRef}
          required
        />
        <input
          type="password"
          placeholder="password"
          className="border p-3 rounded-lg"
          id="password"
          ref={passwordRef}
          required
        />

        <button className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80">
          {loading ? "Signing..." : "Sign In"}
        </button>
      </form>
      <div className="flex gap-2 mt-5">
        <p>Dont have an account?</p>
        <Link to={"/sign-up"}>
          <span className="text-blue-700">Sign up</span>
        </Link>
      </div>
    </div>
  );
}
