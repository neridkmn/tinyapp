function findUserByEmail(email, users) {
  for (const item in users) {
    if (users[item].email === email) {
      const user = users[item];
      return user;
    }
  }
  return undefined;
};

function generateRandomString() {
  let shortUrlArray = [];
  let alphanumericCharacters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "w", "x", "y", "z", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  for (let i = 0; i < 6; i++) {
    let randomIndex = Math.floor(Math.random() * alphanumericCharacters.length);
    shortUrlArray.push(alphanumericCharacters[randomIndex]);
  }

  return shortUrlArray.join("");
};

function urlsForUser(id, urlDatabase) { // helper func for loop over a database and return urls whose user id matches with the given user id.
  const urls = {};
  for (const item in urlDatabase) {
    if (urlDatabase[item].userID === id) {
      urls[item] = urlDatabase[item];
    }
  }
  return urls;
};


module.exports = {
  findUserByEmail,
  generateRandomString,
  urlsForUser
};