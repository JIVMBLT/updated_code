(function(){
  const PROD_API_BASE = 'https://mantto-gestor-api-a4hwfpgvbeb4gmgj.mexicocentral-01.azurewebsites.net';

  function isPrivateIpv4(hostname){
    const parts = String(hostname || '').split('.').map(Number);
    if(parts.length !== 4 || parts.some(part => !Number.isInteger(part) || part < 0 || part > 255)) return false;
    return parts[0] === 10 ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168);
  }

  function resolveDefaultApiBase(){
    const hostname = String(window.location.hostname || '').trim();
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || isPrivateIpv4(hostname);

    if(isLocal){
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
      const apiHost = hostname === '::1' ? '[::1]' : hostname;
      return `${protocol}//${apiHost}:3001`;
    }

    return PROD_API_BASE;
  }

  window.MANTTO_API_BASE = window.MANTTO_API_BASE || resolveDefaultApiBase();
})();
