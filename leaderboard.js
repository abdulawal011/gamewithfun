// ========================================
// GAMEWITHFUN LEADERBOARD
// Google Login + Firestore
// ========================================

import {
  auth,
  db,
  googleProvider,

  signInWithPopup,
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


// ========================================
// HTML ELEMENTS
// ========================================

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");
const leaderboardList = document.getElementById("leaderboardList");


// ========================================
// VARIABLES
// ========================================

let currentUser = null;
let gameStartTime = null;
let timeInterval = null;


// ========================================
// CHECK LOGIN BUTTON
// ========================================

console.log("=================================");
console.log("GameWithFun Leaderboard Loaded");
console.log("Login Button:", loginBtn);
console.log("Firebase Auth:", auth);
console.log("=================================");


// ========================================
// GOOGLE LOGIN
// ========================================

if (loginBtn) {

  loginBtn.addEventListener("click", async function () {

    console.log("LOGIN BUTTON CLICKED");

    try {

      loginBtn.disabled = true;
      loginBtn.textContent = "Opening Google...";

      console.log("Opening Google Login...");

      const result = await signInWithPopup(
        auth,
        googleProvider
      );

      console.log(
        "Google login successful:",
        result.user
      );

    } catch (error) {

      console.error(
        "GOOGLE LOGIN ERROR:",
        error
      );

      let errorMessage =
        "Google Login failed.";

      if (error.code) {

        errorMessage +=
          "\n\nError Code: " +
          error.code;

      }

      if (error.message) {

        errorMessage +=
          "\n\nMessage: " +
          error.message;

      }

      alert(errorMessage);

      loginBtn.disabled = false;

      loginBtn.textContent =
        "🔐 Login with Google";

    }

  });

} else {

  console.error(
    "ERROR: loginBtn was not found!"
  );

}


// ========================================
// LOGOUT
// ========================================

if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    async function () {

      try {

        await saveTimeSpent();

        await signOut(auth);

        console.log(
          "User logged out successfully"
        );

      } catch (error) {

        console.error(
          "Logout Error:",
          error
        );

        alert(
          "Logout failed:\n\n" +
          (error.message || error)
        );

      }

    }
  );

}


// ========================================
// AUTH STATE
// ========================================

