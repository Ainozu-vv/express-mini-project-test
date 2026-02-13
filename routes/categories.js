const express = require('express');

let categories;
let nextId;

function resetCategories() {
  categories = [
    { id: 1, name: 'Fruits' },
    { id: 2, name: 'Vegetables' },
  ];
  nextId = 3;
}

// initialize default state on startup
resetCategories();

const router = express.Router();

// Get all categories
router.get('/', (req, res) => {
  res.status(200).json(categories);
});

// Get a single category by ID
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const category = categories.find((c) => c.id === id);

  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }

  res.status(200).json(category);
});

// Create a new category
router.post('/', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  const newCategory = { id: nextId++, name };
  categories.push(newCategory);

  res.status(201).json(newCategory);
});

// Update a category
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const category = categories.find((c) => c.id === id);

  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }

  const { name } = req.body;

  if (name !== undefined) {
    category.name = name;
  }

  res.status(200).json(category);
});

// Delete a category
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = categories.findIndex((c) => c.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Category not found' });
  }

  categories.splice(index, 1);

  res.status(200).json({ message: 'Category deleted' });
});

module.exports = { router, resetCategories };
