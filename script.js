/* ==================================================
   GAME DATA
   Game names are stored for SEARCH.
   They are NOT displayed on the homepage.
================================================== */

const games = [

  {
    id: 17,
    title: "Shadow Cat",
    category: "Arcade",
    icon: "games/cat.webp",
    url: "games/cat.html",
    newGame: true,
    popular: false
  },

  {
    id: 16,
    title: "Bubble Shooter",
    category: "Puzzle",
    icon: "games/balls.webp",
    url: "games/bubbleshooter.html",
    newGame: false,
    popular: true
  },

  {
    id: 15,
    title: "Carrom Board",
    category: "Board",
    icon: "games/caroom.webp",
    url: "games/carromboard.html",
    newGame: false,
    popular: true
  },

  {
    id: 14,
    title: "GameWithFun Crush",
    category: "Puzzle",
    icon: "games/colour.webp",
    url: "games/gamewithfuncrush.html",
    newGame: false,
    popular: true
  },

  {
    id: 13,
    title: "Fruit Cut",
    category: "Arcade",
    icon: "games/1000150283_11zon.jpg",
    url: "games/bdcut.html",
    newGame: true,
    popular: false
  },

  {
    id: 12,
    title: "Ghost House",
    category: "Arcade",
    icon: "games/ghost.webp",
    url: "games/ghosthouse.html",
    newGame: false,
    popular: true
  },

  {
    id: 11,
    title: "Flaying Bird",
    category: "Arcade",
    icon: "games/bird.webp",
    url: "games/gamewithfun-flaying-bird.html",
    newGame: false,
    popular: true
  },

  {
    id: 10,
    title: "Color Ball",
    category: "Puzzle",
    icon: "games/colulm.webp",
    url: "games/colorsort.html",
    newGame: false,
    popular: true
  },

  {
    id: 9,
    title: "8 Ball Pool",
    category: "Sports",
    icon: "games/8ball.webp",
    url: "games/8ballgame.html",
    newGame: false,
    popular: true
  },

  {
    id: 8,
    title: "Traffic Jam",
    category: "Puzzle",
    icon: "games/jam.webp",
    url: "games/trafficjamsolve.html",
    newGame: false,
    popular: true
  },

  {
    id: 7,
    title: "Endless Runner",
    category: "Recing",
    icon: "games/end.webp",
    url: "games/endlessrunner.html",
    newGame: true,
    popular: false
  },

  {
    id: 6,
    title: "O&X Game",
    category: "Puzzle",
    icon: "games/Ox.webp",
    url: "games/oxgame.html",
    newGame: true,
    popular: false
  },

  {
    id: 5,
    title: "Pipe Script",
    category: "Puzzle",
    icon: "games/Pipe Script.webp",
    url: "games/pipe_script.html",
    newGame: false,
    popular: true
  },

  {
    id: 4,
    title: "Flag Guess",
    category: "Quiz",
    icon: "games/flags.webp",
    url: "games/flag-guess.html",
    newGame: true,
    popular: false
  },

  {
    id: 3,
    title: "Math Quiz",
    category: "Quiz",
    icon: "games/math.webp",
    url: "games/math_quiz_sound.html",
    newGame: false,
    popular: true
  },

  {
    id: 2,
    title: "Sliding Puzzle",
    category: "Puzzle",
    icon: "games/fuzzle.webp",
    url: "games/puzzle-game.html",
    newGame: true,
    popular: false
  },

  {
    id: 20,
    title: "Hill Climb",
    category: "Recing",
    icon: "games/hill_climb.webp",
    url: "games/hill_climb.html",
    newGame: false,
    popular: true
  },

  {
    id: 1,
    title: "Car Racing",
    category: "Recing",
    icon: "games/car.webp",
    url: "games/careering.html",
    newGame: true,
    popular: false
  },

  {
    id: 101,
    title: "Dragon Mountain",
    category: "Adventure",
    icon: "games/dragon.webp",
    url: "games/dragon_mountain.html",
    newGame: false,
    popular: true
  },

  {
    id: 102,
    title: "Spider",
    category: "Adventure",
    icon: "games/spider .webp",
    url: "games/spider.html",
    newGame: false,
    popular: true
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
  "Adventure"
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

  const isFavorite =
    favorites.includes(game.id);

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
        aria-label="Favorite ${escapeHTML(game.title)}">

        ${isFavorite ? "♥" : "♡"}

      </button>

      ${
        gameUrl
        ? `
          <a
            class="game-link"
            href="${gameUrl}"
            onclick="openGameFromCard(event, ${game.id})"
            aria-label="Play ${escapeHTML(game.title)}">
        `
        : `
          <a
            class="game-link"
            href="#"
            onclick="showToast('This game is coming soon 🎮'); return false;"
            aria-label="${escapeHTML(game.title)} coming soon">
        `
      }

          <div class="game-logo">

            ${
              isImage
              ? `
                <img
                  src="${game.icon}"
                  alt="${escapeHTML(game.title)}"
                  loading="lazy">
              `
              : `
                <span class="emoji-logo">
                  ${game.icon || "🎮"}
                </span>
              `
            }

          </div>

          <h3>
            ${escapeHTML(game.title)}
          </h3>

          <p class="game-category">
            ${escapeHTML(game.category || "Game")}
          </p>

        </a>

    </article>
  `;
}


/* ==================================================
   OPEN GAME FROM CARD
   Firebase tracking happens before navigation
================================================== */

function openGameFromCard(event, id) {

  event.preventDefault();

  const game =
    games.find(item => item.id === id);

  if (
    !game ||
    !game.url ||
    game.url === "#"
  ) {

    showToast(
      "This game is coming soon 🎮"
    );

    return false;
  }


  if (
    typeof window.trackGameStart ===
    "function"
  ) {

    window.trackGameStart(id);

  }


  setTimeout(() => {

    window.location.href =
      game.url;

  }, 250);


  return false;
}


/* ==================================================
   RENDER GAMES
   IMPORTANT:
   Homepage New Games and Popular Games
   remain EMPTY.

   The games still exist in the data and
   can be found through SEARCH.
================================================== */

function renderGames() {

  const newGrid =
    document.getElementById("newGrid");

  const popularGrid =
    document.getElementById("popularGrid");


  if (newGrid) {

    newGrid.innerHTML = "";

  }


  if (popularGrid) {

    popularGrid.innerHTML = "";

  }

}


/* ==================================================
   RENDER CATEGORIES
================================================== */

function renderCategories() {

  const categoryGrid =
    document.getElementById(
      "categoryGrid"
    );

  const allCategoryGrid =
    document.getElementById(
      "allCategoryGrid"
    );


  const html =
    categories
      .map(category => `

        <button
          class="category-card"
          onclick="showCategory('${escapeHTML(category)}')">

          <span>
            ${categoryIcon(category)}
          </span>

          <b>
            ${escapeHTML(category)}
          </b>

        </button>

      `)
      .join("");


  if (categoryGrid) {

    categoryGrid.innerHTML =
      html;

  }


  if (allCategoryGrid) {

    allCategoryGrid.innerHTML =
      html;

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
    Strategy: "🧠",
    Recing: "🏎️",
    Adventure: "🐉"

  };


  return icons[category] || "🎮";

}


/* ==================================================
   FAVORITE
================================================== */

function toggleFavorite(id) {

  if (favorites.includes(id)) {

    favorites =
      favorites.filter(
        item => item !== id
      );

  } else {

    favorites.push(id);

  }


  localStorage.setItem(
    "gameWithFunFavorites",
    JSON.stringify(favorites)
  );


  /*
     Homepage remains empty.
     This does NOT display games there.
  */

  renderGames();


  const favoritesPage =
    document.getElementById(
      "favoritesPage"
    );


  if (
    favoritesPage &&
    !favoritesPage.classList.contains(
      "hidden"
    )
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
    document.getElementById(
      "favoriteGrid"
    );


  if (!favoriteGrid) return;


  const favoriteGames =
    games.filter(
      game =>
        favorites.includes(game.id)
    );


  if (
    favoriteGames.length === 0
  ) {

    favoriteGrid.innerHTML = `

      <div class="empty-state">

        <div>♡</div>

        <h3>
          No favorite games yet
        </h3>

        <p>
          Search for a game and add it
          to your favorites.
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
    games.find(
      item => item.id === id
    );


  if (!game) return;


  if (
    !game.url ||
    game.url === "#"
  ) {

    showToast(
      "This game is coming soon 🎮"
    );

    return;

  }


  if (
    typeof window.trackGameStart ===
    "function"
  ) {

    window.trackGameStart(id);

  }


  setTimeout(() => {

    window.location.href =
      game.url;

  }, 250);

}


/* ==================================================
   PAGE NAVIGATION
================================================== */

function showPage(
  page,
  fromBrowserBack = false
) {

  const pages = {

    home: "homePage",

    categories: "categoriesPage",

    favorites: "favoritesPage",

    all: "allGamesPage",

    leaderboard: "leaderboardPage"

  };


  if (!pages[page]) {

    page = "home";

  }


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

  Object.values(pages)
    .forEach(id => {

      const element =
        document.getElementById(id);

      if (element) {

        element.classList.add(
          "hidden"
        );

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

    target.classList.remove(
      "hidden"
    );

  }


  /* ------------------------------
     Remove Active Navigation
  ------------------------------ */

  document
    .querySelectorAll(
      ".bottom-nav button"
    )
    .forEach(button => {

      button.classList.remove(
        "active"
      );

    });


  /* ------------------------------
     Active Home
  ------------------------------ */

  if (page === "home") {

    document
      .getElementById("navHome")
      ?.classList.add(
        "active"
      );

  }


  /* ------------------------------
     Active Categories
  ------------------------------ */

  if (page === "categories") {

    document
      .getElementById("navCategories")
      ?.classList.add(
        "active"
      );

  }


  /* ------------------------------
     Active Leaderboard
  ------------------------------ */

  if (page === "leaderboard") {

    document
      .getElementById("navLeaderboard")
      ?.classList.add(
        "active"
      );


    if (
      typeof window.loadLeaderboard ===
      "function"
    ) {

      window.loadLeaderboard();

    }

  }


  /* ------------------------------
     Active Favorites
  ------------------------------ */

  if (page === "favorites") {

    document
      .getElementById("navFavorites")
      ?.classList.add(
        "active"
      );


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
      event.state?.page ||
      "home";


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
    location.hash.replace(
      "#",
      ""
    );


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
   These pages still work if manually opened.
================================================== */

function openAll(type) {

  const title =
    document.getElementById(
      "allTitle"
    );

  const grid =
    document.getElementById(
      "allGrid"
    );


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
    document.getElementById(
      "allTitle"
    );

  const grid =
    document.getElementById(
      "allGrid"
    );


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
            More ${escapeHTML(category)}
            games are coming soon.
          </p>

        </div>

      `;

  }


  showPage("all");

}


/* ==================================================
   SEARCH
   SEARCH WORKS EVEN THOUGH HOMEPAGE GAMES
   ARE NOT DISPLAYED.
================================================== */

function searchGames() {

  const input =
    document.getElementById(
      "searchInput"
    );


  if (!input) return;


  const originalQuery =
    input.value.trim();


  const query =
    originalQuery.toLowerCase();


  /* ------------------------------
     Empty Search
  ------------------------------ */

  if (!query) {

    showPage("home");

    return;

  }


  /* ------------------------------
     Search Game Title + Category
  ------------------------------ */

  const results =
    games.filter(game => {

      const title =
        String(
          game.title || ""
        ).toLowerCase();

      const category =
        String(
          game.category || ""
        ).toLowerCase();


      return (
        title.includes(query) ||
        category.includes(query)
      );

    });


  const title =
    document.getElementById(
      "allTitle"
    );


  const grid =
    document.getElementById(
      "allGrid"
    );


  /* ------------------------------
     Search Result Title
  ------------------------------ */

  if (title) {

    title.textContent =
      results.length

      ? `Search results for "${originalQuery}"`

      : `No results for "${originalQuery}"`;

  }


  /* ------------------------------
     Search Results
  ------------------------------ */

  if (grid) {

    if (results.length) {

      grid.innerHTML =
        results
          .map(gameCard)
          .join("");

    } else {

      grid.innerHTML = `

        <div class="empty-state">

          <div>🔍</div>

          <h3>
            No games found
          </h3>

          <p>
            No game matches
            "<strong>${escapeHTML(originalQuery)}</strong>".
          </p>

          <p>
            Try another game name or category.
          </p>

        </div>

      `;

    }

  }


  /* ------------------------------
     Open Search Results Page
  ------------------------------ */

  showPage("all");

}


/* ==================================================
   SEARCH BUTTON SUPPORT
================================================== */

function handleSearch() {

  searchGames();

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
   HTML ESCAPE
================================================== */

function escapeHTML(value) {

  return String(value)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}


/* ==================================================
   DOM READY
================================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    /*
       IMPORTANT:
       This does NOT display games on homepage.
    */

    renderGames();

    renderCategories();

    renderFavorites();


    /* ------------------------------
       Search Enter Key
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

            event.preventDefault();

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
