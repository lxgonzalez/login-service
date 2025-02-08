import express from 'express';
import cors from 'cors';
import { sendEmailCode } from './src/controllers/emailController.mjs';
import { validateEmailCode } from './src/controllers/validationController.mjs';
import { registerUser } from './src/controllers/registerController.mjs';

const app = express();

app.use(cors());
app.use(express.json());

app.post('/send-email', sendEmailCode);
app.post('/validate-code', validateEmailCode);
app.post('/register-user', registerUser);

export default app;