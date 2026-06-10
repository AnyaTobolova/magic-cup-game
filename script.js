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
  lastSticker: null,
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
  "Стакан",
  "Коробка",
  "Шляпа",
  "Чаепитие",
  "Корзинка",
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
};

const elements = {
  numberChoices: document.getElementById("numberChoices"),
  magicChoices: document.getElementById("magicChoices"),
  startButton: document.getElementById("startButton"),
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
};

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
    step.textContent = label;
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

  button.classList.remove("try-again");
  void button.offsetWidth;
  button.classList.add("try-again");
  elements.feedback.className = "feedback hint";
  elements.feedback.textContent = `Почти! Всего ${state.selectedNumber}, видно ${state.visible}. Попробуй еще раз.`;
}

function pickSticker() {
  const saved = getSavedStickers();
  const next = stickers.find((sticker) => !saved.includes(sticker.id)) || stickers[state.totalCorrect % stickers.length];
  saveSticker(next.id);
  return next;
}

function showSeriesSummary() {
  const sticker = pickSticker();
  state.lastSticker = sticker;
  state.seriesStars = 0;
  state.currentMapStep = Math.min(state.currentMapStep + 1, mapSteps.length - 1);

  elements.earnedSticker.textContent = sticker.art;
  elements.earnedSticker.setAttribute("aria-label", sticker.label);
  elements.stickerMessage.textContent = `В альбом добавилась наклейка «${sticker.label}».`;
  showScreen("summary");
}

function renderAlbum() {
  const saved = getSavedStickers();
  elements.stickerAlbum.innerHTML = "";
  stickers.forEach((sticker) => {
    const card = document.createElement("div");
    const isOpen = saved.includes(sticker.id);
    card.className = `sticker-card${isOpen ? "" : " locked"}`;
    card.innerHTML = `<span class="sticker-art">${isOpen ? sticker.art : "?"}</span><span>${isOpen ? sticker.label : "Скоро"}</span>`;
    elements.stickerAlbum.appendChild(card);
  });
}

function openAlbum() {
  renderAlbum();
  showScreen("album");
}

function startGame() {
  state.seriesStars = 0;
  state.currentMapStep = 0;
  showScreen("game");
  startTask();
}

elements.startButton.addEventListener("click", startGame);
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

renderChoices();
