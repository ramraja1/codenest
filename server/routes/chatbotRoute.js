import express from 'express';
import { handleDSAChat,handleMCQChat,Chat } from '../controllers/dsaController.js';
const router = express.Router();
import { adminProtect } from "../middleware/adminProtect.js";
router.post('/dsa', adminProtect, handleDSAChat);
router.post('/mcq', adminProtect, handleMCQChat);
router.post('/chat', Chat);
// router.post('/normal', handleNormalChat);
export default router;
