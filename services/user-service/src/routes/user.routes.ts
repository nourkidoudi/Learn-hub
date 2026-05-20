import express from 'express';
import { getMe, updateMe } from '../controllers/user.controller';

const router = express.Router();

router.get('/me', getMe);
router.put('/me', updateMe);

export default router;
