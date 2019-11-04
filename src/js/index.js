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
import * as listView from "./views/ListView";
import * as likesView from "./views/LikesView";
import { elements, renderLoader, clearLoader } from "./views/base";
import Likes from "./models/Likes";

// ******* GLOBAL STATE ******* //
/*
- Search object
- Current Recipe Object
- Shopping List Objet
- Liked Recipes
*/
const state = {};
window.state = state;

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
      recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
    } catch (error) {
      console.log(error);
      alert("Error Processing Recipe");
    }
  }
};

const controlList = () => {
  // create a new list if there is no list
  if (!state.list) {
    state.list = new List();
  }
  // Add each ingredient to the list and UI
  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
  //
};

state.likes = new Likes();
likesView.toggleLikeMenu(state.likes.getNumLikes());
const controlLike = () => {
  if (!state.likes) {
    state.likes = new Likes();
  }
  const currentID = state.recipe.id;
  // User has not yet liked current recipe
  if (!state.likes.isLiked(currentID)) {
    const newLike = state.likes.addLike(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );
    likesView.toggleLikeBtn(true);
    likesView.renderLike(newLike);

    console.log(state.likes);
  } else {
    state.likes.deleteLike(currentID);

    likesView.toggleLikeBtn(false);
    likesView.deleteLike(currentID);
  }
  likesView.toggleLikeMenu(state.likes.getNumLikes());
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

elements.shopping.addEventListener("click", e => {
  const id = e.target.closest(".shopping__item").dataset.itemid;
  if (e.target.matches(".shopping__delete, .shopping__delete *")) {
    state.list.deleteItem(id);
    listView.deleteItem(id);
  } else if (e.target.matches(".shopping__count-value")) {
    const val = parseFloat(e.target.value);
    state.list.updateCount(id, val);
  }
});

elements.recipe.addEventListener("click", e => {
  if (e.target.matches(".btn-decrease, .btn-decrease *")) {
    if (state.recipe.servings > 1) {
      state.recipe.updateServings("dec");
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches(".btn-increase, .btn-increase *")) {
    state.recipe.updateServings("inc");
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches(".recipe__btn-add, .recipe__btn-add *")) {
    controlList();
  } else if (e.target.matches("recipe__love, .recipe__love *")) {
    controlLike();
  }
});

window.l = new List();
