import express from 'express';
import { search } from '../controllers/searchController';

const router = express.Router();

router.get('/search', search);

export default router;