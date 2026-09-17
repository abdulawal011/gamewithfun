// ========================================
// FIREBASE CONFIGURATION
// GameWithFun
// ========================================

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  getFirestore,
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
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ========================================
// FIREBASE CONFIG
// ========================================

const firebaseConfig = {
  apiKey: "AIzaSyBmsDEIWswcmxdDoJuDCMAh3j3OJQKkG9I",
  authDomain: "game-with-fun-58521.firebaseapp.com",
  projectId: "game-with-fun-58521",
  storageBucket: "game-with-fun-58521.firebasestorage.app",
  messagingSenderId: "475244952455",
  appId: "1:475244952455:web:1d6f18b335867c03037122",
  measurementId: "G-CRHNTHH34B"
};


// ========================================
// INITIALIZE FIREBASE
// ========================================

const app = initializeApp(firebaseConfig);


// ========================================
// AUTH
// ========================================

const auth = getAuth(app);


// ========================================
// FIRESTORE
// ========================================

const db = getFirestore(app);


// ========================================
// GOOGLE PROVIDER
// ========================================

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account"
});


// ========================================
// EXPORT
// ========================================

export {
  app,
  auth,
  db,
  googleProvider,

  // Authentication
  signInWithPopup,
  signOut,
  onAuthStateChanged,

  // Firestore
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
};

2. "leaderboard.js"

:::writing{variant="document" id="74106" title="leaderboard.js"}

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

const loginBtn =
  document.getElementById("loginBtn");

const logoutBtn =
  document.getElementById("logoutBtn");

const userInfo =
  document.getElementById("userInfo");

const leaderboardList =
  document.getElementById("leaderboardList");


// ========================================
// VARIABLES
// ========================================

let currentUser = null;

let gameStartTime = null;

let timeInterval = null;


// ========================================
// GOOGLE LOGIN
// ========================================

if (loginBtn) {

  loginBtn.addEventListener(
    "click",
    async () => {

      try {

        loginBtn.disabled = true;

        loginBtn.textContent =
          "Opening Google...";


        const result =
          await signInWithPopup(
            auth,
            googleProvider
          );


        console.log(
          "Google login successful:",
          result.user
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
            "\n\nError: " +
            error.code;

        }


        if (error.message) {

          message +=
            "\n" +
            error.message;

        }


        alert(message);


        loginBtn.disabled = false;

        loginBtn.textContent =
          "🔐 Login with Google";
      }

    }
  );

}


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
          "User logged out"
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


    // ====================================
    // USER LOGGED IN
    // ====================================

    if (user) {

      console.log(
        "Logged in:",
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


      // Show user information

      if (userInfo) {

        userInfo.style.display =
          "block";


        const photo =
          user.photoURL || "";


        const name =
          user.displayName ||
          "Player";


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


      // Create/update player

      await createOrUpdatePlayer(
        user
      );


      // Start tracking

      startTimeTracking();


      // Load leaderboard

      await loadLeaderboard();

    }


    // ====================================
    // USER LOGGED OUT
    // ====================================

    else {

      console.log(
        "No user logged in"
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

async function createOrUpdatePlayer(
  user
) {

  const playerRef =
    doc(
      db,
      "players",
      user.uid
    );


  try {

    const playerSnap =
      await getDoc(playerRef);


    // New player

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

    }


    // Existing player

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

    }

  } catch (error) {

    console.error(
      "Player update error:",
      error
    );

  }

}


// ========================================
// GAME START TRACKING
// ========================================

window.trackGameStart =
  async function(gameId) {

    if (!currentUser) {

      console.log(
        "Game tracking skipped: user not logged in"
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


    } catch (error) {

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

        online: true

      }
    );


  } catch (error) {

    console.error(
      "Time save error:",
      error
    );

  }

}


// ========================================
// ONLINE / OFFLINE
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

      if (document.hidden) {

        await saveTimeSpent();


        await updateDoc(
          playerRef,
          {

            online: false,

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

            online: true,

            lastActive:
              serverTimestamp()

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


// ========================================
// PAGE LEAVE
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


  } catch (error) {

    console.error(
      "Leaderboard error:",
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
