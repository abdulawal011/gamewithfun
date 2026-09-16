import {
  auth,
  db,
  provider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  setDoc,
  serverTimestamp
} from "./firebase-config.js";


// ======================================
// ELEMENTS
// ======================================

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");
const loginText = document.getElementById("loginText");
const leaderboardList =
  document.getElementById("leaderboardList");


// ======================================
// GOOGLE LOGIN
// ======================================

loginBtn.addEventListener("click", async () => {

  try {

    await signInWithPopup(auth, provider);

  } catch (error) {

    console.error(error);

    alert("Login failed. Please try again.");

  }

});


// ======================================
// LOGOUT
// ======================================

logoutBtn.addEventListener("click", async () => {

  try {

    await signOut(auth);

  } catch (error) {

    console.error(error);

  }

});


// ======================================
// AUTH STATE
// ======================================

onAuthStateChanged(auth, async (user) => {

  if (user) {

    loginBtn.style.display = "none";

    logoutBtn.style.display = "inline-block";

    userInfo.style.display = "block";

    loginText.textContent =
      "You are logged in and your activity can be saved.";

    userInfo.textContent =
      `👤 ${user.displayName || "Player"}`;

    // Create/update player profile
    await savePlayer(user);

  } else {

    loginBtn.style.display = "inline-block";

    logoutBtn.style.display = "none";

    userInfo.style.display = "none";

    loginText.textContent =
      "Login with Google to save your game activity and appear on the leaderboard.";

  }

});


// ======================================
// SAVE PLAYER
// ======================================

async function savePlayer(user) {

  try {

    const playerRef = doc(db, "players", user.uid);

    await setDoc(
      playerRef,
      {
        name: user.displayName || "Player",
        totalTime: 0,
        gamesPlayed: 0,
        lastActive: serverTimestamp()
      },
      {
        merge: true
      }
    );

  } catch (error) {

    console.error("Could not save player:", error);

  }

}


// ======================================
// LOAD LEADERBOARD
// ======================================

async function loadLeaderboard() {

  try {

    const playersRef = collection(db, "players");

    const leaderboardQuery = query(
      playersRef,
      orderBy("totalTime", "desc"),
      limit(100)
    );

    const snapshot =
      await getDocs(leaderboardQuery);

    leaderboardList.innerHTML = "";

    if (snapshot.empty) {

      leaderboardList.innerHTML = `
        <div class="empty">
          No players yet. Be the first player! 🎮
        </div>
      `;

      return;
    }

    let rank = 1;

    snapshot.forEach((playerDoc) => {

      const data = playerDoc.data();

      const player = document.createElement("div");

      player.className = "player";

      player.innerHTML = `
        <div class="rank">
          ${getRankIcon(rank)}
        </div>

        <div class="name">
          ${escapeHTML(data.name || "Player")}
        </div>

        <div class="games">
          ${Number(data.gamesPlayed || 0)}
        </div>

        <div class="time">
          ${formatTime(Number(data.totalTime || 0))}
        </div>
      `;

      leaderboardList.appendChild(player);

      rank++;

    });

  } catch (error) {

    console.error(error);

    leaderboardList.innerHTML = `
      <div class="empty">
        Leaderboard is not available yet.
      </div>
    `;

  }

}


// ======================================
// RANK ICON
// ======================================

function getRankIcon(rank) {

  if (rank === 1) return "🥇";

  if (rank === 2) return "🥈";

  if (rank === 3) return "🥉";

  return rank;

}


// ======================================
// TIME FORMAT
// ======================================

function formatTime(seconds) {

  const hours =
    Math.floor(seconds / 3600);

  const minutes =
    Math.floor((seconds % 3600) / 60);

  if (hours > 0) {

    return `${hours}h ${minutes}m`;

  }

  return `${minutes}m`;

}


// ======================================
// SECURITY: HTML ESCAPE
// ======================================

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


// ======================================
// START
// ======================================

loadLeaderboard();

setInterval(loadLeaderboard, 30000);
