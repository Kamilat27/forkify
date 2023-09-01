import * as model from './model.js';
import recipeView from './view/recipeView.js';
import searchView from './view/searchView.js';
import resultsView from './view/resultsView.js';
import paginationView from './view/paginationView.js';
import bookmarkView from './view/bookmarkView.js';
import addRecipeView from './view/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';

import { loadSearchData } from './model.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

async function controlRecipes() {
  try {
    // Rendering the spinner
    recipeView.renderSpinner();

    const id = window.location.hash.slice(1);

    if (!id) return;
    // 0) Mark the current recipe active
    resultsView.update(model.getSearchResultsPage());
    bookmarkView.update(model.state.bookmarks);

    // console.log(model.getSearchResultsPage());
    // 1) Load the recipe
    await model.loadRecipe(id);

    // 2) Render the recipe
    recipeView.render(model.state.recipe);

    console.log(model.state.recipe);
  } catch (err) {
    console.error(err.message);
    recipeView.renderError();
  }
}

async function controlSearchResults() {
  try {
    resultsView.renderSpinner();

    // 1) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2) Load search results
    await model.loadSearchResults(query);

    controlPagination(1);
  } catch (error) {
    console.error(error);
  }
}

function controlPagination(toPage) {
  //1) Render results
  resultsView.render(model.getSearchResultsPage(toPage));
  //2) Render Initial pagination buttons
  paginationView.render(model.state.search);
}

function controlServings(newServings) {
  // 1. Update data in model
  model.updateServings(newServings);
  // 2. Update data in the view
  recipeView.update(model.state.recipe);
}

function controlAddBookmark() {
  // 1) Add bookmarks
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2) Update recipe view
  recipeView.update(model.state.recipe);
  // 3) render bookmarked recipes
  bookmarkView.render(model.state.bookmarks);
}

function controlBookmarkRender() {
  bookmarkView.render(model.state.bookmarks);
}

async function controlAddRecipe(newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();
    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarkView.render(model.state.bookmarks);

    // Change ID in the URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('***', err);
    addRecipeView.renderError(err.message);
  }
}

function init() {
  bookmarkView.addHandlerRender(controlBookmarkRender);
  addRecipeView.addHandlerUpoad(controlAddRecipe);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandler(controlPagination);
}

init();

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

// ////////////////Assignment1///////////////////
// let array = [1, 2, 4, 591, 392, 391, 2, 5, '2', 10, , '2', 2, 1, 1, 1, 20, 20];
// // let array = [1, '2', '3', 2];
// // [[1, 1, 1, 1], [2, 2, 2], 4, 5, 10, [20, 20], 391, 392, 591]
// //  0  1  2  3  4  5  6  7  8  9   10  11  12    13  14
// // [1, 1, 1, 1, 2, 2, 2, 4, 5, 10, 20, 20, 391, 392, 591]

// //7

// function firstAssignment(array) {
//   let arr = sortArr(array);
//   return reduced(array);
// }

// function firstAsBonus(array) {
//   sortArr(array);
//   const arrayString = array.filter(cur => typeof cur === 'string');
//   const arrayInt = array.filter(cur => typeof cur === 'number');
//   sortArr(array);
//   return [reduced(arrayInt), reduced(arrayString)];
// }
// // Bonus
// // console.log(firstAsBonus(array));
// // console.log(firstAssignment(array));

// function sortArr(array) {
//   return array.sort((a, b) => a - b);
// }

// function reduced(array) {
//   let counter = 0;

//   return array.reduce((acc, cur, i, arr) => {
//     if (cur === arr[i + 1]) {
//       counter++;
//     } else if (counter > 0) {
//       acc.push(arr.slice(i - counter, i + 1));
//       counter = 0;
//     } else {
//       acc.push(cur);
//     }
//     return acc;
//   }, []);
// }

// /////////////////////////Assignment 2////////////////////
// function secondAssignment(array, target) {
//   return array.reduce((acc, element, _, arr) => {
//     const j = array.find(cur => cur + element === target);
//     if (acc.length > 0 || !j) return acc;

//     console.log(j);

//     if (j >= 0) {
//       acc.push(element);
//       acc.push(j);
//     }

//     return acc;
//   }, []);
// }

// console.log(secondAssignment([2, 4, 5, 8, 5], 12));

/////////////////////////Assignmnet 3//////////////////////
