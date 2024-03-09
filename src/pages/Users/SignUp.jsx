import { useContext, useRef, useState } from "react";
import app from "../../firebase";
import { Link, useNavigate } from "react-router-dom";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  query,
  where,
} from "firebase/firestore";

import { GlobalData } from "../../App";

export default function SignUp() {
  const usernameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const {setNotificationMessage} = useContext(GlobalData);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const username = usernameRef.current.value;
      const email = emailRef.current.value;
      const password = passwordRef.current.value;

      // Check if the email already exists in Firestore
      const db = getFirestore(app); // Pass the app instance to getFirestore
      const usersCollection = collection(db, "sign_up");
      const emailQuery = query(usersCollection, where("email", "==", email));
      const emailSnapshot = await getDocs(emailQuery);

      if (emailSnapshot.empty) {
        // Email doesn't exist, create a new user in Firestore
        // Generate default avatar URL based on the first character of the username
        const defaultAvatar = `https://ui-avatars.com/api/?name=${username.charAt(
          0
        )}`;

        const newUser = {
          username: username,
          email: email,
          password: password,
          avatar: defaultAvatar, // Include default avatar URL in the user data
        };

        const userRef = await addDoc(usersCollection, newUser);

        // Optionally, we can use userRef.id to uniquely identify the user in Firestore
        setNotificationMessage("New user created");

        // Navigate to the sign-in page after successful signup
        navigate("/sign-in");
      } else {
        console.log("User already exists");
        setNotificationMessage("User already exists");
        // You can send a response or display an error message to the user
      }
    } catch (error) {
      setNotificationMessage("Error signing up: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">Sign Up</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="username"
          className="border p-3 rounded-lg"
          id="username"
          ref={usernameRef}
          required
        />
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
          {loading ? "Sign Up..." : "Sign Up"}
        </button>
      </form>
      <div className="flex gap-2 mt-5">
        <p>Have an account?</p>
        <Link to={"/sign-in"}>
          <span className="text-blue-700">Sign in</span>
        </Link>
      </div>
    </div>
  );
}
