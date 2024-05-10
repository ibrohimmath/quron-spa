let app = document.querySelector(".app");
let nav = null;
let calc = null;
let tudu = null;
let container = null;

// ---

const history = {
  push: (url) => {
    window.history.pushState({}, "", `#/${url}`);
    sessionStorage.setItem("path", url);
  },
  path: () => {
    return sessionStorage.getItem("path");
  },
};

const navObject = {
  addComponents: () => {
    nav = document.createElement("nav");
    calc = document.createElement("button");
    calc.textContent = "calc";
    tudu = document.createElement("button");
    tudu.textContent = "todo";
    nav.appendChild(calc);
    nav.appendChild(tudu);
    app.appendChild(nav);
  },
};

const containerObject = {
  addComponents: () => {
    container = document.createElement("div");
    container.setAttribute("class", "container");
    app.appendChild(container);
  },
};

// ----

function Calc() {
  let h1 = document.createElement("h1");
  h1.textContent = "Calc";

  container.appendChild(h1);
}

function Tudu() {
  let h1 = document.createElement("h1");
  h1.textContent = "To-do List";

  container.appendChild(h1);
}

function Clear(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

// ----
(() => {
  navObject.addComponents();
  containerObject.addComponents();

  if (history.path()) {
    if (history.path() === "calc") {
      window.history.pushState({}, document.title, window.location.pathname);
      history.push("calc");
      Calc();
    } else {
      Tudu();
    }
  } else {
    history.push("calc");
    Calc();
  }
})();
ss
// ----

calc.addEventListener("click", () => {
  history.push("calc");
  Clear(container);
  Calc();
});

tudu.addEventListener("click", () => {
  history.push("todo");
  Clear(container);
  Tudu();
});

// let memo = {};

// function fib(n) {
//   console.log(n);
//   if (n in memo) {
//     return memo[n];
//   }
//   if (n <= 2) {
//     result = 1;
//   } else {
//     result = fib(n - 1) + fib(n - 2);
//   }
//   memo[n] = result;
//   return result;
// }

// console.log(fib(7), "lorem");
// console.log(fib(7), "lorem");
// console.log(fib(50), "lorem");

// function fib(n) {
//   let a = 1,
//     b = 0,
//     temp;

//   while (n >= 0) {
//     console.log(n);
//     temp = a;
//     a = a + b;
//     b = temp;
//     n--;
//   }

//   return b;
// }

// console.log(fib(7), "lorem");
// console.log(fib(7), "lorem");
// console.log(fib(50), "lorem");
// console.log(fib(500), "lorem");
