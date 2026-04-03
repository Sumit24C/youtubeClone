import { Router } from "express";
import { upload } from "../utils/video.js";

const router = Router();

router.post('/uploads', upload.single('video'), async (req, res) => {
    
})