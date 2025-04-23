import {Router} from 'express';
import {sendMessage, getMessages} from "../controllers/messaages.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Send a message in a community
router.post("/:id/send", verifyJWT, sendMessage);

// Get messages for a community
router.get("/:id/messages", verifyJWT, getMessages);

export default router;