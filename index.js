// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');

const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

// Define person schema
const personSchema = new mongoose.Schema({
    name: String,
    age: Number,
    favoriteFoods: {
        type: [String],
        default: [],
    },
});

// Create Person model
const Person = mongoose.model('Person', personSchema);

// Initialize express app
const app = express();

// Parse incoming request bodies as JSON
app.use(express.json());

// Connect to MongoDB database
const database = () => {
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
};

// Connect to database
database();

// Create an array of people
const arrayOfPeople = [
    new Person({
        name: 'John',
        age: 30,
        favoriteFoods: ['pizza', 'burger'],
    }),
    new Person({
        name: 'Jane',
        age: 25,
        favoriteFoods: ['sushi', 'pasta'],
    }),
];

// Create a new person
app.post('/people', async (req, res) => {
    try {
        const person = new Person(req.body);
        await person.save();
        res.status(201).send(person);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Create multiple new people
app.post('/people/many', async (req, res) => {
    try {
        const people = await Person.create(req.body);
        res.status(201).send(people);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Get a person by ID
app.get('/people/:id', async (req, res) => {
    try {
        const person = await Person.findById(req.params.id);
        if (!person) {
            return res.status(404).send("Person not found");
        }
        res.send(person);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get a person by favorite food
app.get('/people/food/:food', async (req, res) => {
    try {
        const person = await Person.findOne({ favoriteFoods: req.params.food });
        if (!person) {
            return res.status(404).send("Person not found with specified favorite food");
        }
        res.send(person);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update a person's favorite foods
app.put('/people/:id', async (req, res) => {
    try {
        const person = await Person.findById(req.params.id);
        person.favoriteFoods.push('hamburger');
        await person.save();
        res.send(person);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update a person's age by name
app.put('/people/name/:name', async (req, res) => {
    try {
        const person = await Person.findOneAndUpdate({ name: req.params.name }, { age: 20 }, { new: true });
        res.send(person);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Delete a person by ID
app.delete('/people/:id', async (req, res) => {
    try {
        const person = await Person.findByIdAndRemove(req.params.id);
        res.send(person);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Delete people by name
app.delete('/people/name/:name', async (req, res) => {
    try {
        const people = await Person.deleteMany({ name: req.params.name });
        res.send({ message: `${people.deletedCount} people deleted` });
    } catch (error) {
        res.status(500).send(error);
    }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});