import { validateCode } from '../services/codeService.mjs';

export const validateEmailCode = async (req, res) => {
    
    const { email, code } = req.body;
    if (!email || !code) {
        return res.status(400).json({ message: 'Email and code are required.' });
    }

    try {
        const result = await validateCode(email, code);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error validating code.' });
    }
};