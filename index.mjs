import app from './app.mjs';
import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 1028;

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});