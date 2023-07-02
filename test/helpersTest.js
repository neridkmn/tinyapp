const chai = require('chai');
const assert = chai.expect;

const { findUserByEmail, generateRandomString, urlsForUser } = require('../helpers.js');

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

const testUrlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "12dg4t",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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

describe('generateRandomString', () => {
  it('should return a string with a length of 6', () => {
    const randomString = generateRandomString();
    assert(randomString.length === 6).to.be.true;
    assert(typeof randomString === 'string').to.be.true;
  });
});

describe('urlsForUser', () => {
  it('shoul return urls where the userID of the url matches the given id', () => {
    const urls = urlsForUser('12dg4t', testUrlDatabase);
    assert(urls.b6UTxQ.longURL === "https://www.tsn.ca").to.be.true;
  });

  it('should return an empty object if there is no match', () => {
    const urls = urlsForUser('12344t', testUrlDatabase);
    assert(urls).to.be.empty;
  });
});