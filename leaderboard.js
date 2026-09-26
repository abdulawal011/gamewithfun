// ========================================
// GAMEWITHFUN LEADERBOARD
// Google Popup Login + Firestore
// Fixed 15-Day Period System
// PUBLIC TOP 50 + PRIVATE PLAYER RANK
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
// LEADERBOARD PERIOD
// Saudi Arabia Time
// ========================================

const LEADERBOARD_TIMEZONE =
  "Asia/Riyadh";


// ========================================
// GET SAUDI DATE PARTS
// ========================================

function getSaudiDateParts() {

  const formatter =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone:
          LEADERBOARD_TIMEZONE,

        year: "numeric",
        month: "2-digit",
        day: "2-digit",

        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",

        hour12: false
      }
    );


  const parts =
    formatter.formatToParts(
      new Date()
    );


  const result = {};


  parts.forEach(
    part => {

      if (
        part.type !== "literal"
      ) {

        result[part.type] =
          part.value;

      }

    }
  );


  return {

    year:
      Number(result.year),

    month:
      Number(result.month),

    day:
      Number(result.day),

    hour:
      Number(result.hour),

    minute:
      Number(result.minute),

    second:
      Number(result.second)

  };

}


// ========================================
// GET CURRENT PERIOD
// ========================================

function getLeaderboardPeriod() {

  const date =
    getSaudiDateParts();


  const year =
    date.year;

  const month =
    date.month;

  const day =
    date.day;


  let startDay;
  let endDay;


  // ======================================
  // PERIOD 1
  // 1st → 15th
  // ======================================

  if (day <= 15) {

    startDay =
      1;

    endDay =
      15;

  }


  // ======================================
  // PERIOD 2
  // 16th → END OF MONTH
  // ======================================

  else {

    startDay =
      16;


    endDay =
      new Date(
        Date.UTC(
          year,
          month,
          0
        )
      ).getUTCDate();

  }


  const monthName =
    new Intl.DateTimeFormat(
      "en-US",
      {
        month: "short",
        timeZone:
          LEADERBOARD_TIMEZONE
      }
    ).format(
      new Date(
        Date.UTC(
          year,
          month - 1,
          1
        )
      )
    );


  const periodId =
    `${year}-${String(month).padStart(2, "0")}-${startDay}`;


  return {

    id:
      periodId,

    year,

    month,

    startDay,

    endDay,

    monthName,

    label:
      `${monthName} ${startDay} – ${monthName} ${endDay}`

  };

}


// ========================================
// SHOW CURRENT PERIOD
// ========================================

function showLeaderboardPeriod() {

  const period =
    getLeaderboardPeriod();


  let periodElement =
    document.getElementById(
      "leaderboardPeriod"
    );


  if (!periodElement) {

    periodElement =
      document.createElement(
        "div"
      );

    periodElement.id =
      "leaderboardPeriod";


    periodElement.style.textAlign =
      "center";

    periodElement.style.marginBottom =
      "12px";

    periodElement.style.fontSize =
      "13px";

    periodElement.style.opacity =
      "0.75";


    if (leaderboardList) {

      leaderboardList.parentNode.insertBefore(
        periodElement,
        leaderboardList
      );

    }

  }


  periodElement.innerHTML = `

    🏆 Leaderboard Period:
    <strong>
      ${escapeHTML(period.label)}
    </strong>

    <br>

    ⏰ Ends at
    <strong>
      11:59 PM
    </strong>

  `;

}


// ========================================
// SHOW PRIVATE PLAYER RANK
// ========================================

function showPrivateRank(rank, hasPlayed) {

  let rankElement =
    document.getElementById(
      "privatePlayerRank"
    );


  if (!rankElement) {

    rankElement =
      document.createElement(
        "div"
      );

    rankElement.id =
      "privatePlayerRank";


    rankElement.style.textAlign =
      "center";

    rankElement.style.marginBottom =
      "12px";

    rankElement.style.fontSize =
      "14px";

    rankElement.style.fontWeight =
      "600";


    if (leaderboardList) {

      leaderboardList.parentNode.insertBefore(
        rankElement,
        leaderboardList
      );

    }

  }


  // ======================================
  // PLAYER HAS NOT PLAYED
  // ======================================

  if (!currentUser || !hasPlayed) {

    rankElement.innerHTML =
      "";

    rankElement.style.display =
      "none";

    return;

  }


  // ======================================
  // PLAYER RANK
  // ======================================

  rankElement.style.display =
    "block";


  rankElement.innerHTML = `

    🎯 Your Rank:
    <strong>
      #${rank}
    </strong>

  `;

}


