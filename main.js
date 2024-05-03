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
  async getOneListItem(id) {
    if (!this.checkListItems()) {
      await this.getListItems();
    }
    return this.listItems[id];
  },
  async downloadChunksOneListItem(id) {
    try {
      let res = await Promise.all([
        fetch(`http://api.alquran.cloud/v1/surah/${id + 1}/ar.alafasy`),
        fetch(`https://api.alquran.cloud/v1/surah/${id + 1}/en.ahmedali`),
      ]);  
      res = await Promise.all(res.map(data => data.json()));
      res = res.map(data => {
        return data.data.ayahs.map(item => item.text);
      });
      this.chunk = res;
    } catch(err) {
      console.log(err);
    }
  },
  async getChunkOfOneListItem(id, ord) {
    return this.chunk.map(item => item[ord]);
  }
};

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
    const homeBtnActive = !history.path() || history.path() === "home" ? `sidebar__btn--active-mode--${mode}` : "";
    const timeBtnActive = history.path() !== "time" ? "" : `sidebar__btn--active-mode--${mode}`;
    sidebar.innerHTML = `
      <div data-path="home" class="sidebar__btn sidebar__btn-mode--${mode} ${homeBtnActive}"><i class="fa-solid fa-house"></i></div>
      <div data-path="time" class="sidebar__btn sidebar__btn-mode--${mode} ${timeBtnActive}"><i class="fa-regular fa-clock"></i></div>
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
  // if arguments does not exist, we pull all list items, else if arguments was given in array format, we pull that list items with that id
  async addListDatas(arrayID) {
    const ul = lists.querySelector("ul");
    let st;
    if (typeof arrayID !== "undefined") {
      st = new Set(arrayID);
    }
    let listItems = await dataObj.getListItems();
    listItems.forEach((item, id) => {
      if (typeof st !== "undefined") {
        if (st.has(id + 1)) {
          const {englishName, englishNameTranslation, name} = item;
          const listItemActive = id == dataObj.getSelectedItem() ? `list__item--active-mode--${mode}` : "";
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
        }
      } else {
        const {englishName, englishNameTranslation, name} = item;
        const listItemActive = id == dataObj.getSelectedItem() ? `list__item--active-mode--${mode}` : "";
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
      }
    });
    ul.style.overflowY = "scroll";
    lists.appendChild(ul);
  },
  clickListItem(e) {
    let el = e.target;
    if (el.closest(".list__item")) {
      el = el.closest(".list__item");
    }
    const previousActiveListItemId = dataObj.getSelectedItem();
    const selectedListItemId = +el.dataset.listitemid;
    if (previousActiveListItemId === selectedListItemId) {
      return;
    }
    spinnerObj.addComponents();
    const timeout = setTimeout(() => {
      this.deactivateListItem(previousActiveListItemId);  
      this.activateListItem(selectedListItemId);
      clear(section);
      this.addListItemContent(selectedListItemId);
      clearTimeout(timeout);
    }, 1500);

  },
  deactivateListItem(id) {
    if (!document.querySelector(`li[data-listitemid="${id}"]`)) return;
    document.querySelector(`li[data-listitemid="${id}"]`).classList.remove(`list__item--active-mode--${mode}`);
  },
  activateListItem(id) {
    dataObj.setSelectedItem(id);
    document.querySelector(`li[data-listitemid="${id}"]`).classList.add(`list__item--active-mode--${mode}`);
  },
  async addListItemContent(id = dataObj.getSelectedItem()) {
    let data = await dataObj.getOneListItem(id);
    const contentHeader = document.createElement("div");
    contentHeader.setAttribute("class", "contentheader");
    contentHeader.classList.add(`contentheader-mode--${mode}`);
    contentHeader.innerHTML = `
      <div class="contentheader__title">${data.englishName}</div>
      <div class="contentheader__info">Ayah-${data.numberOfAyahs}, ${data.revelationType}</div>
    `;  
    section.appendChild(contentHeader);
    console.log("Chosen section item ID", id);
    await dataObj.downloadChunksOneListItem(id);
    for (let i = 0; i < data.numberOfAyahs; i++) {
      const resultDatas = await dataObj.getChunkOfOneListItem(id, i);
      sectionObj.addSectionItem(id, i, resultDatas);
    }
  },
  async getListItemsForSearchText(text) {
    try {
      let response = await fetch(`https://api.alquran.cloud/v1/search/${text}/all/en`);
      response = await response.json();
      response = response.data.matches;
      const matchedListItems = [...new Set([...response.map(item => item.surah.number)])];
      matchedListItems.sort((a, b) => a - b);
      return matchedListItems;
    } catch (err) {
      console.log(err);
    }
  },
};

