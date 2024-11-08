const request = require("supertest");
const chai = require("chai");
const app = require("../src/index"); // Your Express app
const fs = require("fs");
const path = require("path");

const expect = chai.expect;

describe("Todo App", function () {
  const todosFilePath = path.join(__dirname, "../src/todos.json"); // Path to the JSON file

  // Suppress console.log output during tests
  before(() => {
    console.log = function () {}; // Override console.log to suppress logging
  });

  // Clean up the todos file before each test
  beforeEach(function (done) {
    fs.writeFileSync(todosFilePath, JSON.stringify([])); // Clear the todos file before each test
    done();
  });

  // Clean up the todos file after each test
  afterEach(function (done) {
    fs.writeFileSync(todosFilePath, JSON.stringify([])); // Clear the todos file after each test
    done();
  });

  it("1. should redirect from the root to /todo", async function () {
    const res = await request(app).get("/");
    expect(res.status).to.equal(302); // Should redirect
    expect(res.header.location).to.equal("/todo");
  });

  it("2. should render the todo page with an empty todo list", async function () {
    const res = await request(app).get("/todo");
    expect(res.status).to.equal(200); // Should return OK
    expect(res.text).to.include("<title>Todo List</title>"); // Check if title is included in the response HTML
    expect(res.text).to.include("No tasks available. Add a new task!"); // Check if no tasks message is present
  });

  it("3. should add a new todo item", async function () {
    const todoItem = "Test Todo Item";

    // Make POST request to add a new todo
    const res = await request(app)
      .post("/todo/add")
      .type("form")
      .send({ item: todoItem });

    // Verify redirect after posting
    expect(res.status).to.equal(302); // Should redirect
    expect(res.header.location).to.equal("/todo");

    // Verify that the new item is in the todo list by checking the JSON file
    const todos = JSON.parse(fs.readFileSync(todosFilePath, "utf-8"));
    expect(todos.length).to.equal(1); // Should contain one todo
    expect(todos[0].item).to.equal(todoItem); // The todo item should match the posted item
  });

  it("4. should delete a todo item", async function () {
    const todoItem = "Test Todo Item to Delete";

    // Add a new todo first
    await request(app).post("/todo/add").type("form").send({ item: todoItem });

    // Verify that the todo was added
    const todosBeforeDelete = JSON.parse(
      fs.readFileSync(todosFilePath, "utf-8")
    );
    const todoId = todosBeforeDelete[0].id;

    // Delete the todo item
    const res = await request(app).get(`/todo/delete/${todoId}`);
    expect(res.status).to.equal(302); // Should redirect back to /todo

    // Verify that the item was deleted by checking the JSON file
    const todosAfterDelete = JSON.parse(
      fs.readFileSync(todosFilePath, "utf-8")
    );
    expect(todosAfterDelete.length).to.equal(0); // The list should be empty after deletion
  });

  it("5. should edit an existing todo item", async function () {
    const originalItem = "Original Todo Item";
    const updatedItem = "Updated Todo Item";

    // Add a new todo first
    await request(app)
      .post("/todo/add")
      .type("form")
      .send({ item: originalItem });

    // Verify that the todo was added
    const todosBeforeEdit = JSON.parse(fs.readFileSync(todosFilePath, "utf-8"));
    const todoId = todosBeforeEdit[0].id;

    // Edit the todo item
    const res = await request(app)
      .put(`/todo/edit/${todoId}`)
      .type("form")
      .send({ item: updatedItem });

    expect(res.status).to.equal(302); // Should redirect after editing

    // Verify that the updated item is in the todo list by checking the JSON file
    const todosAfterEdit = JSON.parse(fs.readFileSync(todosFilePath, "utf-8"));
    expect(todosAfterEdit.length).to.equal(1); // Should contain one todo
    expect(todosAfterEdit[0].item).to.equal(updatedItem); // The item should be updated
    expect(todosAfterEdit[0].item).not.to.equal(originalItem); // The original item should not be there
  });
});
