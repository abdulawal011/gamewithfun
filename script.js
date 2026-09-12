const games = [
  {
    id: 1,
    title: "Neon Tic Tac Toe",
    category: "Puzzle",
    icon: "games/file_00000000c8388211815dc83cd8039c22.png",
    url: "games/neon_tic_tac_toe-1.html",
    newGame: true,
    popular: true
  },
  {
    id: 2,
    title: "Color Match",
    category: "Puzzle",
    icon: "🎨",
    url: "#",
    newGame: true,
    popular: true
  },
  {
    id: 3,
    title: "Flag Guess",
    category: "Quiz",
    icon: "games/file_00000000c8388211815dc83cd8039c22.png",
    url: "games/flag-guess.html",
    newGame: true,
    popular: false
  },
  {
    id: 4,
    title: "Chess AI",
    category: "Board",
    icon: "♟️",
    url: "#",
    newGame: false,
    popular: true
  }
];

const categories = [
  "Puzzle",
  "Quiz",
  "Board",
  "Arcade",
  "Sports",
  "Strategy"
];

let favorites = JSON.parse(
  localStorage.getItem("gameWithFunFavorites") || "[]"
);

function gameCard(game) {
  const isFavorite = favorites.includes(game.id);

  return `
    <article class="game-card">

      <button
        class="favorite-btn ${isFavorite ? "active" : ""}"
        onclick="toggleFavorite(${game.id})">
        ${isFavorite ? "♥" : "♡"}
      </button>

      <div class="game-icon">${game.icon}</div>

      <div class="game-info">
        <h3>${game.title}</h3>
        <p>${game.category}</p>
      </div>

      <button
        class="play-btn"
        onclick="playGame(${game.id})">
        Play
      </button>

    </article>
  `;
}

function renderGames() {
  const newGrid = document.getElementById("newGrid");
  const popularGrid = document.getElementById("popularGrid");

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

function renderCategories() {
  const categoryGrid = document.getElementById("categoryGrid");
  const allCategoryGrid = document.getElementById("allCategoryGrid");

  const html = categories.map(category => `
    <button
      class="category-card"
      onclick="showCategory('${category}')">
      <span>${categoryIcon(category)}</span>
      <b>${category}</b>
    </button>
  `).join("");

  if (categoryGrid) {
    categoryGrid.innerHTML = html;
  }

  if (allCategoryGrid) {
    allCategoryGrid.innerHTML = html;
  }
}

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

function toggleFavorite(id) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(item => item !== id);
  } else {
    favorites.push(id);
  }

  localStorage.setItem(
    "gameWithFunFavorites",
    JSON.stringify(favorites)
  );

  renderGames();

  if (!document.getElementById("favoritesPage").classList.contains("hidden")) {
    renderFavorites();
  }

  showToast(
    favorites.includes(id)
      ? "Added to favorites ❤️"
      : "Removed from favorites"
  );
}

function renderFavorites() {
  const favoriteGrid = document.getElementById("favoriteGrid");

  if (!favoriteGrid) return;

  const favoriteGames = games.filter(game =>
    favorites.includes(game.id)
  );

  if (favoriteGames.length === 0) {
    favoriteGrid.innerHTML = `
      <div class="empty-state">
        <div>♡</div>
        <h3>No favorite games yet</h3>
        <p>Tap the heart on a game to add it here.</p>
      </div>
    `;
    return;
  }

  favoriteGrid.innerHTML = favoriteGames
    .map(gameCard)
    .join("");
}

function playGame(id) {
  const game = games.find(item => item.id === id);

  if (!game) return;

  if (!game.url || game.url === "#") {
    showToast("This game is coming soon 🎮");
    return;
  }

  window.location.href = game.url;
}

function showPage(page) {
  const pages = {
    home: "homePage",
    categories: "categoriesPage",
    favorites: "favoritesPage",
    all: "allGamesPage"
  };

  Object.values(pages).forEach(id => {
    const element = document.getElementById(id);
    if (element) element.classList.add("hidden");
  });

  const target = document.getElementById(pages[page]);

  if (target) {
    target.classList.remove("hidden");
  }

  document.querySelectorAll(".bottom-nav button").forEach(button => {
    button.classList.remove("active");
  });

  if (page === "home") {
    document.getElementById("navHome")?.classList.add("active");
  }

  if (page === "categories") {
    document.getElementById("navCategories")?.classList.add("active");
  }

  if (page === "favorites") {
    document.getElementById("navFavorites")?.classList.add("active");
    renderFavorites();
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function openAll(type) {
  const title = document.getElementById("allTitle");
  const grid = document.getElementById("allGrid");

  if (!grid) return;

  let selectedGames = games;

  if (type === "new") {
    selectedGames = games.filter(game => game.newGame);
    if (title) title.textContent = "New Games";
  }

  if (type === "popular") {
    selectedGames = games.filter(game => game.popular);
    if (title) title.textContent = "Popular Games";
  }

  grid.innerHTML = selectedGames.map(gameCard).join("");

  showPage("all");
}

function showCategory(category) {
  const title = document.getElementById("allTitle");
  const grid = document.getElementById("allGrid");

  const selectedGames = games.filter(
    game => game.category === category
  );

  if (title) {
    title.textContent = category + " Games";
  }

  if (grid) {
    grid.innerHTML = selectedGames.length
      ? selectedGames.map(gameCard).join("")
      : `
        <div class="empty-state">
          <div>🎮</div>
          <h3>No games yet</h3>
          <p>More ${category} games are coming soon.</p>
        </div>
      `;
  }

  showPage("all");
}

function searchGames() {
  const input = document.getElementById("searchInput");

  if (!input) return;

  const query = input.value.trim().toLowerCase();

  if (!query) {
    showPage("home");
    return;
  }

  const results = games.filter(game =>
    game.title.toLowerCase().includes(query) ||
    game.category.toLowerCase().includes(query)
  );

  const title = document.getElementById("allTitle");
  const grid = document.getElementById("allGrid");

  if (title) {
    title.textContent = `Search results for "${input.value}"`;
  }

  if (grid) {
    grid.innerHTML = results.length
      ? results.map(gameCard).join("")
      : `
        <div class="empty-state">
          <div>🔍</div>
          <h3>No games found</h3>
          <p>Try another game name or category.</p>
        </div>
      `;
  }

  showPage("all");
}

function showToast(message) {
  const toast = document.getElementById("toast");

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

document.addEventListener("DOMContentLoaded", () => {
  renderGames();
  renderCategories();

  const searchInput = document.getElementById("searchInput");

  if (searchInput) {
    searchInput.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        searchGames();
      }
    });
  }
});
