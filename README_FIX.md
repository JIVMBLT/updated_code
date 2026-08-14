# FIX COBRANZA UNI - DETALLE GESTION DE CREDITO V005

## Alcance
Se agrega al detalle de Gestion de Credito una tabla de relaciones del proyecto.

### Nombres visibles solicitados
- MP: **Mantenimiento Preventivo**
- PC: **Venta Adicional**

## Tabla agregada
La tabla reutiliza exclusivamente los datos ya presentes en el snapshot de `gestion_credito`; no crea requests adicionales.

Filas mostradas:
- Mantenimiento Preventivo 2025: cantidad `mp_2025` y monto `monto_mp_2025`.
- Mantenimiento Preventivo 2026: cantidad `mp_2026` y monto `monto_mp_2026`.
- Mantenimiento Preventivo Pendiente: `facturas_mp` y `montp_mp`.
- Venta Adicional: `facturas_va`, `monto_va` y `credito_para_va`.
- Se muestra adicionalmente `credito_disponible_venta`.

Los botones de accion reutilizan la navegacion ya preparada en V004. Si la vista relacionada aun no esta registrada, permanecen deshabilitados como en V004.

## Archivos modificados
- `modules/cobranza-uni/cobranza-uni.js`
- `modules/cobranza-uni/cobranza-uni.css`

## Backend / SQL
No requiere cambios de backend ni SQL.
