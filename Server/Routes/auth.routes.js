const express = require('express');
const router = express.Router();
const authModel = require('../Models/authModel');

// Authentication routes
router.post('/signup', async (req, res) => {
    console.log(req.body)
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    
    try {
        const { data, error } = await authModel.signUp(email, password);
        
        if (error) {
            return res.status(400).json({ message: error.message });
        }
        
        return res.status(200).json({ message: 'Signup successful', data });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    
    try {
        const { data, error } = await authModel.signIn(email, password);
        
        if (error) {
            return res.status(400).json({ message: error.message });
        }
        
        return res.status(200).json({ message: 'Signin successful', data });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

router.post('/signout', async (req, res) => {
    try {
        const { error } = await authModel.signOut();
        
        if (error) {
            return res.status(400).json({ message: error.message });
        }
        
        return res.status(200).json({ message: 'Signout successful' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

router.post('/reset-password', async (req, res) => {
    const { email } = req.body;
    const redirectUrl = req.body.redirectUrl || process.env.FRONTEND_URL + '/reset-password';
    
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    
    try {
        const { data, error } = await authModel.resetPassword(email, redirectUrl);
        
        if (error) {
            return res.status(400).json({ message: error.message });
        }
        
        return res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

router.post('/update-password', async (req, res) => {
    const { newPassword } = req.body;
    
    if (!newPassword) {
        return res.status(400).json({ message: 'New password is required' });
    }
    
    try {
        const { data, error } = await authModel.updatePassword(newPassword);
        
        if (error) {
            return res.status(400).json({ message: error.message });
        }
        
        return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// User data routes
router.post('/user-data', async (req, res) => {
    const { table, userData } = req.body;
    
    if (!table || !userData) {
        return res.status(400).json({ message: 'Table and user data are required' });
    }
    
    try {
        const { data, error } = await authModel.insertUserData(table, userData);
        
        if (error) {
            return res.status(400).json({ message: error.message, details: error.details });
        }
        
        return res.status(200).json({ message: 'User data inserted successfully', data });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

router.get('/user-data/:table/:userId', async (req, res) => {
    const { table, userId } = req.params;
    
    if (!table || !userId) {
        return res.status(400).json({ message: 'Table and user ID are required' });
    }
    
    try {
        const { data, error } = await authModel.getUserData(table, userId);
        
        if (error) {
            return res.status(400).json({ message: error.message });
        }
        
        return res.status(200).json({ data });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

router.put('/user-data/:table/:userId', async (req, res) => {
    const { table, userId } = req.params;
    const updates = req.body;
    
    if (!table || !userId || !updates) {
        return res.status(400).json({ message: 'Table, user ID, and updates are required' });
    }
    
    try {
        const { data, error } = await authModel.updateUserData(table, userId, updates);
        
        if (error) {
            return res.status(400).json({ message: error.message });
        }
        
        return res.status(200).json({ message: 'User data updated successfully', data });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

router.delete('/user-data/:table/:userId', async (req, res) => {
    const { table, userId } = req.params;
    
    if (!table || !userId) {
        return res.status(400).json({ message: 'Table and user ID are required' });
    }
    
    try {
        const { error } = await authModel.deleteUserData(table, userId);
        
        if (error) {
            return res.status(400).json({ message: error.message });
        }
        
        return res.status(200).json({ message: 'User data deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Google Sign-In
router.post('/google-signin', async (req, res) => {
    const redirectUrl = req.body.redirectUrl || process.env.FRONTEND_URL + '/profile-completion';
    
    try {
        const { data, error } = await authModel.signInWithGoogle(redirectUrl);
        
        if (error) {
            return res.status(400).json({ message: error.message });
        }
        
        return res.status(200).json({ data });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Verify security PIN
router.post('/verify-pin', async (req, res) => {
    const { role, pin } = req.body;
    
    if (!role || !pin) {
        return res.status(400).json({ message: 'Role and PIN are required' });
    }
    
    try {
        const { data, error } = await authModel.verifySecurityPin(role, pin);
        
        if (error) {
            return res.status(400).json({ message: error.message });
        }
        
        return res.status(200).json({ message: 'PIN verified successfully', data });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

module.exports = router;