onAuthStateChanged(
  auth,
  async function (user) {

    currentUser = user;

    // ====================================
    // USER LOGGED IN
    // ====================================

    if (user) {

      console.log(
        "USER LOGGED IN:",
        user.displayName
      );


      // Hide login button

      if (loginBtn) {

        loginBtn.style.display =
          "none";

      }


      // Show logout button

      if (logoutBtn) {

        logoutBtn.style.display =
          "inline-block";

      }


      // ==================================
      // USER INFORMATION
      // ==================================

      if (userInfo) {

        userInfo.style.display =
          "block";

        const name =
          user.displayName ||
          "Player";

        const photo =
          user.photoURL ||
          "";

        userInfo.innerHTML = `

          <div style="
            display:flex;
            align-items:center;
            justify-content:center;
            gap:12px;
            margin-top:15px;
          ">

            ${
              photo

                ? `

                  <img
                    src="${escapeHTML(photo)}"
                    alt="Profile"
                    style="
                      width:45px;
                      height:45px;
                      border-radius:50%;
                      object-fit:cover;
                    "
                  >

                `

                : `

                  <div style="
                    width:45px;
                    height:45px;
                    border-radius:50%;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    background:#eef4ff;
                    font-size:22px;
                  ">
                    🎮
                  </div>

                `
            }

            <div style="text-align:left;">

              <strong>
                ${escapeHTML(name)}
              </strong>

              <div style="
                font-size:13px;
                opacity:.7;
                margin-top:3px;
              ">
                Logged in with Google
              </div>

            </div>

          </div>

        `;

      }


      // ==================================
      // CREATE / UPDATE PLAYER
      // ==================================

      await createOrUpdatePlayer(user);


      // ==================================
      // START TIME TRACKING
      // ==================================

      startTimeTracking();


      // ==================================
      // LOAD LEADERBOARD
      // ==================================

      await loadLeaderboard();

    }


    // ====================================
    // USER LOGGED OUT
    // ====================================

    else {

      console.log(
        "NO USER LOGGED IN"
      );


      if (loginBtn) {

        loginBtn.style.display =
          "inline-block";

        loginBtn.disabled =
          false;

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

        userInfo.innerHTML =
          "";

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

  }
);


// ========================================
// CREATE / UPDATE PLAYER
// ========================================

async function createOrUpdatePlayer(user) {

  const playerRef =
    doc(
      db,
      "players",
      user.uid
    );

  try {

    const playerSnap =
      await getDoc(playerRef);


    // ==================================
    // NEW PLAYER
    // ==================================

    if (!playerSnap.exists()) {

      await setDoc(
        playerRef,
        {

          name:
            user.displayName ||
            "Player",

          photoURL:
            user.photoURL ||
            "",

          gamesPlayed: 0,

          totalTime: 0,

          online: true,

          createdAt:
            serverTimestamp(),

          lastActive:
            serverTimestamp()

        }
      );

      console.log(
        "New player created"
      );

    }


    // ==================================
    // EXISTING PLAYER
    // ==================================

    else {

      await updateDoc(
        playerRef,
        {

          name:
            user.displayName ||
            "Player",

          photoURL:
            user.photoURL ||
            "",

          online: true,

          lastActive:
            serverTimestamp()

        }
      );

      console.log(
        "Player updated"
      );

    }

  } catch (error) {

    console.error(
      "PLAYER UPDATE ERROR:",
      error
    );

  }

}


// ========================================
// GAME START TRACKING
// ========================================

window.trackGameStart =
  async function (gameId) {

    if (!currentUser) {

      console.log(
        "Game tracking skipped - user not logged in"
      );

      return;

    }

    try {

      const playerRef =
        doc(
          db,
          "players",
          currentUser.uid
        );


      await updateDoc(
        playerRef,
        {

          gamesPlayed:
            increment(1),

          lastGame:
            gameId,

          lastActive:
            serverTimestamp()

        }
      );

      console.log(
        "Game started:",
        gameId
      );

    } catch (error) {

      console.error(
        "GAME TRACKING ERROR:",
        error
      );

    }

  };


// ========================================
// START TIME TRACKING
// ========================================

function startTimeTracking() {

  stopTimeTracking();

  gameStartTime =
    Date.now();


  timeInterval =
    setInterval(
      async function () {

        await saveTimeSpent();

      },
      30000
    );

}


// ========================================
// STOP TIME TRACKING
// ========================================

function stopTimeTracking() {

  if (timeInterval) {

    clearInterval(
      timeInterval
    );

    timeInterval =
      null;

  }

  gameStartTime =
    null;

}


// ========================================
// SAVE TIME
// ========================================

async function saveTimeSpent() {

  if (
    !currentUser ||
    !gameStartTime
  ) {

    return;

  }


  const elapsed =
    Math.floor(
      (
        Date.now() -
        gameStartTime
      ) / 1000
    );


  if (elapsed <= 0) {

    return;

  }


  gameStartTime =
    Date.now();


  try {

    const playerRef =
      doc(
        db,
        "players",
        currentUser.uid
      );


    await updateDoc(
      playerRef,
      {

        totalTime:
          increment(elapsed),

        lastActive:
          serverTimestamp(),

        online:
          true

      }
    );

  } catch (error) {

    console.error(
      "TIME SAVE ERROR:",
      error
    );

  }

}


// ========================================
// ONLINE / OFFLINE
// ========================================

document.addEventListener(
  "visibilitychange",
  async function () {

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

      if (document.hidden) {

        await saveTimeSpent();


        await updateDoc(
          playerRef,
          {

            online:
              false,

            lastActive:
              serverTimestamp()

          }
        );

      }

      else {

        gameStartTime =
          Date.now();


        await updateDoc(
          playerRef,
          {

            online:
              true,

            lastActive:
              serverTimestamp()

          }
        );

      }

    } catch (error) {

      console.error(
        "ONLINE STATUS ERROR:",
        error
      );

    }

  }
);


// ========================================
// PAGE LEAVE
// ========================================

window.addEventListener(
  "pagehide",
  function () {

    if (!currentUser) {

      return;

    }

    saveTimeSpent();

  }
);


// ========================================
// LOAD LEADERBOARD
// ========================================

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


    // ==================================
    // NO PLAYERS
    // ==================================

    if (snapshot.empty) {

      leaderboardList.innerHTML = `

        <div class="leaderboard-empty">

          No players yet 🎮

        </div>

      `;

      return;

    }


    let html =
      "";

    let rank =
      1;


    snapshot.forEach(
      function (docSnap) {

        const player =
          docSnap.data();


        const name =
          player.name ||
          "Player";


        const photo =
          player.photoURL ||
          "";


        const games =
          Number(
            player.gamesPlayed ||
            0
          );


        const totalTime =
          Number(
            player.totalTime ||
            0
          );


        const online =
          player.online === true;


        let rankIcon =
          rank;


        if (rank === 1) {

          rankIcon =
            "🥇";

        }

        else if (rank === 2) {

          rankIcon =
            "🥈";

        }

        else if (rank === 3) {

          rankIcon =
            "🥉";

        }


        html += `

          <div class="leaderboard-player">

            <div class="leaderboard-rank">

              ${rankIcon}

            </div>


            <div>

              ${
                photo

                  ? `

                    <img
                      class="leaderboard-avatar"
                      src="${escapeHTML(photo)}"
                      alt="Player"
                    >

                  `

                  : `

                    <div
                      class="leaderboard-avatar"
                      style="
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        background:#eef4ff;
                        font-size:22px;
                      "
                    >
                      🎮
                    </div>

                  `
              }

            </div>


            <div class="leaderboard-player-info">

              <div class="leaderboard-name">

                ${escapeHTML(name)}

              </div>


              <div class="leaderboard-player-stats">

                🎮 ${games} Games

                &nbsp; • &nbsp;

                ⏱️ ${formatTime(totalTime)}

                &nbsp; • &nbsp;

                ${
                  online

                    ? `

                      <span style="color:#20c997;">
                        ● Online
                      </span>

                    `

                    : `

                      <span style="opacity:.6;">
                        ● Offline
                      </span>

                    `
                }

              </div>

            </div>

          </div>

        `;


        rank++;

      }
    );


    leaderboardList.innerHTML =
      html;


  } catch (error) {

    console.error(
      "LEADERBOARD ERROR:",
      error
    );


    leaderboardList.innerHTML = `

      <div class="leaderboard-empty">

        Unable to load leaderboard.

        <br><br>

        Please try again later.

      </div>

    `;

  }

}


// ========================================
// FORMAT TIME
// ========================================

function formatTime(seconds) {

  seconds =
    Math.max(
      0,
      Number(
        seconds || 0
      )
    );


  const hours =
    Math.floor(
      seconds / 3600
    );


  const minutes =
    Math.floor(
      (seconds % 3600) / 60
    );


  const secs =
    seconds % 60;


  if (hours > 0) {

    return (
      `${hours}h ${minutes}m`
    );

  }


  if (minutes > 0) {

    return (
      `${minutes}m ${secs}s`
    );

  }


  return (
    `${secs}s`
  );

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(value) {

  return String(
    value || ""
  )

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}


// ========================================
// GLOBAL LEADERBOARD FUNCTION
// ========================================

window.loadLeaderboard =
  loadLeaderboard;


console.log(
  "GameWithFun leaderboard.js ready!"
);
