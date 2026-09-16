/* ==================================================
   GAME DATA
================================================== */

const games = [
  {
    id: 8,
    title: "Fruit Cut",
    category: "",
    icon: "games/IMG-20260914-WA0051.jpg",
    url: "games/Fruit cutting game.html",
    newGame: true,
    popular: false
  },

  {
    id: 7,
    title: "Endless Runner",
    category: "Recing",
    icon: "games/neon_runner_logo.jpg",
    url: "games/Endless Runner.html",
    newGame: true,
    popular: false
  },

  {
    id: 1,
    title: "Neon Tic Tac Toe",
    category: "Puzzle",
    icon: "games/logo.png",
    url: "games/neon_tic_tac_toe-1.html",
    newGame: true,
    popular: false
  },

  {
    id: 2,
    title: "Guess People",
    category: "Puzzle",
    icon: "games/GUuhrKZZGsIRBscIOCGwbaYGs0M.jpg",
    url: "games/guesspepole.html",
    newGame: false,
    popular: true
  },

  {
    id: 3,
    title: "Flag Guess",
    category: "Quiz",
    icon: "games/flag_guess_logo.jpg",
    url: "games/flag-guess.html",
    newGame: true,
    popular: false
  },

  {
    id: 4,
    title: "Math Quiz",
    category: "Quiz",
    icon: "games/file_00000000b20c81f59277a71fc4330a3a.png",
    url: "games/math_quiz_sound.html",
    newGame: false,
    popular: true
  },

  {
    id: 5,
    title: "Sliding Puzzle",
    category: "Puzzle",
    icon: "games/sliding-puzzle-logo.jpg",
    url: "games/puzzle-game.html",
    newGame: true,
    popular: false
  },

  {
    id: 6,
    title: "Car Racing",
    category: "Recing",
    icon: "games/file_00000000f2808208ae73d8b75c491ce3.png",
    url: "games/careering.html",
    newGame: true,
    popular: false
  }
];


/* ==================================================
   CATEGORIES
================================================== */

const categories = [
  "Puzzle",
  "Quiz",
  "Recing",
  "Board",
  "Arcade",
  "Sports",
  "Strategy"
];


/* ==================================================
   FAVORITES
================================================== */

let favorites = JSON.parse(
  localStorage.getItem("gameWithFunFavorites") || "[]"
);


/* ==================================================
   GAME CARD
================================================== */

function gameCard(game) {

  const isFavorite = favorites.includes(game.id);

  const isImage =
    game.icon &&
    (
      game.icon.includes(".png") ||
      game.icon.includes(".jpg") ||
      game.icon.includes(".jpeg") ||
      game.icon.includes(".webp")
    );

  const gameUrl =
    game.url && game.url !== "#"
      ? game.url
      : null;

  return `
    <article class="game-item">

      <button
        class="favorite-btn ${isFavorite ? "active" : ""}"
        onclick="event.preventDefault(); event.stopPropagation(); toggleFavorite(${game.id})"
        aria-label="Favorite ${game.title}">

        ${isFavorite ? "♥" : "♡"}

      </button>


      ${
        gameUrl
        ? `
          <a
            class="game-link"
            href="${gameUrl}"
            aria-label="Play ${game.title}">
        `
        : `
          <a
            class="game-link"
            href="#"
            onclick="showToast('This game is coming soon 🎮'); return false;"
            aria-label="${game.title} coming soon">
        `
      }


          <div class="game-logo">

            ${
              isImage
                ? `<img src="${game.icon}" alt="${game.title}">`
                : `<span class="emoji-logo">${game.icon}</span>`
            }

          </div>


          <h3>
            ${game.title}
          </h3>


        </a>

    </article>
  `;
}


/* ==================================================
   RENDER GAMES
================================================== */

function renderGames() {

  const newGrid =
    document.getElementById("newGrid");

  const popularGrid =
    document.getElementById("popularGrid");


  if (newGrid) {

    newGrid.innerHTML = games
      .filter(game => game.newGame)
      .map(gameCard)
      .join("");

  }


  if (popularGrid) {

    popularGrid.innerHTML = games
      .filter(game => game.popular)
      .map(gameCard)
      .join("");

  }

}


/* ==================================================
   RENDER CATEGORIES
================================================== */

function renderCategories() {

  const categoryGrid =
    document.getElementById("categoryGrid");

  const allCategoryGrid =
    document.getElementById("allCategoryGrid");


  const html = categories
    .map(category => `

      <button
        class="category-card"
        onclick="showCategory('${category}')">

        <span>
          ${categoryIcon(category)}
        </span>

        <b>
          ${category}
        </b>

      </button>

    `)
    .join("");


  if (categoryGrid) {
    categoryGrid.innerHTML = html;
  }


  if (allCategoryGrid) {
    allCategoryGrid.innerHTML = html;
  }

}


