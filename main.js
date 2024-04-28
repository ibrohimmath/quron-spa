"use strict";

const app = document.querySelector(".app");

// -------------

let mode = "light";

// -------------

let nav = null;
let container = null;
let sidebar = null;
let lists = null;
let section = null;
let content = null;
let settingsDiv = null;
let settingsWindow = null;

// -------------

const history = {
  push(url) {
    window.history.pushState({}, "", `#/${url}`);  
    sessionStorage.setItem("path", url);
  },
  path() {
    return sessionStorage.getItem("path");
  },
};

// ------------- Very important datas (for datas from request)

const dataObj = {
  setSelectedItem(chosenItemId) {
    localStorage.setItem("selectedItemId", JSON.stringify(chosenItemId));
  },
  getSelectedItem() {
    let selectedItemId = +localStorage.getItem("selectedItemId");
    if (!selectedItemId) selectedItemId = 0;
    this.setSelectedItem(selectedItemId);
    return selectedItemId;
  },
  checkListItems() {
    return typeof this.listItems !== "undefined";
  },
  async getListItems() {
    if (!this.checkListItems()) {
      console.log("Data has been arrived");
      this.listItems = await getData("surah");
    } else {
      console.log("Data has been preserved in properties");
    }
    return this.listItems;
  },
}

// -------------

const settingsWindowObj = {
  addComponents() {
    settingsWindow = document.createElement("div");
    settingsWindow.setAttribute("class", "settingswindow");
    this.makeHidden();
    document.body.appendChild(settingsWindow);
  },
  makeVisible() {
    settingsWindow.style.display = "block";
  },
  makeHidden() {
    settingsWindow.style.display = "none";
  },
  closeThisWindow() {
    console.log("settings window is vanishing");
    while (document.querySelectorAll(".settingswindow").length > 1) {
      document.querySelector(".settingswindow").remove();
    }
  },
};

const settingsObj = {
  addComponents() {
    settingsDiv = document.createElement("div");
    settingsDiv.setAttribute("class", "settingsdiv");
    settingsDiv.innerHTML = `
      <div class="row--head">
        <div class="settingsdiv__title">Settings</div>
        <span class="settingsdiv__close"><i class="fa-solid fa-xmark"></i></span>
      </div>
    `;
    this.changeMode();
    document.body.appendChild(settingsDiv);
    settingsWindowObj.addComponents();
  }, 
  moveLeft(e) {
    console.log("settings move is opening");
    if (!settingsDiv.classList.contains('settings--open')) {
      settingsDiv.classList.toggle("settings--open");
      settingsWindowObj.makeVisible();
    }
  },
  moveRight(e) {
    console.log("settings move is closing");
    if (settingsDiv.classList.contains('settings--open')) {
      settingsDiv.classList.toggle("settings--open");
      settingsWindowObj.makeHidden();
    }
  },
  changeMode() {
    settingsDiv.classList.add(`settingsdiv-mode--${mode}`);
  },
  closeSettings() {
    console.log("settings move is vanishing");
    while (document.querySelectorAll(".settingsdiv").length > 1) {
      document.querySelector(".settingsdiv").remove();
    }
    settingsWindowObj.closeThisWindow();
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
    this.changeMode();
    lists.innerHTML = `
      <div class="searchfield searchfield-mode--${mode}">
        <input type="text" class="search-number" placeholder="Search by Surah Name">
        <span class="search-logo search-logo-mode--${mode}"><i class="fa-solid fa-magnifying-glass"></i></span>
      </div>
      <ul></ul>
    `;
    content.appendChild(lists);
    this.addListDatas();
  },
  changeMode() {
    lists.classList.add(`lists-mode--${mode}`);
  },
  async addListDatas() {
    const ul = lists.querySelector("ul");
    const listItems = await dataObj.getListItems();
    listItems.forEach(({englishName, englishNameTranslation, name}, id) => {
      const listItemActive = id == dataObj.getSelectedItem() ? `list__item--active-mode--${mode}` : "";
      console.log(listItemActive);
      ul.insertAdjacentHTML("beforeend", `
        <li class="list__item list__item-mode--${mode} ${listItemActive}" data-listItemId="${id}">
          <div class="diamond diamond-mode--${mode}">
            <span class="diamond__text">${id + 1}</span>
          </div>
          <div class="list__item-row">
            <div class="col">
              <span class="list__item-name list__item-name-mode--${mode}">${englishName}</span>
              <span class="list__item-name-translate">${englishNameTranslation}</span>
            </div>
            <div class="col">
              <span>${name}</span>
            </div>
          </div>
        </li>
      `);
      ul.style.overflowY = "scroll";
    });
    lists.appendChild(ul);
  },
  clickListItem(e) {
    spinnerObj.addComponents();
    let el = e.target;
    if (el.closest(".list__item")) {
      el = el.closest(".list__item");
    }
    const previousActiveListItemId = dataObj.getSelectedItem();
    const selectedListItemId = +el.dataset.listitemid;
    this.deactivateListItem(previousActiveListItemId);
    this.activateListItem(selectedListItemId);
  },
  deactivateListItem(id) {
    document.querySelector(`li[data-listitemid="${id}"]`).classList.remove(`list__item--active-mode--${mode}`);
  },
  activateListItem(id) {
    dataObj.setSelectedItem(id);
    document.querySelector(`li[data-listitemid="${id}"]`).classList.add(`list__item--active-mode--${mode}`);
  }
}

