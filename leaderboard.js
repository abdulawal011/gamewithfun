// ==================================================
// GAMEWITHFUN LEADERBOARD
// ==================================================

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
  getDocs
} from "./firebase-config.js";


// ==================================================
// ELEMENTS
// ==================================================

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");
const leaderboardList = document.getElementById("leaderboardList");


// ==================================================
// VARIABLES
// ==================================================

let currentUser = null;
let gameStartTime = null;
let timeInterval = null;

const LEADERBOARD_TIMEZONE = "Asia/Riyadh";


// ==================================================
// SAUDI DATE
// ==================================================

function getSaudiDateParts() {

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: LEADERBOARD_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const result = {};

  parts.forEach(part => {
    if (part.type !== "literal") {
      result[part.type] = part.value;
    }
  });

  return {
    year: Number(result.year),
    month: Number(result.month),
    day: Number(result.day)
  };
}


// ==================================================
// LEADERBOARD PERIOD
// ==================================================

function getLeaderboardPeriod() {

  const { year, month, day } =
    getSaudiDateParts();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  const monthName = monthNames[month - 1];

  let startDay;
  let endDay;

  if (day <= 15) {

    startDay = 1;
    endDay = 15;

  } else {

    startDay = 16;
    endDay = new Date(year, month, 0).getDate();
  }

  const periodId =
    `${year}-${String(month).padStart(2, "0")}-${startDay}`;

  const label =
    `${monthName} ${startDay} – ${monthName} ${endDay}`;

  return {
    id: periodId,
    label,
    startDay,
    endDay,
    year,
    month
  };
}


// ==================================================
// SHOW PERIOD
// ==================================================

function showLeaderboardPeriod() {

  const period = getLeaderboardPeriod();

  let periodBox =
    document.getElementById("leaderboardPeriod");

  if (!periodBox) {

    periodBox = document.createElement("div");

    periodBox.id = "leaderboardPeriod";

    periodBox.style.textAlign = "center";
    periodBox.style.margin = "10px 0";
    periodBox.style.fontWeight = "600";

    if (leaderboardList &&
        leaderboardList.parentNode) {

      leaderboardList.parentNode.insertBefore(
        periodBox,
        leaderboardList
      );
    }
  }

  periodBox.innerHTML = `
    🏆 Leaderboard Period: ${period.label}<br>
    <span style="font-size:13px;">
      ⏰ Ends at 11:59 PM
    </span>
  `;
}


// ==================================================
// CHECK PERIOD
// ==================================================

async function checkLeaderboardPeriod() {

  const period = getLeaderboardPeriod();

  const settingsRef =
    doc(db, "settings", "leaderboard");

  try {

    const settingsSnap =
      await getDoc(settingsRef);

    if (!settingsSnap.exists()) {

      await setDoc(settingsRef, {
        leaderboardPeriod: period.id,
        updatedAt: serverTimestamp()
      });

      return period;
    }

    const data = settingsSnap.data();

    if (data.leaderboardPeriod !== period.id) {

      console.log(
        "New leaderboard period detected."
      );

      const playersRef =
        collection(db, "players");

      const snapshot =
        await getDocs(playersRef);

      const resetPromises = [];

      snapshot.forEach(playerDoc => {

        resetPromises.push(
          updateDoc(playerDoc.ref, {

            gamesPlayed: 0,
            totalTime: 0,
            lastGame: "",
            online: false,
            leaderboardPeriod: period.id,
            lastActive: serverTimestamp()

          })
        );

      });

      await Promise.all(resetPromises);

      await setDoc(settingsRef, {
        leaderboardPeriod: period.id,
        updatedAt: serverTimestamp()
      });

      console.log(
        "Leaderboard reset completed."
      );
    }

    return period;

  } catch (error) {

    console.error(
      "Period check error:",
      error
    );

    return period;
  }
}


// ==================================================
// GOOGLE LOGIN
// ==================================================

if (loginBtn) {

  loginBtn.addEventListener(
    "click",
    async () => {

      try {

        await signInWithPopup(
          auth,
          googleProvider
        );

      } catch (error) {

        console.error(
          "Google login error:",
          error
        );

        alert(
          "Google Login failed: " +
          (error.message || "Unknown error")
        );
      }
    }
  );
}


// ==================================================
// LOGOUT
// ==================================================

