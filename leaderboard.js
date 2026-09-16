import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,

  collection,
  query,
  orderBy,
  limit,
  getDocs,

  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp
} from "./firebase-config.js";


// ======================================
// ELEMENTS
// ======================================

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");
const leaderboardList =
  document.getElementById("leaderboardList");


// ======================================
// CURRENT USER
// ======================================

let currentUser = null;


// ======================================
// TIME TRACKING
// ======================================

let timeTimer = null;

let lastTimeSaved = Date.now();


// ======================================
// GOOGLE LOGIN
// ======================================

if (loginBtn) {

  loginBtn.addEventListener("click", async () => {

    try {

      loginBtn.disabled = true;
      loginBtn.textContent = "Signing in...";

      await signInWithPopup(
        auth,
        googleProvider
      );

    } catch (error) {

      console.error("Login error:", error);

      alert(
        "Google Login failed. Please try again."
      );

    } finally {

      loginBtn.disabled = false;

      if (!currentUser) {

        loginBtn.textContent =
          "🔐 Login with Google";

      }

    }

  });

}


// ======================================
// LOGOUT
// ======================================

if (logoutBtn) {

  logoutBtn.addEventListener("click", async () => {

    try {

      await saveTimeSpent();

      await signOut(auth);

    } catch (error) {

      console.error(
        "Logout error:",
        error
      );

    }

  });

}


// ======================================
// AUTH STATE
// ======================================

onAuthStateChanged(
  auth,
  async (user) => {

    currentUser = user || null;

    if (user) {

      // -------------------------------
      // LOGGED IN
      // -------------------------------

      if (loginBtn) {

        loginBtn.style.display = "none";

      }

      if (logoutBtn) {

        logoutBtn.style.display =
          "inline-block";

      }

      if (userInfo) {

        userInfo.style.display = "block";

        const photo = user.photoURL
          ? `<img src="${escapeHTML(user.photoURL)}"
                   alt="Profile">`
          : "";

        userInfo.innerHTML = `
          ${photo}
          👤 ${escapeHTML(
            user.displayName || "Player"
          )}
        `;

      }


      // Save player
      await savePlayer(user);


      // Start time tracking
      startTimeTracking();


      // Load leaderboard
      await loadLeaderboard();

    } else {

      // -------------------------------
      // LOGGED OUT
      // -------------------------------

      stopTimeTracking();

      if (loginBtn) {

        loginBtn.style.display =
          "inline-block";

        loginBtn.textContent =
          "🔐 Login with Google";

      }

      if (logoutBtn) {

        logoutBtn.style.display =
          "none";

      }

      if (userInfo) {

        userInfo.style.display =
          "none";

        userInfo.innerHTML = "";

      }

      await loadLeaderboard();

    }

  }
);


// ======================================
// SAVE PLAYER
// ======================================

async function savePlayer(user) {

  try {

    const playerRef =
      doc(db, "players", user.uid);

    const playerSnap =
      await getDoc(playerRef);

    if (!playerSnap.exists()) {

      await setDoc(playerRef, {

        name:
          user.displayName || "Player",

        photoURL:
          user.photoURL || "",

        gamesPlayed: 0,

        totalTime: 0,

        online: true,

        createdAt:
          serverTimestamp(),

        lastActive:
          serverTimestamp()

      });

    } else {

      await updateDoc(
        playerRef,
        {

          name:
            user.displayName || "Player",

          photoURL:
            user.photoURL || "",

          online: true,

          lastActive:
            serverTimestamp()

        }
      );

    }

  } catch (error) {

    console.error(
      "Could not save player:",
      error
    );

  }

}


// ======================================
// GAME START TRACKING
// ======================================

window.trackGameStart =
  async function (gameId) {

    if (!currentUser) {

      return;

    }

    try {

      const playerRef =
        doc(
          db,
          "players",
          currentUser.uid
        );

      await setDoc(
        playerRef,
        {

          gamesPlayed:
            increment(1),

          lastGame:
            String(gameId || ""),

          lastActive:
            serverTimestamp(),

          online: true

        },

        {
          merge: true
        }

      );

      console.log(
        "Game started:",
        gameId
      );

    } catch (error) {

      console.error(
        "Game tracking error:",
        error
      );

    }

  };


// ======================================
// TIME TRACKING START
// ======================================

function startTimeTracking() {

  stopTimeTracking();

  lastTimeSaved = Date.now();

  timeTimer =
    setInterval(
      saveTimeSpent,
      30000
    );

}


// ======================================
// TIME TRACKING STOP
// ======================================

function stopTimeTracking() {

  if (timeTimer) {

    clearInterval(timeTimer);

    timeTimer = null;

  }

}


// ======================================
// SAVE TIME
// ======================================

