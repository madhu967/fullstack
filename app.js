const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const admin = require('./firebase-config');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'your_secret', resave: false, saveUninitialized: true }));

// Middleware to check auth
const isAuthenticated = (req, res, next) => {
  if (req.session.user) next();
  else res.redirect('/login');
};

// Routes
app.get('/', (req, res) => res.redirect('/login'));

app.get('/signup', (req, res) => res.render('signup'));
app.get('/login', (req, res) => res.render('login'));
app.get('/dashboard', isAuthenticated, (req, res) => res.render('dashboard', { user: req.session.user }));

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await admin.auth().createUser({ email, password });
    req.session.user = { email: user.email, uid: user.uid };
    res.redirect('/dashboard');
  } catch (error) {
    res.send('Signup Error: ' + error.message);
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  // NOTE: Firebase Admin SDK can't verify password directly.
  // Instead, use Firebase Client SDK on frontend or use a workaround API.
  res.send('For password verification, use Firebase Client SDK or REST API.');
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
