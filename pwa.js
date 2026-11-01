(() => {
  const $ = id => document.getElementById(id);
  const section = $('pwaSettings'); if (!section) return;
  const install=$('pwaInstall'), open=$('pwaOpen'), check=$('pwaCheck'), update=$('pwaUpdate');
  const status=$('pwaStatus'), help=$('pwaHelp'), badge=$('pwaBadge'), recover=$('pwaRecover');
  const version=document.querySelector('meta[name="paintline-version"]')?.content || '';
  $('pwaVersion').textContent=version ? 'Sürüm · '+version.slice(0,8) : 'Paintline';
  const display=matchMedia('(display-mode: standalone)');
  const installed=()=>display.matches || navigator.standalone===true;
  const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  let invitation=null, registration=null, checking=false, lastCheck=0, reloading=false;
  const watched=new WeakSet();
  function report(state,text,title) {
    section.dataset.state=state; status.textContent=text;
    badge.textContent=title || ({idle:'Oynamaya hazır',checking:'Kontrol ediliyor',ready:'Yeni sürüm',current:'Güncel',offline:'Çevrimdışı',error:'Tekrar dene',auth:'Oturum gerekli',downloading:'İndiriliyor'}[state]||'Paintline');
  }
  function timeout(promise,ms=12000) {
    let timer;return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('timeout')),ms);})]).finally(()=>clearTimeout(timer));
  }
  function showUpdate() {
    if (!registration?.waiting) return false;
    update.hidden=false; recover.hidden=true;
    report('ready','Yeni sürüm hazır. Kaydın korunarak yeniden açılacak.'); return true;
  }
  function watch(worker) {
    if (!worker || watched.has(worker)) return;
    watched.add(worker);
    const changed=()=>{
      if(worker.state==='installed') setTimeout(()=>{if(!showUpdate()&&!navigator.serviceWorker.controller)report('idle','Çevrimdışı oyun hazır. İyi eğlenceler!');},0);
      if(worker.state==='redundant'&&!showUpdate())report('error','İndirme tamamlanamadı. Bağlantını kontrol edip tekrar dene.');
    };
    worker.addEventListener('statechange',changed);changed();
  }
  function attach(reg) {
    registration=reg;reg.addEventListener('updatefound',()=>watch(reg.installing));watch(reg.installing);showUpdate();return reg;
  }
  const startRegistration=()=>timeout(navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(attach));
  function busy(on) { check.disabled=on;check.setAttribute('aria-busy',String(on));$('pwaCheckLabel').textContent=on?'Kontrol ediliyor…':'Güncellemeleri kontrol et'; }
  async function checkUpdates(manual=false) {
    if(checking || (!manual&&Date.now()-lastCheck<60000))return;
    checking=true;lastCheck=Date.now();busy(true);recover.hidden=true;
    try {
      if(showUpdate())return;
      if(!navigator.onLine){report('offline','İnternete bağlandığında tekrar kontrol edebilirsin. Oyunun çevrimdışı çalışmaya devam eder.');return;}
      report('checking','Son sürüme bakılıyor…');
      const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),10000);
      let response;
      try{response=await fetch('./release.json?check='+Date.now(),{cache:'no-store',credentials:'same-origin',signal:controller.signal});}finally{clearTimeout(timer);}
      if(response.status===401||response.status===403||response.redirected||response.headers.get('content-type')?.includes('text/html')){
        recover.hidden=false;report('auth','Güncelleme için oturumunu yenilemen gerekiyor. Oyun kaydın bu cihazda kalır.');return;
      }
      if(!response.ok)throw new Error('server');
      const remote=await response.json();if(!/^[a-f0-9]{16}$/.test(remote.version))throw new Error('version');
      const reg=registration || await startRegistration();
      await timeout(reg.update());watch(reg.installing);
      if(showUpdate())return;
      if(reg.installing){report('downloading','Yeni sürüm indiriliyor. Tamamlanınca güncelleme düğmesi açılacak.');return;}
      if(remote.version===version)report('current','En yeni sürüm sende. İyi oyunlar!');
      else {recover.hidden=false;report('error','Yeni sürüm bulundu, ancak indirme tamamlanmadı. Bağlantıyı yenileyip güncellemeyi tamamlayabilirsin.');}
    }catch(error){
      if(!showUpdate()){recover.hidden=false;report('error',error.message==='timeout'||error.name==='AbortError'?'Sunucu yanıt vermedi. Tekrar dene veya bağlantını yenile.':'Güncelleme kontrol edilemedi. Tekrar dene veya oturumunu yenile.');}
    }finally{checking=false;busy(false);}
  }
  function reflectInstalled(){if(installed()){install.hidden=open.hidden=true;help.hidden=true;}}
  const eligible=window.isSecureContext&&/^https?:$/.test(location.protocol)&&window.top===window.self&&'serviceWorker' in navigator;
  if(!eligible){install.hidden=check.hidden=update.hidden=true;open.hidden=false;report('idle','Kurulum ve güncelleme için Paintline’ın uygulama sayfasını aç.');return;}
  reflectInstalled();display.addEventListener?.('change',reflectInstalled);
  addEventListener('beforeinstallprompt',event=>{event.preventDefault();invitation=event;if(!installed())install.hidden=false;});
  addEventListener('appinstalled',()=>{invitation=null;install.hidden=open.hidden=true;help.hidden=true;report('idle','Ana ekranındaki Paintline simgesinden açabilirsin.');});
  install.addEventListener('click',async()=>{
    if(!invitation){help.hidden=false;help.textContent=ios?'Safari’de Paylaş → Ana Ekrana Ekle → Ekle yolunu izle.':'Tarayıcı menüsünden “Uygulamayı yükle” veya “Ana ekrana ekle”yi seç.';return;}
    const event=invitation;invitation=null;install.disabled=true;
    try{await event.prompt();await event.userChoice;}catch(_){help.hidden=false;help.textContent='Tarayıcı menüsünden ana ekranına ekleyebilirsin.';}finally{install.disabled=false;}
  });
  check.addEventListener('click',()=>checkUpdates(true));
  update.addEventListener('click',()=>{
    if(!registration?.waiting){checkUpdates(true);return;}
    reloading=true;update.disabled=true;report('checking','Yeni sürüm açılıyor…');
    registration.waiting.postMessage({type:'SKIP_WAITING'});
    setTimeout(()=>{if(reloading){reloading=false;update.disabled=false;recover.hidden=false;report('error','Yeniden açma tamamlanmadı. Bağlantıyı yenileyerek devam edebilirsin.');}},12000);
  });
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloading){reloading=false;location.reload();}});
  startRegistration().then(reg=>{navigator.serviceWorker.ready.then(()=>{if(!checking&&!reg.waiting)report('idle','Çevrimdışı oynamaya hazır. Yeni sürümleri buradan kontrol edebilirsin.');});}).catch(()=>{report('error','Güncelleme bağlantısı kurulamadı. Kontrol et düğmesine dokunarak tekrar deneyebilirsin.');});
  const settings=$('settings');if(settings)new MutationObserver(()=>{if(!settings.hidden)checkUpdates();}).observe(settings,{attributes:true,attributeFilter:['hidden']});
  addEventListener('online',()=>checkUpdates(true));addEventListener('visibilitychange',()=>{if(!document.hidden)checkUpdates();});
})();
