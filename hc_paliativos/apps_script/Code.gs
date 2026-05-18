// =============================================================
// HC PALIATIVOS - Backend Apps Script
// Esquema longitudinal: 1 paciente -> N evoluciones
// Spreadsheet: 1wTrvlbIMDmDsOlPq6yOLUy3PXsuz5izrAmof7hYjLCc
// =============================================================

var SPREADSHEET_ID = '1wTrvlbIMDmDsOlPq6yOLUy3PXsuz5izrAmof7hYjLCc';
var SHEET_PACIENTES = 'Pacientes';
var SHEET_EVOLUCIONES = 'Evoluciones';

// --- Columnas de Pacientes (datos estables del paciente) ---
var PATIENT_COLS = [
  'paciente_id', 'fecha_creacion', 'fecha_actualizacion',
  'tipo_doc', 'num_doc',
  'nombre1', 'nombre2', 'apellido1', 'apellido2',
  'fecha_nac', 'sexo',
  'eps', 'regimen', 'telefono',
  'direccion', 'municipio', 'departamento', 'zona',
  'cuidador_nombre', 'cuidador_parentesco', 'cuidador_tel',
  'tipo_paciente', 'voluntad_anticipada'
];

// --- Columnas de Evoluciones (datos por visita) ---
var EVOLUCION_COLS = [
  // Metadatos
  'evolucion_id', 'paciente_id', 'fecha_registro',
  // Institución y visita
  'institucion', 'inst_nit', 'inst_cod', 'programa',
  'fecha_atencion', 'tipo_atencion',
  // Clasificación clínica
  'estado_paciente', 'fase_enfermedad',
  'dx_oncol', 'dx_principal',
  // Historia clínica
  'motivo_consulta', 'enfermedad_actual',
  'ant_patologicos', 'ant_farmacologicos', 'ant_alergicos',
  'ant_quirurgicos', 'ant_familiares', 'ant_toxicos',
  'ant_transfusionales', 'ant_oncologicos',
  'red_apoyo', 'aspectos_espirituales', 'socioeconomica', 'info_comunicacion',
  // Examen físico
  'sv_fc', 'sv_fr', 'sv_pa', 'sv_temp', 'sv_sato2',
  'sv_peso', 'sv_talla', 'sv_imc',
  'ef_general', 'ef_cabeza', 'ef_torax', 'ef_abdomen',
  'ef_extremidades', 'ef_neuro', 'ef_piel', 'ef_otros',
  // Escalas funcionales
  'pps', 'kps', 'ecog',
  'barthel_0', 'barthel_1', 'barthel_2', 'barthel_3', 'barthel_4',
  'barthel_5', 'barthel_6', 'barthel_7', 'barthel_8', 'barthel_9',
  'barthel_score',
  // ESAS (10 síntomas, 0-10)
  'esas_dolor', 'esas_fatiga', 'esas_nausea', 'esas_depresion',
  'esas_ansiedad', 'esas_somnolencia', 'esas_apetito',
  'esas_bienestar', 'esas_disnea', 'esas_otro',
  'esas_total',
  // Dolor
  'eva_rest', 'eva_mov', 'eva_irr',
  'dolor_loc', 'dolor_irrad', 'dolor_temp', 'dolor_tipo',
  'dolor_alivia', 'dolor_empeora', 'dolor_desc',
  // DN4 (10 items)
  'dn4_0', 'dn4_1', 'dn4_2', 'dn4_3', 'dn4_4',
  'dn4_5', 'dn4_6', 'dn4_7', 'dn4_8', 'dn4_9',
  'dn4_score',
  // PPI
  'ppi_0', 'ppi_1', 'ppi_2', 'ppi_3', 'ppi_4', 'ppi_score',
  // NECPAL
  'necpal_sorpresa', 'necpal_demanda', 'necpal_indicadores',
  'necpal_criterios', 'necpal_recursos', 'necpal_comorbilidad',
  'necpal_resultado',
  // SPICT
  'spict_0', 'spict_1', 'spict_2', 'spict_3',
  'spict_4', 'spict_5', 'spict_6', 'spict_score',
  // CAM
  'cam_0', 'cam_1', 'cam_2', 'cam_3', 'cam_positivo',
  // Glasgow
  'glasgow_0', 'glasgow_1', 'glasgow_2', 'glasgow_score',
  // Norton
  'norton_0', 'norton_1', 'norton_2', 'norton_3', 'norton_4', 'norton_score',
  // IDC-Pal (paciente: 7, familia: 5, organización: 3)
  'idc_p_0', 'idc_p_1', 'idc_p_2', 'idc_p_3', 'idc_p_4', 'idc_p_5', 'idc_p_6',
  'idc_f_0', 'idc_f_1', 'idc_f_2', 'idc_f_3', 'idc_f_4',
  'idc_o_0', 'idc_o_1', 'idc_o_2',
  'idc_total',
  // Análisis y diagnóstico
  'analisis_clinico',
  'dx1', 'dx2', 'dx3', 'dx4', 'dx_z515',
  // Plan
  'plan_no_farmaco', 'let_doc',
  'prox_control', 'modalidad_control', 'signos_alarma', 'instrucciones',
  'medico_nombre', 'medico_rm', 'medico_esp',
  // Medicación prescrita (JSON con lista de prescribedMeds)
  'meds_json', 'meds_resumen'
];

