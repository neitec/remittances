---
name: design-mode
description: Inicia el frontend en modo diseño con datos mockeados y abre el navegador automáticamente
---

# Design Mode - Dashboard

Para iniciar el frontend en modo diseño, ejecuta:

```bash
# Mata cualquier proceso previo en puerto 3002, inicia el servidor y abre el navegador
lsof -ti :3002 | xargs kill -9 2>/dev/null || true && sleep 1 && NEXT_PUBLIC_DESIGN_MODE=true npm run dev > /tmp/design-mode.log 2>&1 & sleep 3 && open http://localhost:3002
```

**O más simplemente:**

```bash
NEXT_PUBLIC_DESIGN_MODE=true npm run dev
```

Luego abre manualmente `http://localhost:3002` en el navegador.

**Qué hace:**
✅ Levanta el servidor en modo diseño (puerto 3002)
✅ Abre automáticamente `http://localhost:3002` en el navegador
✅ Carga datos mockeados sin necesidad de API backend

## Datos Mockeados

- **Cuentas**: EUR 5432.50 + USD 2100.75
- **Transacciones**: 5 de ejemplo (DEPOSIT/TRANSFER)
- **Cuentas bancarias**: 2 externas

Ubicación: `lib/mocks/mockData.ts`

## Variables de Entorno

- `NEXT_PUBLIC_DESIGN_MODE=true`: Activa modo diseño con datos mockeados
