import express from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes/index';

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.use('/api', routes);

export default app;
