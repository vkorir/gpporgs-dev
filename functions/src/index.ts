import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import {
  onDocumentCreated,
  onDocumentUpdated,
} from "firebase-functions/v2/firestore";
import { HttpsError, beforeUserCreated } from "firebase-functions/v2/identity";

initializeApp();

// Restrict registration to berkeley domain
exports.restrictdomain = beforeUserCreated((event) => {
  if (!event.data.email?.includes("@berkeley.edu")) {
    throw new HttpsError("permission-denied", "User your berkeley email");
  }
});

// Set initial user claim
exports.setclaim = onDocumentCreated("users/{userId}", async (event) => {
  try {
    const snapshot = event.data;
    if (snapshot) {
      const data = snapshot.data();
      const claims = {role: data?.role};
      await getAuth().setCustomUserClaims(data?.uid, claims);
      console.log("created claim for: ", data.uid, claims);
    }
  } catch (e) {
    console.log("Error setting user claims: ", e);
  }
});

// Update user claim after document update
exports.updateclaim = onDocumentUpdated("users/{userId}", async (event) => {
  try {
    const previous = event.data?.before.data();
    const current = event.data?.after.data();
    if (previous?.role !== current?.role) {
      const claims = {role: current?.role};
      await getAuth().setCustomUserClaims(current?.uid, claims);
      console.log("updated claim for: ", current?.uid, claims);
    }
  } catch (e) {
    console.log("Error updating user claims: ", e);
  }
});