if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    async () => {

      try {

        await saveTimeSpent();

        if (currentUser) {

          const playerRef =
            doc(
              db,
              "players",
              currentUser.uid
            );

          await updateDoc(
            playerRef,
            {
              online: false,
              lastActive: serverTimestamp()
            }
          );
        }

        stopTimeTracking();

        await signOut(auth);

      } catch (error) {

        console.error(
          "Logout error:",
          error
        );
      }
    }
  );
}


// ==================================================
// AUTH STATE
// ==================================================

onAuthStateChanged(
  auth,
  async (user) => {

    currentUser = user;

    if (user) {

      try {

        await checkLeaderboardPeriod();

        showLeaderboardPeriod();

        if (loginBtn) {
          loginBtn.style.display = "none";
        }

        if (logoutBtn) {
          logoutBtn.style.display = "block";
        }

        if (userInfo) {

          const photo =
            user.photoURL
              ? `
                <img
                  src="${escapeHTML(user.photoURL)}"
                  referrerpolicy="no-referrer"
                  style="
                    width:36px;
                    height:36px;
                    border-radius:50%;
                    object-fit:cover;
                  "
                >
              `
              : "";

          userInfo.innerHTML = `
            ${photo}
            <span>
              ${escapeHTML(
                user.displayName || "Player"
              )}
            </span>
          `;

          userInfo.style.display = "flex";
        }

        await createOrUpdatePlayer(user);

        if (!document.hidden) {
          startTimeTracking();
        }

        await loadLeaderboard();

      } catch (error) {

        console.error(
          "Auth state error:",
          error
        );

        if (leaderboardList) {

          leaderboardList.innerHTML = `
            <div style="
              text-align:center;
              padding:20px;
            ">
              Unable to load leaderboard.
            </div>
          `;
        }
      }

    } else {

      if (loginBtn) {
        loginBtn.style.display = "block";
      }

      if (logoutBtn) {
        logoutBtn.style.display = "none";
      }

      if (userInfo) {
        userInfo.innerHTML = "";
        userInfo.style.display = "none";
      }

      stopTimeTracking();

      currentUser = null;

      if (leaderboardList) {

        leaderboardList.innerHTML = `
          <div style="
            text-align:center;
            padding:20px;
          ">
            Login to join the leaderboard 🎮
          </div>
        `;
      }

      showLeaderboardPeriod();
    }
  }
);


// ==================================================
// CREATE / UPDATE PLAYER
// ==================================================

async function createOrUpdatePlayer(user) {

  const period =
    getLeaderboardPeriod();

  const playerRef =
    doc(
      db,
      "players",
      user.uid
    );

  const playerSnap =
    await getDoc(playerRef);

  if (!playerSnap.exists()) {

    await setDoc(
      playerRef,
      {

        name:
          user.displayName || "Player",

        email:
          user.email || "",

        photoURL:
          user.photoURL || "",

        gamesPlayed: 0,

        totalTime: 0,

        online: true,

        lastGame: "",

        leaderboardPeriod:
          period.id,

        lastActive:
          serverTimestamp(),

        createdAt:
          serverTimestamp()
      }
    );

    return;
  }

  const playerData =
    playerSnap.data();

  if (
    playerData.leaderboardPeriod &&
    playerData.leaderboardPeriod !== period.id
  ) {

    await updateDoc(
      playerRef,
      {

        gamesPlayed: 0,
        totalTime: 0,
        lastGame: "",

        leaderboardPeriod:
          period.id,

        online: true,

        name:
          user.displayName || "Player",

        email:
          user.email || "",

        photoURL:
          user.photoURL || "",

        lastActive:
          serverTimestamp()
      }
    );

  } else {

    await updateDoc(
      playerRef,
      {

        name:
          user.displayName || "Player",

        email:
          user.email || "",

        photoURL:
          user.photoURL || "",

        leaderboardPeriod:
          period.id,

        online: true,

        lastActive:
          serverTimestamp()
      }
    );
  }
}


// ==================================================
// TRACK GAME START
// ==================================================

window.trackGameStart =
  async function(gameId) {

    if (!currentUser) {
      return;
    }

    // Do not count game activity while tab is hidden
    if (document.hidden) {
      return;
    }

    try {

      const period =
        await checkLeaderboardPeriod();

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
            gameId || "",

          online: true,

          leaderboardPeriod:
            period.id,

          lastActive:
            serverTimestamp()
        }
      );

      gameStartTime =
        Date.now();

      await loadLeaderboard();

    } catch (error) {

      console.error(
        "Game start tracking error:",
        error
      );
    }
  };


// ==================================================
// TIME TRACKING
// ==================================================