// ========================================
// PERIOD RESET
// ========================================
//
// Player accounts stay.
//
// Only leaderboard statistics reset.
//
// New period starts EMPTY.
// A player appears only after
// playing a game in the new period.
//
// ========================================

async function checkLeaderboardPeriod() {

  const period =
    getLeaderboardPeriod();


  const periodRef =
    doc(
      db,
      "settings",
      "leaderboard"
    );


  try {

    const periodSnap =
      await getDoc(
        periodRef
      );


    // ====================================
    // FIRST PERIOD
    // ====================================

    if (!periodSnap.exists()) {

      await setDoc(
        periodRef,
        {

          currentPeriod:
            period.id,

          periodLabel:
            period.label,

          updatedAt:
            serverTimestamp()

        }
      );


      console.log(
        "🆕 Leaderboard period initialized:",
        period.id
      );


      return;

    }


    const data =
      periodSnap.data();


    const oldPeriod =
      data.currentPeriod;


    // ====================================
    // SAME PERIOD
    // ====================================

    if (
      oldPeriod ===
      period.id
    ) {

      console.log(
        "✅ Current leaderboard period:",
        period.id
      );

      return;

    }


    // ====================================
    // NEW PERIOD
    // ====================================

    console.log(
      "🔄 NEW LEADERBOARD PERIOD!"
    );


    console.log(
      "Old:",
      oldPeriod
    );


    console.log(
      "New:",
      period.id
    );


    // ====================================
    // GET ALL PLAYERS
    // ====================================

    const playersRef =
      collection(
        db,
        "players"
      );


    const snapshot =
      await getDocs(
        playersRef
      );


    // ====================================
    // RESET PLAYER LEADERBOARD STATS
    // ====================================

    const resetPromises =
      [];


    snapshot.forEach(
      playerDoc => {

        resetPromises.push(

          updateDoc(
            doc(
              db,
              "players",
              playerDoc.id
            ),
            {

              gamesPlayed:
                0,

              totalTime:
                0,

              lastGame:
                "",

              online:
                false,

              lastActive:
                serverTimestamp(),

              leaderboardPeriod:
                period.id

            }
          )

        );

      }
    );


    await Promise.all(
      resetPromises
    );


    // ====================================
    // SAVE NEW PERIOD
    // ====================================

    await setDoc(
      periodRef,
      {

        currentPeriod:
          period.id,

        periodLabel:
          period.label,

        updatedAt:
          serverTimestamp()

      }
    );


    console.log(
      "✅ Leaderboard reset completed!"
    );


    console.log(
      "🏆 New period:",
      period.label
    );

  }

  catch (error) {

    console.error(
      "❌ Period check/reset error:",
      error
    );

  }

}


// ========================================
// DEBUG
// ========================================

console.log(
  "================================"
);

console.log(
  "🎮 GameWithFun Leaderboard Loaded"
);

console.log(
  "🔥 Leaderboard Period System: ON"
);

console.log(
  "🏆 Public Leaderboard: TOP 50"
);

console.log(
  "🔒 Private Rank: ENABLED"
);

console.log(
  "🇸🇦 Timezone: Asia/Riyadh"
);

console.log(
  "================================"
);


// ========================================
// GOOGLE LOGIN
// ========================================

if (loginBtn) {

  loginBtn.addEventListener(
    "click",
    async () => {

      try {

        loginBtn.disabled =
          true;

        loginBtn.textContent =
          "Opening Google...";


        console.log(
          "🔐 Starting Google Popup Login..."
        );


        const result =
          await signInWithPopup(
            auth,
            googleProvider
          );


        console.log(
          "✅ Google Login Successful:",
          result.user.email
        );

      }

      catch (error) {

        console.error(
          "❌ Google Login Error:",
          error
        );


        showLoginError(
          error
        );


        loginBtn.disabled =
          false;


        loginBtn.textContent =
          "🔐 Login with Google";

      }

    }
  );

}


// ========================================
// LOGIN ERROR
// ========================================

