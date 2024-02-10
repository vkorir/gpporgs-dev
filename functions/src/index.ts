import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import {
  HttpsError,
  beforeUserCreated,
  beforeUserSignedIn,
} from "firebase-functions/v2/identity";

const app = initializeApp();

// Restrict registration to berkeley domain
exports.restrictdomain = beforeUserCreated((event) => {
  if (!event.data.email?.includes("@berkeley.edu")) {
    throw new HttpsError("permission-denied", "User your berkeley email");
  }
});

exports.onSignIn = beforeUserSignedIn(async (event) => {
  const firestore = getFirestore(app);
  const usersCol = firestore.collection("users");
  const query = usersCol.where("email", "==", event.data.email);
  const snapshot = await query.get();
  snapshot.forEach(async (_user) => {
    const data = _user.data();
    const claims = { role: data.role };
    await getAuth().setCustomUserClaims(event.data?.uid, claims);
  });
});
