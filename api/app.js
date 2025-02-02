const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const { MongoClient } = require('mongodb');

require('dotenv').config();

const middlewares = require('./middlewares');

const app = express();

const url = "mongodb+srv://admin:123@cluster0.tz018.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const cliente = new MongoClient(url);
cliente.connect();
const db = cliente.db('despliegue_vercel_express');
const coleccion = db.collection('users');



app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/api/users", async (req, res) =>{
  try {
    const users = await coleccion.find().toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
});

app.get("/api/users/:name", async (req, res) =>{
  const userId = req.params.name;
  try {
    const user = await coleccion.findOne({ name: userId });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "Usuario no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
});

app.post('/api/users', async (req, res) => {
  const { id, nombre, apellido, telefono } = req.body;
  try {
    await coleccion.insertOne({ id, nombre, apellido, telefono });
    res.status(201).json({ message: 'Usuario añadido exitosamente.', user: { id, nombre, apellido, telefono } });
  } catch (error) {
    res.status(500).json({ error: 'Error al añadir el usuario' });
  }
});

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
