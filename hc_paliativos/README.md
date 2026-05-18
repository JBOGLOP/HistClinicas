# HC Paliativos - Apps Script

Historia Clínica integral de Cuidados Paliativos con escalas validadas y soporte longitudinal (múltiples evoluciones por paciente), persistida en Google Sheets vía Apps Script.

## Stack
- **Frontend:** Index.html (HTML/CSS/JS vanilla, dentro de Apps Script HtmlService)
- **Backend:** Code.gs (CRUD sobre dos hojas: `Pacientes` y `Evoluciones`)
- **Storage:** Google Sheet `1wTrvlbIMDmDsOlPq6yOLUy3PXsuz5izrAmof7hYjLCc`
- **Deploy URL existente:** `https://script.google.com/macros/s/AKfycbxvOYMeHjM_QGHxMZCyfKBb2yDR1aNDctmfoPvWixUktNd3Dxs_7UFaBNzMy_JtEVi60Q/exec`

## Estructura de archivos
- [appsscript.json](appsscript.json) — manifest (timezone, webapp access)
- [Code.gs](Code.gs) — backend: `listPacientes`, `getPaciente`, `savePaciente`, `listEvoluciones`, `getEvolucion`, `saveEvolucion`
- [Index.html](Index.html) — UI completa con 10 pestañas (Identificación, Historia, Examen Físico, 5 grupos de escalas, Dx, Plan + Medicación)
- [Meds.html](Meds.html) — base farmacológica `MEDS_DB` (24 medicamentos con fichas INVIMA y justificación clínica por tipo de dolor). Se inyecta en Index.html vía `<?!= include('Meds'); ?>`
- `README.md` — este documento

## Esquema de datos
**Hoja `Pacientes`** (1 fila = 1 paciente, datos estables):
- `paciente_id` (UUID, PK), `fecha_creacion`, `fecha_actualizacion`
- Identidad: tipo_doc, num_doc, nombres y apellidos, fecha_nac, sexo
- Contacto: eps, regimen, telefono, dirección, municipio, departamento, zona
- Cuidador: cuidador_nombre, cuidador_parentesco, cuidador_tel
- Clasificación: tipo_paciente, voluntad_anticipada

**Hoja `Evoluciones`** (1 fila = 1 visita; FK = `paciente_id`):
- `evolucion_id` (UUID, PK), `paciente_id` (FK), `fecha_registro`
- Institución y visita (fecha_atencion, tipo_atencion, etc.)
- Anamnesis (motivo, enfermedad actual, antecedentes, valoración psicosocial)
- Examen físico (signos vitales + 7 sistemas)
- **Escalas con score + ítems individuales:**
  - Funcionalidad: PPS, KPS, ECOG, Barthel (10 ítems + score)
  - Síntomas: ESAS-r (10 ítems + total)
  - Dolor: EVA (reposo/movimiento/irruptivo), caracterización, DN4 (10 ítems + score)
  - Pronóstico: PPI (5 ítems + score), NECPAL (6 ítems + resultado), SPICT (7 ítems + score)
  - Otras: CAM (4 ítems + positivo), Glasgow (3 ítems + score), Norton (5 ítems + score), IDC-Pal (15 ítems + total)
- Plan: análisis clínico, diagnósticos CIE-10, plan no farmacológico, LET, seguimiento, firma
- **Medicación prescrita:** `meds_json` (array completo de medicamentos con dosis/vía/frecuencia/observaciones/justificación INVIMA por tipo de dolor) + `meds_resumen` (string plano "Morfina 10mg VO c/4h | Gabapentina 300mg VO c/8h" para filtros rápidos en Sheets)

Las hojas se crean automáticamente con encabezados al primer `doGet`. Si faltan columnas (porque se agregaron campos nuevos al código), se anexan al final sin perder datos.

## Despliegue (actualizar el deployment existente)

### Opción A — copiar/pegar en el editor de Apps Script (más simple)
1. Abrir el spreadsheet en Google Sheets.
2. **Extensiones > Apps Script** (esto abre el proyecto vinculado).
3. En el editor:
   - Reemplazar el contenido de `Code.gs` (o `Código.gs`) con el de este repo.
   - Crear el archivo HTML **`Index`** (botón **+ > HTML**, nombrar exactamente `Index` — sin .html) y pegar el contenido de `Index.html`.
   - Crear el archivo HTML **`Meds`** (botón **+ > HTML**, nombrar exactamente `Meds`) y pegar el contenido de `Meds.html`.
   - Verificar `appsscript.json` (en **Configuración del proyecto > Mostrar archivo manifiesto**).
   - **Si aparece "Exception: No HTML file named Index was found"** es porque el archivo HTML no existe o tiene otro nombre. Asegurate de nombrarlo exactamente `Index` (con I mayúscula).
4. **Implementar > Administrar implementaciones** → al lado de la implementación existente, ícono de lápiz ✏️ → Versión: **Nueva versión** → Descripción "Migración HC rica + longitudinal" → **Implementar**. La URL `/exec` actual queda actualizada.

### Opción B — con CLASP (recomendado para iterar)
```bash
npm install -g @google/clasp
clasp login
# Una sola vez: vincular esta carpeta al script existente
cd "g:/Mi unidad/4. APPs/1. HC_pal/hc_paliativos_appscript"
clasp clone <SCRIPT_ID>   # o crear .clasp.json manualmente con el scriptId
# A partir de ahí:
clasp push                # sube Code.gs + Index.html + appsscript.json
clasp deploy --deploymentId <DEPLOYMENT_ID> --description "..."
```
Para obtener `SCRIPT_ID` y `DEPLOYMENT_ID`: en el editor de Apps Script, **Implementar > Administrar implementaciones**.

## Permisos
La primera vez que se ejecute, Apps Script pedirá autorización para acceder al spreadsheet. Ver/aprobar desde el editor (botón **Ejecutar** sobre `doGet`).

## Uso
1. Al abrir la URL `/exec`, se carga la lista de pacientes (sidebar izquierdo).
2. **Nuevo paciente** → llenar pestaña *Identificación* → **Guardar paciente** (crea fila en `Pacientes`).
3. Con paciente seleccionado, **Nueva evolución** o clic en una evolución existente para editar.
4. Cada **Guardar evolución** hace upsert en `Evoluciones` con todos los campos y escalas calculadas.
5. **Imprimir/PDF** expande todas las pestañas y abre el diálogo de impresión del navegador (Guardar como PDF).

## Notas
- El HTML standalone original (`historia_clinica_paliativos.html` en la carpeta padre) queda como referencia/backup.
- Si querés sumar el módulo de medicación con justificación INVIMA, se puede migrar después (la `MEDS_DB` del HTML original se puede reincorporar como tab adicional y guardarse como JSON en una columna nueva de `Evoluciones`).
- Timezone en `appsscript.json` está como `America/Argentina/Buenos_Aires`; si tu instalación es para Colombia (sugerido por la referencia a INVIMA), cambiar a `America/Bogota`.
