import {
  auth,
  db,
  googleProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  collection,
  query,
  orderBy,
  limit,
  getDocs
} from "./firebase-config.js";

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");
const leaderboardList = document.getElementById("leaderboardList");

let currentUser = null;
let gameStartTime = null;
let timeInterval = null;


// ================================
// GOOGLE LOGIN - MOBILE REDIRECT
// ================================

if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    try {
      loginBtn.disabled = true;
      loginBtn.textContent = "Opening Google...";

      await signInWithRedirect(auth, googleProvider);

    } catch (error) {
      console.error("Login error:", error);

      alert("Google Login failed: " + error.message);

      loginBtn.disabled = false;
      loginBtn.textContent = "🔐 Login with Google";
    }
  });
}


// ================================
// GET REDIRECT RESULT
// ================================

getRedirectResult(auth)
  .then((result) => {
    if (result && result.user) {
      console.log("Google login successful:", result.user);
    }
  })
  .catch((error) => {
    console.error("Redirect login error:", error);

    if (error.code !== "auth/popup-closed-by-user") {
      console.log(error.message);
    }
  });


// ================================
// LOGOUT
// ================================

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await saveTimeSpent();
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  });
}


// ================================
// AUTH STATE
// ================================

onAuthStateChanged(auth, async (user) => {

  currentUser = user;

  if (user) {

    console.log("Logged in:", user.displayName);

    if (loginBtn) {
      loginBtn.style.display = "none";
    }

    if (logoutBtn) {
      logoutBtn.style.display = "inline-block";
    }

    if (userInfo) {
      userInfo.style.display = "block";

      userInfo.innerHTML = `
        <div style="
          display:flex;
          align-items:center;
          gap:12px;
          margin-top:15px;
        ">
          ${
            user.photoURL
              ? `<img src="${escapeHTML(user.photoURL)}"
                   style="
                     width:45px;
                     height:45px;
                     border-radius:50%;
                     object-fit:cover;
                   ">`
              : ""
          }

          <div>
            <strong>${escapeHTML(user.displayName || "Player")}</strong>
            <div style="font-size:13px;opacity:.7;">
              Logged in with Google
            </div>
          </div>
        </div>
      `;
    }

    await createOrUpdatePlayer(user);

    startTimeTracking();

    await loadLeaderboard();

  } else {

    if (loginBtn) {
      loginBtn.style.display = "inline-block";
      loginBtn.disabled = false;
      loginBtn.textContent = "🔐 Login with Google";
    }

    if (logoutBtn) {
      logoutBtn.style.display = "none";
    }

    if (userInfo) {
      userInfo.style.display = "none";
      userInfo.innerHTML = "";
    }

    stopTimeTracking();

    if (leaderboardList) {
      leaderboardList.innerHTML = `
        <div class="leaderboard-empty">
          Login to join the leaderboard 🎮
        </div>
      `;
    }
  }
});


// ================================
// CREATE / UPDATE PLAYER
// ================================

async function createOrUpdatePlayer(user) {

  const playerRef = doc(db, "players", user.uid);

  try {

    const playerSnap = await getDoc(playerRef);

    if (!playerSnap.exists()) {

      await setDoc(playerRef, {
        name: user.displayName || "Player",
        photoURL: user.photoURL || "",
        gamesPlayed: 0,
        totalTime: 0,
        online: true,
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp()
      });

    } else {

      await updateDoc(playerRef, {
        name: user.displayName || "Player",
        photoURL: user.photoURL || "",
        online: true,
        lastActive: serverTimestamp()
      });

    }

  } catch (error) {
    console.error("Player update error:", error);
  }
}


// ================================
// GAME START TRACKER
// ================================

window.trackGameStart = async function(gameId) {

  if (!currentUser) {
    return;
  }

  try {

    const playerRef = doc(
      db,
      "players",
      currentUser.uid
    );

    await updateDoc(playerRef, {
      gamesPlayed: increment(1),
      lastGame: gameId,
      lastActive: serverTimestamp()
    });

  } catch (error) {

    console.error(
      "Game tracking error:",
      error
    );
  }
};


// ================================
// TIME TRACKING
// ================================

function startTimeTracking() {

  stopTimeTracking();

  gameStartTime = Date.now();

  timeInterval = setInterval(async () => {

    await saveTimeSpent();

  }, 30000);
}


function stopTimeTracking() {

  if (timeInterval) {
    clearInterval(timeInterval);
    timeInterval = null;
  }

  gameStartTime = null;
}


async function saveTimeSpent() {

  if (!currentUser || !gameStartTime) {
    return;
  }

  const elapsed = Math.floor(
    (Date.now() - gameStartTime) / 1000
  );

  if (elapsed <= 0) {
    return;
  }

  gameStartTime = Date.now();

  try {

    const playerRef = doc(
      db,
      "players",
      currentUser.uid
    );

    await updateDoc(playerRef, {
      totalTime: increment(elapsed),
      lastActive: serverTimestamp(),
      online: true
    });

  } catch (error) {

    console.error(
      "Time save error:",
      error
    );
  }
}


// ================================
// ONLINE / OFFLINE
// ================================

document.addEventListener(
  "visibilitychange",
  async () => {

    if (!currentUser) {
      return;
    }

    const playerRef = doc(
      db,
      "players",
      currentUser.uid
    );

    try {

      if (document.hidden) {

        await saveTimeSpent();

        await updateDoc(playerRef, {
          online: false,
          lastActive: serverTimestamp()
        });

      } else {

        gameStartTime = Date.now();

        await updateDoc(playerRef, {
          online: true,
          lastActive: serverTimestamp()
        });
      }

    } catch (error) {

      console.error(
        "Online status error:",
        error
      );
    }
  }
);


// ================================
// BEFORE LEAVING PAGE
// ================================

window.addEventListener(
  "pagehide",
  () => {

    if (!currentUser) {
      return;
    }

    saveTimeSpent();
  }
);


// ================================
// LEADERBOARD
// ================================

async function loadLeaderboard() {

  if (!leaderboardList) {
    return;
  }

  try {

    leaderboardList.innerHTML = `
      <div class="leaderboard-empty">
        Loading leaderboard...
      </div>
    `;

    const playersRef = collection(
      db,
      "players"
    );

    const leaderboardQuery = query(
      playersRef,
      orderBy("totalTime", "desc"),
      limit(100)
    );

    const snapshot = await getDocs(
      leaderboardQuery
    );

    if (snapshot.empty) {

      leaderboardList.innerHTML = `
        <div class="leaderboard-empty">
          No players yet 🎮
        </div>
      `;

      return;
    }

    let html = "";
    let rank = 1;

    snapshot.forEach((docSnap) => {

      const player = docSnap.data();

      const name =
        player.name || "Player";

      const photo =
        player.photoURL || "";

      const games =
        Number(player.gamesPlayed || 0);

      const totalTime =
        Number(player.totalTime || 0);

      const online =
        player.online === true;

      let rankIcon = rank;

      if (rank === 1) {
        rankIcon = "🥇";
      }

      if (rank === 2) {
        rankIcon = "🥈";
      }

      if (rank === 3) {
        rankIcon = "🥉";
      }

      html += `
        <div class="leaderboard-player">

          <div class="leaderboard-rank">
            ${rankIcon}
          </div>

          <div class="leaderboard-avatar">
            ${
              photo
                ? `<img src="${escapeHTML(photo)}"
                     alt="Player">`
                : "🎮"
            }
          </div>

          <div class="leaderboard-player-info">

            <div class="leaderboard-player-name">
              ${escapeHTML(name)}
            </div>

            <div class="leaderboard-player-stats">

              🎮 ${games} Games

              &nbsp; • &nbsp;

              ⏱️ ${formatTime(totalTime)}

              &nbsp; • &nbsp;

              ${
                online
                  ? `<span style="color:#20c997;">● Online</span>`
                  : `<span style="opacity:.6;">● Offline</span>`
              }

            </div>

          </div>

        </div>
      `;

      rank++;
    });

    leaderboardList.innerHTML = html;

  } catch (error) {

    console.error(
      "Leaderboard error:",
      error
    );

    leaderboardList.innerHTML = `
      <div class="leaderboard-empty">
        Unable to load leaderboard.
      </div>
    `;
  }
}


// ================================
// FORMAT TIME
// ================================

function formatTime(seconds) {

  seconds = Math.max(
    0,
    Number(seconds || 0)
  );

  const hours =
    Math.floor(seconds / 3600);

  const minutes =
    Math.floor((seconds % 3600) / 60);

  const secs =
    seconds % 60;

  if (hours > 0) {

    return `${hours}h ${minutes}m`;

  }

  if (minutes > 0) {

    return `${minutes}m ${secs}s`;

  }

  return `${secs}s`;
}


// ================================
// ESCAPE HTML
// ================================

function escapeHTML(value) {

  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// ================================
// GLOBAL FUNCTION
// ================================

window.loadLeaderboard =
  loadLeaderboard;