/* ==================================================
   CATEGORY ICON
================================================== */

function categoryIcon(category) {

  const icons = {

    Puzzle: "🧩",

    Quiz: "❓",

    Board: "♟️",

    Arcade: "🕹️",

    Sports: "⚽",

    Strategy: "🧠"

  };


  return icons[category] || "🎮";

}


/* ==================================================
   FAVORITE
================================================== */

function toggleFavorite(id) {

  if (favorites.includes(id)) {

    favorites =
      favorites.filter(item => item !== id);

  } else {

    favorites.push(id);

  }


  localStorage.setItem(
    "gameWithFunFavorites",
    JSON.stringify(favorites)
  );


  renderGames();


  const favoritesPage =
    document.getElementById("favoritesPage");


  if (
    favoritesPage &&
    !favoritesPage.classList.contains("hidden")
  ) {

    renderFavorites();

  }


  showToast(
    favorites.includes(id)
      ? "Added to favorites ❤️"
      : "Removed from favorites"
  );

}


/* ==================================================
   RENDER FAVORITES
================================================== */

function renderFavorites() {

  const favoriteGrid =
    document.getElementById("favoriteGrid");


  if (!favoriteGrid) return;


  const favoriteGames =
    games.filter(game =>
      favorites.includes(game.id)
    );


  if (favoriteGames.length === 0) {

    favoriteGrid.innerHTML = `

      <div class="empty-state">

        <div>♡</div>

        <h3>
          No favorite games yet
        </h3>

        <p>
          Tap the heart on a game to add it here.
        </p>

      </div>

    `;

    return;

  }


  favoriteGrid.innerHTML =
    favoriteGames
      .map(gameCard)
      .join("");

}


/* ==================================================
   OPEN GAME
================================================== */

function playGame(id) {

  const game =
    games.find(item => item.id === id);


  if (!game) return;


  if (!game.url || game.url === "#") {

    showToast(
      "This game is coming soon 🎮"
    );

    return;

  }


  window.location.href =
    game.url;

}


/* ==================================================
   PAGE NAVIGATION
================================================== */

