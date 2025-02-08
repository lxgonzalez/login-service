import db from '../config/couchdb.js';
import { nanoid } from 'nanoid';

export const generateAndStoreVerificationCode = async (email) => {
  const code = nanoid(6); // Generate a unique 6-character code
  const timestamp = new Date().toISOString();

  try {
    let doc = {
      _id: email,
      code,
      createdAt: timestamp,
      type: "verification_code"
    };

    try {
      const existingDoc = await db.get(email);
      doc._rev = existingDoc._rev; // If exists, get its _rev to update
    } catch (error) {
      if (error.statusCode !== 404) {
        throw error;
      }
    }

    const response = await db.insert(doc); // Insert or update the document
    console.log('Code saved in CouchDB:', response);
    return { code, timestamp };
  } catch (error) {
    console.error('Error saving to CouchDB:', error);
    throw error;
  }
};

export const canSendNewCode = async (email) => {
  try {
    const doc = await db.get(email);
    const lastSent = new Date(doc.createdAt);
    const currentTime = new Date();
    const timeElapsed = currentTime - lastSent;

    if (timeElapsed >= 60000) {
      return true;
    } else {
      const timeRemaining = Math.floor((60000 - timeElapsed) / 1000); // Time remaining in seconds
      console.log(`Please wait ${timeRemaining} seconds before resending the code.`);
      return false;
    }
  } catch (error) {
    console.log('No previous code found, generating a new one...');
    return true;
  }
};

export const validateCode = async (email, code) => {
  try {
    const doc = await db.get(email);
    const expirationTime = 5 * 60 * 1000;
    const isExpired = new Date() - new Date(doc.createdAt) > expirationTime;

    if (isExpired) {
      return { valid: false, message: 'The code has expired.' };
    }

    if (doc.code !== code) {
      return { valid: false, message: 'Incorrect code.' };
    }

    return { valid: true, message: 'Valid code.' };
  } catch (error) {
    console.error('Error validating:', error);
    return { valid: false, message: 'User not found or database error.' };
  }
};