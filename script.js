const state = {
  selectedNumber: 3,
  selectedMagic: "cup",
  visible: 1,
  hidden: 2,
  lastVisible: null,
  seriesStars: 0,
  currentMapStep: 0,
  totalCorrect: 0,
  revealed: false,
  taskHadMistake: false,
  lastSticker: null,
  lastReward: null,
};

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}
window.scrollTo(0, 0);

const magicItems = [
  { id: "cup", label: "Стакан", icon: "🥤" },
  { id: "box", label: "Коробка", icon: "🎁" },
  { id: "hat", label: "Шляпа", icon: "🎩" },
];

const mapSteps = [
  { label: "Стакан", magicId: "cup" },
  { label: "Коробка", magicId: "box" },
  { label: "Шляпа", magicId: "hat" },
];

const friends = [
  { name: "Мишка", icon: "🧸", text: "Мишка ждет конфеты к чаю." },
  { name: "Белочка", icon: "🐿️", text: "Белочка считает угощения." },
];

const stickers = [
  { id: "cup", art: "☕", label: "Чашка" },
  { id: "bow", art: "🎀", label: "Бантик" },
  { id: "candy", art: "🍬", label: "Конфета" },
  { id: "flower", art: "🌼", label: "Цветочек" },
  { id: "star", art: "⭐", label: "Звездочка" },
  { id: "gift", art: "🎁", label: "Подарок" },
  { id: "cake", art: "🍰", label: "Пирожное" },
  { id: "heart", art: "💛", label: "Сердечко" },
];

const screens = {
  start: document.getElementById("startScreen"),
  game: document.getElementById("gameScreen"),
  summary: document.getElementById("summaryScreen"),
  album: document.getElementById("albumScreen"),
  stats: document.getElementById("statsScreen"),
};

const elements = {
  numberChoices: document.getElementById("numberChoices"),
  magicChoices: document.getElementById("magicChoices"),
  startButton: document.getElementById("startButton"),
  statsButton: document.getElementById("statsButton"),
  backButton: document.getElementById("backButton"),
  dayNumber: document.getElementById("dayNumber"),
  totalBadge: document.getElementById("totalBadge"),
  taskText: document.getElementById("taskText"),
  visibleCandies: document.getElementById("visibleCandies"),
  hiddenCandies: document.getElementById("hiddenCandies"),
  hiddenZone: document.querySelector(".hidden-zone"),
  magicCover: document.getElementById("magicCover"),
  answerButtons: document.getElementById("answerButtons"),
  feedback: document.getElementById("feedback"),
  newTaskButton: document.getElementById("newTaskButton"),
  adventureMap: document.getElementById("adventureMap"),
  friendAvatar: document.getElementById("friendAvatar"),
  friendText: document.getElementById("friendText"),
  stickersButton: document.getElementById("stickersButton"),
  closeAlbumButton: document.getElementById("closeAlbumButton"),
  stickerAlbum: document.getElementById("stickerAlbum"),
  earnedSticker: document.getElementById("earnedSticker"),
  stickerMessage: document.getElementById("stickerMessage"),
  playAgainButton: document.getElementById("playAgainButton"),
  chooseNumberButton: document.getElementById("chooseNumberButton"),
  openAlbumButton: document.getElementById("openAlbumButton"),
  closeStatsButton: document.getElementById("closeStatsButton"),
  resetStatsButton: document.getElementById("resetStatsButton"),
  statsTable: document.getElementById("statsTable"),
  statsSummaryText: document.getElementById("statsSummaryText"),
};

function createEmptyStats() {
  const stats = {};
  for (let number = 3; number <= 10; number += 1) {
    stats[number] = { solved: 0, withMistake: 0 };
  }
  return stats;
}

function getSavedStats() {
  const defaults = createEmptyStats();
  try {
    const saved = JSON.parse(localStorage.getItem("magicCupStatsV2") || "{}");
    return { ...defaults, ...saved };
  } catch {
    return defaults;
  }
}

function saveStats(stats) {
  localStorage.setItem("magicCupStatsV2", JSON.stringify(stats));
}

