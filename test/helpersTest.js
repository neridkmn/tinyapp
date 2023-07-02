const chai = require('chai');
const assert = chai.expect;

const { findUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    const expectedEmail = "user@example.com";
    const expectedPassword = "purple-monkey-dinosaur";
    assert(user.id === expectedUserID).to.be.true;
    assert(user.email === expectedEmail).to.be.true;
    assert(user.password === expectedPassword).to.be.true;
  });

  it('should return undefined if the user does not exist', function() {
    const user = findUserByEmail('a@a.com', testUsers);
    assert(user === undefined).to.be.true;
  });
});