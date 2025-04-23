import { Router } from 'express';
import { createCommunity, joinCommunity, getCommunities, getCommunityDetails, addUserToCommunity } from "../controllers/community.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Create a community (only for entrepreneurs)
router.post("/create", verifyJWT, createCommunity);

// Join a community (for normal users)
router.post("/:id/join", verifyJWT, joinCommunity);

// Get all communities
router.get("/", verifyJWT, getCommunities);

// Get details of a specific community
router.get("/:id", verifyJWT, getCommunityDetails);

// Add a user to a community
router.post("/:id/add-user", verifyJWT, addUserToCommunity);

export default router;