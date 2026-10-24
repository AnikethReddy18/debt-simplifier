import express from 'express';
import routers from './routers/index.js';

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/auth', routers.authRouter);
app.use('/users', routers.userRouter);
app.use('/groups', routers.groupRouter);

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});