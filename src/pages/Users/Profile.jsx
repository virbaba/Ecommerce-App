import React, { useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signOut, updateProfile } from "../../redux/User/AuthSlice";
import { useNavigate } from "react-router-dom";
import { deleteAll } from "../../redux/Product/ProductSlice";
import {
  getFirestore,
  doc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { uploadBytes, ref, getStorage, getDownloadURL } from "firebase/storage";
import app from "../../firebase";

import { GlobalData } from "../../App";

function Profile() {
  const user = useSelector((state) => state.auth.user);

  const usernameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const [file, setFile] = useState(undefined);
  const [loading, setLoading] = useState(false);

  const { setNotificationMessage } = useContext(GlobalData);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignOut = () => {
    setNotificationMessage("Sign out successfully!")
    dispatch(deleteAll());
    dispatch(signOut());
    navigate("/sign-in");
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    let avatarURL = user.avatar; // Default to the current avatar
    const username = usernameRef.current.value || user.username;
    const email = emailRef.current.value || user.email;
    const password = passwordRef.current.value || user.password;

    try {
      setLoading(true);
      const storage = getStorage(app);
      const db = getFirestore(app);

      const signUpCollection = collection(db, "sign_up");
      // Query the collection for documents with the specified email
      // Query the collection for documents with the specified email
      const q = query(signUpCollection, where("email", "==", user.email));
      const querySnapshot = await getDocs(q);

      // Check if any documents match the query
      if (querySnapshot.empty) {
        setNotificationMessage("No matching documents.");
        return null;
      }

      if (file) {
        const storageRef = ref(storage, `avatars/${user.email}`);

        // Upload the avatar to Firebase Storage
        await uploadBytes(storageRef, file);

        // Get the download URL of the uploaded avatar
        avatarURL = await getDownloadURL(storageRef);
      }
      const newData = {
        avatar: avatarURL,
        username,
        email,
        password,
      };

      const docRef = doc(signUpCollection, querySnapshot.docs[0].id);
      await updateDoc(docRef, newData);

      dispatch(updateProfile(newData));

      setNotificationMessage("Document updated successfully.");
    } catch (err) {
      setNotificationMessage("error in file uploading " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (e, email) => {
    try {
      const db = getFirestore(app);

      const signUpCollection = collection(db, "sign_up");
      // Query the collection for documents with the specified email
      // Query the collection for documents with the specified email
      const q = query(signUpCollection, where("email", "==", user.email));
      const querySnapshot = await getDocs(q);

      // Check if any documents match the query
      if (querySnapshot.empty) {
        setNotificationMessage("No matching documents.");
        return null;
      }

      const docRef = doc(signUpCollection, querySnapshot.docs[0].id);
      await deleteDoc(docRef);

      dispatch(signOut());
      navigate("/sign-up");

      setNotificationMessage("Document Deleted successfully.");
    } catch (err) {
      setNotificationMessage("error in file uploading " + err.message);
    }
  };

  useEffect(() => {
    if (!user) navigate("/sign-in");
  }, []);

  return (
    <>
      {user && (
        <div className="p-3 max-w-lg mx-auto">
          <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <input
              type="file"
              name="avatar"
              id="avatar"
              hidden
              accept="image/*"
              onChange={handleFileChange}
            />
            <img
              onClick={() => document.getElementById("avatar").click()}
              src={file ? URL.createObjectURL(file) : user.avatar}
              alt="profile"
              className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
            />

            <input
              id="username"
              type="text"
              placeholder="username"
              className="border p-3 rounded-lg"
              defaultValue={user.username} // Set default value to the current username
              ref={usernameRef}
            />

            <input
              id="email"
              type="email"
              placeholder="email"
              className="border p-3 rounded-lg"
              defaultValue={user.email} // Set default value to the current email
              ref={emailRef}
            />

            <input
              id="password"
              type="password"
              placeholder="password"
              className="border p-3 rounded-lg"
              ref={passwordRef}
            />

            <button className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80">
              {loading ? "Updating..." : "Update"}
            </button>
          </form>

          <div className="flex justify-between mt-5">
            <span
              className="text-red-700 cursor-pointer"
              onClick={(e) => deleteAccount(e, user.email)}
            >
              Delete Account
            </span>
            <span
              className="text-red-700 cursor-pointer"
              onClick={handleSignOut}
            >
              Sign Out
            </span>
          </div>
        </div>
      )}
    </>
  );
}

export default Profile;
