// import { isInteger } from 'core-js/core/number';
import { API_URL, RECIPES_PER_PAGE, KEY } from './config.js';
import { AJAX } from './helper.js';

export const state = {
  recipe: {},
  search: {
    results: [],
    resultsPerPage: RECIPES_PER_PAGE,
    page: 1,
    query: '',
  },

  bookmarks: [],
};

function createRecipeData(data){
  let { recipe } = data.data;
  return {
    id: recipe.id,
    cookingTime: recipe.cooking_time,
    image: recipe.image_url,
    ingredients: recipe.ingredients,
    publisher: recipe.publisher,
    servings: recipe.servings,
    sourceUrl: recipe.source_url,
    title: recipe.title,
    ...(recipe.key && {key:recipe.key}),
  };
}

export async function loadRecipe(id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);

    state.recipe = createRecipeData(data)

    if (state.bookmarks.some(el => el.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (error) {
    alert(error);
  }
}

export async function loadSearchResults(query) {
  try {
    state.search.results.query = query;

    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);

    state.search.results = data.data.recipes.map(recipe => {
      return {
        id: recipe.id,
        image: recipe.image_url,
        publisher: recipe.publisher,
        title: recipe.title,
        ...(recipe.key && {key:recipe.key})
      };
    });
  } catch (error) {
    console.error(error);
  }
}

export const getSearchResultsPage = function (page = state.search.page) {
  this.state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;

  const f = state.search.results.slice(start, end);
  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  // console.log(state.recipe.ingredients);
  state.recipe.ingredients.forEach(element => {
    element.quantity = (newServings * element.quantity) / state.recipe.servings;
  });

  state.recipe.servings = newServings;
};

function persistBookmarks() {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
}

export const addBookmark = function (recipe) {
  if (recipe.id === state.recipe.id) {
    state.bookmarks.push(recipe);
    state.recipe.bookmarked = true;
    persistBookmarks();
  }
};

export const deleteBookmark = function (id) {
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);
  // console.log(state.bookmarks);

  // Mark curent recipe as not bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false;
  persistBookmarks();
};

function init() {
  const storage = localStorage.getItem('bookmarks');

  if (storage) state.bookmarks = JSON.parse(storage);
}

// init();
// console.log(state.bookmarks);

function clearBookmarks() {
  localStorage.clear('bookmarks');
}
// clearBookmarks;

export async function uploadRecipe(newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '').map(ing => {

        const ingArr = ing[1].split(",").map(el => el.trim());
        // const ingArr = ing[1].replaceAll(' ', '').split(',');
        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient format. Please, use the correct format!'
          );
          [(quantity, unit, description)] = ingArr;

        return { quantity: quantity ? +quantity : null, unit, description };});

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };

    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeData(data)
    addBookmark(state.recipe)
  } catch (err) {
    throw err;
  }
}
