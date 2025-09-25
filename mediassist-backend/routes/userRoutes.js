// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, deleteUserById } = require('../controllers/userController');

// Registration
router.post('/register', registerUser);

// Login
router.post('/login', loginUser);


// Delete user by ID
/* router.delete('/:userId', deleteUserById); */
// Delete user by ID
router.delete('/:userId', deleteUserById);


module.exports = router;
