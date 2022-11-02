const mongoose = require('mongoose')
const mongoURL = process.env.MONGO_URI

// Connection to DB
console.log(`Connecting to MongoDB @ ${mongoURL}`)
mongoose
  .connect(mongoURL)
  .then(result => console.log("Connection established with MongoDB"))
  .catch(error => console.log("Error while connecting to MongoDB", error))


// Person Schema
const personSchema = mongoose.Schema({
  name: String,
  phone: Number
})
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


module.exports = mongoose.model('Person', personSchema)