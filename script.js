document.addEventListener("DOMContentLoaded", () => {
    const statusEl = document.getElementById('server-status');
    const playersEl = document.getElementById('online-players');

    // Плейсхолдер статусу сервера
    const serverOnline = true;
    const onlinePlayers = 12; // тут можна підставити API

    statusEl.textContent = serverOnline ? "Онлайн ✅" : "Офлайн ❌";
    playersEl.textContent = onlinePlayers;
});
