// Global app controller

// import { add as a } from "./models/Search";
// console.log(a(1,2));

// import * as Search from "./models/Search";
// console.log(Search.add(1, 2));

// API KEY: 3ba0fd203ee1edb9c439564e54003e9e

// Search: https://www.food2fork.com/api/search
import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import * as searchView from "./views/SearchView";
import * as recipeView from "./views/RecipeView";
import { elements, renderLoader, clearLoader } from "./views/base";

// ******* GLOBAL STATE ******* //
/*
- Search object
- Current Recipe Object
- Shopping List Objet
- Liked Recipes
*/
const state = {};

const controlSearch = async () => {
  // 1) Get Query from view
  const query = searchView.getInput();

  // 2) If query, new search object, add to state
  if (query) {
    state.search = new Search(query);

    // 3) Prepare UI for results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchResults);
    // 4) Search for recipes
    try {
      await state.search.getResults();

      // 5) Render results on UI
      clearLoader();
      searchView.renderResults(state.search.results);
    } catch (error) {
      alert("Search Unsuccessful");
      clearLoader();
    }
  }
};

const controlRecipe = async () => {
  // Get ID from URL
  const id = window.location.hash.replace("#", "");

  if (id) {
    // Prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);
    if (state.search) {
      searchView.highlightSelected(id);
    }

    // Create new Recipe object
    state.recipe = new Recipe(id);

    // Get recipe data
    try {
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();
      // Calc time and servings
      state.recipe.calcServings();
      state.recipe.calcTime();

      // Render Recipe

      clearLoader();
      recipeView.renderRecipe(state.recipe);
    } catch (error) {
      console.log(error);
      alert("Error Processing Recipe");
    }
  }
};

elements.searchForm.addEventListener("submit", e => {
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener("click", e => {
  const btn = e.target.closest(".btn-inline");
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.results, goToPage);
  }
});

// window.addEventListener("hashchange", controlRecipe);
// window.addEventListener("load", controlRecipe);
["hashchange", "load"].forEach(event =>
  window.addEventListener(event, controlRecipe)
);

elements.recipe.addEventListener("click", e => {
  if (e.target.matches(".btn-decrease, .btn-decrease *")) {
    if (state.recipe.servings > 1) {
      state.recipe.updateServings("dec");
    }
  }
  if (e.target.matches(".btn-increase, .btn-increase *")) {
    state.recipe.updateServings("inc");
  }
  recipeView.updateServingsIngredients(state.recipe);
});

window.l = new List();
