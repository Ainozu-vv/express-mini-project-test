const express = require('express');

let cars;
let tasks;
let nextCarId;
let nextTaskId;

function resetCars() {
  cars = [
    { id: 1, plateNumber: 'ABC-123', brand: 'Toyota', model: 'Corolla', year: 2010 },
    { id: 2, plateNumber: 'XYZ-987', brand: 'Ford', model: 'Focus', year: 2016 },
  ];

  tasks = [
    {
      id: 1,
      carId: 1,
      title: 'Oil change',
      description: 'Replace engine oil and filter',
      completed: false,
    },
  ];

  nextCarId = 3;
  nextTaskId = 2;
}

resetCars();

function findCarById(id) {
  return cars.find((c) => c.id === id);
}

function findTaskById(taskId) {
  return tasks.find((t) => t.id === taskId);
}

const router = express.Router();

// Cars
router.get('/', (req, res) => {
  res.status(200).json(cars);
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const car = findCarById(id);

  if (!car) {
    return res.status(404).json({ message: 'Car not found' });
  }

  res.status(200).json(car);
});

router.post('/', (req, res) => {
  const { plateNumber, brand, model, year } = req.body;

  if (!plateNumber) {
    return res.status(400).json({ message: 'plateNumber is required' });
  }

  if (year !== undefined && typeof year !== 'number') {
    return res.status(400).json({ message: 'year must be a number if provided' });
  }

  const newCar = {
    id: nextCarId++,
    plateNumber,
    brand,
    model,
    year,
  };

  cars.push(newCar);

  res.status(201).json(newCar);
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const car = findCarById(id);

  if (!car) {
    return res.status(404).json({ message: 'Car not found' });
  }

  const { plateNumber, brand, model, year } = req.body;

  if (plateNumber !== undefined) {
    car.plateNumber = plateNumber;
  }
  if (brand !== undefined) {
    car.brand = brand;
  }
  if (model !== undefined) {
    car.model = model;
  }
  if (year !== undefined) {
    if (typeof year !== 'number') {
      return res.status(400).json({ message: 'year must be a number if provided' });
    }
    car.year = year;
  }

  res.status(200).json(car);
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = cars.findIndex((c) => c.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Car not found' });
  }

  cars.splice(index, 1);
  tasks = tasks.filter((t) => t.carId !== id);

  res.status(200).json({ message: 'Car deleted' });
});

// Tasks under cars
router.get('/:carId/tasks', (req, res) => {
  const carId = Number(req.params.carId);
  const car = findCarById(carId);

  if (!car) {
    return res.status(404).json({ message: 'Car not found' });
  }

  res.status(200).json(tasks.filter((t) => t.carId === carId));
});

router.get('/:carId/tasks/:taskId', (req, res) => {
  const carId = Number(req.params.carId);
  const taskId = Number(req.params.taskId);

  const car = findCarById(carId);
  if (!car) {
    return res.status(404).json({ message: 'Car not found' });
  }

  const task = findTaskById(taskId);
  if (!task || task.carId !== carId) {
    return res.status(404).json({ message: 'Task not found' });
  }

  res.status(200).json(task);
});

router.post('/:carId/tasks', (req, res) => {
  const carId = Number(req.params.carId);
  const car = findCarById(carId);

  if (!car) {
    return res.status(404).json({ message: 'Car not found' });
  }

  const { title, description, completed } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'title is required' });
  }

  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({ message: 'completed must be a boolean if provided' });
  }

  const newTask = {
    id: nextTaskId++,
    carId,
    title,
    description,
    completed: completed ?? false,
  };

  tasks.push(newTask);

  res.status(201).json(newTask);
});

router.put('/:carId/tasks/:taskId', (req, res) => {
  const carId = Number(req.params.carId);
  const taskId = Number(req.params.taskId);

  const car = findCarById(carId);
  if (!car) {
    return res.status(404).json({ message: 'Car not found' });
  }

  const task = findTaskById(taskId);
  if (!task || task.carId !== carId) {
    return res.status(404).json({ message: 'Task not found' });
  }

  const { title, description, completed } = req.body;

  if (title !== undefined) {
    task.title = title;
  }
  if (description !== undefined) {
    task.description = description;
  }
  if (completed !== undefined) {
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ message: 'completed must be a boolean if provided' });
    }
    task.completed = completed;
  }

  res.status(200).json(task);
});

router.delete('/:carId/tasks/:taskId', (req, res) => {
  const carId = Number(req.params.carId);
  const taskId = Number(req.params.taskId);

  const car = findCarById(carId);
  if (!car) {
    return res.status(404).json({ message: 'Car not found' });
  }

  const index = tasks.findIndex((t) => t.id === taskId && t.carId === carId);
  if (index === -1) {
    return res.status(404).json({ message: 'Task not found' });
  }

  tasks.splice(index, 1);

  res.status(200).json({ message: 'Task deleted' });
});

module.exports = { router, resetCars };
