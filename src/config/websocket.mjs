import WebSocket from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const BROKER_URL = process.env.BROKER_URL;

export const createWebSocketConnection = () => {
  return new WebSocket(BROKER_URL);
};