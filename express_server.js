
const { findUserByEmail, generateRandomString, urlsForUser } = require('./helpers'); // Object destructuring
const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;


app.set('view engine', 'ejs');


// DATABASES

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};


const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["key1"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.get('/', (req, res) => {
  res.send('Hello!');
});

// Create
app.post("/urls", (req, res) => {
  if (!req.session.user_id) { //check if the user is logged in via cookies
    return res.send('Only logged in users can shorten URLs.');
  }
  let longURL = req.body.longURL;
  const shortURL = generateRandomString();//create random short url
  urlDatabase[shortURL] = { longURL, userID: req.session.user_id }; //add new short url to databse
  res.redirect(`/urls/${shortURL}`);
});

// Delete
app.post('/urls/:id/delete', (req, res) => {
  if (!Object.keys(urlDatabase).includes(req.params.id)) { // check if short url exists in the database
    return res.send('This url does not exist.');
  }

  if (!req.session.user_id) { // check if the user is logged in via cookies
    return res.send('Please log in first.');
  }
  if (urlDatabase[req.params.id].userID !== req.session.user_id) { // check if user id in the database matches the logged in user's id.
    return res.send('You do not have permission to delete this URL.');
  }

  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

// Read
app.get('/urls', (req, res) => {
  if (!req.session.user_id) { //check if the user logged in via cookies
    return res.send('Please log in or register first');
  }
  const templateVars = { urls: urlsForUser(req.session.user_id, urlDatabase), user: users[req.session.user_id] };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  if (!req.session.user_id) { // check if the user logged in via cookies
    res.redirect('/login');
  }
  const templateVars = { user: users[req.session.user_id] };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  if (!req.session.user_id) {// check if the user logged in via cookies
    return res.send('Please log in first');
  }

  if (!Object.keys(urlDatabase).includes(req.params.id)) {// check if short url exists in the database
    return res.send('This URL does not exist.');
  }

  if (req.session.user_id !== urlDatabase[req.params.id].userID) {// check if user id in the database matches the logged in user's id.
    return res.send('You do not have access to this URL.');
  }

  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.session.user_id] };
  res.render('urls_show', templateVars);
});

//UPDATE
app.post('/urls/:id', (req, res) => {
  if (!Object.keys(urlDatabase).includes(req.params.id)) {// check if short url exists in the database
    return res.send('This URL does not exist.');
  }
  if (!req.session.user_id) {// check if the user logged in via cookies
    return res.send("Please log in first.");
  }

  if (req.session.user_id !== urlDatabase[req.params.id].userID) {// check if user id in the database matches the logged in user's id.
    return res.send('You do not have access to this URL.');
  }
  urlDatabase[req.params.id].longURL = req.body.editURL; //update urldatabase with new long url submitted by the user.
  res.redirect('/urls');
});

app.get('/u/:id', (req, res) => {
  const shortURL = req.params.id;
  if (!Object.keys(urlDatabase).includes(shortURL)) { // check if short url exists in the database
    return res.send('URL does not exist.');
  }
  const longURL = urlDatabase[shortURL].longURL;
  if (!longURL) {//check if the long url exists or not.
    res.status(404).send("Not found");
  } else {
    res.redirect(longURL);
  }
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


// AUTHENTICATION

// /login
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = findUserByEmail(email, users);//check if the user exists in the users database.

  if (!user) {//send error if user is not found.
    res.status(403).send('This user does not exist.');
  }

  if (!bcrypt.compareSync(password, user.hashedPassword)) {//check if user submitted password matches with the hashed password in the database.
    res.status(403).send('Password does not match.');
  }

  req.session.user_id = user.id;
  res.redirect('/urls');

});

// logout
app.post('/logout', (req, res) => {
  req.session = null; //clear session cookies on log out
  res.redirect('/login');
});

// Registeration page
app.get('/register', (req, res) => {
  if (req.session.user_id) {//if user is already logged in redirect to urls page.
    res.redirect('/urls');
  }
  const templateVars = { user: users[req.session.user_id] };
  res.render('registration', templateVars);
});


app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email === '' || password === '') {// if email aor password is empty, send an error
    res.status(400).send('Email or password cannot be empty');
  }
  const user = findUserByEmail(email, users);
  if (user) { //if the user is already exists in the database, send an error.
    res.status(400).send('User already exists');
  }

  const id = generateRandomString(); //generate random user id.
  const hashedPassword = bcrypt.hashSync(password, 10); //encrypt user submitted password.
  users[id] = { //save a new user in the database.
    id,
    email,
    hashedPassword
  };

  req.session.user_id = id; //set session cookie
  res.redirect('/urls');

});

app.get('/login', (req, res) => {
  if (req.session.user_id) { //if the user is already logged in redirect to urls page.
    res.redirect('/urls');
  }
  const templateVars = { user: users[req.session.user_id] };
  res.render('login', templateVars);

});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});