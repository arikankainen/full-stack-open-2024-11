import React, { useState, useEffect } from 'react'
import personService from './services/persons'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
      .catch(() => {
        showErrorMessage('Error retrieving phonebook from server')
      })
  }, [])

  const showErrorMessage = message => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 5000)
  }

  const showSuccessMessage = message => {
    setSuccessMessage(message)
    setTimeout(() => {
      setSuccessMessage(null)
    }, 5000)
  }

  const handleNewName = event => {
    setNewName(event.target.value)
  }

  const handleNewNumber = event => {
    setNewNumber(event.target.value)
  }

  const handleFilter = event => {
    setShowAll(
      (event.target.value.length > 0) ? false : true
    )
    setFilter(event.target.value)
  }

  const handleDeleteNumber = event => {
    const id = event.target.value
    const nameToDelete = persons.find(person => person.id === id).name

    if (window.confirm(`Delete ${nameToDelete} ?`)) {
      personService
        .remove(id)
        .then(() => {
          setPersons(persons.filter(person => person.id !== id))
          showSuccessMessage(`Deleted '${nameToDelete}'`)
        })
        .catch(() => {
          showErrorMessage(`Error deleting '${nameToDelete}' from server`)
        })
    }
  }

  const personsToShow = showAll
    ? persons
    : persons.filter(person => person.name.toUpperCase().includes(filter.toUpperCase()))

  const addPerson = event => {
    event.preventDefault()

    const personObject = {
      name: newName,
      number: newNumber
    }

    if (persons.some(person => person.name === newName)) {
      const existingPerson = persons.find(person => person.name === newName)

      if (window.confirm(`${newName} is already added to phonebook, replace old number with a new one?`)) {
        personService
          .update(existingPerson.id, personObject)
          .then(returnedPerson => {
            setPersons(
              persons.map(person => person.id !== existingPerson.id ? person : returnedPerson)
            )
            setNewName('')
            setNewNumber('')
            showSuccessMessage(`Updated '${newName}'`)
          })
          .catch(error => {
            const message = error.response.data

            if (Object.prototype.hasOwnProperty.call(message, 'error')) {
              showErrorMessage(message.error)
            } else {
              showErrorMessage(`Error adding '${newName}' to server`)
            }
          })
      }
    } else {
      personService
        .create(personObject)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson))
          setNewName('')
          setNewNumber('')
          showSuccessMessage(`Added '${newName}'`)
        })
        .catch(error => {
          const message = error.response.data

          //if (message.hasOwnProperty('error')) { // <- ESlint error!
          if (Object.prototype.hasOwnProperty.call(message, 'error')) {
            showErrorMessage(message.error)
          } else {
            showErrorMessage(`Error adding '${newName}' to server`)
          }
        })
    }
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={errorMessage} messageStyle="error" />
      <Notification message={successMessage} messageStyle="success" />
      <Filter filter={filter} handleChange={handleFilter} />
      <h3>add a new</h3>
      <PersonForm handleSubmit={addPerson} name={newName} handleNameChange={handleNewName} number={newNumber} handleNumberChange={handleNewNumber} />
      <h3>Numbers</h3>
      <Numbers persons={personsToShow} handleDelete={handleDeleteNumber} />
    </div>
  )
}

const Notification = ({ message, messageStyle }) => {
  if (message === null) {
    return null
  }

  return (
    <div className={messageStyle}>
      {message}
    </div>
  )
}

const Filter = ({ filter, handleChange }) => {
  return (
    <div>filter shown with <input value={filter} onChange={handleChange} /></div>
  )
}

const PersonForm = ({ handleSubmit, name, handleNameChange, number, handleNumberChange }) => {
  return (
    <form onSubmit={handleSubmit}>
      <div>name: <input value={name} onChange={handleNameChange} /></div>
      <div>number: <input value={number} onChange={handleNumberChange} /></div>
      <div><button type="submit">add</button></div>
    </form>
  )
}

const Numbers = ({ persons, handleDelete }) => {
  return (
    <ul>
      {persons.map(person => <Number key={person.name} person={person} handleDelete={handleDelete} />)}
    </ul>
  )
}

const Number = ({ person, handleDelete }) => {
  return (
    <li>
      <div>{person.name} {person.number} <button value={person.id} onClick={handleDelete}>delete</button></div>
    </li>
  )
}

export default App