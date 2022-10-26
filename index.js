const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})



/*****************************************
 *  MIDDLEWARES
 ****************************************/

app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))
morgan.token('content', (request) => JSON.stringify(request.body))
app.use(cors())

/*****************************************
 *  HARDCODED DB
 ****************************************/

let persons = [
  {
    "id": 1,
    "name": "Arto Hellas",
    "phone": 11111111111
  },
  {
    "id": 2,
    "name": "Ada Lovelace",
    "phone": 22222222222
  },
  {
    "id": 3,
    "name": "Dan Abramov",
    "phone": 33333333333
  },
  {
    "id": 4,
    "name": "Mary Poppendick",
    "phone": 44444444444
  }
]

const generateId = () => {
  return Math.floor(Math.random() * 1000)
}


/*****************************************
 *  GET ROUTES
 ****************************************/

app.get('/info', (request, response) => {
  response.send(`Phonebook contains info about ${persons.length} people <br/><br/> ${new Date()}`)
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)

  if (person)
    response.json(person)
  else
    response.status(404).json('Person not found').end()
})


/*****************************************
 *  POST ROUTES
 ****************************************/
app.post('/api/persons', (request, response) => {

  // const body = request.body
  const body = request.body
  if (!body.name || !body.phone)
    return response.status(400).json({
      error: "Information Missing"
    })


  if (persons.find(({ name }) => name.match(new RegExp(body.name.trim(), 'i'))))
    return response.status(400).json({
      error: "Name must be unique"
    }).end()

  const person = {
    id: generateId(),
    name: body.name,
    phone: body.phone
  }

  persons = persons.concat(person)
  response.status(200).json(person)
})

/*****************************************
 *  DELETE ROUTES
 ****************************************/

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})


/*****************************************
 *  DEFAULT ROUTES
 ****************************************/

// app.use((request, response) => {
//   response.status(404).send('404. Not found')
// })

// app.use((error, request, response, next) => {
//   console.error(error.stack)
//   response.status(500).send(`500. Internal server error`)
// })
