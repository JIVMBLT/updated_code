/* Sesiones renovables: 28 días de inactividad y máximo absoluto de 90 días. */
USE mydb;

CREATE TABLE IF NOT EXISTS auth_sessions (
  id_session BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  token_hash CHAR(64) NOT NULL,
  csrf_hash CHAR(64) NOT NULL,
  session_version VARCHAR(64) NOT NULL,
  session_started_at DATETIME(3) NOT NULL,
  last_activity_at DATETIME(3) NOT NULL,
  idle_expires_at DATETIME(3) NOT NULL,
  absolute_expires_at DATETIME(3) NOT NULL,
  revoked_at DATETIME(3) NULL,
  created_ip VARCHAR(64) NULL,
  last_ip VARCHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_session),
  UNIQUE KEY uq_auth_sessions_token_hash (token_hash),
  KEY idx_auth_sessions_usuario (usuario_id, revoked_at),
  KEY idx_auth_sessions_expiracion (idle_expires_at, absolute_expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