const spinnerObj = {
  addComponents(parentDiv = section) {
    console.log("spinner has been started");
    const spinnerDiv = document.createElement("div");
    spinnerDiv.setAttribute("class", "spinner");
    const spinnerWindow = document.createElement("div");
    spinnerWindow.setAttribute("class", "spinnerwindow");
    spinnerWindow.style.width = (section.clientWidth - 10) + "px";    
    spinnerWindow.appendChild(spinnerDiv);
    parentDiv.appendChild(spinnerWindow);
    const timeout = setTimeout(function() {
      console.log("spinner has been ended");
      if (document.querySelector(".spinner"))
        document.querySelector(".spinner").remove();
      clearTimeout(timeout);
    }, 1500);
  },
};

const sectionObj = {
  addComponents() {
    section = document.createElement("div");
    section.setAttribute("class", "section");
    listsObj.addListItemContent();
    content.appendChild(section);
  },
  addSectionItem(itemId, sectionItemId, datas) {
    const sectionItem = document.createElement("div");
    sectionItem.setAttribute("class", "sectionitem");
    sectionItem.classList.add(`sectionitem-mode--${mode}`);
    sectionItem.innerHTML = `
      <div class="sectionitem__order">${itemId + 1}:${sectionItemId + 1}</div>
      <div class="sectionitem__row-right sectionitem__row-right-mode--${mode}">${datas[0]}</div>
      <div class="sectionitem__row-left sectionitem__row-left-mode--${mode}">${datas[1]}</div>      
    `;
    section.appendChild(sectionItem);
  },
};

