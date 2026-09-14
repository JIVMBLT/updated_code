-- [Aster | 2026-09-14 | ASTER-MG | LAB DGB FASE 6 HOME COMPLETO V002]
-- No crea tablas, columnas ni indices. Reutiliza el esquema relacional de Fase 1.
-- Solo agrega fixtures sinteticos LAB para validar bandeja y visibilidad de tareas.

INSERT OR IGNORE INTO sup_notificaciones
  (id_usuario, tipo_notificacion, titulo_notificacion, mensaje_notificacion,
   icono_notificacion, accion_notificacion, id_referencia, ruta_destino,
   clave_deduplicacion, trace_id, leido, activo)
VALUES
  (910006, 'COMENTARIO', 'Aviso general LAB',
   'Notificacion sintetica para validar la bandeja local del Laboratorio DGB.',
   'LAB', 'ABRIR_MODULO', NULL, 'home',
   'LAB_PHASE6_V002_GENERAL_910006', 'LAB-P6V2-001', 0, 1),
  (910006, 'tareas.comentario.creado', 'Nueva interaccion en tarea LAB',
   'Usuario LAB comento en una tarea colaborativa visible para este perfil.',
   'CHAT', 'ABRIR_TAREA', 950002, 'home:tarea:950002',
   'LAB_PHASE6_V002_TASK_COMMENT_910006_950002', 'LAB-P6V2-002', 0, 1);

-- Relacion 100% sintetica: permite probar el mismo filtro de una tarea
-- colaborativa y su notificacion ABRIR_TAREA con la identidad Programador LAB.
INSERT INTO pendientes_usuarios
  (id_pendiente, iniciales_usuario, tipo_relacion)
SELECT 950002, 'L06', 'RESPONSABLE'
WHERE NOT EXISTS (
  SELECT 1 FROM pendientes_usuarios
  WHERE id_pendiente=950002
    AND UPPER(TRIM(iniciales_usuario))='L06'
    AND tipo_relacion='RESPONSABLE'
);

PRAGMA user_version = 6;