function startTimeTracking() {

  stopTimeTracking();

  // Never start timer in background tab
  if (document.hidden) {
    return;
  }

  gameStartTime =
    Date.now();

  timeInterval =
    setInterval(
      () => {

        if (!document.hidden) {
          saveTimeSpent();
        }

      },
      30000
    );
}


function stopTimeTracking() {

  if (timeInterval) {

    clearInterval(timeInterval);

    timeInterval = null;
  }

  gameStartTime = null;
}


// ==================================================
// SAVE TIME
// ==================================================

async function saveTimeSpent() {

  if (!currentUser) {
    return;
  }

  // ==================================================
  // IMPORTANT:
  // NEVER COUNT TIME WHEN TAB IS NOT VISIBLE
  // ==================================================

  if (document.hidden) {

    gameStartTime = null;

    return;
  }

  if (!gameStartTime) {
    return;
  }

  const elapsedSeconds =
    Math.floor(
      (Date.now() - gameStartTime) / 1000
    );

  if (elapsedSeconds <= 0) {
    return;
  }

  gameStartTime =
    Date.now();

  try {

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
          increment(elapsedSeconds),

        lastActive:
          serverTimestamp(),

        online: true,

        leaderboardPeriod:
          period.id
      }
    );

    await loadLeaderboard();

  } catch (error) {

    console.error(
      "Save time error:",
      error
    );
  }
}


// ==================================================
// VISIBILITY CHANGE
// ==================================================

document.addEventListener(
  "visibilitychange",
  async () => {

    if (!currentUser) {
      return;
    }

    try {

      // ==================================================
      // PLAYER LEFT GAMEWITHFUN TAB
      // ==================================================

      if (document.hidden) {

        // Save only the time that was actually
        // spent while the GameWithFun tab was visible
        await saveTimeSpent();

        const playerRef =
          doc(
            db,
            "players",
            currentUser.uid
          );

        await updateDoc(
          playerRef,
          {

            online: false,

            lastActive:
              serverTimestamp()
          }
        );

        stopTimeTracking();

        return;
      }


      // ==================================================
      // PLAYER RETURNED TO GAMEWITHFUN
      // ==================================================

      const period =
        await checkLeaderboardPeriod();

      const playerRef =
        doc(
          db,
          "players",
          currentUser.uid
        );

      await updateDoc(
        playerRef,
        {

          online: true,

          leaderboardPeriod:
            period.id,

          lastActive:
            serverTimestamp()
        }
      );

      showLeaderboardPeriod();

      // Start a NEW timer from this moment
      startTimeTracking();

      await loadLeaderboard();

    } catch (error) {

      console.error(
        "Visibility error:",
        error
      );
    }
  }
);


// ==================================================
// PAGE HIDE
// ==================================================

window.addEventListener(
  "pagehide",
  async () => {

    if (!currentUser) {
      return;
    }

    // Only save if GameWithFun was visible
    if (!document.hidden) {
      await saveTimeSpent();
    }
  }
);


// ==================================================
// PRIVATE PLAYER RANK
// ==================================================

function showPrivateRank(
  rank,
  hasPlayed
) {

  let rankBox =
    document.getElementById(
      "privatePlayerRank"
    );

  if (!rankBox) {

    rankBox =
      document.createElement("div");

    rankBox.id =
      "privatePlayerRank";

    rankBox.style.textAlign =
      "center";

    rankBox.style.margin =
      "10px 0";

    rankBox.style.fontWeight =
      "600";

    if (
      leaderboardList &&
      leaderboardList.parentNode
    ) {

      leaderboardList.parentNode.insertBefore(
        rankBox,
        leaderboardList
      );
    }
  }

  if (
    !currentUser ||
    !hasPlayed
  ) {

    rankBox.style.display =
      "none";

    return;
  }

  rankBox.style.display =
    "block";

  rankBox.innerHTML =
    `🎯 Your Rank: #${rank}`;
}


// ==================================================
// LOAD LEADERBOARD
// ==================================================

