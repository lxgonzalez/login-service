import { canSendNewCode, generateAndStoreVerificationCode } from '../services/codeService.mjs';
import { sendCodeToWebSocket } from '../services/websocketService.mjs';
import dotenv from 'dotenv';
dotenv.config();

const CLIENT_URL = `${process.env.API_GATEWAY_URL}/client/email`;

export const sendEmailCode = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }
  const emailValidation = await validateRegistrationEmail(email);
  if (emailValidation) {
    return { valid: false, message: 'Email is already registered.' };
  }

  try {
    // Check if the email can receive a new verification code
    const isAllowedToSend = await canSendNewCode(email);

    if (!isAllowedToSend) {
      throw new Error('You cannot resend the code yet.');
    }

    // Generate and store the verification code
    const { code, timestamp } = await generateAndStoreVerificationCode(email);

    // Send the code via WebSocket
    await sendCodeToWebSocket(email, code, timestamp);

    // Respond to the client
    res.status(200).json({ message: 'Code sent.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const validateRegistrationEmail = async (email) => {
  try {
    const res = await fetch(`${CLIENT_URL}/${email}`);
    if (!res.ok) {
      throw new Error('Failed to validate email.');
    }
    const check = await res.json();
    if (check.status === 'Failed') {
      return false;
    }
  } catch (error) {
    console.error('Email validation error:', error);
    throw error;
  }
  return true;
};
