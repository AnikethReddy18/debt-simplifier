import express from 'express';
import cors from 'cors';
import routers from './routers/router.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/auth', routers.authRouter);
app.use('/users', routers.userRouter);
app.use('/groups', routers.groupRouter);

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});