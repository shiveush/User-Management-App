const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

/* =======================
   MIDDLEWARE
======================= */
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

/* =======================
   DATA FILE
======================= */
const USERS_FILE = path.join(__dirname, 'users.json');

async function readUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

/* =======================
   ROUTES
======================= */

// Health check (important for Render sanity)
app.get('/', (req, res) => {
  res.send('User Management Backend is running');
});

/* ---------- REGISTER ---------- */
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields required' });
  }

  const users = await readUsers();
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  users.push({
    id: Date.now(),
    name,
    email,
    passwordHash
  });

  await writeUsers(users);
  res.json({ message: 'User registered successfully' });
});

/* ---------- LOGIN ---------- */
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const users = await readUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: 'Wrong password' });
  }

  res.json({
    message: 'Login successful',
    user: { name: user.name, email: user.email }
  });
});

/* ---------- GET USERS ---------- */
app.get('/users', async (req, res) => {
  const users = await readUsers();
  res.json(users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email
  })));
});

/* ---------- ADD USER ---------- */
app.post('/users', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email required' });
  }

  const users = await readUsers();
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ message: 'User already exists' });
  }

  users.push({
    id: Date.now(),
    name,
    email,
    passwordHash: 'N/A'
  });

  await writeUsers(users);
  res.json({ message: 'User added successfully' });
});

/* ---------- DELETE USER ---------- */
app.delete('/users/:id', async (req, res) => {
  let users = await readUsers();
  users = users.filter(u => u.id != req.params.id);
  await writeUsers(users);
  res.json({ message: 'User deleted' });
});

/* =======================
   START SERVER
======================= */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