// =============================================================
// ENTRY POINTS
// =============================================================
function doGet() {
  try {
    return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('Historia Clínica Paliativos')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (e) {
    // Error amigable cuando faltan los archivos HTML en el proyecto
    var msg = String(e && e.message || e);
    var html =
      '<!doctype html><html><head><meta charset="utf-8">' +
      '<title>HC Paliativos · Configuración pendiente</title>' +
      '<style>body{font-family:system-ui,Arial,sans-serif;max-width:720px;margin:40px auto;padding:0 20px;color:#2c3e50}' +
      'h1{color:#c0392b;font-size:20px}h2{color:#1a5276;font-size:15px;margin-top:24px}' +
      'code{background:#f4f6f8;padding:2px 6px;border-radius:4px;font-size:13px}' +
      '.box{background:#fdedec;border-left:4px solid #c0392b;padding:12px 16px;border-radius:6px;margin:16px 0}' +
      'ol li{margin-bottom:8px}</style></head><body>' +
      '<h1>⚠️ Configuración del proyecto Apps Script incompleta</h1>' +
      '<div class="box"><strong>Error:</strong> ' + msg + '</div>' +
      '<h2>Cómo resolverlo</h2>' +
      '<ol>' +
      '<li>En el editor de Apps Script, panel <strong>Archivos</strong>, clic en <strong>+</strong> → <strong>HTML</strong>.</li>' +
      '<li>Nombrarlo exactamente <code>Index</code> (sin <code>.html</code>, con <strong>I mayúscula</strong>).</li>' +
      '<li>Borrar el contenido por defecto y pegar el contenido de <code>Index.html</code> del repo.</li>' +
      '<li>Repetir: <strong>+</strong> → <strong>HTML</strong> → nombrarlo <code>Meds</code> y pegar <code>Meds.html</code>.</li>' +
      '<li>Guardar (Ctrl+S) y volver a probar.</li>' +
      '</ol>' +
      '<p style="font-size:12px;color:#7f8c8d">Si después de crear los archivos el error persiste, ejecutá <code>healthCheck</code> desde el editor.</p>' +
      '</body></html>';
    return HtmlService.createHtmlOutput(html).setTitle('HC Paliativos · Setup');
  }
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// =============================================================
// SHEET HELPERS
// =============================================================
function getOrCreateSheet_(name, columns) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, columns.length).setValues([columns]);
    sheet.setFrozenRows(1);
  } else {
    // Asegurar que existan todas las columnas (agrega faltantes al final)
    var existing = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var missing = columns.filter(function(c) { return existing.indexOf(c) === -1; });
    if (missing.length > 0) {
      sheet.getRange(1, existing.length + 1, 1, missing.length).setValues([missing]);
    }
  }
  return sheet;
}

// Normaliza valores leídos de Sheet: Date -> string ISO ('YYYY-MM-DD' o 'YYYY-MM-DDTHH:mm')
// para que los <input type="date"> / <input type="datetime-local"> los acepten al recargar.
function normalizeCell_(v) {
  if (v instanceof Date) {
    var iso = Utilities.formatDate(v, Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm:ss");
    return iso.slice(11, 19) === '00:00:00' ? iso.slice(0, 10) : iso.slice(0, 16);
  }
  return v;
}

function readAll_(sheet) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2) {
    return { headers: sheet.getRange(1, 1, 1, lastCol).getValues()[0], rows: [] };
  }
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  var rows = data.map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = normalizeCell_(row[i]); });
    return obj;
  });
  return { headers: headers, rows: rows };
}

