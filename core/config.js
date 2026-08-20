(function(){
  const directApiBase = 'https://mantto-gestor-api-a4hwfpgvbeb4gmgj.mexicocentral-01.azurewebsites.net';
  const protocol = String(window.location.protocol || '').toLowerCase();
  const hostname = String(window.location.hostname || '').trim();

  function isPrivateIpv4(value){
    const parts = String(value || '').split('.').map(Number);
    if(parts.length !== 4 || parts.some(part => !Number.isInteger(part) || part < 0 || part > 255)) return false;
    return parts[0] === 10 ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168);
  }

  function isLocalDevelopmentHost(value){
    return value === 'localhost' ||
      value === '127.0.0.1' ||
      value === '::1' ||
      value === '0.0.0.0' ||
      isPrivateIpv4(value);
  }

  const useLocalBackend = protocol === 'http:' && isLocalDevelopmentHost(hostname);
  const localBackendHost = hostname === '::1' ? 'localhost' : (hostname || 'localhost');
  const selectedApiBase = useLocalBackend
    ? `http://${localBackendHost}:3001`
    : directApiBase;

  // Auth y consultas operativas deben usar el mismo backend para que el JWT,
  // la sesion renovable y las consultas a Aiven pertenezcan al mismo entorno.
  window.MANTTO_API_BASE = window.MANTTO_API_BASE || selectedApiBase;
  window.MANTTO_SESSION_API_BASE = window.MANTTO_SESSION_API_BASE || selectedApiBase;
})();
