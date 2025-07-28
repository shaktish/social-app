import express from "express";
import {uploadMedia, getAllMedia} from "../controller/mediaController";
import authenticateRequest from "../middleware/authenticateRequest";
import singleFileUploadMiddleware from "../middleware/singleFileUploadMiddleware";

const route = express.Router();

route.post('/upload', authenticateRequest, singleFileUploadMiddleware, uploadMedia );
route.get('/getAllMedia', authenticateRequest, getAllMedia);

export default route;