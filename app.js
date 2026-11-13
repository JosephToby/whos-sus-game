// --- 1. WORD PACK DATABASE ---
const WORD_PACKS = {
  foods: [
    { crew: "Pepperoni Pizza", decoy: "Garlic Bread", decoys: ["Pepperoni Pizza", "Lasagna", "Tacos", "Cheese Burger"] },
    { crew: "Bubble Tea", decoy: "Iced Coffee", decoys: ["Bubble Tea", "Smoothie", "Milkshake", "Matcha Latte"] },
    { crew: "French Fries", decoy: "Onion Rings", decoys: ["French Fries", "Potato Chips", "Mozzarella Sticks", "Nachos"] },
    { crew: "Sushi Roll", decoy: "Ramen Bowl", decoys: ["Sushi Roll", "Poke Bowl", "Spring Roll", "Dumplings"] }
  ],
  places: [
    { crew: "Haunted House", decoy: "Escape Room", decoys: ["Haunted House", "Roller Coaster", "Graveyard", "Cinema"] },
    { crew: "Airport Security", decoy: "Train Station", decoys: ["Airport Security", "Bus Terminal", "Cruise Ship", "Subway"] },
    { crew: "Gym Locker Room", decoy: "Swimming Pool", decoys: ["Gym Locker Room", "Sauna", "Yoga Studio", "CrossFit Box"] }
  ],
  movies: [
    { crew: "Spider-Man", decoy: "Batman", decoys: ["Spider-Man", "Iron Man", "Deadpool", "Superman"] },
    { crew: "Darth Vader", decoy: "Thanos", decoys: ["Darth Vader", "Voldemort", "Joker", "Loki"] },
    { crew: "Hogwarts", decoy: "Narnia", decoys: ["Hogwarts", "Wakanda", "Gotham City", "Mordor"] }
  ],
  animals: [
    { crew: "Chameleon", decoy: "Iguana", decoys: ["Chameleon", "Gecko", "Tree Frog", "Komodo Dragon"] },
    { crew: "Penguin", decoy: "Puffin", decoys: ["Penguin", "Seagull", "Pelican", "Flamingo"] },
    { crew: "Octopus", decoy: "Jellyfish", decoys: ["Octopus", "Squid", "Stingray", "Lobster"] }
  ],
  tech: [
    { crew: "ChatGPT", decoy: "Google Search", decoys: ["ChatGPT", "Siri", "Alexa", "Stack Overflow"] },
    { crew: "Minecraft", decoy: "Roblox", decoys: ["Minecraft", "Fortnite", "Terraria", "Among Us"] },
    { crew: "AirPods", decoy: "VR Headset", decoys: ["AirPods", "Smartwatch", "Bluetooth Speaker", "Gaming Mouse"] }
  ]
};

const FUNNY_NAMES = [
  "Captain Sus", "Vent Goblin", "Sir Lies-a-Lot", "Spicy Nugget",
  "Detective Potato", "Trash Panda", "Agent Banana", "Dr. Chaos"
];

const AVATARS = ["🦊", "🐸", "🐵", "🐼", "🐯", "🐙", "🦄", "🦖", "👽", "🤖", "👻", "🤠"];

// --- 2. GLOBAL GAME STATE ---
let state = {
  roomCode: "SUS4",
  players: [
    { name: "Captain Sus", avatar: "🦊" },
    { name: "Spicy Nugget", avatar: "🐸" },
    { name: "Agent Banana", avatar: "🐵" },
    { name: "Trash Panda", avatar: "🐼" }
  ],
  imposterIndex: 0,
  currentPack: null,
  mode: "classic",
  revealIndex: 0,
  cardFlipped: false,
  timerSeconds: 120,
  timerInterval: null,
  voterIndex: 0,
  votes: {}
};

// Cross-Tab Live Sync Channel
const syncChannel = ('BroadcastChannel' in window) ? new BroadcastChannel('whos_sus_party') : null;
if (syncChannel) {
  syncChannel.onmessage = (e) => {
    if (e.data && e.data.roomCode === state.roomCode) {
      state.players = e.data.players;
      renderPlayers();
    }
  };
}

// --- 3. WEB AUDIO API SOUND SYNTHESIZER ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSFX(type) {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const now = audioCtx.currentTime;

  if (type === 'sus') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.55);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.6);
  } else if (type === 'siren') {
    for (let i = 0; i < 3; i++) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(620, now + i * 0.22);
      osc.frequency.setValueAtTime(880, now + i * 0.22 + 0.1);
      gain.gain.setValueAtTime(0.2, now + i * 0.22);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.22 + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + i * 0.22);
      osc.stop(now + i * 0.22 + 0.2);
    }
  } else if (type === 'eject') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(75, now + 0.45);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.45);
  } else if (type === 'win') {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);
      gain.gain.setValueAtTime(0.25, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.09 + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.25);
    });
  }
}

