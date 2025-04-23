/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.deleteUserByUID = functions.https.onRequest(async (req, res) => {
  const uid = req.body.uid;

  if (!uid) {
    return res.status(400).send("UID is required");
  }

  try {
    await admin.auth().deleteUser(uid);
    return res.status(200).send(`Successfully deleted user with UID: ${uid}`);
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).send("Error deleting user");
  }
});
