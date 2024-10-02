async function sendRequest(url, method, data) {
  url = `https://tg-api.tehnikum.school/tehnikum_course/minesweeper/${url}`;

  if (method == "POST") {
    let response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    response = await response.json();
    return response;
  } else if (method == "GET") {
    url = url + "?" + new URLSearchParams(data);
    let response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    response = await response.json();
    return response;
  }
}

let username;
let balance;
let points = 1000;
let game_id;

checkUser();

let authorizationForm = document.getElementById("authorization");
authorizationForm.addEventListener("submit", authorization);

async function authorization(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  username = formData.get("userName");

  let response = await sendRequest("user", "GET", { username });

  if (response.error) {
    // Пользователь не найден, нужно его зарегистрировать
    let regResponse = await sendRequest("user", "POST", { username });
    if (regResponse.error) {
      // Возникла ошибка при регистрации
      alert(regResponse.message);
    } else {
      // Успешная регистрация
      balance = regResponse.balance;
      showUser();
    }
  } else {
    // Пользователь найден
    balance = response.balance; // Здесь используем response, а не regResponse
    showUser();
  }
}

function showUser() {
  let popUpSection = document.querySelector("section");
  popUpSection.style.display = "none";
  let userInfo = document.querySelector("header span");
  userInfo.innerHTML = `[${username}, ${balance}]`;
  localStorage.setItem("username", username);

  if (localStorage.getItem("game_id")) {
    gameButton.setAttribute("data-game", "stop");
  } else {
    gameButton.setAttribute("data-game", "start");
  }
}

document.querySelector(".exit").addEventListener("click", exit);

function exit() {
  let popUpSection = document.querySelector("section");
  popUpSection.style.display = "flex";
  let userInfo = document.querySelector("header span");
  userInfo.innerHTML = `[]`;
  localStorage.removeItem("username");
}

async function checkUser() {
  if (localStorage.getItem("username")) {
    //Если пользователь уже сохранён в LS
    username = localStorage.getItem("username");
    let response = await sendRequest("user", "GET", { username });
    if (response.error) {
      alert(response.message);
    } else {
      balance = response.balance;
      showUser();
    }
  } else {
    //Пользователь зашёл на сайт впервые
    let popUpSection = document.querySelector("section");
    popUpSection.style.display = "flex";
  }
}

let pointButtons = document.getElementsByName("point");
pointButtons.forEach((elem) => {
  elem.addEventListener("input", setPoints);
});

function setPoints() {
  let checkedBtn = document.querySelector("input:checked");
  points = +checkedBtn.value;
}

let gameButton = document.querySelector("#gameButton");
gameButton.addEventListener("click", startOrStopGame);

function startOrStopGame() {
  let option = gameButton.getAttribute("data-game");
  if (option === "start") {
    //Начинаем игру
    if (points > 0) {
      startGame();
    }
  } else if (option == "stop") {
    //Закончить игру
    stopGame();
  }
}

async function startGame() {
  let response = await sendRequest("new_game", "POST", { username, points });
  if (response.error) {
    alert(response.message);
  } else {
    //Игра успешно начата
    console.log(response);
    game_id = response.game_id;
    gameButton.setAttribute("data-game", "stop");
    gameButton.innerHTML = "Завершить игру";

    // Активироваться поле
    activateArea();
  }
}

function activateArea() {
  let cells = document.querySelectorAll(".cell");
  let rows = 8;
  let columns = 10;
  cells.forEach((cell, i) => {
    setTimeout(() => {
      let row = Math.floor(i / columns);
      let column = i - row * columns;
      cell.setAttribute("data-row", row);
      cell.setAttribute("data-column", column);
      cell.classList.add("active");
      cell.addEventListener("contextmenu", setFlag);
      cell.addEventListener("click", makeStep);
    }, 30 * i);
  });
}

function setFlag(event) {
  event.preventDefault();
  let cell = event.target;
  cell.classList.toggle("flag");
}

function makeStep() {}

async function stopGame(params) {
  let response = await sendRequest("stop_game", "POST", { username, game_id });
  if (response.error) {
    alert(response.message);
  } else {
    //Игра успешно окончена
    console.log(response);
    game_id = "";

    balance = response.balance;
    showUser();
    gameButton.setAttribute("data-game", "start");
    gameButton.innerHTML = "Играть";

    // Очистить поле
    clearArea();
  }
}

function clearArea() {
  let area = document.querySelector(".area");
  area.innerHTML = "";
  for (let i = 0; i < 80; i++) {
    area.innerHTML = area.innerHTML + `<div class="cell"></div>`;
  }
}
