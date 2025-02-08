import { createWebSocketConnection } from '../config/websocket.mjs';
export const sendCodeToWebSocket = async (email, code, timestamp) => {
  const ws = createWebSocketConnection();

  ws.on('open', () => {
    const message = {
      topic: 'send_code',
      event: 'send_email_code',
      email,
      code,
      date: timestamp,
    };

    ws.send(JSON.stringify(message));
    console.log('Message sent to WebSocket:', message);
    ws.close();
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
};

export const sendRegisterUserToWebSocket = async (firstName, lastName, email, password, dob, role) => {
  const ws = createWebSocketConnection();

  ws.on('open', () => {
    const message = {
      topic: 'register-client',
      event: 'register-client',
      email,
      firstName,
      lastName,
      password,
      dob,
      role
    };

    ws.send(JSON.stringify(message));
    console.log('Message sent to WebSocket:', message);
    ws.close();
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
};