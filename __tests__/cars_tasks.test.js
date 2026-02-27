const request = require("supertest");
const app = require("../app");
const { resetCars } = require("../routes/cars");

beforeEach(() => {
  resetCars();
});

describe("Car service API tests", () => {
  describe("Cars", () => {
    it("GET /cars - returns defaults cars", async () => {
      const res = await request(app).get("/cars");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0]).toHaveProperty("id", 1);
      expect(res.body[0]).toHaveProperty("plateNumber", "ABC-123");
    });
    it("GET /cars:id return 404 for non-existing car", async () => {
      const res = await request(app).get("/cars/999");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "Car not found");
    });
    it("PUT /cars/:id - updates a car", async () => {
      const res = await request(app).put("/cars/1").send({
        model: "Yaris",
      });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: 1,
        model: "Yaris",
      });
    });

    it("PUT /cars:id returns 400 when year is not a number", async () => {
      const res = await request(app).put("/cars/1").send({
        year: "asd-asd",
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty(
        "message",
        "year must be a number if provided",
      );
    });
    it("DELETE /cars/:id - deletes the car and its tasks", async () => {
      //ELSŐ: lekérjük egy változóba az autóhoz tartozó taskokat.
      const beforeTasks = await request(app).get("/cars/1/tasks");
      expect(beforeTasks.status).toBe(200);
      expect(beforeTasks.body.length).toBe(1);
      //MÁSODIK: töröljük az autót
      const deleteCarRes = await request(app).delete("/cars/1");
      expect(deleteCarRes.status).toBe(200);
      expect(deleteCarRes.body).toHaveProperty("message", "Car deleted");
      //HARMADIK: megnézzük az autó létezik-e, törlés után
      const getCarRes = await request(app).get("/cars/1");
      expect(getCarRes.status).toBe(404);
      expect(getCarRes.body).toHaveProperty("message", "Car not found");
      //NEGYEDIK: megnézzük a taskokat hogy léteznek-e még
      const afterTasks = await request(app).get("/cars/1/tasks");
      expect(afterTasks.status).toBe(404);
      expect(afterTasks.body).toHaveProperty("message", "Car not found");
    });
    it("DELETE /cars/:id return 404 for non-existing car", async () => {
      const res = await request(app).delete("/cars/999");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "Car not found");
    });
  });

  describe("Tasks", () => {
    it("GET /cars/:carId/tasks returns 404 when car does not exist", async () => {
      const res = await request(app).get("/cars/999/tasks");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "Car not found");
    });

    it("GET /cars/:carId/tasks/:taskId returns a task when it exists", async () => {
      const res = await request(app).get("/cars/1/tasks");
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: 1, carId: 1, completed: false });
    });

    it("GET /cars/:carId/tasks/:taskId returns 404 when task is not under that car", async () => {
      const createTaskRes = await request(app).post("/cars/2/tasks").send({
        title: "Tire swap",
      });
      const taskId = createTaskRes.body.id;
      const res = await request(app).get(`/cars/1/tasks/${taskId}`);
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "Task not found");
    });
    it("POST /cars/:carId/tasks returns 400 when title is missing", async () => {
      const createTaskRes = await request(app).post("/cars/2/tasks").send({
        description: "a",
      });
      expect(createTaskRes.status).toBe(400);
      expect(createTaskRes.body).toHaveProperty("message", "title is required");
    });

    it("POST /cars/:carId/tasks returns 400 when completed is not boolean", async () => {
      const createTaskRes = await request(app).post("/cars/2/tasks").send({
        title: "Tire swap",
        completed: "no",
      });
      expect(createTaskRes.status).toBe(400);
      expect(createTaskRes.body).toHaveProperty(
        "message",
        "completed must be a boolean if provided",
      );
    });

    it("PUT /cars/:carId/tasks/:taskId updates title and description", async () => {
      const res = await request(app).put("/cars/1/tasks/1").send({
        title: "Oil change + filter",
        description: "Change the oil and filter",
      });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: 1,
        carId: 1,
        title: "Oil change + filter",
        description: "Change the oil and filter",
      });
    });

    it("PUT /cars/:carId/tasks/:taskId returns 404 when car does not exist", async () => {
       const res = await request(app)
        .put('/cars/999/tasks/111')
        .send({ completed: true });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'Car not found');
    });

    it("PUT /cars/:carId/tasks/:taskId returns 404 when task does not exist", async () => {
      const res = await request(app)
        .put('/cars/1/tasks/999')
        .send({ completed: true });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'Task not found');
    });

    it("DELETE /cars/:carId/tasks/:taskId returns 404 when task does not exist", async () => {
      const res = await request(app).delete('/cars/1/tasks/999');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'Task not found')
    });
  });

   it('creates a car, adds a task, updates completed, then deletes the task', async () => {
    const createCarRes = await request(app).post('/cars').send({
      plateNumber: 'HUN-001',
      brand: 'VW',
      model: 'Golf',
      year: 2018,
    });

    expect(createCarRes.status).toBe(201);
    expect(createCarRes.body).toMatchObject({
      plateNumber: 'HUN-001',
      brand: 'VW',
      model: 'Golf',
      year: 2018,
    });
    expect(createCarRes.body).toHaveProperty('id');

    const carId = createCarRes.body.id;

    const createTaskRes = await request(app).post(`/cars/${carId}/tasks`).send({
      title: 'Brake check',
      description: 'Inspect pads and discs',
    });

    expect(createTaskRes.status).toBe(201);
    expect(createTaskRes.body).toMatchObject({
      carId,
      title: 'Brake check',
      description: 'Inspect pads and discs',
      completed: false,
    });
    expect(createTaskRes.body).toHaveProperty('id');

    const taskId = createTaskRes.body.id;

    const updateTaskRes = await request(app)
      .put(`/cars/${carId}/tasks/${taskId}`)
      .send({ completed: true });

    expect(updateTaskRes.status).toBe(200);
    expect(updateTaskRes.body).toMatchObject({
      id: taskId,
      carId,
      completed: true,
    });

    const listTasksRes = await request(app).get(`/cars/${carId}/tasks`);
    expect(listTasksRes.status).toBe(200);
    expect(listTasksRes.body.length).toBe(1);
    expect(listTasksRes.body[0]).toMatchObject({ id: taskId, completed: true });

    const deleteTaskRes = await request(app).delete(`/cars/${carId}/tasks/${taskId}`);
    expect(deleteTaskRes.status).toBe(200);
    expect(deleteTaskRes.body).toHaveProperty('message', 'Task deleted');

    const listAfterDeleteRes = await request(app).get(`/cars/${carId}/tasks`);
    expect(listAfterDeleteRes.status).toBe(200);
    expect(listAfterDeleteRes.body).toEqual([]);
  });

  it('returns 400 when creating a car without plateNumber', async () => {
    const res = await request(app).post('/cars').send({ brand: 'VW' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'plateNumber is required');
  });

  it('returns 404 when adding a task to a non-existing car', async () => {
    const res = await request(app).post('/cars/999/tasks').send({ title: 'Any' });
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Car not found');
  });

  it('returns 400 when updating task with non-boolean completed', async () => {
    const res = await request(app)
      .put('/cars/1/tasks/1')
      .send({ completed: 'yes' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty(
      'message',
      'completed must be a boolean if provided'
    );
  });
});
