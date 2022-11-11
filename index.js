require('dotenv').config()
const PORT = process.env.PORT

const express = require('express')
const app = express()
const cors = require('cors')

const morgan = require('morgan')
const consoleLogger = require('./middleware/console-logger')
const notFound = require('./middleware/not-found')
const handleErrors = require('./middleware/handle-errors')



/*****************************************
 *  PORT LISTENER
*****************************************/
app.listen(PORT, () => {
	console.clear()
	console.log('\n************************************')
	console.log(`RELOAD. Server running on port ${PORT}`)
	console.log('************************************\n')
})



/*****************************************
 *  MONGO DB
*****************************************/
const connectDB = require('./mongo.js')
const Person = require('./models/Person.js')

connectDB()



/*****************************************
 *  HELPER MIDDLEWARES
****************************************/

// Search for static frontend build (./build)
app.use(express.static('build'))

// Serve static content in /images folder to API
app.use('/images', express.static('images'))

// Convert requests' body information to JSON
app.use(express.json())

// Adding a custom formatted logs to server console
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))
morgan.token('content', (request) => JSON.stringify(request.body))
app.use(consoleLogger)

// Enabling CROSS-ORIGIN requests
const corsOptions = {
	origin: '*',
	optionsSuccessStatus: 200
	// origin: function (origin, callback) {
	//   // db.loadOrigins is an example call to load a list of origins from a backing database
	//   db.loadOrigins(function (error, origins) {
	//     callback(error, origins)
	//   })
	// }
}
app.use(cors(corsOptions))



/*****************************************
 *  ROUTE CONTROLLERS
*****************************************/


/*****  GET  *****/

// Obtain total number of entries in phonebook
app.get('/info', (request, response, next) => {
	Person
		.find({})
		.then(people => {
			const msg = (people.length)
				? `Phonebook contains info about ${people.length} people <br/><br/> ${new Date()}`
				: `Phonebook is currently empty <br/><br/> ${new Date()}`

			response.send(msg)
		})
		.catch(error => next(error))
})


// Obtain all contacts from DB
app.get('/api/persons', (request, response, next) => {
	Person
		.find({})
		.then(people => response.json(people))
		.catch(error => next(error))
})


// Obtain specific contact from DB, based on personID
app.get('/api/persons/:id', (request, response, next) => {
	Person
		.findById(request.params.id)
		.then(person => {
			return person
				? response.json(person)
				: next('ID not found')
		})
		.catch(error => next(error))
})



/*****  POST  *****/

// Add new contact to DB, based on request.body
app.post('/api/persons', (request, response, next) => {

	const reqBody = request.body

	const newPerson = new Person({
		name: reqBody.name,
		phone: reqBody.phone,
	})

	newPerson
		.save()
		.then(savedPerson => response.status(201).json(savedPerson))
		.catch(error => next(error))

	// Person
	// 	.findOne({ name: request.body.name })
	// 	.then(person => {
	// 		return person !== null
	// 			? next('Name must be unique.')
	// 			: new Person({ ...request.body })
	// 				.save()
	// 				.then(result => response.status(201).json(result))
	// 				.catch(error => next(error))
	// 	})
	// 	.catch(error => next(error))
})



/*****  PUT  *****/

// Edit existing contact in DB, based on personID
app.put('/api/persons/:id', (request, response, next) => {
	Person
		.findByIdAndUpdate(request.params.id, { ...request.body }, { new: true, runValidators: true })
		.then(updatedPerson => {
			return updatedPerson
				? response.json(updatedPerson)
				: next('ID not found')
		})
		.catch(error => next(error))
})



/*****  DELETE  *****/

// Delete existing contact in DB, based on personID
app.delete('/api/persons/:id', (request, response, next) => {
	Person
		.findByIdAndDelete(request.params.id)
		.then(deletedPerson => {
			return deletedPerson
				? response.status(204).json(deletedPerson)
				: next('ID not found')
		})
		.catch(error => next(error))
})



/*****************************************
 *  ERROR HANDLERS
****************************************/

// 404 - UNKNOWN ENDPOINT
app.use(notFound)

// OTHER ERRORS
app.use(handleErrors)

