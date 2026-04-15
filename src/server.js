import 'dotenv/config';
import express from 'express';
import router from '../infra/database/http/routes.js';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

app.use(router);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