// --- 4. LOBBY & PLAYER MANAGEMENT ---
function renderPlayers() {
  const list = document.getElementById('player-list');
  list.innerHTML = state.players.map((p, idx) => `
    <div class="player-chip">
      <span>${p.avatar} ${p.name}</span>
      <button onclick="removePlayer(${idx})">×</button>
    </div>
  `).join('');
}

function addPlayer() {
  const input = document.getElementById('player-input');
  const name = input.value.trim();
  if (!name) return;
  if (state.players.length >= 12) return alert("Max 12 players!");
  const avatar = AVATARS[state.players.length % AVATARS.length];
  state.players.push({ name, avatar });
  input.value = '';
  broadcastLobby();
  renderPlayers();
}

function addRandomFunnyName() {
  const available = FUNNY_NAMES.filter(n => !state.players.some(p => p.name === n));
  const pick = available.length
    ? available[Math.floor(Math.random() * available.length)]
    : `Agent #${Math.floor(Math.random() * 99)}`;
  document.getElementById('player-input').value = pick;
  addPlayer();
}

function removePlayer(idx) {
  state.players.splice(idx, 1);
  broadcastLobby();
  renderPlayers();
}

function joinRoomCode() {
  const code = document.getElementById('join-code-input').value.trim().toUpperCase();
  if (code.length !== 4) return alert("Enter a 4-letter Room Code!");
  state.roomCode = code;
  document.getElementById('room-code-display').textContent = code;
  playSFX('win');
}

function broadcastLobby() {
  if (syncChannel) {
    syncChannel.postMessage({ roomCode: state.roomCode, players: state.players });
  }
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// --- 5. ROLE ASSIGNMENT & 3D CARD REVEAL ---
function startGame() {
  if (state.players.length < 3) {
    alert("Add at least 3 players to start!");
    return;
  }
  const category = document.getElementById('category-select').value;
  state.mode = document.getElementById('mode-select').value;
  const packs = WORD_PACKS[category];
  state.currentPack = packs[Math.floor(Math.random() * packs.length)];
  state.imposterIndex = Math.floor(Math.random() * state.players.length);
  state.revealIndex = 0;

  playSFX('siren');
  setupRevealTurn();
  showScreen('screen-reveal');
}

function setupRevealTurn() {
  const player = state.players[state.revealIndex];
  document.getElementById('reveal-player-turn').textContent = `Pass to: ${player.avatar} ${player.name}`;
  const card = document.getElementById('role-flip-card');
  card.classList.remove('is-flipped');
  state.cardFlipped = false;
  document.getElementById('next-reveal-btn').style.display = 'none';
}

function flipRoleCard() {
  const card = document.getElementById('role-flip-card');
  const isImposter = (state.revealIndex === state.imposterIndex);
  const badge = document.getElementById('role-badge');
  const wordText = document.getElementById('secret-word-text');
  const hintText = document.getElementById('role-hint-text');

  if (!state.cardFlipped) {
    if (isImposter && state.mode === 'classic') {
      badge.textContent = "🚨 YOU ARE THE IMPOSTER";
      badge.className = "role-badge role-sus";
      wordText.textContent = "??? NO WORD ???";
      hintText.textContent = "Blend in! Listen to others' clues and fake yours!";
      playSFX('sus');
    } else if (isImposter && state.mode === 'undercover') {
      badge.textContent = "🕵️ SECRET AGENT";
      badge.className = "role-badge role-crew";
      wordText.textContent = state.currentPack.decoy;
      hintText.textContent = "Beware: One person has a slightly different decoy word!";
    } else {
      badge.textContent = "🕵️ CREWMATE";
      badge.className = "role-badge role-crew";
      wordText.textContent = state.currentPack.crew;
      hintText.textContent = "Give a 1-word clue so Crewmates know you're legit!";
    }
    card.classList.add('is-flipped');
    state.cardFlipped = true;
    document.getElementById('next-reveal-btn').style.display = 'flex';
  } else {
    card.classList.remove('is-flipped');
    state.cardFlipped = false;
  }
}

function nextPlayerReveal() {
  const card = document.getElementById('role-flip-card');
  card.classList.remove('is-flipped');
  state.revealIndex++;
  if (state.revealIndex < state.players.length) {
    setTimeout(setupRevealTurn, 220);
  } else {
    startDiscussionPhase();
  }
}

// --- 6. DISCUSSION TIMER ---
function startDiscussionPhase() {
  showScreen('screen-discussion');
  const starter = state.players[Math.floor(Math.random() * state.players.length)];
  document.getElementById('speaker-order-text').innerHTML =
    `First clue starts with: <strong style="color:var(--cyan);">${starter.avatar} ${starter.name}</strong> (go clockwise!)`;

  state.timerSeconds = 120;
  updateTimerUI();
  clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    state.timerSeconds--;
    updateTimerUI();
    if (state.timerSeconds <= 0) {
      clearInterval(state.timerInterval);
      goToVoting();
    }
  }, 1000);
}

