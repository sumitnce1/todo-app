const express = require("express");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const path = require("path");
const fs = require("fs");
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method")); // Allow PUT and DELETE methods in form submissions
app.set("view engine", "ejs");

// Set views path correctly
app.set("views", path.join(__dirname, "../views")); // This sets the views path correctly

// File path to store todos in JSON format
const todosFilePath = path.join(__dirname, "todos.json");

// Function to read todos from JSON file
function readTodosFromFile() {
  try {
    const data = fs.readFileSync(todosFilePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading file:", err);
    return []; // Return empty array if file doesn't exist or error occurs
  }
}

// Function to write todos to JSON file
function writeTodosToFile(todos) {
  try {
    fs.writeFileSync(todosFilePath, JSON.stringify(todos, null, 2));
  } catch (err) {
    console.error("Error writing to file:", err);
  }
}

// Redirect to /todo when accessing the root URL
app.get("/", (req, res) => {
  res.redirect("/todo");
});

// Display the to-do list
app.get("/todo", (req, res) => {
  const todos = readTodosFromFile(); // Load todos from the JSON file
  res.render("todo", { todos }); // Render the "todo.ejs" page with the todos list
});

// Add an item to the to-do list
app.post("/todo/add", (req, res) => {
  const { item } = req.body;
  const newTodo = { id: Date.now(), item };
  const todos = readTodosFromFile();
  todos.push(newTodo); // Add new todo item
  writeTodosToFile(todos); // Save updated todos to JSON file
  res.redirect("/todo"); // Redirect back to /todo page
});

// Delete an item from the to-do list
app.get("/todo/delete/:id", (req, res) => {
  const { id } = req.params;
  let todos = readTodosFromFile(); // Load current todos
  todos = todos.filter((todo) => todo.id != id); // Remove the deleted todo by ID
  writeTodosToFile(todos); // Save updated todos to JSON file
  res.redirect("/todo"); // Redirect back to /todo after deletion
});

// Get a single todo item and render the edit page
app.get("/todo/:id", (req, res) => {
  const { id } = req.params;
  const todos = readTodosFromFile(); // Load current todos
  const todo = todos.find((todo) => todo.id == id); // Find todo by ID
  if (todo) {
    res.render("editItem", { todo }); // Render the edit page with the todo data
  } else {
    res.redirect("/todo"); // If not found, redirect to the todo list
  }
});

// Handle the update of a todo item
app.put("/todo/edit/:id", (req, res) => {
  const { id } = req.params;
  const { item } = req.body;
  let todos = readTodosFromFile(); // Load current todos
  todos = todos.map((todo) => (todo.id == id ? { ...todo, item } : todo)); // Update the todo item
  writeTodosToFile(todos); // Save updated todos to JSON file
  res.redirect("/todo"); // Redirect back to /todo after editing
});

// Start the server
const PORT = process.env.PORT || 5000; // Allow dynamic port assignment in production
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app; // Export app for testing purposes