function recordTaskResult() {
  const stats = getSavedStats();
  const key = String(state.selectedNumber);
  stats[key] ||= { solved: 0, withMistake: 0 };
  stats[key].solved += 1;
  if (state.taskHadMistake) {
    stats[key].withMistake += 1;
  }
  saveStats(stats);
}

function getSavedStickers() {
  try {
    return JSON.parse(localStorage.getItem("magicCupStickers") || "[]");
  } catch {
    return [];
  }
}

function saveSticker(stickerId) {
  const saved = getSavedStickers();
  if (!saved.includes(stickerId)) {
    saved.push(stickerId);
    localStorage.setItem("magicCupStickers", JSON.stringify(saved));
  }
}

function getSavedStickerShines() {
  try {
    return JSON.parse(localStorage.getItem("magicCupStickerShines") || "{}");
  } catch {
    return {};
  }
}

function saveStickerShines(shines) {
  localStorage.setItem("magicCupStickerShines", JSON.stringify(shines));
}

function showScreen(screenName) {
  Object.values(screens).forEach((screen) => screen.classList.add("hidden"));
  screens[screenName].classList.remove("hidden");
  window.requestAnimationFrame(() => window.scrollTo(0, 0));
}

function renderChoices() {
  elements.numberChoices.innerHTML = "";
  for (let number = 3; number <= 10; number += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `choice-button number${number === state.selectedNumber ? " active" : ""}`;
    button.textContent = number;
    button.setAttribute("aria-pressed", String(number === state.selectedNumber));
    button.addEventListener("click", () => {
      state.selectedNumber = number;
      renderChoices();
    });
    elements.numberChoices.appendChild(button);
  }

  elements.magicChoices.innerHTML = "";
  magicItems.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `choice-button magic${item.id === state.selectedMagic ? " active" : ""}`;
    button.setAttribute("aria-pressed", String(item.id === state.selectedMagic));
    button.innerHTML = `<span class="magic-emoji">${item.icon}</span><span>${item.label}</span>`;
    button.addEventListener("click", () => {
      state.selectedMagic = item.id;
      renderChoices();
    });
    elements.magicChoices.appendChild(button);
  });
}

function renderMap() {
  elements.adventureMap.innerHTML = "";
  mapSteps.forEach((label, index) => {
    const step = document.createElement("div");
    step.className = "map-step";
    if (index < state.currentMapStep) step.classList.add("done");
    if (index === state.currentMapStep) step.classList.add("current");
    step.textContent = label.label;
    elements.adventureMap.appendChild(step);
  });
}

function renderStars() {
  document.querySelectorAll(".star-slot").forEach((slot, index) => {
    slot.classList.toggle("filled", index < state.seriesStars);
  });
}

function createCandy(index) {
  const candy = document.createElement("span");
  candy.className = "candy";
  candy.textContent = "🍬";
  candy.setAttribute("aria-hidden", "true");
  return candy;
}

function renderCandies() {
  elements.visibleCandies.innerHTML = "";
  elements.hiddenCandies.innerHTML = "";

  for (let index = 0; index < state.visible; index += 1) {
    elements.visibleCandies.appendChild(createCandy(index));
  }

  for (let index = 0; index < state.hidden; index += 1) {
    elements.hiddenCandies.appendChild(createCandy(index + state.visible));
  }
}

function renderAnswers() {
  elements.answerButtons.innerHTML = "";
  for (let answer = 1; answer < state.selectedNumber; answer += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-button";
    button.textContent = answer;
    button.addEventListener("click", () => checkAnswer(answer, button));
    elements.answerButtons.appendChild(button);
  }
}

function updateFriend() {
  const friend = friends[state.currentMapStep % friends.length];
  elements.friendAvatar.className = "friend-avatar";
  elements.friendAvatar.textContent = friend.icon;
  elements.friendText.textContent = friend.text;
}

function setMagicCover() {
  const item = magicItems.find((magic) => magic.id === state.selectedMagic) || magicItems[0];
  elements.magicCover.className = "magic-cover";
  elements.magicCover.textContent = item.icon;
}

