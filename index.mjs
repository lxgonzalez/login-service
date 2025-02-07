import express from 'express';
import WebSocket from 'ws';
import { nanoid } from 'nanoid';
import nano from 'nano';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

const COUCHDB_URL = process.env.COUCHDB_URL;
const COUCHDB_DB_NAME = process.env.COUGHTDB_DB_NAME;

const couch = nano(COUCHDB_URL);
const db = couch.db.use(COUCHDB_DB_NAME);

async function generateAndStoreVerificationCode(email) {
  const code = nanoid(6); // Genera un código único de 6 caracteres
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
      doc._rev = existingDoc._rev; // Si existe, obtenemos su _rev para actualizar
    } catch (error) {
      if (error.statusCode !== 404) {
        // Si el error no es 404 (no encontrado), es un problema de conexión u otro error
        throw error;
      }
      // Si no encontramos el documento, lo dejamos como está para insertar un nuevo documento
    }

    const response = await db.insert(doc); // Inserta o actualiza el documento
    console.log('Código guardado en CouchDB:', response);
    return { code, timestamp };
  } catch (error) {
    console.error('Error al guardar en CouchDB:', error);
    throw error;
  }
}

async function canSendNewCode(email) {
  try {
    const doc = await db.get(email);
    const lastSent = new Date(doc.createdAt);
    const currentTime = new Date();
    const timeElapsed = currentTime - lastSent;

    if (timeElapsed >= 60000) {
      // Ha pasado más de 1 minuto, se puede enviar un nuevo código
      return true;
    } else {
      // Si no han pasado los 60 segundos, se deniega el reenvío
      const timeRemaining = Math.floor((60000 - timeElapsed) / 1000); // Tiempo restante en segundos
      console.log(`Por favor espera ${timeRemaining} segundos para reenviar el código.`);
      return false;
    }
  } catch (error) {
    // Si no se encuentra un código, lo generamos y enviamos
    console.log('No se encontró un código previo, generando uno nuevo...');
    return true;
  }
}

/**
 * Función para enviar el mensaje a WebSocket
 */
async function sendCodeToWebSocket(email) {
  const isAllowedToSend = await canSendNewCode(email);

  if (!isAllowedToSend) {
    throw new Error('No se puede reenviar el código aún.');
  }

  const { code, timestamp } = await generateAndStoreVerificationCode(email);

  const ws = new WebSocket('ws://54.80.63.162:1050');

  ws.on('open', () => {
    const message = {
      topic: 'send_code',
      event: 'send_email_code',
      email,
      code,
      date: timestamp,
    };

    ws.send(JSON.stringify(message));
    console.log('Mensaje enviado al WebSocket:', message);
    ws.close();
  });

  ws.on('error', (error) => {
    console.error('Error en WebSocket:', error);
  });
}

/**
 * Función para validar el código
 */
async function validateCode(email, code) {
  try {
    const doc = await db.get(email);
    const expirationTime = 5 * 60 * 1000; // 5 minutos
    const isExpired = new Date() - new Date(doc.createdAt) > expirationTime;

    if (isExpired) {
      return { valid: false, message: 'El código ha expirado.' };
    }

    if (doc.code !== code) {
      return { valid: false, message: 'Código incorrecto.' };
    }

    return { valid: true, message: 'Código válido.' };
  } catch (error) {
    console.error('Error en la validación:', error);
    return { valid: false, message: 'Usuario no encontrado o error en la base de datos.' };
  }
}

// Ruta para enviar código
app.post('/send-email', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'El correo es requerido.' });
  }

  try {
    await sendCodeToWebSocket(email);
    res.status(200).json({ message: 'Código enviado.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ruta para validar código
app.post('/validate-code', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ message: 'El correo y el código son requeridos.' });
  }

  try {
    const result = await validateCode(email, code);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error al validar el código.' });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