function showPage(
  page,
  fromBrowserBack = false
) {

  const pages = {

    home:
      "homePage",

    categories:
      "categoriesPage",

    favorites:
      "favoritesPage",

    all:
      "allGamesPage",

    leaderboard:
      "leaderboardPage"

  };


  /* ------------------------------
     Browser History
  ------------------------------ */

  if (!fromBrowserBack) {

    history.pushState(
      { page: page },
      "",
      "#" + page
    );

  }


  /* ------------------------------
     Hide All Pages
  ------------------------------ */

  Object.values(pages).forEach(id => {

    const element =
      document.getElementById(id);

    if (element) {

      element.classList.add("hidden");

    }

  });


  /* ------------------------------
     Show Selected Page
  ------------------------------ */

  const target =
    document.getElementById(
      pages[page]
    );


  if (target) {

    target.classList.remove("hidden");

  }


  /* ------------------------------
     Remove Active Navigation
  ------------------------------ */

  document
    .querySelectorAll(".bottom-nav button")
    .forEach(button => {

      button.classList.remove("active");

    });


  /* ------------------------------
     Active Home
  ------------------------------ */

  if (page === "home") {

    document
      .getElementById("navHome")
      ?.classList.add("active");

  }


  /* ------------------------------
     Active Categories
  ------------------------------ */

  if (page === "categories") {

    document
      .getElementById("navCategories")
      ?.classList.add("active");

  }


  /* ------------------------------
     Active Leaderboard
  ------------------------------ */

  if (page === "leaderboard") {

    document
      .getElementById("navLeaderboard")
      ?.classList.add("active");

    loadLeaderboard();

  }


  /* ------------------------------
     Active Favorites
  ------------------------------ */

  if (page === "favorites") {

    document
      .getElementById("navFavorites")
      ?.classList.add("active");

    renderFavorites();

  }


  /* ------------------------------
     Scroll Top
  ------------------------------ */

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* ==================================================
   ANDROID / BROWSER BACK BUTTON
================================================== */

window.addEventListener(
  "popstate",
  function(event) {

    const page =
      event.state?.page || "home";

    showPage(
      page,
      true
    );

  }
);


/* ==================================================
   INITIAL HISTORY
================================================== */

if (!location.hash) {

  history.replaceState(
    { page: "home" },
    "",
    "#home"
  );

}


/* ==================================================
   LOAD PAGE FROM URL HASH
================================================== */

function loadInitialPage() {

  const hash =
    location.hash.replace("#", "");


  const allowedPages = [
    "home",
    "categories",
    "favorites",
    "all",
    "leaderboard"
  ];


  if (
    allowedPages.includes(hash)
  ) {

    showPage(
      hash,
      true
    );

  } else {

    showPage(
      "home",
      true
    );

  }

}


/* ==================================================
   VIEW ALL
================================================== */

function openAll(type) {

  const title =
    document.getElementById("allTitle");

  const grid =
    document.getElementById("allGrid");


  if (!grid) return;


  let selectedGames =
    games;


  if (type === "new") {

    selectedGames =
      games.filter(
        game => game.newGame
      );


    if (title) {

      title.textContent =
        "New Games";

    }

  }


  if (type === "popular") {

    selectedGames =
      games.filter(
        game => game.popular
      );


    if (title) {

      title.textContent =
        "Popular Games";

    }

  }


  grid.innerHTML =
    selectedGames
      .map(gameCard)
      .join("");


  showPage("all");

}


/* ==================================================
   CATEGORY
================================================== */

function showCategory(category) {

  const title =
    document.getElementById("allTitle");

  const grid =
    document.getElementById("allGrid");


  const selectedGames =
    games.filter(
      game =>
        game.category === category
    );


  if (title) {

    title.textContent =
      category + " Games";

  }


  if (grid) {

    grid.innerHTML =
      selectedGames.length

        ? selectedGames
            .map(gameCard)
            .join("")

        : `

          <div class="empty-state">

            <div>🎮</div>

            <h3>
              No games yet
            </h3>

            <p>
              More ${category}
              games are coming soon.
            </p>

          </div>

        `;

  }


  showPage("all");

}


/* ==================================================
   SEARCH
================================================== */

function searchGames() {

  const input =
    document.getElementById(
      "searchInput"
    );


  if (!input) return;


  const query =
    input.value
      .trim()
      .toLowerCase();


  if (!query) {

    showPage("home");

    return;

  }


  const results =
    games.filter(game =>

      game.title
        .toLowerCase()
        .includes(query)

      ||

      game.category
        .toLowerCase()
        .includes(query)

    );


  const title =
    document.getElementById(
      "allTitle"
    );


  const grid =
    document.getElementById(
      "allGrid"
    );


  if (title) {

    title.textContent =
      `Search results for "${input.value}"`;

  }


  if (grid) {

    grid.innerHTML =
      results.length

        ? results
            .map(gameCard)
            .join("")

        : `

          <div class="empty-state">

            <div>🔍</div>

            <h3>
              No games found
            </h3>

            <p>
              Try another game name
              or category.
            </p>

          </div>

        `;

  }


  showPage("all");

}


/* ==================================================
   TOAST
================================================== */

function showToast(message) {

  const toast =
    document.getElementById(
      "toast"
    );


  if (!toast) return;


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  setTimeout(() => {

    toast.classList.remove(
      "show"
    );

  }, 2000);

}


/* ==================================================
   LEADERBOARD
================================================== */

/*
   Firebase setup না হওয়া পর্যন্ত
   demo leaderboard দেখাবে।

   Firebase connect করার পরে এই
   function-এ real online players
   load করা হবে।
*/

function loadLeaderboard() {

  const leaderboardList =
    document.getElementById(
      "leaderboardList"
    );


  if (!leaderboardList) return;


  leaderboardList.innerHTML = `

    <div class="leaderboard-player">

      <div class="leaderboard-rank">
        🥇
      </div>

      <div class="leaderboard-name">
        Player
      </div>

      <div class="leaderboard-games">
        0
      </div>

      <div class="leaderboard-time">
        0m
      </div>

    </div>


    <div class="leaderboard-empty">

      Login to join the leaderboard 🎮

    </div>

  `;

}


/* ==================================================
   DOM READY
================================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    renderGames();

    renderCategories();

    renderFavorites();


    /* ------------------------------
       Search Enter
    ------------------------------ */

    const searchInput =
      document.getElementById(
        "searchInput"
      );


    if (searchInput) {

      searchInput.addEventListener(
        "keydown",
        event => {

          if (
            event.key === "Enter"
          ) {

            searchGames();

          }

        }
      );

    }


    /* ------------------------------
       Load Initial Page
    ------------------------------ */

    loadInitialPage();

  }
);