function showLoginError(error) {

  let message =
    "Google Login failed.";


  if (
    error &&
    error.code
  ) {

    message +=
      "\n\nError Code:\n" +
      error.code;

  }


  if (
    error &&
    error.message
  ) {

    message +=
      "\n\nMessage:\n" +
      error.message;

  }


  alert(
    message
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


        if (currentUser) {

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

                online:
                  false,

                lastActive:
                  serverTimestamp()

              }
            );

          }

          catch (error) {

            console.error(
              "Offline status error:",
              error
            );

          }

        }


        await signOut(
          auth
        );


        console.log(
          "✅ User logged out."
        );

      }

      catch (error) {

        console.error(
          "❌ Logout Error:",
          error
        );


        alert(
          "Logout Error:\n\n" +
          (
            error.message ||
            "Unknown error"
          )
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

    currentUser =
      user;


    // ====================================
    // USER LOGGED IN
    // ====================================

    if (user) {

      console.log(
        "================================"
      );


      console.log(
        "✅ AUTHENTICATED USER"
      );


      console.log(
        "Name:",
        user.displayName
      );


      console.log(
        "Email:",
        user.email
      );


      console.log(
        "UID:",
        user.uid
      );


      console.log(
        "================================"
      );


      // Check period FIRST
      await checkLeaderboardPeriod();


      showLeaderboardPeriod();


      // ==================================
      // HIDE LOGIN
      // ==================================

      if (loginBtn) {

        loginBtn.style.display =
          "none";

      }


      // ==================================
      // SHOW LOGOUT
      // ==================================

      if (logoutBtn) {

        logoutBtn.style.display =
          "inline-block";

      }


      // ==================================
      // SHOW USER
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


      // ==================================
      // SAVE PLAYER
      // ==================================

      await createOrUpdatePlayer(
        user
      );


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
        "User is not logged in."
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


      showPrivateRank(
        null,
        false
      );


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

  console.log(
    "🔥 FIRESTORE PLAYER SAVE START"
  );


  try {

    const playerRef =
      doc(
        db,
        "players",
        user.uid
      );


    const playerSnap =
      await getDoc(
        playerRef
      );


    const period =
      getLeaderboardPeriod();


    // ====================================
    // NEW PLAYER
    // ====================================

    if (
      !playerSnap.exists()
    ) {

      console.log(
        "🆕 Creating new player..."
      );


      await setDoc(
        playerRef,
        {

          name:
            user.displayName ||
            "Player",

          email:
            user.email ||
            "",

          photoURL:
            user.photoURL ||
            "",

          gamesPlayed:
            0,

          totalTime:
            0,

          online:
            true,

          lastGame:
            "",

          leaderboardPeriod:
            period.id,

          lastActive:
            serverTimestamp(),

          createdAt:
            serverTimestamp()

        }
      );


      console.log(
        "✅ New player created successfully!"
      );

    }


    // ====================================
    // EXISTING PLAYER
    // ====================================

    else {

      const player =
        playerSnap.data();


      // ==================================
      // OLD PERIOD PROTECTION
      // ==================================

      if (
        player.leaderboardPeriod &&
        player.leaderboardPeriod !==
        period.id
      ) {

        await updateDoc(
          playerRef,
          {

            gamesPlayed:
              0,

            totalTime:
              0,

            lastGame:
              "",

            leaderboardPeriod:
              period.id,

            name:
              user.displayName ||
              "Player",

            email:
              user.email ||
              "",

            photoURL:
              user.photoURL ||
              "",

            online:
              true,

            lastActive:
              serverTimestamp()

          }
        );

      }

      else {

        await updateDoc(
          playerRef,
          {

            name:
              user.displayName ||
              "Player",

            email:
              user.email ||
              "",

            photoURL:
              user.photoURL ||
              "",

            online:
              true,

            leaderboardPeriod:
              period.id,

            lastActive:
              serverTimestamp()

          }
        );

      }


      console.log(
        "✅ Existing player updated."
      );

    }


    console.log(
      "================================"
    );


    console.log(
      "🎮 PLAYER PROFILE READY"
    );


    console.log(
      "Firestore: players/" +
      user.uid
    );


    console.log(
      "================================"
    );

  }

  catch (error) {

    console.error(
      "❌ FIRESTORE PLAYER ERROR:",
      error
    );


    alert(
      "❌ FIRESTORE ERROR\n\n" +

      "Code:\n" +

      (
        error.code ||
        "unknown"
      ) +

      "\n\nMessage:\n" +

      (
        error.message ||
        "Unknown error"
      )
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
        "🎮 Game tracking skipped - not logged in."
      );

      return;

    }


    try {

      // Make sure period is current
      await checkLeaderboardPeriod();


      const period =
        getLeaderboardPeriod();


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
            serverTimestamp(),

          online:
            true,

          leaderboardPeriod:
            period.id

        }
      );


      console.log(
        "🎮 Game started:",
        gameId
      );


      await loadLeaderboard();

    }

    catch (error) {

      console.error(
        "❌ Game tracking error:",
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

    // Check if period changed
    await checkLeaderboardPeriod();


    const period =
      getLeaderboardPeriod();


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
          true,

        leaderboardPeriod:
          period.id

      }
    );


    console.log(
      "⏱️ Saved time:",
      elapsed,
      "seconds"
    );


    // Refresh ranking after time update
    await loadLeaderboard();

  }

  catch (error) {

    console.error(
      "❌ Save time error:",
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

      if (
        document.hidden
      ) {

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

        await checkLeaderboardPeriod();


        gameStartTime =
          Date.now();


        await updateDoc(
          playerRef,
          {

            online:
              true,

            lastActive:
              serverTimestamp(),

            leaderboardPeriod:
              getLeaderboardPeriod().id

          }
        );


        showLeaderboardPeriod();


        await loadLeaderboard();

      }

    }

    catch (error) {

      console.error(
        "❌ Visibility error:",
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
//
// PUBLIC:
// Only current-period players who have
// actually played are included.
// Only TOP 50 are shown.
//
// PRIVATE:
// Logged-in player can see own rank
// even when rank is > 50.
//
// ========================================

async function loadLeaderboard() {

  if (!leaderboardList) {

    return;

  }


  try {

    // Check current period
    await checkLeaderboardPeriod();


    showLeaderboardPeriod();


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


    // ====================================
    // GET PLAYERS
    // ====================================

    const leaderboardQuery =
      query(
        playersRef,

        orderBy(
          "totalTime",
          "desc"
        ),

        limit(1000)
      );


    const snapshot =
      await getDocs(
        leaderboardQuery
      );


    const currentPeriod =
      getLeaderboardPeriod();


    // ====================================
    // CREATE CURRENT PERIOD PLAYER LIST
    // ====================================

    const players =
      [];


    snapshot.forEach(
      (docSnap) => {

        const player =
          docSnap.data();


        // ==================================
        // ONLY CURRENT PERIOD
        // ==================================

        if (
          player.leaderboardPeriod !==
          currentPeriod.id
        ) {

          return;

        }


        // ==================================
        // ONLY PLAYERS WHO PLAYED
        // ==================================

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


        if (
          games <= 0
        ) {

          return;

        }


        players.push({

          id:
            docSnap.id,

          ...player,

          gamesPlayed:
            games,

          totalTime:
            totalTime

        });

      }
    );


    // ====================================
    // SORT CURRENT PERIOD PLAYERS
    // ====================================

    players.sort(
      (a, b) => {

        return (
          b.totalTime -
          a.totalTime
        );

      }
    );


    // ====================================
    // FIND CURRENT PLAYER PRIVATE RANK
    // ====================================

    let currentPlayerRank =
      null;


    let currentPlayerHasPlayed =
      false;


    if (currentUser) {

      const index =
        players.findIndex(
          player =>
            player.id ===
            currentUser.uid
        );


      if (index !== -1) {

        currentPlayerHasPlayed =
          true;

        currentPlayerRank =
          index + 1;

      }

    }


    // ====================================
    // SHOW PRIVATE RANK
    // ====================================

    showPrivateRank(
      currentPlayerRank,
      currentPlayerHasPlayed
    );


    // ====================================
    // PUBLIC TOP 25
    // ====================================

    const top25 =
      players.slice(
        0,
        25
      );


    // ====================================
    // NEW PERIOD = EMPTY LEADERBOARD
    // ====================================

    if (
      top25.length === 0
    ) {

      leaderboardList.innerHTML = `

        <div class="leaderboard-empty">

          No players yet 🎮

        </div>

      `;

      return;

    }


    // ====================================
    // BUILD PUBLIC LEADERBOARD
    // ====================================

    let html =
      "";


    top50.forEach(
      (player, index) => {

        const rank =
          index + 1;


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
          player.online ===
          true;


        let rankIcon =
          rank;


        if (
          rank === 1
        ) {

          rankIcon =
            "🥇";

        }

        else if (
          rank === 2
        ) {

          rankIcon =
            "🥈";

        }

        else if (
          rank === 3
        ) {

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


              <div
                class="leaderboard-player-stats"
              >

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

      }
    );


    leaderboardList.innerHTML =
      html;

  }

  catch (error) {

    console.error(
      "❌ Leaderboard loading error:",
      error
    );


    leaderboardList.innerHTML = `

      <div class="leaderboard-empty">

        Unable to load leaderboard.

        <br><br>

        Error:

        ${escapeHTML(
          error.code ||
          "unknown"
        )}

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
      (
        seconds % 3600
      ) / 60
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
// GLOBAL FUNCTION
// ========================================

window.loadLeaderboard =
  loadLeaderboard;


// ========================================
// SHOW PERIOD IMMEDIATELY
// ========================================

showLeaderboardPeriod();
