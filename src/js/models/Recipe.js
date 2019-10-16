import axios from "axios";
import { key } from "../config";
export default class Recipe {
  constructor(id) {
    this.id = id;
  }

  async getRecipe() {
    try {
      const result = await axios(
        `https://www.food2fork.com/api/get?key=${key}&rId=${this.id}`
      );
      console.log(result);
      this.title = result.data.recipe.title;
      this.author = result.data.recipe.publisher;
      this.img = result.data.recipe.image_url;
      this.url = result.data.recipe.source_url;
      this.ingredients = result.data.recipe.ingredients;
    } catch (error) {
      console.log(error);
      alert("Unable to retrieve recipe");
    }
  }

  calcTime() {
    const numImg = this.ingredients.length;
    const periods = Math.ceil(numImg / 3);
    this.time = periods * 15;
  }

  calcServings() {
    this.servings = 4;
  }

  parseIngredients() {
    const unitsLong = [
      "tablespoons",
      "tablespoon",
      "ounces",
      "ounce",
      "teaspoons",
      "teaspoon",
      "pounds",
      "cups"
    ];
    const unitsShort = [
      "tbsp",
      "tbsp",
      "oz",
      "oz",
      "tsp",
      "tsp",
      "pound",
      "cup"
    ];
    const units = [...unitsShort, "kg", "g"];
    const newIngredients = this.ingredients.map(el => {
      // Uniform Units
      let ingredient = el.toLowerCase();
      unitsLong.forEach((unit, i) => {
        ingredient = ingredient.replace(unit, unitsShort[i]);
      });
      // Remove Parenthesis
      ingredient = ingredient.replace(/ *\([^)]*\) */g, " ");
      // Parse ingredients into count, unit, and ingredient
      const arrIng = ingredient.split(" ");
      // findIndex: takes a callback function. Returns the index when callback function === true
      const unitIndex = arrIng.findIndex(el2 => units.includes(el2));

      let objIng;
      if (unitIndex > -1) {
        // Has units
        const arrCount = arrIng.slice(0, unitIndex);
        let count;
        if (arrCount.length === 1) {
          count = eval(arrIng[0].replace("-", "+"));
        } else {
          // eval takes the string and runs it as javascript conde, so it will add the two numbers
          count = eval(arrIng.slice(0, unitIndex).join("+"));
        }

        objIng = {
          count,
          unit: arrIng[unitIndex],
          ingredient: arrIng.slice(unitIndex + 1).join(" ")
        };
      } else if (parseInt(arrIng[0], 10)) {
        // No units, but has number
        objIng = {
          count: parseInt(arrIng[0], 10),
          unit: "",
          ingredient: arrIng.slice(1).join(" ")
        };
      } else {
        // No units or number
        objIng = {
          count: 1,
          unit: "",
          ingredient
        };
      }

      return objIng;
    });
    this.ingredients = newIngredients;
  }
}
