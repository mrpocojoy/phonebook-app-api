const mongoose = require("mongoose")
const argsLength = process.argv.length

if (argsLength !== 3 && argsLength !== 5)
  errorExit()

connectToDB(process.argv[2])
const Person = buildPersonModel()

if (argsLength === 3)
  getAllPeople().then(people => printPeople(people))
else
  addNewPerson(process.argv[3], process.argv[4])



/********************************************** 
 * FUNCTIONS DECLARATION
**********************************************/
function errorExit() {
  console.log('Please provide enough arguments to run the program:')
  console.log('@ Print all contacts: node mongo.js <password>')
  console.log('@ Add new contact: node mongo.js <password> <newContactName> <newContactPhone>')
  process.exit(1)
}

function connectToDB(password) {
  const userName = 'MrJow_dev'
  const projectName = 'freecodecamp2022'
  const dbName = 'phonebook-app'

  const url = `mongodb+srv://${userName}:${password}@${projectName}.2qrgxcj.mongodb.net/${dbName}?retryWrites=true&w=majority`
  mongoose.connect(url)
  console.log(`DB Connection Established @ ${dbName}\n`)
}

function buildPersonModel() {
  const personSchema = new mongoose.Schema({
    name: String,
    phone: Number,
  })
  return mongoose.model('Person', personSchema)
}

function getAllPeople() {
  const filter = {}
  return Person
    .find(filter)
    .then(result => {
      mongoose.connection.close()
      return result
    })
    .catch(error => {
      console.error(error)
      return []
    })
}

function printPeople(people) {
  console.log("**** PHONEBOOK CONTACTS ****")
  console.log('----------------------------------')
  people.forEach(person => printPerson(person))
}

function printPerson({ name, phone }) {
  console.log(`Name:  ${name} \nPhone: ${phone}`)
  console.log('----------------------------------')
}

function addNewPerson(newName, newPhone) {
  const newPerson = new Person({
    name: newName,
    phone: newPhone
  })

  console.log("Provided data ->", newPerson)

  newPerson
    .save()
    .then(result => {
      console.log("new person saved ->", result)
      mongoose.connection.close()
    })
    .catch(error => console.error("@Save person -> ", error))
}
