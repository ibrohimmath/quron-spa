const app = document.querySelector(".app");

const h1 = document.createElement("h1");
h1.textContent = "Hi";

const p = document.createElement("p");
p.textContent = "Lorem ipsum dolor sit amet";

app.appendChild(h1);
app.appendChild(p);