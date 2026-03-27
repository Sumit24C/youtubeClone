import { Router } from "express";
import { upload } from "../utils/video";

const router = Router();

router.post('/uploads', upload.single('video'), async (req, res) => {
    
})