function syncMagicWithMapStep() {
  const step = mapSteps[state.currentMapStep];
  if (step?.magicId) {
    state.selectedMagic = step.magicId;
  }
}

function getRandomVisible() {
  const max = state.selectedNumber - 1;
  let value = Math.floor(Math.random() * max) + 1;
  if (max > 1 && value === state.lastVisible) {
    value = (value % max) + 1;
  }
  state.lastVisible = value;
  return value;
}

function startTask() {
  state.visible = getRandomVisible();
  state.hidden = state.selectedNumber - state.visible;
  state.revealed = false;
  state.taskHadMistake = false;

  elements.dayNumber.textContent = state.selectedNumber;
  elements.totalBadge.textContent = state.selectedNumber;
  elements.taskText.textContent = `Всего ${state.selectedNumber}. Видно ${state.visible}. Сколько спряталось?`;
  elements.hiddenZone.classList.remove("revealed");
  elements.feedback.className = "feedback neutral";
  elements.feedback.textContent = "Выбери ответ.";

  setMagicCover();
  renderCandies();
  renderAnswers();
  renderStars();
  renderMap();
  updateFriend();
}

function revealCorrectAnswer() {
  recordTaskResult();
  state.revealed = true;
  elements.hiddenZone.classList.add("revealed");
  elements.feedback.className = "feedback good";
  elements.feedback.textContent = `Верно! ${state.visible} и ${state.hidden} - это ${state.selectedNumber}.`;

  [...elements.answerButtons.children].forEach((button) => {
    button.disabled = true;
    if (Number(button.textContent) === state.hidden) {
      button.classList.add("correct");
    }
  });

  state.seriesStars += 1;
  state.totalCorrect += 1;
  renderStars();

  if (state.seriesStars >= 5) {
    window.setTimeout(showSeriesSummary, 900);
  }
}

function checkAnswer(answer, button) {
  if (state.revealed) return;

  if (answer === state.hidden) {
    revealCorrectAnswer();
    return;
  }

  state.taskHadMistake = true;
  button.classList.remove("try-again");
  void button.offsetWidth;
  button.classList.add("try-again");
  button.disabled = true;
  elements.feedback.className = "feedback hint";
  elements.feedback.textContent = `Почти! Всего ${state.selectedNumber}, видно ${state.visible}. Попробуй еще раз.`;
}

function pickReward() {
  const saved = getSavedStickers();
  const next = stickers.find((sticker) => !saved.includes(sticker.id));
  if (next) {
    saveSticker(next.id);
    return { type: "sticker", sticker: next };
  }

  const shines = getSavedStickerShines();
  const minShines = Math.min(...stickers.map((sticker) => Number(shines[sticker.id] || 0)));
  const candidates = stickers.filter((sticker) => Number(shines[sticker.id] || 0) === minShines);
  const upgraded = candidates[(state.totalCorrect - 1) % candidates.length];
  shines[upgraded.id] = Number(shines[upgraded.id] || 0) + 1;
  saveStickerShines(shines);

  return { type: "shine", sticker: upgraded, shineCount: shines[upgraded.id] };
}

function showSeriesSummary() {
  const reward = pickReward();
  const { sticker } = reward;
  state.lastSticker = sticker;
  state.lastReward = reward;
  state.seriesStars = 0;
  state.currentMapStep = Math.min(state.currentMapStep + 1, mapSteps.length - 1);
  syncMagicWithMapStep();

  elements.earnedSticker.className = `earned-sticker${reward.type === "shine" ? " shiny" : ""}`;
  elements.earnedSticker.textContent = sticker.art;
  elements.earnedSticker.setAttribute("aria-label", sticker.label);
  if (reward.type === "shine") {
    elements.stickerMessage.textContent = `Альбом уже собран! Наклейка «${sticker.label}» получила волшебную звездочку: ${reward.shineCount}.`;
  } else {
    elements.stickerMessage.textContent = `В альбом добавилась наклейка «${sticker.label}».`;
  }
  showScreen("summary");
}

