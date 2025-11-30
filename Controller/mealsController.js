const { connectDB,sql } = require("../MiddleWare/connectToDB");
const generateError = require("../MiddleWare/generateError");
const handleRes = require("../MiddleWare/handleRes");
const { SUCCESS, FAIL } = require("../MiddleWare/handleResStatus");
const asyncWrapper = require("../MiddleWare/errorHandling");

const getAllMeals = asyncWrapper(async (req, res, next) => {
  const pool = await connectDB();

  const result = await pool.request().query(`
        SELECT 
            p.id,
            p.name,
            p.price,
            p.description,
            p.image,
            c.id AS category_id,
            c.name AS category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
    `);

  if (result.recordset.length === 0)
    return next(generateError("no data to show ", 200, FAIL));
  return handleRes(res, 200, SUCCESS, result.recordset);
});

const getSingleMeal = asyncWrapper(async (req, res, next) => {
  const { mealId } = req.params;
  const pool = await connectDB();
  const result = await pool.request().input("id", mealId).query(`
                SELECT 
                    p.id,
                    p.name,
                    p.price,
                    p.description,
                    p.image,
                    c.id AS category_id,
                    c.name AS category_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.id = @id
            `);

  const product = result.recordset[0];
  if (!product) return next(generateError("no data to show ", 200, FAIL));

  return handleRes(res, 200, SUCCESS, result.recordset);
});

const addMeal = asyncWrapper(async (req, res, next) => {
  const { name, price, description, category_id } = req.body;
  const pool = await connectDB();

  await pool
    .request()
    .input("name", name)
    .input("price", price)
    .input("description", description)
    .input("category_id", category_id).query(`
                INSERT INTO products (name, price, description, category_id)
                VALUES (@name, @price, @description, @category_id)
            `);
  handleRes(res, 201, SUCCESS, "Product created successfully");
});

const updateMeal = asyncWrapper(async (req, res, next) => {
  const { mealId } = req.params;
  const { name, price, description, category_id } = req.body;

  const pool = await connectDB();

  // 1️⃣ Build update fields dynamically
  let updates = [];
  if (name) updates.push(`name = @name`);
  if (price) updates.push(`price = @price`);
  if (description) updates.push(`description = @description`);
  if (category_id) updates.push(`category_id = @category_id`);

  // If no fields provided
  if (updates.length === 0)
    return next(generateError("No fields to update", 400, FAIL));

  const sqlQuery = `
        UPDATE products 
        SET ${updates.join(", ")} 
        WHERE id = @id;
    `;

  // 2️⃣ Prepare SQL inputs
  const request = pool.request().input("id", sql.Int, mealId);

  if (name) request.input("name", sql.VarChar, name);
  if (price) request.input("price", sql.Decimal, price);
  if (description) request.input("description", sql.VarChar, description);
  if (category_id) request.input("category_id", sql.Int, category_id);

  // 3️⃣ Execute update
  await request.query(sqlQuery);

  handleRes(res, 200, SUCCESS, "Meal updated successfully");
});


const deleteMeal = asyncWrapper(async (req, res, next) => {
  const { mealId } = req.params;
  const pool = await connectDB();
  const checkUser = await pool
    .request()
    .input("id", mealId)
    .query("SELECT * FROM products WHERE id = @id");
  if (checkUser.recordset.length == 0)
    return next(generateError("this meal already not exist", 404, FAIL));

  await pool
    .request()
    .input("id", mealId)
    .query(`DELETE FROM products WHERE id = @id`);

  handleRes(res, 201, SUCCESS, "Product deleted successfully");
});

module.exports = {
  getAllMeals,
  getSingleMeal,
  addMeal,
  deleteMeal,
  updateMeal,
};
