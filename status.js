// status.js
(function(){
  const CONFIG = {
    statusApi: ip => `https://api.mcsrvstat.us/2/${encodeURIComponent(ip)}`
  };

  async function checkServer(ip){
    try{
      const res = await fetch(CONFIG.statusApi(ip), {cache:'no-store'});
      const data = await res.json();
      if(!data || data.online === false){
        document.getElementById('players').innerText = '0';
        document.getElementById('version').innerText = '—';
        document.getElementById('statusTxt').innerText = 'Offline';
        return;
      }
      document.getElementById('players').innerText = (data.players && data.players.online) ? data.players.online : '—';
      document.getElementById('version').innerText = data.version || '—';
      document.getElementById('statusTxt').innerText = 'Online';
    }catch(err){
      console.error('Status check error', err);
      document.getElementById('statusTxt').innerText = 'Помилка';
    }
  }

  // expose
  window.StatusChecker = { check: checkServer };
})();
