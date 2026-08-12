// [Aster | 2026-08-12 | ASTER-MG | PATCH: FIX_CORS_LOCAL_DEV_V001]

const LOCAL_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '::1',
  '0.0.0.0'
]);

function parseAllowedOrigins() {
  const raw = process.env.CORS_ORIGINS || '*';

  if (raw.trim() === '*') {
    return '*';
  }

  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function isPrivateIpv4(hostname) {
  const parts = String(hostname || '')
    .split('.')
    .map((part) => Number(part));

  if (
    parts.length !== 4 ||
    parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  ) {
    return false;
  }

  const [a, b] = parts;

  if (a === 10) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;

  return false;
}

function isLocalDevelopmentOrigin(origin) {
  if (process.env.NODE_ENV === 'production') {
    return false;
  }

  try {
    const url = new URL(origin);
    const hostname = String(url.hostname || '').toLowerCase();

    if (!['http:', 'https:'].includes(url.protocol)) {
      return false;
    }

    return LOCAL_HOSTNAMES.has(hostname) || isPrivateIpv4(hostname);
  } catch (_error) {
    return false;
  }
}

function getCorsOptions() {
  const allowedOrigins = parseAllowedOrigins();

  return {
    credentials: true,
    origin(origin, callback) {
      // Requests server-to-server, health checks and tools without Origin.
      if (!origin) {
        return callback(null, true);
      }

      // Development only: allow localhost and RFC1918 LAN origins regardless
      // of the frontend port. This supports Live Server / local PWA testing
      // without opening production CORS.
      if (isLocalDevelopmentOrigin(origin)) {
        return callback(null, true);
      }

      // With credentials enabled, "*" is never reflected for arbitrary
      // browser origins. Production must use an explicit allowlist.
      if (allowedOrigins !== '*' && allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      const message = allowedOrigins === '*'
        ? 'Configura CORS_ORIGINS con el origen exacto para este entorno.'
        : `Origen no permitido por CORS: ${origin}`;

      const error = new Error(message);
      error.statusCode = 403;
      return callback(error);
    }
  };
}

module.exports = { getCorsOptions };