const timeObj = {
  async addComponents() {
    const timeDiv = document.createElement("div");
    timeDiv.setAttribute("class", "timediv");
    timeDiv.classList.add(`timediv-mode--${mode}`);
    timeDiv.innerHTML = `
      <div class="timediv__area">
        <h3 class="timediv__area-addition">Hudud nomi</h3>
        <select name="area">
          <option value="Toshkent">Toshkent</option>
          <option value="Samarqand">Samarqand</option>
          <option value="Nukus">Nukus</option>
          <option value="Xiva">Xiva</option>
          <option value="Buxoro">Buxoro</option>
          <option value="Navoiy">Navoiy</option>
          <option value="Jizzax">Jizzax</option>
          <option value="Paxtaobod">Paxtaobod</option>
          <option value="Dehqonobod">Dehqonobod</option>
          <option value="Andijon">Andijon</option>
          <option value="Farg'ona">Farg'ona</option>
          <option value="Namangan">Namangan</option>
        </select>
      </div>
      <h3 class="fivetime__cards-info">Namoz vaqtlari</h3> 
      <div class="fivetimes__cards">
      </div>   
    `;
    const region = this.getRegion();
    const obj = await this.getDataForRegion(region);
    this.fillDatas(timeDiv, obj);    
    content.appendChild(timeDiv);
    const selectedOption = timeDiv.querySelector(`option[value="${region}"]`);
    selectedOption.selected = true;
  },
  setRegion(region) {
    localStorage.setItem("region", region);
  },
  getRegion() {
    return localStorage.getItem("region") ?? "Toshkent";
  },
  isEqualTimes(compTime, now) {
    if (compTime.length < 8) compTime += ":00";
    if (now.length < 8) now += ":00";
    compTime = compTime.split(":").map(item => +item);
    now = now.split(":").map(item => +item);
    const [h1, m1, s1] = compTime;
    const [h2, m2, s2] = now;
    return 3600 * (h2 - h1) + 60 * (m2 - m1) + (s2 - s1) === 0;
  },
  compareTimes(compTime, now) {
    if (compTime.length < 8) compTime += ":00";
    if (now.length < 8) now += ":00";
    compTime = compTime.split(":").map(item => +item);
    now = now.split(":").map(item => +item);
    const [h1, m1, s1] = compTime;
    const [h2, m2, s2] = now;
    return 3600 * (h2 - h1) + 60 * (m2 - m1) + (s2 - s1) >= 0;
  },
  validInterval(a, now, b) {
    return (this.compareTimes(a, now) || this.isEqualTimes(a, now)) && this.compareTimes(now, b);
  },
  fillDatas(timeDiv, obj) {
    console.log("Fill datas func obj", obj);

    // Time for comparing and activating nearby praying time
    const timeNow = new Date();
    const hours = timeNow.getHours();
    const minutes = timeNow.getMinutes();
    const seconds = timeNow.getSeconds();

    const string = `${hours}:${minutes}:${seconds}`;
    let timeStrings = [obj.tong_saharlik, obj.quyosh, obj.peshin, obj.asr, obj.shom_iftor, obj.hufton];
    let ansInd = -1000;
    for (let i = 0; i < 6; i++) {
      if (this.compareTimes(timeStrings[i], string)) {
        ansInd = i;
      }
      timeStrings[i] = "";
    }
    timeStrings[ansInd] = "fivetime__card--active";

    const objExists = typeof obj !== "undefined";
    timeDiv.querySelector(".fivetimes__cards").innerHTML = `
      <div class="fivetime__card ${timeStrings[0]}">Bomdod namozi: ${objExists ? obj.tong_saharlik : ""}</div>
      <div class="fivetime__card ${timeStrings[1]}">Quyosh: ${objExists ? obj.quyosh : ""}</div>
      <div class="fivetime__card ${timeStrings[2]}">Peshin namozi: ${objExists ? obj.peshin : ""}</div>
      <div class="fivetime__card ${timeStrings[3]}">Asr namozi: ${objExists ? obj.asr : ""}</div>
      <div class="fivetime__card ${timeStrings[4]}">Shom namozi: ${objExists ? obj.shom_iftor : ""}</div>
      <div class="fivetime__card ${timeStrings[5]}">Xufton namozi: ${objExists ? obj.hufton : ""}</div>
    `;
  },
  async getDataForRegion(region) {
    console.log("Request for region data was sended");
    try {
      let response = await fetch(`https://islomapi.uz/api/present/day?region=${region}`);
      response = await response.json();
      response = response.times;
      return response;
    } catch (err) {
      console.log(err);
    }
  }
};

const contentObj = {
  async addComponents() {
    content = document.createElement("div");
    content.setAttribute("class", "content");
    clear(content);
    if (history.path() != "time") {
      this.addHomeComponents();
    } else {
      await this.addTimeComponents();
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
  async addTimeComponents() {
    await timeObj.addComponents();
  },
};

const containerObj = {
  async addComponents() {
    container = document.createElement("div");
    container.setAttribute("class", "container");
    sidebarObj.addComponents();
    await contentObj.addComponents();
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
    // search from input
    document.querySelector(".searchfield").querySelector("input[type='text']").addEventListener("input", function(e) {
      const el = e.target;
      setTimeout(async function(e) {
        const arrayID = await listsObj.getListItemsForSearchText(el.value);
        console.log("IDs array for searched text has been come");
        const ul = lists.querySelector("ul");
        clear(ul);
        listsObj.addListDatas(arrayID);
      }, 1000);
    });
  } else {
    document.querySelector("select").addEventListener("input", async function(e){
      console.log("------------- Request ------------");
      const value = e.target.value;
      console.log("Eventhandler's value", value);

      const timeDiv = document.querySelector(".timediv");

      try {
        console.log("Selected text", document.querySelector("select").value);
        console.log("Previous selected", timeObj.getRegion());
        
        timeObj.setRegion(value);
        console.log("From Local Storage", timeObj.getRegion());

        // document.querySelector(".fivetimes__cards").remove();

        const requestObj = await timeObj.getDataForRegion(value);
        timeObj.fillDatas(timeDiv, requestObj);

        document.querySelector(`option[value="${value}"]`).setAttribute("selected", "true");
      } catch(err) {
        console.log(err);
      }

      console.log("---------------------------");      
    });
  }
};

// ------------- main render func

const render = async function() {
  getMode();

  navObject.addComponents();
  await containerObj.addComponents();

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
    console.log("sidebar button was not found. Good bye!!!");
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