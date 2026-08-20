(function(){
  const directApiBase = 'https://mantto-gestor-api-a4hwfpgvbeb4gmgj.mexicocentral-01.azurewebsites.net';
  const protocol = String(window.location.protocol || '').toLowerCase();
  const hostname = String(window.location.hostname || '').trim();

  // Las consultas operativas continúan yendo directo a Azure.
  window.MANTTO_API_BASE = window.MANTTO_API_BASE || directApiBase;

  // Solo Auth usa el mismo origen del frontend en Web/PWA para que la cookie
  // HttpOnly mantto_refresh sea first-party. En local se mantiene :3001.
  window.MANTTO_SESSION_API_BASE = window.MANTTO_SESSION_API_BASE || (
    protocol === 'https:'
      ? window.location.origin
      : `http://${hostname || 'localhost'}:3001`
  );
})();
