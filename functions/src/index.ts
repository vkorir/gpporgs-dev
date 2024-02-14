import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, UpdateData } from "firebase-admin/firestore";
import {
  HttpsError,
  beforeUserCreated,
  beforeUserSignedIn,
} from "firebase-functions/v2/identity";

const app = initializeApp();
const allowedDomain = "@berkeley.edu";

// Restrict domain, and check if user has access
exports.onCreate = beforeUserCreated(async (event) => {
  const email = event.data.email;
  if (!email) {
    throw new HttpsError("invalid-argument", "Invalid email argument");
  }
  if (!email.includes(allowedDomain)) {
    throw new HttpsError("permission-denied", "User your berkeley email");
  }
  if ((await getUserSnapshot(email)).size == 0) {
    throw new HttpsError("not-found", "User has no access");
  }
});

// Set role in custom claims
exports.onSignIn = beforeUserSignedIn(async (event) => {
  const email = event.data.email;
  if (!email) {
    throw new HttpsError("invalid-argument", "Invalid email");
  }
  const snapshot = await getUserSnapshot(email);
  snapshot.forEach(async (_user) => {
    const data = _user.data();
    const claims = { role: data.role };
    await getAuth().setCustomUserClaims(event.data?.uid, claims);
    
  });
});

const getUserSnapshot = async (email: string) => {
  const firestore = getFirestore(app);
  const usersCol = firestore.collection("users");
  const query = usersCol.where("email", "==", email);
  return await query.get();
};
