function generateRandomString() {
  let shortUrlArray = [];
  let alphanumericCharacters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "w", "x", "y", "z", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  for (i = 0; i < 6; i++) {
    let randomIndex = Math.floor(Math.random() * alphanumericCharacters.length);
    shortUrlArray.push(alphanumericCharacters[randomIndex]);
  }

  return shortUrlArray.join("");
};

const express = require('express');
const cookieParser = require('cookie-parser'); 
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': "http://www.lighthouselabs.ca",
  '9sm5xK': "http://www.google.com",
};

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Hello!');
});

// Create
app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

// Delete
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

// Read
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:id', (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["username"] };
  res.render('urls_show', templateVars);
});

//UPDATE
app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = req.body.editURL;
  res.redirect('/urls');
});

app.get('/u/:id', (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  if (!longURL) {
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

// /login 
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

// logout
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});