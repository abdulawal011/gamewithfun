// ========================================
// GAMEWITHFUN LEADERBOARD
// Firebase Google Login + Firestore
// ========================================

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


// ========================================
// HTML ELEMENTS
// ========================================

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");
const leaderboardList = document.getElementById("leaderboardList");


// ========================================
// GLOBAL VARIABLES
// ========================================

let currentUser = null;
let gameStartTime = null;
let timeInterval = null;


// ========================================
// GOOGLE LOGIN
// REDIRECT METHOD
// ========================================

if (loginBtn) {

  loginBtn.addEventListener("click", async () => {

    try {

      loginBtn.disabled = true;

      loginBtn.textContent = "Opening Google...";

      console.log("Starting Google login...");

      await signInWithRedirect(
        auth,
        googleProvider
      );

    } catch (error) {

      console.error(
        "Google Login Error:",
        error
      );

      let message =
        "Google Login failed.";

      if (error.code) {

        message +=
          "\n\nError Code: " +
          error.code;

      }

      if (error.message) {

        message +=
          "\n\nMessage: " +
          error.message;

      }

      alert(message);

      loginBtn.disabled = false;

      loginBtn.textContent =
        "🔐 Login with Google";

    }

  });

}


// ========================================
// CHECK GOOGLE REDIRECT RESULT
// ========================================

getRedirectResult(auth)

  .then((result) => {

    if (result && result.user) {

      console.log(
        "Google redirect login successful:",
        result.user
      );

    } else {

      console.log(
        "No redirect login result."
      );

    }

  })

  .catch((error) => {

    console.error(
      "Google redirect login error:",
      error
    );

    let message =
      "Google Login failed.";

    if (error.code) {

      message +=
        "\n\nError Code: " +
        error.code;

    }

    if (error.message) {

      message +=
        "\n\nMessage: " +
        error.message;

    }

    alert(message);

  });


// ========================================
// LOGOUT
// ========================================

if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    async () => {

      try {

        await saveTimeSpent();

        await signOut(auth);

        console.log(
          "User logged out."
        );

      } catch (error) {

        console.error(
          "Logout error:",
          error
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
  async (user) => {

    currentUser = user;

    if (user) {

      console.log(
        "Logged in user:",
        user
      );


      // -----------------------------
      // LOGIN BUTTON
      // -----------------------------

      if (loginBtn) {

        loginBtn.style.display =
          "none";

      }


      // -----------------------------
      // LOGOUT BUTTON
      // -----------------------------

      if (logoutBtn) {

        logoutBtn.style.display =
          "inline-block";

      }


      // -----------------------------
      // USER INFORMATION
      // -----------------------------

      if (userInfo) {

        userInfo.style.display =
          "block";

        const photo =
          user.photoURL || "";

        const name =
          user.displayName ||
          "Player";

        userInfo.innerHTML = `

          <div
            style="
              display:flex;
              align-items:center;
              justify-content:center;
              gap:12px;
              margin-top:15px;
            "
          >

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

                  <div
                    style="
                      width:45px;
                      height:45px;
                      border-radius:50%;
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

            <div style="text-align:left;">

              <strong>
                ${escapeHTML(name)}
              </strong>

              <div
                style="
                  font-size:13px;
                  opacity:.7;
                  margin-top:3px;
                "
              >
                Logged in with Google
              </div>

            </div>

          </div>

        `;

      }


      // -----------------------------
      // CREATE / UPDATE PLAYER
      // -----------------------------

      await createOrUpdatePlayer(user);


      // -----------------------------
      // START TIME TRACKING
      // -----------------------------

      startTimeTracking();


      // -----------------------------
      // LOAD LEADERBOARD
      // -----------------------------

      await loadLeaderboard();

    }

    else {

      console.log(
        "No user logged in."
      );


      // -----------------------------
      // LOGIN BUTTON
      // -----------------------------

      if (loginBtn) {

        loginBtn.style.display =
          "inline-block";

        loginBtn.disabled =
          false;

        loginBtn.textContent =
          "🔐 Login with Google";

      }


      // -----------------------------
      // LOGOUT BUTTON
      // -----------------------------

      if (logoutBtn) {

        logoutBtn.style.display =
          "none";

      }


      // -----------------------------
      // USER INFO
      // -----------------------------

      if (userInfo) {

        userInfo.style.display =
          "none";

        userInfo.innerHTML = "";

      }


      // -----------------------------
      // STOP TIMER
      // -----------------------------

      stopTimeTracking();


      // -----------------------------
      // LEADERBOARD MESSAGE
      // -----------------------------

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
// CREATE OR UPDATE PLAYER
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


    // -----------------------------
    // NEW PLAYER
    // -----------------------------

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

          gamesPlayed:
            0,

          totalTime:
            0,

          online:
            true,

          createdAt:
            serverTimestamp(),

          lastActive:
            serverTimestamp()

        }
      );

      console.log(
        "New player created."
      );

    }


    // -----------------------------
    // EXISTING PLAYER
    // -----------------------------

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

          online:
            true,

          lastActive:
            serverTimestamp()

        }
      );

      console.log(
        "Player updated."
      );

    }

  }

  catch (error) {

    console.error(
      "Player update error:",
      error
    );

  }

}


// ========================================
// TRACK GAME START
// ========================================

window.trackGameStart =
  async function(gameId) {

    if (!currentUser) {

      console.log(
        "Game tracking skipped: user not logged in."
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

    }

    catch (error) {

      console.error(
        "Game tracking error:",
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
      async () => {

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
// SAVE TIME SPENT
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


    console.log(
      "Time saved:",
      elapsed,
      "seconds"
    );

  }

  catch (error) {

    console.error(
      "Time save error:",
      error
    );

  }

}


// ========================================
// VISIBILITY CHANGE
// ========================================

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

      // -----------------------------
      // PAGE HIDDEN
      // -----------------------------

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


      // -----------------------------
      // PAGE VISIBLE
      // -----------------------------

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

    }

    catch (error) {

      console.error(
        "Online status error:",
        error
      );

    }

  }
);


// ========================================
// PAGE HIDE
// ========================================

window.addEventListener(
  "pagehide",
  () => {

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


    // -----------------------------
    // NO PLAYERS
    // -----------------------------

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


    snapshot.forEach(
      (docSnap) => {

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


        // -----------------------------
        // RANK ICON
        // -----------------------------

        let rankIcon =
          rank;


        if (rank === 1) {

          rankIcon = "🥇";

        }

        else if (rank === 2) {

          rankIcon = "🥈";

        }

        else if (rank === 3) {

          rankIcon = "🥉";

        }


        // -----------------------------
        // PLAYER HTML
        // -----------------------------

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


              <div
                class="leaderboard-player-stats"
              >

                🎮
                ${games}
                Games

                &nbsp; • &nbsp;

                ⏱️
                ${formatTime(totalTime)}

                &nbsp; • &nbsp;

                ${
                  online

                    ? `

                      <span
                        style="color:#20c997;"
                      >
                        ● Online
                      </span>

                    `

                    : `

                      <span
                        style="opacity:.6;"
                      >
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

  }

  catch (error) {

    console.error(
      "Leaderboard error:",
      error
    );


    leaderboardList.innerHTML = `

      <div class="leaderboard-empty">

        Unable to load leaderboard.

        <br>
        <br>

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
// MAKE FUNCTION AVAILABLE GLOBALLY
// ========================================

window.loadLeaderboard =
  loadLeaderboard;
