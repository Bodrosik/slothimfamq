// Примітивний скрипт для статусу сервера
document.addEventListener("DOMContentLoaded", () => {
    const statusEl = document.getElementById('server-status');

    // Плейсхолдер для реального API
    const serverOnline = true; // тут можна підставити API перевірки сервера

    statusEl.textContent = serverOnline ? "Онлайн ✅" : "Офлайн ❌";
});
