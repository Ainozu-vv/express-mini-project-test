const express = require('express');

let items;
let nextId;

function resetItems() {
  items = [
    { id: 1, name: 'Apple', price: 100 },
    { id: 2, name: 'Banana', price: 200 },
  ];
  nextId = 3;
}

// induláskor alapértelmezett állapot
resetItems();

const router = express.Router();

// Összes termék lekérése
router.get('/', (req, res) => {
  res.status(200).json(items);
});

// Egy termék lekérése ID alapján
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const item = items.find((i) => i.id === id);

  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  res.status(200).json(item);
});

// Új termék létrehozása
router.post('/', (req, res) => {
  const { name, price } = req.body;

  if (!name || typeof price !== 'number') {
    return res
      .status(400)
      .json({ message: 'Name and numeric price are required' });
  }

  const newItem = { id: nextId++, name, price };
  items.push(newItem);

  res.status(201).json(newItem);
});

// Termék frissítése
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const item = items.find((i) => i.id === id);

  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  const { name, price } = req.body;

  if (name !== undefined) {
    item.name = name;
  }
  if (price !== undefined) {
    if (typeof price !== 'number') {
      return res
        .status(400)
        .json({ message: 'Price must be a number if provided' });
    }
    item.price = price;
  }

  res.status(200).json(item);
});

// Termék törlése
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = items.findIndex((i) => i.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Item not found' });
  }

  items.splice(index, 1);

  res.status(200).json({ message: 'Item deleted' });
});

module.exports = { router, resetItems };
