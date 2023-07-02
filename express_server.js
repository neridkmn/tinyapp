function generateRandomString() {
  let shortUrlArray = [];
  let alphanumericCharacters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "w", "x", "y", "z", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  for (let i = 0; i < 6; i++) {
    let randomIndex = Math.floor(Math.random() * alphanumericCharacters.length);
    shortUrlArray.push(alphanumericCharacters[randomIndex]);
  }

  return shortUrlArray.join("");
};

function urlsForUser(id) {
  const urls = {};
  for (const item in urlDatabase) {
    if (urlDatabase[item].userID === id) {
      urls[item] = urlDatabase[item];
    }
  }
  return urls;
};


const { findUserByEmail } = require('./helpers'); // Object destructuring
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
}))

app.get('/', (req, res) => {
  res.send('Hello!');
});

// Create
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.send('Only logged in users can shorten URLs.');
  }
  let longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL, userID: req.session.user_id };
  res.redirect(`/urls/${shortURL}`);
});

// Delete
app.post('/urls/:id/delete', (req, res) => {
  if (!Object.keys(urlDatabase).includes(req.params.id)) {
    return res.send('This url does not exist.');
  }

  if (!req.session.user_id) {
    return res.send('Please log in first.');
  }
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return res.send('You do not have permission to delete this URL.');
  }

  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

// Read
app.get('/urls', (req, res) => {
  if (!req.session.user_id) {
    return res.send('Please log in or register first');
  }
  const templateVars = { urls: urlsForUser(req.session.user_id), user: users[req.session.user_id] };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  }
  const templateVars = { user: users[req.session.user_id] };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  if (!req.session.user_id) {
    return res.send('Please log in first');
  }

  if (!Object.keys(urlDatabase).includes(req.params.id)) {
    return res.send('This URL does not exist.');
  }

  if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    return res.send('You do not have access to this URL.');
  }

  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.session.user_id] };
  res.render('urls_show', templateVars);
});

//UPDATE
app.post('/urls/:id', (req, res) => {
  if (!Object.keys(urlDatabase).includes(req.params.id)) {
    return res.send('This URL does not exist.');
  }
  if (!req.session.user_id) {
    return res.send("Please log in first.");
  }

  if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    return res.send('You do not have access to this URL.');
  }
  urlDatabase[req.params.id].longURL = req.body.editURL;
  res.redirect('/urls');
});

app.get('/u/:id', (req, res) => {
  const shortURL = req.params.id;
  if (!Object.keys(urlDatabase).includes(shortURL)) {
    return res.send('URL does not exist.');
  }
  const longURL = urlDatabase[shortURL].longURL;
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


// AUTHENTICATION

// /login 
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = findUserByEmail(email, users);

  if (!user) {
    res.status(403).send('This user does not exist.');
  }

  if (!bcrypt.compareSync(password, user.hashedPassword)) {
    res.status(403).send('Password does not match.');
  }

  req.session.user_id = user.id;
  res.redirect('/urls');

});

// logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

// Registeration page
app.get('/register', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  const templateVars = { user: users[req.session.user_id] };
  res.render('registration', templateVars);
});


app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email === '' || password === '') {
    res.status(400).send('Email or password cannot be empty');
  }
  const user = findUserByEmail(email, users);
  if (user) {
    res.status(400).send('User already exists');
  }

  const id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[id] = {
    id,
    email,
    hashedPassword
  };
  
  req.session.user_id = id;
  res.redirect('/urls');

});

app.get('/login', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  const templateVars = { user: users[req.session.user_id] };
  res.render('login', templateVars);

});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});