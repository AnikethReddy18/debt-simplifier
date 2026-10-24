import express from 'express';
import cors from 'cors';
import routers from './routers/router.js';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
  ],
}));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/auth', routers.authRouter);
app.use('/users', routers.userRouter);
app.use('/groups', routers.groupRouter);

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});