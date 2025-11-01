(function(){
  function qs(s){return document.querySelector(s)}
  function show(){ const b=qs('#cookie-consent-banner'); if(!b) return; b.style.display='block' }
  function hide(){ const b=qs('#cookie-consent-banner'); if(!b) return; b.style.display='none' }
  function init(){ if(!window.MugsyCookieConsent) return; if(!MugsyCookieConsent.shouldShow()) return; show();
    qs('#accept-all-cookies')?.addEventListener('click', ()=>{ MugsyCookieConsent.set({analytics:true,functional:true}); hide() })
    qs('#reject-optional-cookies')?.addEventListener('click', ()=>{ MugsyCookieConsent.set({analytics:false,functional:false}); hide() })
    qs('#customize-cookies')?.addEventListener('click', ()=>{ location.assign('/cookie-preferences') })
  }
  document.addEventListener('DOMContentLoaded', init)
})();

