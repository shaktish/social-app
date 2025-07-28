import express from "express";
import { createPost, deletePost, getAllPosts, getPost, updatePost } from "../controllers/PostController";
import { validatePostBody } from "../middleware/postValidate";

const routes = express.Router();

routes.post('/', validatePostBody, createPost);
routes.get('/', getAllPosts);
routes.get('/:id', getPost);
routes.patch('/:id', updatePost);
routes.delete("/:id", deletePost)

export default routes;