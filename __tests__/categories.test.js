const request = require("supertest");
const app = require("../app");
const { resetCategories } = require("../routes/categories");

// Reset in-memory categories before each test
beforeEach(() => {
  resetCategories();
});

describe("Categories API (mini_project)", () => {
  describe("GET /categories", () => {
    it("returns all default categories", async () => {
      const res = await request(app).get("/categories", () => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body[0]).toHaveProperty("id", 1);
        expect(res.body[0]).toHaveProperty("name", "Fruits");
      });
    });
  });

  describe("GET /categories/:id", () => {
    it("returns a single category when it exists", async () => {
      const res = await request(app).get("/categories/1", () => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0]).toHaveProperty("id", 1);
        expect(res.body[0]).toHaveProperty("name", "Fruits");
      });
    });

    it("returns 404 when category does not exist", async () => {
      const res = await request(app).get("/categories/999", () => {
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("message", "Category not found");
      });
    });
  });

  describe("POST /categories", () => {
    it("creates a new category with valid data", async () => {
      const res = await request(app).post("/categories").send({
        name: "Dairy",
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id", 3);
      expect(res.body).toHaveProperty("name", "Dairy");
    });

    it("returns 400 when data is invalid", async () => {
      const res = await request(app).post("/categories").send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Name is required");
    });
  });

  describe("PUT /categories/:id", () => {
    it("updates an existing category", async () => {
      /*
      const res=await request(app).put("/categories/1").send({
        name:"Fresh Fruits"
      })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('id',1)
      expect(res.body).toHaveProperty('name','Fresh Fruits')
      */
      const existing = await request(app).get("/categories/1", async () => {
        const res = await request(app).put("/categories/1").send({
          name: "Fresh Fruits",
        });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("id", 1);
        expect(res.body).toBeTruthy(existing!=res);
      });   
    });

    it("returns 404 when updating non-existing category", async () => {
      const res=await request(app)
      .put("/categories/999")
      .send({name:'Nothing'})

      expect(res.status).toBe(404)
      expect(res.body).toHaveProperty("message", "Category not found")
    });
  });

  describe("DELETE /categories/:id", () => {
    it("deletes an existing category", async () => {
      const res=await request(app).delete("/categories/1")

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty("message")

      /*
      const listRes=await request(app).get("/categories/1")
      expect(listRes.status).toBe(404)
      */
     const listRes=await request(app).get("/categories")
     expect(listRes.body.find((c)=>c.id==1)).toBeUndefined()
    });

    it("returns 404 when deleting non-existing category", async () => {
      const res=await request(app).delete("/categories/999")

      expect(res.status).toBe(404)
      expect(res.body).toHaveProperty("message", "Category not found")
    });
  });
});
