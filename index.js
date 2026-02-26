console.log("Banking system started");

const readline = require("readline");

const fs = require("fs");

function loadAccount() {
  if (fs.existsSync("account.json")) {
    const data = JSON.parse(fs.readFileSync("account.json"));
    return createAccount(data.owner, data.balance, data.history);
  }
  return createAccount("Andrew", 100);
}

function createAccount(owner, balance, history = []) {

  function isValidAmount(amount) {
    return Number.isFinite(amount) && amount > 0;
  }

  function saveToFile(ctx) {
    fs.writeFileSync(
      "account.json",
      JSON.stringify(
        { owner: ctx.owner, balance: ctx.balance, history: ctx.history },
        null,
        2
      )
    );
  }

  return {
    owner,
    balance,
    history,

    deposit(amount) {

      if (!isValidAmount(amount)) {
        console.log("Invalid amount");
        return;}

      this.balance += amount;
      this.history.push({
        id: Date.now(),
        type: "deposit",
        amount,
        time: new Date().toISOString()
      });
      saveToFile(this);
      console.log(`Deposited ${amount}`);
    },

    withdraw(amount) {

      if (!isValidAmount(amount)) {
        console.log("Invalid amount");
        return};

      if (amount > this.balance) {
        console.log("Insufficient funds");
        return;
      }
      this.balance -= amount;
      this.history.push({
        id: Date.now(),
        type: "withdraw",
        amount,
        time: new Date().toISOString()
      });
      saveToFile(this);
      console.log(`Withdrew ${amount}`);
    },

    checkBalance() {
      console.log(`Balance: ${this.balance}`);
    },

    showHistory(limit) {
        const n = Number(limit);

    if (Number.isFinite(n) && n > 0) {
        console.log(this.history.slice(-n));
        return;
    }

    console.log(this.history);
    }
  };
}

const account = loadAccount();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("Mini Bank CLI Started");
console.log("Commands: deposit 50 | withdraw 20 | balance | history [n] | exit");
rl.on("line", (input) => {
  const [command, value] = input.trim().split(/\s+/);

  switch (command) {
    case "deposit":
      account.deposit(Number(value));
      break;
    case "withdraw":
      account.withdraw(Number(value));
      break;
    case "balance":
      account.checkBalance();
      break;
    case "exit":
      rl.close();
      break;
    case "history":
      account.showHistory(value);
      break;
    default:
      console.log("Unknown command");
  }
});