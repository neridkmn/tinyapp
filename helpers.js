function findUserByEmail(email, users) {
  for (const item in users) {
    if (users[item].email === email) {
      const user = users[item];
      return user;
    }
  }
  return undefined;
};

module.exports = {
  findUserByEmail
};