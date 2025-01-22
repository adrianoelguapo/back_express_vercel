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

const uri = "mongodb+srv://admin:123@cluster0.tz018.mongodb.net/despliegue_vercel_express?retryWrites=true&w=majority";
const client = new MongoClient(url);
cliente.connect();
const db = client.db('despliegue_vercel_express');
const coleccion = db.collection('users');

app.get('/api/users', async (req, res) => {
  try {
    const users = await coleccion.find().toArray();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving users', error: err });
  }
});

app.get('/api/users/:name', async (req, res) => {
  try {
    const users = await db.coleccion.find({ name: new ObjectId(req.params.name) });
    if (!users) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(users);
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

    const result = await db.coleccion.insertOne(newUser);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: 'Error creating user', error: err });
  }
});

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