function buildRow_(headers, record) {
  return headers.map(function(h) {
    var v = record[h];
    return (v === undefined || v === null) ? '' : v;
  });
}

function findRowIndex_(sheet, columnName, value) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var idx = headers.indexOf(columnName);
  if (idx === -1) return -1;
  var col = sheet.getRange(2, idx + 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < col.length; i++) {
    if (String(col[i][0]) === String(value)) return i + 2;
  }
  return -1;
}

function nowIso_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

// =============================================================
// PACIENTES
// =============================================================
function listPacientes(filter) {
  var sheet = getOrCreateSheet_(SHEET_PACIENTES, PATIENT_COLS);
  var data = readAll_(sheet);
  var rows = data.rows;
  if (filter) {
    var q = String(filter).toLowerCase().trim();
    if (q.length > 0) {
      rows = rows.filter(function(r) {
        return ['nombre1','nombre2','apellido1','apellido2','num_doc']
          .some(function(c) { return String(r[c] || '').toLowerCase().indexOf(q) !== -1; });
      });
    }
  }
  rows.sort(function(a, b) {
    var an = (a.apellido1 + ' ' + a.apellido2 + ' ' + a.nombre1).toLowerCase();
    var bn = (b.apellido1 + ' ' + b.apellido2 + ' ' + b.nombre1).toLowerCase();
    return an < bn ? -1 : (an > bn ? 1 : 0);
  });
  return rows.map(function(r) {
    return {
      paciente_id: r.paciente_id,
      num_doc: r.num_doc,
      tipo_doc: r.tipo_doc,
      nombre_completo: [r.nombre1, r.nombre2, r.apellido1, r.apellido2].filter(Boolean).join(' '),
      tipo_paciente: r.tipo_paciente,
      fecha_actualizacion: r.fecha_actualizacion
    };
  });
}

function getPaciente(pacienteId) {
  if (!pacienteId) return null;
  var sheet = getOrCreateSheet_(SHEET_PACIENTES, PATIENT_COLS);
  var data = readAll_(sheet);
  for (var i = 0; i < data.rows.length; i++) {
    if (String(data.rows[i].paciente_id) === String(pacienteId)) return data.rows[i];
  }
  return null;
}

function savePaciente(data) {
  var sheet = getOrCreateSheet_(SHEET_PACIENTES, PATIENT_COLS);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  var pacienteId = data.paciente_id;
  var existingRow = -1;

  if (pacienteId) {
    existingRow = findRowIndex_(sheet, 'paciente_id', pacienteId);
  }
  // Si no hay id pero hay num_doc, intentar match por documento (evita duplicados)
  if (existingRow === -1 && data.num_doc) {
    existingRow = findRowIndex_(sheet, 'num_doc', data.num_doc);
    if (existingRow !== -1) {
      var idIdx = headers.indexOf('paciente_id');
      pacienteId = sheet.getRange(existingRow, idIdx + 1).getValue();
    }
  }

  if (!pacienteId) pacienteId = Utilities.getUuid();
  data.paciente_id = pacienteId;
  data.fecha_actualizacion = nowIso_();

  if (existingRow === -1) {
    data.fecha_creacion = nowIso_();
    sheet.appendRow(buildRow_(headers, data));
  } else {
    var fcIdx = headers.indexOf('fecha_creacion');
    if (fcIdx !== -1) {
      var prevFc = sheet.getRange(existingRow, fcIdx + 1).getValue();
      if (prevFc) data.fecha_creacion = prevFc;
    }
    sheet.getRange(existingRow, 1, 1, headers.length).setValues([buildRow_(headers, data)]);
  }

  return { success: true, paciente_id: pacienteId, message: 'Paciente guardado correctamente.' };
}

// =============================================================
// EVOLUCIONES
// =============================================================
function listEvoluciones(pacienteId) {
  if (!pacienteId) return [];
  var sheet = getOrCreateSheet_(SHEET_EVOLUCIONES, EVOLUCION_COLS);
  var data = readAll_(sheet);
  var rows = data.rows.filter(function(r) {
    return String(r.paciente_id) === String(pacienteId);
  });
  rows.sort(function(a, b) {
    var af = String(a.fecha_atencion || a.fecha_registro || '');
    var bf = String(b.fecha_atencion || b.fecha_registro || '');
    return af < bf ? 1 : (af > bf ? -1 : 0);
  });
  return rows.map(function(r) {
    return {
      evolucion_id: r.evolucion_id,
      fecha_atencion: r.fecha_atencion,
      fecha_registro: r.fecha_registro,
      tipo_atencion: r.tipo_atencion,
      dx_principal: r.dx_principal,
      pps: r.pps,
      ecog: r.ecog,
      esas_total: r.esas_total,
      medico_nombre: r.medico_nombre
    };
  });
}

