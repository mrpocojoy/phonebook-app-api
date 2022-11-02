require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const requestLogger = require('./loggerMiddleware')

// MONGOOSE MODELS
const Person = require('./models/person')
// ...

const app = express()
const PORT = process.env.PORT

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})



/*****************************************
 *  MIDDLEWARES
****************************************/

// Search for static frontend build (./build)
app.use(express.static('build'))

// Convert requests' body information to JSON
app.use(express.json())

// Adding a custom formatted logs to server console
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))
morgan.token('content', (request) => JSON.stringify(request.body))
app.use(requestLogger)

// Enabling CROSS-ORIGIN requests
app.use(cors())




/*****************************************
 *  ... GET ROUTES
****************************************/

app.get('/info', (request, response, next) => {
	Person
		.find({})
		.then(result => {
			response.status(200).send((result.length)
				? `Phonebook contains info about ${result.length} people <br/><br/> ${new Date()}`
				: `Phonebook is currently empty <br/><br/> ${new Date()}`
			)
		})
		.catch(error => next(error))
})

app.get('/api/persons', (request, response, next) => {
	Person
		.find({})
		.then(result => response.json(result))
		.catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
	Person
		.findById(request.params.id)
		.then(result => {
			if (!result)
				return next()

			response.json(result)
		})
		.catch(error => next(error))
})


/*****************************************
 *  ...POST ROUTES
****************************************/

app.post('/api/persons', (request, response, next) => {

	const mandatoryFields = ['name', 'phone']

	mandatoryFields.forEach(elem => {
		if (elem in request.body === false)
			throw `Missing mandatory field -> ${elem}`
	})

	const { name, phone } = request.body

	Person
		.findOne({ name })
		.then(result => {
			if (result !== null)
				throw 'Name must be unique.'

			new Person({ name, phone })
				.save()
				.then(result => response.status(201).json(result))
				.catch(error => next(error))
		})
		.catch(error => next(error))
})


/*****************************************
 *  ...PUT ROUTES
****************************************/

app.put('/api/persons/:id', (request, response, next) => {
	Person
		.findByIdAndUpdate(request.params.id, { ...request.body }, { new: true })
		.then(result => {
			if (!result)
				return next()

			response.json(result)
		})
		.catch(error => next(error))
})


/*****************************************
 *  ...DELETE ROUTES
****************************************/

app.delete('/api/persons/:id', (request, response, next) => {
	Person
		.findByIdAndDelete(request.params.id)
		.then(result => {
			if (!result)
				return next()

			response.status(204).json(result)
		})
		.catch(error => next(error))
})




/*****************************************
 *  HTTP 4XX HANDLERS
****************************************/

// 404 - UNKNOWN ENDPOINT
app.use((request, response) => {
	response.status(404).send({ error: 'HTTP404 - Unknown Endpoint.' })
})


// 400 - BAD CLIENT REQUEST
app.use((error, request, response, next) => {
	console.error("Error message", error.message)

	if (error.name === 'CastError')
		return response.status(400).send({ error: 'Wrong ID Format.' })

	return response.status(400).send({ error })
})
