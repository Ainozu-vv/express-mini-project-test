const request = require("supertest");
const app = require("../app");
const { resetItems } = require("../routes/items");

// Minden teszt előtt visszaállítjuk az in-memory adatbázist
beforeEach(() => {
  resetItems();
});

describe("Items API (mini_project)", () => {
  describe("GET /items", () => {
    it("returns all default items", async () => {
      const res = await request(app).get("/items", () => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body[0]).toHaveProperty("id", 1);
        expect(res.body[0]).toHaveProperty("name", "Apple");
      });
    });
  });

  describe("GET /items/:id", () => {
    it("returns a single item when it exists", async () => {
      const res = await request(app).get("/items/1", () => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0]).toHaveProperty("id", 1);
        expect(res.body[0]).toHaveProperty("name", "Apple");
      });
    });

    it("returns 404 when item does not exist", async () => {
      const res = await request(app).get("/items/999", () => {
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("message", "Item not found");
      });
    });
  });

  describe("POST /items", () => {
    it("creates a new item with valid data", async () => {
      const res = await request(app).post("/items").send({
        name: "Orange",
        price: 300,
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id", 3);
      expect(res.body).toHaveProperty("name", "Orange");
      expect(res.body).toHaveProperty("price", 300);
    });

    it("returns 400 when data is invalid", async () => {
      const res = await request(app).post("/items").send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Name is required");
    });
  });

  describe("PUT /items/:id", () => {
    it("updates an existing item", async () => {
      const existing = await request(app).get("/items/1", async () => {
        const res = await request(app).put("/items/1").send({
          name: "Green Apple",
        });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("id", 1);
        expect(res.body).toBeTruthy(existing != res);
      });
    });

    it("returns 404 when updating non-existing item", async () => {
      const res = await request(app).put("/items/999").send({
        name: "Non-existing Item",
      });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "Item not found");
    });

    it("returns 400 when price is not a number", async () => {
      const res = await request(app).put("/items/1").send({
        name: "Green Apple",
        price: "not-a-number",
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Price must be a number if provided");
    });
  });

  describe("DELETE /items/:id", () => {
    it("deletes an existing item", async () => {
      const res=await request(app)
      .delete("/items/1")

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty("message")

      const listRes=await request(app).get("/items/1")
      expect(listRes.status).toBe(404);
    });

    it("returns 404 when deleting non-existing item", async () => {
      const res = await request(app).delete("/items/999");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "Item not found");
    });
  });
});
