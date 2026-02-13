const express = require('express');
const { router: itemsRouter } = require('./routes/items');
const { router: categoriesRouter } = require('./routes/categories');

const app = express();

app.use(express.json());
app.use('/items', itemsRouter);
app.use('/categories', categoriesRouter);

// Az app-ot exportáljuk, hogy a tesztek Supertest-tel tudják használni
module.exports = app;
