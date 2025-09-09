// main.js
window.addEventListener('load', function(){
  // CONFIG (змінюйте під свій IP/налаштування)
  const APP_CONFIG = {
    defaultIP: 'play.nazvaserveru.ua'
  };

  // 1) UI small helpers
  function $(s){ return document.querySelector(s); }
  function $all(s){ return Array.from(document.querySelectorAll(s)); }

  // 2) Init ThreeParallax
  try{
    const threeCanvas = document.getElementById('three-canvas');
    window.threeApp = new ThreeParallax(threeCanvas);
  }catch(e){ console.warn('three init failed', e); }

  // 3) init particles on canvas (tsparticles)
  if(window.tsParticles){
    tsParticles.loadCanvas('particles', document.getElementById('particles-canvas'), {
      fpsLimit:60, detectRetina:true,
      particles:{ number:{value:60,density:{enable:true,area:700}}, color:{value:['#9b5cff','#5cc1ff','#ffffff']}, shape:{type:'circle'}, opacity:{value:0.6,random:{enable:true,min:0.2}}, size:{value:{min:1,max:6}}, move:{enable:true,speed:0.6,outModes:{default:'out'}} },
      interactivity:{events:{onHover:{enable:true,mode:'grab'}, onClick:{enable:true,mode:'push'}}, modes:{grab:{distance:120},push:{quantity:4}}}
    }).catch(()=>{});
  }

  // 4) Init Shop
  if(window.ShopModule) window.ShopModule.init();

  // 5) Status check
  if(window.StatusChecker) StatusChecker.check(APP_CONFIG.defaultIP);

  // 6) UI events
  $('#year').innerText = new Date().getFullYear();
  $('#serverIpPill').innerText = 'IP: ' + APP_CONFIG.defaultIP;

  $('#joinBtn').addEventListener('click', ()=>{ navigator.clipboard?.writeText(APP_CONFIG.defaultIP); alert('IP скопійовано: ' + APP_CONFIG.defaultIP); });
  $('#playNow').addEventListener('click', ()=>{ navigator.clipboard?.writeText(APP_CONFIG.defaultIP); alert('IP скопійовано: ' + APP_CONFIG.defaultIP); });
  $('#howTo').addEventListener('click', ()=>{ alert('Java: Multiplayer -> Add Server -> IP. Bedrock: Play -> Servers -> Add Server.'); });
  $('#shopBtn').addEventListener('click', ()=>{ $('#openCart').click(); });
  $('#supportBtn').addEventListener('click', ()=>{ window.scrollTo({top:document.body.scrollHeight, behavior:'smooth'}); });

  // payment buttons (temporary)
  $all('[data-pay]').forEach(b => b.addEventListener('click', e => {
    const method = e.currentTarget.getAttribute('data-pay');
    alert('Вибрано платіж: ' + method + '. Заміни на реальний процес.');
  }));

  // keyboard: C -> cart
  document.addEventListener('keydown', e=>{ if(e.key.toLowerCase()==='c'){ $('#openCart').click(); } });

  // small helper
  function $(s){ return document.querySelector(s); }
});
