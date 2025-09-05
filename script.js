// Автоматичний рік
document.getElementById("year").textContent = new Date().getFullYear();

// Кола для перемикання теми
document.getElementById("lightMode").onclick = () => {
  document.body.classList.remove("dark");
};
document.getElementById("darkMode").onclick = () => {
  document.body.classList.add("dark");
};
