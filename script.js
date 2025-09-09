// Налаштування: підстав свій IP/домен сервера сюди:
const SERVER_ADDRESS = "berezivka2tochka0.aternos.me"; // заміни на свій IP / домен
const STATUS_API = `https://api.mcsrvstat.us/2/${SERVER_ADDRESS}`; // використовує мcsrvstat.us

// Заповнюємо інтерфейс
document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('server-ip').textContent = SERVER_ADDRESS;
const howtoIp = document.getElementById('howto-ip');
if(howtoIp) howtoIp.textContent = SERVER_ADDRESS;

// Підтягуємо статус сервера через API (CORS може вимагати проксі)
async function fetchStatus(){
  try{
    const res = await fetch(STATUS_API);
    if(!res.ok) throw new Error('API error');
    const data = await res.json();
    // data: online, players, version, motd
    const online = data.online ? "Онлайн" : "Офлайн";
    const players = data.players && data.players.online !== undefined ? `${data.players.online}/${data.players.max ?? "?"}` : "—";
    const version = data.version || "—";
    document.getElementById('status-text').textContent = `${online} • Гравців: ${players} • Версія: ${version}`;
    document.getElementById('player-count').textContent = players;
    document.getElementById('mc-version').textContent = version;
  }catch(e){
    document.getElementById('status-text').textContent = 'Не вдалося отримати статус сервера (можлива відсутність CORS або помилка API).';
    document.getElementById('player-count').textContent = '—';
    document.getElementById('mc-version').textContent = '—';
    console.warn('Status fetch error:', e);
  }
}

// Виклик одразу + інтервал
fetchStatus();
setInterval(fetchStatus, 60_000); // оновлення кожну хвилину

// Маленька функція для моб меню
function toggleNav(){
  const nav = document.querySelector('.nav');
  if(!nav) return;
  nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
}
window.toggleNav = toggleNav;