async function loadLeaderboard() {

  if (!leaderboardList) {
    return;
  }

  try {

    const period =
      getLeaderboardPeriod();

    const playersRef =
      collection(db, "players");

    const leaderboardQuery =
      query(
        playersRef,
        orderBy("totalTime", "desc")
      );

    const snapshot =
      await getDocs(
        leaderboardQuery
      );

    const players = [];

    snapshot.forEach(
      playerDoc => {

        const data =
          playerDoc.data();

        if (
          data.leaderboardPeriod ===
            period.id &&
          Number(
            data.gamesPlayed || 0
          ) > 0
        ) {

          players.push({

            id:
              playerDoc.id,

            ...data
          });
        }
      }
    );


    // ==================================================
    // SORT
    // ==================================================

    players.sort(
      (a, b) => {

        const timeA =
          Number(a.totalTime || 0);

        const timeB =
          Number(b.totalTime || 0);

        if (
          timeB !== timeA
        ) {

          return timeB - timeA;
        }

        return String(
          a.name || ""
        ).localeCompare(
          String(b.name || "")
        );
      }
    );


    // ==================================================
    // PRIVATE RANK
    // ==================================================

    if (currentUser) {

      const myIndex =
        players.findIndex(
          player =>
            player.id ===
            currentUser.uid
        );

      if (myIndex !== -1) {

        showPrivateRank(
          myIndex + 1,
          true
        );

      } else {

        showPrivateRank(
          0,
          false
        );
      }

    } else {

      showPrivateRank(
        0,
        false
      );
    }


    // ==================================================
    // PUBLIC TOP 25
    // ==================================================

    const top25 =
      players.slice(0, 25);


    if (top25.length === 0) {

      leaderboardList.innerHTML = `
        <div style="
          text-align:center;
          padding:20px;
        ">
          No players yet.<br>
          🎮 Play a game to join the leaderboard!
        </div>
      `;

      return;
    }


    // ==================================================
    // RENDER TOP 25
    // ==================================================

    leaderboardList.innerHTML =
      top25.map(
        (player, index) => {

          const rank =
            index + 1;

          const name =
            escapeHTML(
              player.name ||
              "Player"
            );

          const photoURL =
            player.photoURL
              ? escapeHTML(
                  player.photoURL
                )
              : "";

          const gamesPlayed =
            Number(
              player.gamesPlayed || 0
            );

          const totalTime =
            Number(
              player.totalTime || 0
            );

          const online =
            player.online === true;


          const profileImage =
            photoURL

              ? `
                <img
                  src="${photoURL}"
                  alt=""
                  referrerpolicy="no-referrer"
                  style="
                    width:40px;
                    height:40px;
                    min-width:40px;
                    border-radius:50%;
                    object-fit:cover;
                    margin-right:9px;
                    vertical-align:middle;
                  "
                  onerror="
                    this.style.display='none';
                  "
                >
              `

              : `
                <div
                  style="
                    width:40px;
                    height:40px;
                    min-width:40px;
                    border-radius:50%;
                    background:#ddd;
                    display:inline-flex;
                    align-items:center;
                    justify-content:center;
                    margin-right:9px;
                    vertical-align:middle;
                    font-size:20px;
                  "
                >
                  👤
                </div>
              `;


          return `

            <div
              class="leaderboard-player"
            >

              <div
                class="leaderboard-rank"
              >
                #${rank}
              </div>


              <div
                class="leaderboard-name"
                style="
                  display:flex;
                  align-items:center;
                  min-width:0;
                "
              >

                ${profileImage}

                <div
                  style="
                    min-width:0;
                  "
                >

                  <div>
                    ${name}
                  </div>

                  <small>
                    ${gamesPlayed} games
                  </small>

                </div>

              </div>


              <div
                class="leaderboard-time"
              >

                ${formatTime(
                  totalTime
                )}

                <span
                  style="
                    display:inline-block;
                    width:8px;
                    height:8px;
                    border-radius:50%;
                    background:${
                      online
                        ? "#22c55e"
                        : "#999"
                    };
                    margin-left:5px;
                  "
                ></span>

              </div>

            </div>

          `;
        }
      ).join("");


  } catch (error) {

    console.error(
      "Leaderboard loading error:",
      error
    );

    leaderboardList.innerHTML = `
      <div style="
        text-align:center;
        padding:20px;
      ">
        Unable to load leaderboard.
      </div>
    `;
  }
}


// ==================================================
// FORMAT TIME
// ==================================================

function formatTime(seconds) {

  seconds =
    Math.max(
      0,
      Math.floor(
        Number(seconds) || 0
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
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }

  return `${secs}s`;
}


// ==================================================
// ESCAPE HTML
// ==================================================

function escapeHTML(value) {

  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// ==================================================
// GLOBAL
// ==================================================

window.loadLeaderboard =
  loadLeaderboard;


// ==================================================
// INITIAL PERIOD
// ==================================================

showLeaderboardPeriod();
