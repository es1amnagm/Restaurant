const { connectDB, sql } = require("../MiddleWare/connectToDB");
const generateError = require("../MiddleWare/generateError");
const handleRes = require("../MiddleWare/handleRes");
const asyncWrapper = require("../MiddleWare/errorHandling");
const { SUCCESS, FAIL } = require("../MiddleWare/handleResStatus");
const bcrypt = require("bcryptjs");
const generateJWT = require("../MiddleWare/generateJWT");

const getAllUsers = asyncWrapper(async (req, res, next) => {
  const pool = await connectDB();
  const result = await pool.request().query("select * from users");
  const data = result.recordset;
  if (data.length === 0)
    return next(generateError("no data to show", 200, FAIL));

  handleRes(res, 200, SUCCESS, data);
});

const getSingleUser = asyncWrapper(async (req, res, next) => {
  const { userId } = req.params;
  const pool = await connectDB();
  const result = await pool
    .request()
    .input("id", userId)
    .query("SELECT * FROM users WHERE id = @id");

  const data = result.recordset;

  if (data.length === 0)
    return next(generateError("User not found", 404, FAIL));

  handleRes(res, 200, SUCCESS, data);
});

const register = asyncWrapper(async (req, res, next) => {
  const pool = await connectDB();
  const {
    email,
    password,
    first_name,
    last_name,
    gender,
    birth_date,
    phone,
    role, // optional
  } = req.body;

  // 1️⃣ Check if user exists
  const checkUser = await pool
    .request()
    .input("email", sql.VarChar, email)
    .query("SELECT id FROM users WHERE email = @email");

  if (checkUser.recordset.length > 0)
    return next(generateError("Email already exists", 400, FAIL));

  // 2️⃣ Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3️⃣ Insert user and get ID
  const result = await pool
    .request()
    .input("email", sql.VarChar, email)
    .input("password", sql.VarChar, hashedPassword)
    .input("first_name", sql.VarChar, first_name)
    .input("last_name", sql.VarChar, last_name)
    .input("gender", sql.VarChar, gender)
    .input("birth_date", sql.Date, birth_date)
    .input("phone", sql.VarChar, phone).query(`
      INSERT INTO users (email, password, first_name, last_name, gender, birth_date, phone)
      OUTPUT inserted.id
      VALUES (@email, @password, @first_name, @last_name, @gender, @birth_date, @phone)
    `);

  const userId = result.recordset[0].id;

  // 4️⃣ Assign role (default CUSTOMER)
  const roleName = role ? role.toUpperCase() : "CUSTOMER";

  // Check if role exists in roles table
  let roleResult = await pool
    .request()
    .input("roleName", sql.VarChar, roleName)
    .query("SELECT id FROM roles WHERE name = @roleName");

  let roleId;

  if (roleResult.recordset.length === 0) {
    // Insert role if not exists
    const insertRole = await pool
      .request()
      .input("roleName", sql.VarChar, roleName)
      .query("INSERT INTO roles (name) OUTPUT inserted.id VALUES (@roleName)");

    roleId = insertRole.recordset[0].id;
  } else {
    roleId = roleResult.recordset[0].id;
  }

  // 5️⃣ Link user and role
  await pool
    .request()
    .input("userId", sql.Int, userId)
    .input("roleId", sql.Int, roleId)
    .query(
      "INSERT INTO user_roles (user_id, role_id) VALUES (@userId, @roleId)"
    );

  handleRes(res, 201, SUCCESS, { userId, role: roleName });
});


const logIn = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  const pool = await connectDB();
  if (!email || !password)
    return next(generateError("Email and Password are required", 400, FAIL));

  const result = await pool
    .request()
    .input("email", email)
    .query("SELECT password FROM users WHERE email = @email");

  const data = result.recordset;

  if (data.length === 0)
    return next(generateError("no user with this email", 404, FAIL));

  console.log(data[0].password);

  const matchedPassword = await bcrypt.compare(password, data[0].password);

  if (!matchedPassword) return next(generateError("Wrong Password", 404, FAIL));
  const token = await generateJWT({ email: email });

  handleRes(res, 200, SUCCESS, token);
});

const updateUser = asyncWrapper(async (req, res, next) => {
  const { userId } = req.params;
  const { first_name, last_name, email, phone } = req.body;

  const pool = await connectDB();

  // 1️⃣ Build update fields dynamically
  let updates = [];
  if (first_name) updates.push(`first_name = @first_name`);
  if (last_name) updates.push(`last_name = @last_name`);
  if (email) updates.push(`email = @email`);
  if (phone) updates.push(`phone = @phone`);

  // If no fields provided
  if (updates.length === 0)
    return next(generateError("No fields to update", 400, FAIL));

  const sqlQuery = `
        UPDATE users 
        SET ${updates.join(", ")} 
        WHERE id = @id;
    `;

  // 2️⃣ Prepare SQL inputs
  const request = pool.request().input("id", sql.Int, userId);

  if (first_name) request.input("first_name", sql.VarChar, first_name);
  if (last_name) request.input("last_name", sql.VarChar, last_name);
  if (email) request.input("email", sql.VarChar, email);
  if (phone) request.input("phone", sql.VarChar, phone);

  // 3️⃣ Execute update
  const result = await request.query(sqlQuery);

  handleRes(res, 201, SUCCESS, "User updated successfully");
});

const deleteUser = asyncWrapper(async (req, res, next) => {
  const { userId } = req.params;
  const pool = await connectDB();

  const checkUser = await pool
    .request()
    .input("id", userId)
    .query("SELECT * FROM users WHERE id = @id");
  if (checkUser.recordset.length == 0)
    return next(generateError("this user already not exist", 404, FAIL));

  const result = await pool
    .request()
    .input("id", userId)
    .query("DELETE FROM users WHERE id = @id");

  handleRes(res, 201, SUCCESS, "User deleted successfully");
});

module.exports = {
  getAllUsers,
  getSingleUser,
  register,
  updateUser,
  logIn,
  deleteUser,
};
