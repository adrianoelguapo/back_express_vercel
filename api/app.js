const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const middlewares = require('./middlewares');

const app = express();

app.use(morgan('dev'));
app.use(helmet({ contentSecurityPolicy: false })); // Configuración más flexible
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://admin:123@cluster0.tz018.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
let client;
let db;

async function connectToDatabase() {
  if (!client || !client.isConnected()) {
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    db = client.db('despliegue_vercel_express');
    console.log('Connected to MongoDB Atlas');
  }
  return db;
}

app.get('/api/users', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const users = await db.collection('users').find().toArray();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving users', error: err });
  }
});

app.get('/api/users/:name', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const user = await db.collection('users').findOne({ name: req.params.name });
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
    const db = await connectToDatabase();
    const newUser = {
      name: req.body.name,
      apellido: req.body.apellido,
      tlf: req.body.tlf,
    };

    const result = await db.collection('users').insertOne(newUser);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: 'Error creating user', error: err });
  }
});

app.use(middlewares.notFound);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

module.exports = app;
