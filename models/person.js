const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to' ,url)
mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB', error.message)
  })

function validator (val) {
  return /(^\d{2}-\d{6,})|(^\d{3}-\d{5,})/.test(val)
}

const custom = [validator, 'Number needs to be formatted xx-xxxxxx.. or xxx-xxxxx.. and minimum length is 8.']

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3
  },
  number: {
    type: String,
    validate: custom
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)