function updateTimerUI() {
  const mins = String(Math.floor(state.timerSeconds / 60)).padStart(2, '0');
  const secs = String(state.timerSeconds % 60).padStart(2, '0');
  document.getElementById('timer-display').textContent = `${mins}:${secs}`;
}

function addThirtySeconds() {
  state.timerSeconds += 30;
  updateTimerUI();
}

// --- 7. VOTING & RESULTS ---
function goToVoting() {
  clearInterval(state.timerInterval);
  playSFX('siren');
  state.voterIndex = 0;
  state.votes = {};
  setupVoterTurn();
  showScreen('screen-voting');
}

function setupVoterTurn() {
  const voter = state.players[state.voterIndex];
  document.getElementById('voter-prompt').textContent = `${voter.avatar} ${voter.name}: Who is SUS?`;
  const grid = document.getElementById('vote-grid');
  grid.innerHTML = state.players.map((p, idx) => {
    if (idx === state.voterIndex) return '';
    return `
      <div class="vote-card" onclick="castVote(${idx})">
        <div style="font-size:2rem;">${p.avatar}</div>
        <div>${p.name}</div>
      </div>
    `;
  }).join('');
}

function castVote(suspectIdx) {
  playSFX('eject');
  state.votes[suspectIdx] = (state.votes[suspectIdx] || 0) + 1;
  state.voterIndex++;
  if (state.voterIndex < state.players.length) {
    setupVoterTurn();
  } else {
    tallyVotesAndShowResults();
  }
}

function tallyVotesAndShowResults() {
  showScreen('screen-results');
  let maxVotes = -1;
  let ejectedIdx = 0;

  Object.keys(state.votes).forEach(idx => {
    if (state.votes[idx] > maxVotes) {
      maxVotes = state.votes[idx];
      ejectedIdx = parseInt(idx);
    }
  });

  const ejectedPlayer = state.players[ejectedIdx];
  const realImposter = state.players[state.imposterIndex];
  const caughtImposter = (ejectedIdx === state.imposterIndex);

  const emoji = document.getElementById('result-emoji');
  const headline = document.getElementById('result-headline');
  const subtext = document.getElementById('result-subtext');
  const redemptionBox = document.getElementById('redemption-box');
  const summaryBox = document.getElementById('word-summary-box');

  document.getElementById('summary-crew-word').textContent = state.currentPack.crew;
  document.getElementById('summary-imposter-name').textContent = `${realImposter.avatar} ${realImposter.name}`;

  if (caughtImposter) {
    playSFX('win');
    emoji.textContent = "🎯";
    headline.textContent = `${ejectedPlayer.name} WAS CAUGHT!`;
    subtext.textContent = "The Crew spotted the Imposter! Wait... the Imposter gets ONE final guess to steal the win!";
    summaryBox.style.display = 'none';
    redemptionBox.style.display = 'block';

    const options = [...state.currentPack.decoys].sort(() => Math.random() - 0.5);
    document.getElementById('redemption-options').innerHTML = options.map(word => `
      <div class="vote-card" onclick="checkImposterRedemption('${word}')">${word}</div>
    `).join('');
  } else {
    playSFX('sus');
    emoji.textContent = "😈";
    headline.textContent = "IMPOSTER WINS!";
    subtext.textContent = `You ejected ${ejectedPlayer.avatar} ${ejectedPlayer.name} (Innocent)! ${realImposter.name} fooled everyone!`;
    redemptionBox.style.display = 'none';
    summaryBox.style.display = 'block';
  }
}

function checkImposterRedemption(guessedWord) {
  const redemptionBox = document.getElementById('redemption-box');
  const summaryBox = document.getElementById('word-summary-box');
  const headline = document.getElementById('result-headline');
  const subtext = document.getElementById('result-subtext');
  const emoji = document.getElementById('result-emoji');

  redemptionBox.style.display = 'none';
  summaryBox.style.display = 'block';

  if (guessedWord === state.currentPack.crew) {
    playSFX('sus');
    emoji.textContent = "👑";
    headline.textContent = "IMPOSTER STEALS THE WIN!";
    subtext.textContent = `Unbelievable! The Imposter correctly guessed "${guessedWord}"!`;
  } else {
    playSFX('win');
    emoji.textContent = "🏆";
    headline.textContent = "CREWMATES WIN!";
    subtext.textContent = `Imposter guessed "${guessedWord}" — WRONG! Crew takes the crown!`;
  }
}

function resetToLobby() {
  showScreen('screen-lobby');
}

// Initialize Lobby on Load
renderPlayers();