// applications.routes.js
import express from 'express';
import { submitApplication, getUserApplications, getAllApplications, updateApplicationStatus, deleteApplication } from '../controllers/application.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = express.Router();

// User routes
router.post('/submit', verifyJWT, submitApplication);
router.get('/user', verifyJWT, getUserApplications);

// Entrepreneur routes
router.get('/all', verifyJWT, getAllApplications);
router.patch('/:id/status', verifyJWT, updateApplicationStatus);

// Add DELETE route for deleting an application
router.delete('/:id', verifyJWT, deleteApplication);

export default router;