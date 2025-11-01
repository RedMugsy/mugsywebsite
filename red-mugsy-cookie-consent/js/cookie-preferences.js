(function(){
  function q(id){return document.getElementById(id)}
  function init(){ if(!window.MugsyCookieConsent) return; const c=MugsyCookieConsent.read()||{essential:true,analytics:false,functional:false};
    const a=q('toggle-analytics'), f=q('toggle-functional'); if(a) a.checked=!!c.analytics; if(f) f.checked=!!c.functional;
    q('save-prefs')?.addEventListener('click', ()=>{ MugsyCookieConsent.set({analytics:!!a?.checked,functional:!!f?.checked}); alert('Preferences saved') })
    q('accept-all')?.addEventListener('click', ()=>{ if(a) a.checked=true; if(f) f.checked=true; MugsyCookieConsent.set({analytics:true,functional:true}); alert('All cookies accepted') })
    q('reject-all')?.addEventListener('click', ()=>{ if(a) a.checked=false; if(f) f.checked=false; MugsyCookieConsent.set({analytics:false,functional:false}); alert('Optional cookies rejected') })
  }
  document.addEventListener('DOMContentLoaded', init)
})();