const spinnerObj = {
  addComponents(parentDiv = section) {
    console.log("spinner has been started");
    const spinnerDiv = document.createElement("div");
    spinnerDiv.setAttribute("class", "spinner");
    parentDiv.style.position = "relative";
    parentDiv.appendChild(spinnerDiv);
    const timeout = setTimeout(function() {
      console.log("spinner has been ended");
      document.querySelector(".spinner").remove();
      clearTimeout(timeout);
    }, 1500);
  },
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

// ------------- first helpers functions

function setMode() {
  localStorage.setItem("mode", mode);
}

function getMode() {
  mode = localStorage.getItem("mode");
}

// Clear inner side of element
function clear(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }

  settingsObj.closeSettings();
}

// ------------- Async funcs

const getData = async function(str) {
  try {
    let response = await fetch(`http://api.alquran.cloud/v1/${str}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    let data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
(async function() {
  getData("surah");
})();

const collectEventListeners = function() {
  document.querySelector(".nav__btn.mode").addEventListener("click", toggleMode);
  sidebar.addEventListener("click", changeActiveBtns);
  document.querySelector(".nav__btn.settings").addEventListener("click", settingsObj.moveLeft);
  document.querySelector(".settingsdiv__close").addEventListener("click", settingsObj.moveRight);
  document.querySelector(".settingswindow").addEventListener("click", settingsObj.moveRight);
  if (history.path() == "home") {
    document.querySelector(".lists").addEventListener("click", function(e) {
      const el = e.target;
      // Clicking List Item Event
      if (!el.classList.contains(".list__item") && !el.closest(".list__item")) {
        console.log("List Item was not found. Good bye!!!");
        return;
      }
      listsObj.clickListItem(e);
    });  
  }
};

// ------------- main render func

const render = function() {
  getMode();

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

  collectEventListeners();
};
render();

// ------------- second helper functions

function deactivateBtns(parent, className, activeClassName) {
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
  if (!el.parentElement.classList.contains("sidebar__btn") && !el.classList.contains("sidebar__btn")) {
    console.log("xayr");
    return;
  }
  if (!el.classList.contains("sidebar__btn")) {
    el = el.parentElement;
  }
  deactivateBtns(el.parentElement, `sidebar__btn`, `sidebar__btn--active-mode--${mode}`);
  el.classList.add(`sidebar__btn--active-mode--${mode}`);
  if (!history.path() || el.dataset.path != history.path()) {
    history.push(el.dataset.path);
    clear(app);
    render();
  }
}

// Change light/dark mode
function toggleMode() {
  mode == "light" ? mode = "dark" : mode = "light";
  setMode();
  clear(app);
  render();
};