function renderAlbum() {
  const saved = getSavedStickers();
  const shines = getSavedStickerShines();
  elements.stickerAlbum.innerHTML = "";
  stickers.forEach((sticker) => {
    const card = document.createElement("div");
    const isOpen = saved.includes(sticker.id);
    const shineCount = Number(shines[sticker.id] || 0);
    card.className = `sticker-card${isOpen ? "" : " locked"}${shineCount > 0 ? " shining" : ""}`;
    card.innerHTML = `
      <span class="sticker-art">${isOpen ? sticker.art : "?"}</span>
      <span>${isOpen ? sticker.label : "Скоро"}</span>
      ${isOpen && shineCount > 0 ? `<span class="sticker-shine">★ ${shineCount}</span>` : ""}
    `;
    elements.stickerAlbum.appendChild(card);
  });
}

function openAlbum() {
  renderAlbum();
  showScreen("album");
}

function renderStats() {
  const stats = getSavedStats();
  const rows = Object.entries(stats).map(([number, item]) => {
    const solved = Number(item.solved || 0);
    const withMistake = Number(item.withMistake || 0);
    const clean = Math.max(0, solved - withMistake);
    const success = solved > 0 ? Math.round((clean / solved) * 100) : null;
    return { number, solved, withMistake, clean, success };
  });

  const maxMistakes = Math.max(...rows.map((row) => row.withMistake));
  const hardest = rows.filter((row) => row.withMistake > 0 && row.withMistake === maxMistakes);
  const totalSolved = rows.reduce((sum, row) => sum + row.solved, 0);

  if (totalSolved === 0) {
    elements.statsSummaryText.textContent = "Пока нет решенных заданий. Поиграйте немного, и здесь появится статистика.";
  } else if (hardest.length > 0) {
    elements.statsSummaryText.textContent = `Чаще всего задания с ошибкой были по числу: ${hardest.map((row) => row.number).join(", ")}.`;
  } else {
    elements.statsSummaryText.textContent = "Пока все задания решены без ошибок. Отличный старт!";
  }

  elements.statsTable.innerHTML = "";
  rows.forEach((row) => {
    const card = document.createElement("div");
    card.className = `stats-card${row.withMistake > 0 && row.withMistake === maxMistakes ? " hardest" : ""}`;
    card.innerHTML = `
      <div class="stats-number">${row.number}</div>
      <div class="stats-line"><span>Решено</span><strong>${row.solved}</strong></div>
      <div class="stats-line"><span>С ошибкой</span><strong>${row.withMistake}</strong></div>
      <div class="stats-line"><span>Без ошибок</span><strong>${row.success === null ? "-" : `${row.success}%`}</strong></div>
    `;
    elements.statsTable.appendChild(card);
  });
}

function openStats() {
  renderStats();
  showScreen("stats");
}

function resetStats() {
  localStorage.removeItem("magicCupStats");
  localStorage.removeItem("magicCupStatsV2");
  renderStats();
}

function startGame() {
  state.seriesStars = 0;
  const selectedStep = mapSteps.findIndex((step) => step.magicId === state.selectedMagic);
  state.currentMapStep = selectedStep >= 0 ? selectedStep : 0;
  showScreen("game");
  startTask();
}

elements.startButton.addEventListener("click", startGame);
elements.statsButton.addEventListener("click", openStats);
elements.backButton.addEventListener("click", () => showScreen("start"));
elements.newTaskButton.addEventListener("click", startTask);
elements.stickersButton.addEventListener("click", openAlbum);
elements.closeAlbumButton.addEventListener("click", () => showScreen("game"));
elements.playAgainButton.addEventListener("click", () => {
  showScreen("game");
  startTask();
});
elements.chooseNumberButton.addEventListener("click", () => showScreen("start"));
elements.openAlbumButton.addEventListener("click", openAlbum);
elements.closeStatsButton.addEventListener("click", () => showScreen("start"));
elements.resetStatsButton.addEventListener("click", resetStats);

renderChoices();