function getEvolucion(evolucionId) {
  if (!evolucionId) return null;
  var sheet = getOrCreateSheet_(SHEET_EVOLUCIONES, EVOLUCION_COLS);
  var data = readAll_(sheet);
  for (var i = 0; i < data.rows.length; i++) {
    if (String(data.rows[i].evolucion_id) === String(evolucionId)) return data.rows[i];
  }
  return null;
}

function saveEvolucion(data) {
  if (!data.paciente_id) {
    return { success: false, message: 'Falta paciente_id. Guarda primero el paciente.' };
  }
  var sheet = getOrCreateSheet_(SHEET_EVOLUCIONES, EVOLUCION_COLS);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  var evolucionId = data.evolucion_id;
  var existingRow = evolucionId ? findRowIndex_(sheet, 'evolucion_id', evolucionId) : -1;

  if (!evolucionId) evolucionId = Utilities.getUuid();
  data.evolucion_id = evolucionId;
  data.fecha_registro = data.fecha_registro || nowIso_();

  if (existingRow === -1) {
    sheet.appendRow(buildRow_(headers, data));
  } else {
    sheet.getRange(existingRow, 1, 1, headers.length).setValues([buildRow_(headers, data)]);
  }

  return { success: true, evolucion_id: evolucionId, message: 'Evolución guardada correctamente.' };
}

function deleteEvolucion(evolucionId) {
  if (!evolucionId) return { success: false, message: 'Falta evolucion_id.' };
  var sheet = getOrCreateSheet_(SHEET_EVOLUCIONES, EVOLUCION_COLS);
  var row = findRowIndex_(sheet, 'evolucion_id', evolucionId);
  if (row === -1) return { success: false, message: 'Evolución no encontrada.' };
  sheet.deleteRow(row);
  return { success: true, message: 'Evolución eliminada.' };
}

// =============================================================
// UTIL / OPS
// =============================================================

// Devuelve definición de columnas al cliente (opcional).
function getFieldDefinitions() {
  return { patient: PATIENT_COLS, evolucion: EVOLUCION_COLS };
}

// Ejecutar UNA VEZ desde el editor (Ejecutar > setup) para crear hojas + encabezados
// sin necesidad de abrir la web app. Útil si Index.html aún no existe.
function setup() {
  var pSheet = getOrCreateSheet_(SHEET_PACIENTES, PATIENT_COLS);
  var eSheet = getOrCreateSheet_(SHEET_EVOLUCIONES, EVOLUCION_COLS);
  var msg = 'Hojas listas: "' + pSheet.getName() + '" (' + PATIENT_COLS.length + ' cols) y "' +
            eSheet.getName() + '" (' + EVOLUCION_COLS.length + ' cols).';
  Logger.log(msg);
  return msg;
}

// Verificación rápida desde el editor: confirma acceso al spreadsheet y a las hojas.
// Ejecutar > healthCheck → ver Registro de ejecución.
function healthCheck() {
  var report = { ok: true, checks: [] };
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    report.checks.push({ name: 'openById', ok: true, info: ss.getName() });
  } catch (e) {
    report.ok = false;
    report.checks.push({ name: 'openById', ok: false, error: String(e) });
    Logger.log(JSON.stringify(report, null, 2));
    return report;
  }
  ['Pacientes','Evoluciones'].forEach(function(name) {
    try {
      var s = getOrCreateSheet_(name, name === 'Pacientes' ? PATIENT_COLS : EVOLUCION_COLS);
      report.checks.push({ name: 'sheet:' + name, ok: true, rows: s.getLastRow() - 1 });
    } catch (e) {
      report.ok = false;
      report.checks.push({ name: 'sheet:' + name, ok: false, error: String(e) });
    }
  });
  ['Index','Meds'].forEach(function(name) {
    try {
      HtmlService.createHtmlOutputFromFile(name);
      report.checks.push({ name: 'html:' + name, ok: true });
    } catch (e) {
      report.ok = false;
      report.checks.push({ name: 'html:' + name, ok: false, error: String(e) });
    }
  });
  Logger.log(JSON.stringify(report, null, 2));
  return report;
}
