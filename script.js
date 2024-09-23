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
}

document.querySelector(".exit").addEventListener("click", exit);

function exit() {
  let popUpSection = document.querySelector("section");
  popUpSection.style.display = "flex";
  let userInfo = document.querySelector("header span");
  userInfo.innerHTML = `[]`;
}
