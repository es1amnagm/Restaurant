const express = require('express');
const Router = express.Router();
const Meal = require('../Controller/mealsController');

Router.route("/").get(Meal.getAllMeals).post(Meal.addMeal);


Router.route('/:mealId').get(Meal.getSingleMeal).patch(Meal.updateMeal).delete(Meal.deleteMeal);

module.exports = Router;