async function saveTimeSpent() {

  if (!currentUser) {

    return;

  }

  const now = Date.now();

  const elapsed =
    Math.floor(
      (now - lastTimeSaved) / 1000
    );

  if (elapsed < 1) {

    return;

  }

  lastTimeSaved = now;

  try {

    const playerRef =
      doc(
        db,
        "players",
        currentUser.uid
      );

    await setDoc(
      playerRef,
      {

        totalTime:
          increment(elapsed),

        lastActive:
          serverTimestamp(),

        online: true

      },

      {
        merge: true
      }

    );

  } catch (error) {

    console.error(
      "Time save error:",
      error
    );

  }

}


// ======================================
// UPDATE ONLINE STATUS
// ======================================

document.addEventListener(
  "visibilitychange",
  async () => {

    if (!currentUser) {

      return;

    }

    const playerRef =
      doc(
        db,
        "players",
        currentUser.uid
      );

    try {

      if (
        document.visibilityState ===
        "visible"
      ) {

        lastTimeSaved = Date.now();

        await setDoc(
          playerRef,
          {

            online: true,

            lastActive:
              serverTimestamp()

          },

          {
            merge: true
          }

        );

      } else {

        await saveTimeSpent();

        await setDoc(
          playerRef,
          {

            online: false,

            lastActive:
              serverTimestamp()

          },

          {
            merge: true
          }
        );

      }

    } catch (error) {

      console.error(
        "Online status error:",
        error
      );

    }

  }
);


// ======================================
// BEFORE LEAVING
// ======================================

window.addEventListener(
  "pagehide",
  () => {

    saveTimeSpent();

  }
);


// ======================================
// LOAD LEADERBOARD
// ======================================

async function loadLeaderboard() {

  if (!leaderboardList) {

    return;

  }

  try {

    const playersRef =
      collection(
        db,
        "players"
      );

    const leaderboardQuery =
      query(
        playersRef,

        orderBy(
          "totalTime",
          "desc"
        ),

        limit(100)
      );

    const snapshot =
      await getDocs(
        leaderboardQuery
      );

    leaderboardList.innerHTML = "";

    if (snapshot.empty) {

      leaderboardList.innerHTML = `
        <div class="leaderboard-empty">
          No players yet. Be the first player! 🎮
        </div>
      `;

      return;

    }


    let rank = 1;


    snapshot.forEach(
      (playerDoc) => {

        const data =
          playerDoc.data();

        const player =
          document.createElement(
            "div"
          );

        player.className =
          "leaderboard-player";


        const online =
          data.online === true
            ? `<span class="online-dot"></span>`
            : "";


        player.innerHTML = `

          <div class="leaderboard-rank">
            ${getRankIcon(rank)}
          </div>


          <div class="leaderboard-name">

            ${
              data.photoURL
                ? `
                  <img
                    class="leaderboard-avatar"
                    src="${escapeHTML(
                      data.photoURL
                    )}"
                    alt="Player">
                `
                : ""
            }

            ${escapeHTML(
              data.name || "Player"
            )}

            ${online}

          </div>


          <div class="leaderboard-games">

            ${Number(
              data.gamesPlayed || 0
            )}

          </div>


          <div class="leaderboard-time">

            ${formatTime(
              Number(
                data.totalTime || 0
              )
            )}

          </div>

        `;


        leaderboardList.appendChild(
          player
        );


        rank++;

      }
    );


  } catch (error) {

    console.error(
      "Leaderboard error:",
      error
    );

    leaderboardList.innerHTML = `

      <div class="leaderboard-empty">

        Leaderboard is not available yet.

        <br><br>

        Please check your Firebase
        Firestore Rules.

      </div>

    `;

  }

}


// ======================================
// MAKE FUNCTION AVAILABLE TO script.js
// ======================================

window.loadLeaderboard =
  loadLeaderboard;


// ======================================
// RANK ICON
// ======================================

function getRankIcon(rank) {

  if (rank === 1) {

    return "🥇";

  }

  if (rank === 2) {

    return "🥈";

  }

  if (rank === 3) {

    return "🥉";

  }

  return rank;

}


// ======================================
// TIME FORMAT
// ======================================

function formatTime(seconds) {

  seconds =
    Math.max(
      0,
      Number(seconds) || 0
    );


  const hours =
    Math.floor(
      seconds / 3600
    );


  const minutes =
    Math.floor(
      (seconds % 3600) / 60
    );


  if (hours > 0) {

    return `${hours}h ${minutes}m`;

  }


  if (minutes > 0) {

    return `${minutes}m`;

  }


  return `${seconds}s`;

}


// ======================================
// SECURITY: HTML ESCAPE
// ======================================

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


// ======================================
// REFRESH LEADERBOARD
// ======================================

setInterval(
  loadLeaderboard,
  30000
);
