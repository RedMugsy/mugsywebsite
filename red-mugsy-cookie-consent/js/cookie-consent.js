(function(){
  const COOKIE_NAME = 'mugsy_cookie_consent';
  function getDomain(){ try{ const h=location.hostname; return h.endsWith('redmugsy.com')?'.redmugsy.com':undefined }catch{return undefined} }
  function exp(days){ const d=new Date(); d.setTime(d.getTime()+days*864e5); return d.toUTCString() }
  function read(){ const raw=document.cookie.split('; ').find(r=>r.startsWith(COOKIE_NAME+'=')); if(!raw) return null; try{const v=decodeURIComponent(raw.split('=')[1]); const p=JSON.parse(v); return {essential:true, analytics:!!p.analytics, functional:!!p.functional}}catch{return null} }
  function write(p){ const v=encodeURIComponent(JSON.stringify({essential:true, analytics:!!p.analytics, functional:!!p.functional})); const parts=[COOKIE_NAME+'='+v,'Expires='+exp(365),'Path=/','SameSite=Lax']; const dom=getDomain(); if(dom) parts.push('Domain='+dom); if(location.protocol==='https:') parts.push('Secure'); document.cookie=parts.join('; ') }
  function set(p){ write(p); if(p.analytics) loadGA() }
  function shouldShow(){ return !read() }
  function loadGA(){ if(window._mugsyGAInjected) return; const GA_ID=window.RM_GA_ID||'G-XXXXXXXXXX'; if(!GA_ID||GA_ID==='G-XXXXXXXXXX') return; const s=document.createElement('script'); s.async=true; s.src='https://www.googletagmanager.com/gtag/js?id='+GA_ID; document.head.appendChild(s); window.dataLayer=window.dataLayer||[]; function gtag(){dataLayer.push(arguments)} window.gtag=gtag; gtag('js', new Date()); gtag('config', GA_ID, { anonymize_ip:true, cookie_flags:'SameSite=None;Secure' }); window._mugsyGAInjected=true }
  window.MugsyCookieConsent={read, set, shouldShow, loadGA};
})();

