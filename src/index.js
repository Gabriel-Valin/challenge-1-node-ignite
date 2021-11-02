const express = require('express');
const cors = require('cors');
const { uuid } = require('uuidv4');

// const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const findUser = users.find(user => user.username === username)

  if (!findUser) {
    return response.status(400).json({ error: 'Non-Existent user, please register' })
  }

  request.username = findUser

  next()
}
app.post('/users', (request, response) => {
  const { name, username } = request.body
  const id = uuid()

  const findUser = users.find(user => user.username === username)

  if (findUser) {
    return response.status(400).json({ error: 'Username Already exists!' })
  }

  const newUser = {
    id,
    name,
    username,
    todos: []
  }

  users.push(newUser)

  return response.status(201).json(newUser)

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request

  return response.status(200).json(username.todos)

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request
  const { title, deadline } = request.body
  const id = uuid()

  const newTodo = {
    id,
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date()
  }

  console.log(newTodo)

  username.todos.push(newTodo)

  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request
  const { id } = request.params
  const { title, deadline } = request.body

  const findTodo = username.todos.find(todo => todo.id === id)

  if (!findTodo) {
    return response.status(404).json({ error: 'Non-Existent TODO'})
  }

  findTodo.title = title
  findTodo.deadline = deadline

  return response.status(201).json(findTodo)

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request
  const { id } = request.params

  const findTodo = username.todos.find(todo => todo.id === id)

  if (!findTodo) {
    return response.status(404).json({ error: 'Non-Existent TODO'})
  }

  findTodo.done = true

  return response.status(201).json(findTodo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request
  const { id } = request.params

  const findTodo = username.todos.find(todo => todo.id === id)
  
  if (!findTodo) {
    return response.status(404).json({ error: 'Non-Existent TODO'})
  }

  username.todos.splice(findTodo, 1)

  return response.status(204).send()
});

module.exports = app;