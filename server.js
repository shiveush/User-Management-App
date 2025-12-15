const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const USERS_FILE = path.join(__dirname, 'users.json');

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE));
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

app.get('/', (req, res) => {
  res.send('User Management Backend is running');
});

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields required' });

  const users = readUsers();
  if (users.find(u => u.email === email))
    return res.status(409).json({ message: 'User already exists' });

  const hash = await bcrypt.hash(password, 10);
  users.push({ id: Date.now(), name, email, passwordHash: hash });
  writeUsers(users);

  res.json({ message: 'Registered successfully' });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.email === email);

  if (!user)
    return res.status(404).json({ message: 'User not found' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok)
    return res.status(401).json({ message: 'Wrong password' });

  res.json({ user: { name: user.name, email: user.email } });
});

app.get('/users', (req, res) => {
  const users = readUsers().map(u => ({
    id: u.id,
    name: u.name,
    email: u.email
  }));
  res.json(users);
});

app.post('/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email)
    return res.status(400).json({ message: 'Missing fields' });

  const users = readUsers();
  if (users.find(u => u.email === email))
    return res.status(409).json({ message: 'User exists' });

  users.push({ id: Date.now(), name, email, passwordHash: 'N/A' });
  writeUsers(users);
  res.json({ message: 'User added' });
});

app.delete('/users/:id', (req, res) => {
  let users = readUsers();
  users = users.filter(u => u.id != req.params.id);
  writeUsers(users);
  res.json({ message: 'Deleted' });
});

app.listen(PORT, () =>
  console.log('Backend running on port', PORT)
);
