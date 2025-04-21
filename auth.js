const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Sample hardcoded user (in real app, use MongoDB)
const users = [{ username: "natasha", password: "mypassword" }];

// Login route
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ success: true, token: "Bearer " + token });
});

module.exports = router;
