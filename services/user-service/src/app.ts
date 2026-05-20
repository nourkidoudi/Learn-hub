import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

import userRoutes from './routes/user.routes';

connectDB();

app.use('/auth', authRoutes);
app.use('/', userRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});
