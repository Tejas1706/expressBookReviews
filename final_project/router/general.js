const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }
  if (!isValid(username)) {
    return res.status(409).json({ message: "User already exists" });
  }
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', (req, res) => {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (book) return res.status(200).json(book);
  return res.status(404).json({ message: "Book not found" });
});

// Get book details based on author
public_users.get('/author/:author', (req, res) => {
  const result = Object.entries(books)
    .filter(([id, b]) => b.author.toLowerCase() === req.params.author.toLowerCase())
    .map(([id, b]) => ({ isbn: id, ...b }));
  return res.status(200).json({ booksbyauthor: result });
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
  const result = Object.entries(books)
    .filter(([id, b]) => b.title.toLowerCase() === req.params.title.toLowerCase())
    .map(([id, b]) => ({ isbn: id, ...b }));
  return res.status(200).json({ booksbytitle: result });
});

// Get book review
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (book) return res.status(200).json(book.reviews);
  return res.status(404).json({ message: "Book not found" });
});

/* ---------- Task 11: Axios with async/await and Promise callbacks ---------- */

// All books (async/await)
const getAllBooks = async () => {
  const response = await axios.get(`${BASE_URL}/`);
  return response.data;
};

// By ISBN (Promise callbacks)
const getBookByISBN = (isbn) =>
  axios.get(`${BASE_URL}/isbn/${isbn}`).then((response) => response.data);

// By author (async/await)
const getBooksByAuthor = async (author) => {
  const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
  return response.data;
};

// By title (Promise callbacks)
const getBooksByTitle = (title) =>
  axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`).then((response) => response.data);

// Routes that use the Axios functions
public_users.get('/axios/books', async (req, res) => {
  try {
    res.status(200).json(await getAllBooks());
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

public_users.get('/axios/isbn/:isbn', (req, res) => {
  getBookByISBN(req.params.isbn)
    .then((data) => res.status(200).json(data))
    .catch((e) => res.status(500).json({ message: e.message }));
});

public_users.get('/axios/author/:author', async (req, res) => {
  try {
    res.status(200).json(await getBooksByAuthor(req.params.author));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

public_users.get('/axios/title/:title', (req, res) => {
  getBooksByTitle(req.params.title)
    .then((data) => res.status(200).json(data))
    .catch((e) => res.status(500).json({ message: e.message }));
});

module.exports.general = public_users;
