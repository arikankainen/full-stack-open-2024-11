require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

morgan.token('body', (request) => {
  return JSON.stringify(request.body)
})

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('build'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/info', (request, response, next) => {
  Person
    .find({})
    .then(persons => {
      const info = `
      <p>Phonebook has info for ${persons.length} people</p>
      <p>${new Date()}</p>
      `
      response.send(info)
    })
    .catch(error => next(error))
})

app.get('/api/persons', (request, response, next) => {
  Person
    .find({})
    .then(persons => {
      response.json(persons.map(person => person.toJSON()))
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person
    .findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person.toJSON())
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person
    .findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person
    .findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person
    .save()
    .then(savedPerson => {
      response.json(savedPerson.toJSON())
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log('error.name', error.name)
  console.log('error.kind', error.kind)
  console.error(error.message)

  // 'error.kind' ei saa vääräntyyppisessä id:ssä arvoa 'ObjectId' vaan on 'undefined',
  // joten ohjeenmukainen tarkistus ei toimi. Alapuolelle lisätty toisenlainen tarkistus.
  /*
  if (error.name === 'CastError' && error.kind == 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  */

  if (error.name === 'CastError' && error.message.startsWith('Cast to ObjectId failed')) {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})