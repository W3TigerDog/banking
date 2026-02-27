const STORAGE_KEY = "banking_account_v1";



function formatMoney(n) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(n);
}

function nowISO() {
  return new Date().toISOString();
}

function loadAccount() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw);
  return {
    owner: "W3TigerDog",
    balance: 100,
    history: [],
  };
}

function saveAccount(acc) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(acc));
}

function addHistory(acc, type, amount, note = "") {
  acc.history.unshift({
    ts: nowISO(),
    type,
    amount,
    note,
    balanceAfter: acc.balance,
  });
  acc.history = acc.history.slice(0, 30); // keep last 30
}

function isValidAmount(x) {
  return Number.isFinite(x) && x > 0;
}

// UI
const ownerEl = document.getElementById("owner");
const balanceEl = document.getElementById("balance");
const historyEl = document.getElementById("history");
const msgEl = document.getElementById("msg");

const amountEl = document.getElementById("amount");
const noteEl = document.getElementById("note");

const depositBtn = document.getElementById("depositBtn");
const withdrawBtn = document.getElementById("withdrawBtn");

const newOwnerEl = document.getElementById("newOwner");
const setOwnerBtn = document.getElementById("setOwnerBtn");
const resetBtn = document.getElementById("resetBtn");

let account = loadAccount();
render();

function setMsg(text, isError = false) {
  msgEl.textContent = text;
  msgEl.style.color = isError ? "#ffb4a8" : "#cfe6ff";
  if (text) setTimeout(() => (msgEl.textContent = ""), 2500);
}

function render() {
  ownerEl.textContent = account.owner || "—";
  balanceEl.textContent = formatMoney(account.balance);

  historyEl.innerHTML = "";
  if (!account.history.length) {
    const li = document.createElement("li");
    li.textContent = "No transactions yet.";
    historyEl.appendChild(li);
    return;
  }

  for (const h of account.history) {
    const li = document.createElement("li");

    const left = document.createElement("div");
    left.innerHTML = `<strong>${h.type}</strong> ${formatMoney(h.amount)}<br/><small>${new Date(h.ts).toLocaleString()}</small>`;

    const right = document.createElement("div");
    right.style.textAlign = "right";
    right.innerHTML = `<strong>${formatMoney(h.balanceAfter)}</strong><br/><small>${h.note || ""}</small>`;

    li.appendChild(left);
    li.appendChild(right);
    historyEl.appendChild(li);
  }
}

function getAmountFromInput() {
  const amount = Number(amountEl.value);
  return amount;
}

depositBtn.addEventListener("click", () => {
  const amount = getAmountFromInput();
  const note = noteEl.value.trim();

  if (!isValidAmount(amount)) return setMsg("Please enter a valid amount.", true);

  account.balance += amount;
  addHistory(account, "Deposit", amount, note);
  saveAccount(account);
  render();

  amountEl.value = "";
  noteEl.value = "";
  setMsg("Deposit successful ✅");
});

withdrawBtn.addEventListener("click", () => {
  const amount = getAmountFromInput();
  const note = noteEl.value.trim();

  if (!isValidAmount(amount)) return setMsg("Please enter a valid amount.", true);
  if (amount > account.balance) return setMsg("Insufficient balance.", true);

  account.balance -= amount;
  addHistory(account, "Withdraw", amount, note);
  saveAccount(account);
  render();

  amountEl.value = "";
  noteEl.value = "";
  setMsg("Withdrawal successful ✅");
});

setOwnerBtn.addEventListener("click", () => {
  const newOwner = newOwnerEl.value.trim();
  if (!newOwner) return setMsg("Please enter a name.", true);

  account.owner = newOwner;
  saveAccount(account);
  render();

  newOwnerEl.value = "";
  setMsg("Owner updated ✅");
});

resetBtn.addEventListener("click", () => {
  const ok = confirm("Reset account to default? This will clear history.");
  if (!ok) return;

  account = { owner: "TigerCat", balance: 100, history: [] };
  saveAccount(account);
  render();
  setMsg("Account reset ✅");
});