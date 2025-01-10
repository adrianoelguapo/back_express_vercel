const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const middlewares = require('./middlewares');

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

const mongoURI = "mongodb+srv://admin:123@cluster0.tz018.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";;
const client = new MongoClient(mongoURI);
let db;

client.connect()
  .then(() => {
    db = client.db('despliegue_vercel_express');
    console.log('Connected to MongoDB Atlas');
  })
  .catch((err) => console.error('Error connecting to MongoDB Atlas:', err));

app.get('/api/users', async (req, res) => {
  try {
    const users = await db.collection('users').find().toArray();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving users', error: err });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.params.id) });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving user', error: err });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const newUser = {
      name: req.body.name,
      apellido: req.body.apellido,
      tlf: req.body.tlf,
    };

    const result = await db.collection('users').insertOne(newUser);
    res.status(201).json({ _id: result.insertedId, ...newUser });
  } catch (err) {
    res.status(400).json({ message: 'Error creating user', error: err });
  }
});

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
