require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
morgan.token('body', req => JSON.stringify(req.body)
)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))



let persons = [
]

app.get('/api/persons', (req, res,next) => {
    Person.find({})
    .then(persons=> {
        res.json(persons)
    })
    .catch(error => next(error))
})

app.get('/',(req,res) => {
    res.send('<h1>Hello world</h1>')
})

app.get('/info', (req, res,next) => {
    const date = new Date()
    Person.countDocuments({})
        .then(count => {
            res.send(`<p>Phonebook has info for ${count} people</p>
            <div>${date}</div>`)
        })
        .catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if (person) {
                res.json(person)
            } else {
                res.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res,next)=> {
    
    Person.findByIdAndDelete(req.params.id)
        .then(result => {
            res.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons/', (req, res,next) => {
    
    const body = req.body
    
    if (!body.name || !body.number) {
        return res.status(400).json({
            error: 'name or number missing'
        })
    }

    if (persons.some(person=> person.name === req.body.name)) {
        return res.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = new Person ({
        name: body.name,
        number: body.number
    })

    person.save()
        .then(savedPerson => {
            res.json(savedPerson)
    })
        .catch(error => next(error))
    
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    const updatedPerson = {
        name: body.name,
        number: body.number
    }
    Person.findByIdAndUpdate(request.params.id, updatedPerson, {new: true})
        .then(updatedPerson =>
            response.json(updatedPerson))
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if (error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'})
    }
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, ()=> {
    console.log(`Server running on port ${PORT}`)
})