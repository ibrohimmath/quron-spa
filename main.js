"use strict";

const app = document.querySelector(".app");
let mode = "light";
let nav = null;
let container = null;
let sidebar = null;
let lists = null;
let section = null;
let content = null;
let settingsDiv = null;

const history = {
  push(url) {
    window.history.pushState({}, "", `#/${url}`);  
    sessionStorage.setItem("path", url);
  },
  path() {
    return sessionStorage.getItem("path");
  },
};

const settingsObj = {
  addComponents() {
    settingsDiv = document.createElement("div");
    settingsDiv.setAttribute("class", "settingsdiv");
    document.body.appendChild(settingsDiv);
  },
  moveLeft(e) {
    console.log(e.target);
    if (!settingsDiv.classList.contains('settings--open'))
      settingsDiv.classList.toggle("settings--open");
  },
  moveRight() {
    if (settingsDiv.classList.contains('settings--open'))
      settingsDiv.classList.toggle("settings--open");
  }
}

const navObject = {
  addComponents() {
    nav = document.createElement("nav");
    nav.innerHTML = `
      <div class="logo">
        <img src="./assets/img/logo.jpg" alt="">
      </div>
      <div class="buttons">
        <div class="nav__btn nav__btn-mode--${mode} mode">
          ${ mode == 'light' ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>' }
        </div>
        <div class="nav__btn nav__btn-mode--${mode} settings">
          <i class="fa-solid fa-gear"></i>
        </div>
      </div>
    `;
    this.changeMode(nav);
    settingsObj.addComponents();
    app.appendChild(nav);
  },
  changeMode(nav) {
    nav.classList.add(`nav__mode--${mode}`);
  },
};

const sidebarObj = {
  addComponents() {
    sidebar = document.createElement("div");
    sidebar.setAttribute("class", "sidebar");
    sidebar.innerHTML = `
      <div data-path="home" class="sidebar__btn sidebar__btn-mode--${mode} sidebar__btn--active-mode--${mode}"><i class="fa-solid fa-house"></i></div>
      <div data-path="time" class="sidebar__btn sidebar__btn-mode--${mode}"><i class="fa-regular fa-clock"></i></div>
    `;
    this.changeMode(sidebar);
    container.appendChild(sidebar);
  },
  changeMode(sidebar) {
    sidebar.classList.add(`sidebar__mode--${mode}`);
  },
};

const listsObj = {
  addComponents() {
    lists = document.createElement("div");
    lists.setAttribute("class", "lists");
    lists.classList.add(`lists-mode--${mode}`)
    lists.innerHTML = `
      <div class="searchfield searchfield-mode--${mode}">
        <input type="text" class="search-number" placeholder="Search by Surah Name">
        <span class="search-logo search-logo-mode--${mode}"><i class="fa-solid fa-magnifying-glass"></i></span>
      </div>
    `;
    content.appendChild(lists);
  }
}

const sectionObj = {
  addComponents() {
    section = document.createElement("div");
    section.setAttribute("class", "section");
    content.appendChild(section);
  },
};

const timeObj = {
  addComponents() {
    const timeDiv = document.createElement("div");
    timeDiv.setAttribute("class", "timediv");
    timeDiv.innerHTML = `
      <h1 class="timediv__title">Vaqt</h1>
    `;
    content.appendChild(timeDiv);
  },
}

const contentObj = {
  addComponents() {
    content = document.createElement("div");
    content.setAttribute("class", "content");
    clear(content);
    if (history.path() != "time") {
      this.addHomeComponents();
    } else {
      this.addTimeComponents();
    }
    const contentWrapper = document.createElement("div");
    contentWrapper.setAttribute("class", "content__wrapper");
    this.changeContentMode(content),
    contentWrapper.appendChild(content);
    this.changeWrapperMode(contentWrapper);
    container.appendChild(contentWrapper);
  },
  changeContentMode(content) {
    content.classList.add(`content-mode__${mode}`);
  },
  changeWrapperMode(contentWrapper) {
    contentWrapper.classList.add(`content__wrapper-mode--${mode}`)
  },
  addHomeComponents() {
    listsObj.addComponents();
    sectionObj.addComponents();
  },
  addTimeComponents() {
    timeObj.addComponents();
  },
};

const containerObj = {
  addComponents() {
    container = document.createElement("div");
    container.setAttribute("class", "container");
    sidebarObj.addComponents();
    contentObj.addComponents();
    app.appendChild(container);
  },
};


function clear(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

// Main function IIFE
const render = function() {
  navObject.addComponents();
  containerObj.addComponents();

  if (history.path()) {
    if (history.path() == "home") {
      window.history.pushState({}, document.title, window.location.pathname);
      history.push("home");
    }
  } else {
    history.push("home");
  }

  document.querySelector(".nav__btn.mode").addEventListener("click", toggleMode);
  sidebar.addEventListener("click", changeActiveBtns);
  document.querySelector(".nav__btn.settings").addEventListener("click", settingsObj.moveLeft);
};
render();

const deactivateBtns = function(parent, className, activeClassName) {
  const childs = parent.querySelectorAll(`.${className}`);
  childs.forEach(item => {
    if (item.classList.contains(activeClassName)) {
      item.classList.remove(activeClassName);
    }
  });
}

// Sidebar change active buttons
function changeActiveBtns(e) {
  let el = e.target;
  console.log(el);
  if (!el.parentElement.classList.contains("sidebar__btn") && !el.classList.contains("sidebar__btn")) {
    console.log("xayr");
    return;
  }
  if (!el.classList.contains("sidebar__btn")) {
    el = el.parentElement;
  }
  deactivateBtns(el.parentElement, `sidebar__btn`, `sidebar__btn--active-mode--${mode}`);
  el.classList.add(`sidebar__btn--active-mode--${mode}`);
  // console.log(history.path(), el.dataset.path);
  if (!history.path() || el.dataset.path != history.path()) {
    history.push(el.dataset.path);
    clear(app);
    render();
  }
}

// Change light/dark mode
function toggleMode() {
  mode == "light" ? mode = "dark" : mode = "light";
  clear(app);
  render();
};