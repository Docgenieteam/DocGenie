import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

import { app } from "./firebase";

const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);

  return result.user;
};

export { auth };
