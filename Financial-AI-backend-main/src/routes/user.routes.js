import express from 'express';
import { registerUser, loginUser, logoutUser, refreshAccessToken, getCurrentUser, verifyUser, getAllUsers, deleteUser } from '../controllers/user.controller.js';
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/register").post(registerUser);

router.route("/verify").post(verifyUser);

router.route("/get-users").post(getAllUsers);

router.route("/delete").post(deleteUser);

router.route("/login").post(loginUser);

router.route("/refresh-token").post(refreshAccessToken);

// secure route
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/current-user").get(verifyJWT, getCurrentUser);

// Route definition for verifying a user
router.put('/users/verify/:userId', verifyUser);

export default router;