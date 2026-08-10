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

function getCorsOptions() {
  const allowedOrigins = parseAllowedOrigins();

  if (allowedOrigins === '*') {
    return {
      credentials: true,
      origin(origin, callback) {
        if (!origin) return callback(null, true);

        try {
          const hostname = new URL(origin).hostname;
          const localDevelopment = process.env.NODE_ENV !== 'production' &&
            ['localhost', '127.0.0.1', '::1'].includes(hostname);
          if (localDevelopment) return callback(null, true);
        } catch (_error) {
          // El formato inválido se rechaza abajo.
        }

        const error = new Error('Configura CORS_ORIGINS para permitir credenciales desde este origen.');
        error.statusCode = 403;
        return callback(error);
      }
    };
  }

  return {
    credentials: true,
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      const error = new Error(`Origen no permitido por CORS: ${origin}`);
      error.statusCode = 403;
      return callback(error);
    }
  };
}

module.exports = { getCorsOptions };
