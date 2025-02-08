import { sendRegisterUserToWebSocket } from '../services/websocketService.mjs';
import dotenv from 'dotenv';
dotenv.config();

const CLIENT_URL = `${process.env.API_GATEWAY_URL}/admin/email`;


export const registerUser = async (req, res) => {
    const { firstName, lastName, email, password, dob } = req.body;
    if (!firstName || !lastName || !email || !password || !dob) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const adminValid = await validateAdmin(email);
    let role;
    if (adminValid) {
        role = 'ADMIN'
    } else {
        role = 'CLIENT'
    }
    await sendRegisterUserToWebSocket(firstName, lastName, email, password, dob, role);
    res.status(200).json({ message: 'User registered successfully.' });

};

const validateAdmin = async (email) => {
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
