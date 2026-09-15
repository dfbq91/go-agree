/**
 * @file simulate-webhook.mjs
 * @description Helper script to simulate Wompi payment webhooks locally (Approved, Declined, or Tampered).
 * Usage:
 *   node scripts/simulate-webhook.mjs <TRANSACTION_REFERENCE> [--declined] [--tamper]
 */

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

// 1. Parse arguments
const args = process.argv.slice(2);
const reference = args.find((a) => !a.startsWith('--'));
const isDeclined = args.includes('--declined');
const isTampered = args.includes('--tamper');

if (!reference) {
  console.error('\n❌ ERROR: Falta la referencia de la transacción.');
  console.log('\nUso correcto:');
  console.log(
    '  node scripts/simulate-webhook.mjs <REFERENCIA>           -> Simular Pago Aprobado'
  );
  console.log(
    '  node scripts/simulate-webhook.mjs <REFERENCIA> --declined -> Simular Pago Rechazado (fondos insuficientes)'
  );
  console.log(
    '  node scripts/simulate-webhook.mjs <REFERENCIA> --tamper   -> Simular Firma Inválida / Alterada\n'
  );
  console.log('Ejemplo:');
  console.log('  node scripts/simulate-webhook.mjs ga_pro_m_1789411108473_tifzv8cw\n');
  process.exit(1);
}

// 2. Read WOMPI_EVENT_SECRET from apps/web/.env.local if available
let eventSecret = 'test_event_secret';
try {
  const envPath = path.resolve('apps/web/.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/^WOMPI_EVENT_SECRET=(.+)$/m);
    if (match?.[1]) {
      eventSecret = match[1].trim();
    }
  }
} catch {
  // Fallback to default
}

const txId = `trans_sim_${Date.now()}`;
const amount = 4900000;
const timestamp = Math.floor(Date.now() / 1000);
const status = isDeclined ? 'DECLINED' : 'APPROVED';
const statusMessage = isDeclined
  ? 'Transacción rechazada por el banco emisor: Fondos insuficientes'
  : 'Transacción aprobada (simulación local)';

// 3. Compute SHA-256 Checksum according to Wompi specs:
// Formula: concat(transaction.id, transaction.status, transaction.amount_in_cents, timestamp, eventsSecret)
let concatValues = `${txId}${status}${amount}${timestamp}${eventSecret}`;

if (isTampered) {
  // Deliberately corrupt the data to simulate tampering/forgery
  concatValues += '_tampered_secret';
}

const checksum = createHash('sha256').update(concatValues).digest('hex');

const payload = {
  event: 'transaction.updated',
  data: {
    transaction: {
      id: txId,
      reference,
      amount_in_cents: amount,
      currency: 'COP',
      status,
      payment_method_type: 'CARD',
      status_message: statusMessage,
    },
  },
  environment: 'test',
  signature: {
    properties: ['transaction.id', 'transaction.status', 'transaction.amount_in_cents'],
    checksum,
  },
  timestamp,
};

const scenarioLabel = isTampered
  ? '⚠️ FIRMA ALTERADA (Ataque / Manipulación)'
  : isDeclined
    ? '❌ PAGO RECHAZADO (Fondos insuficientes)'
    : '✅ PAGO APROBADO';

console.log('\n======================================================');
console.log(`🚀 Simulando Webhook de Wompi: ${scenarioLabel}`);
console.log(`📌 Referencia: ${reference}`);
console.log(`💰 Monto: $${(amount / 100).toLocaleString('es-CO')} COP`);
console.log(`🔑 Checksum SHA-256: ${checksum.slice(0, 16)}...`);
console.log('======================================================\n');

try {
  const response = await fetch('http://localhost:3000/api/webhooks/wompi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (response.ok) {
    console.log(`📡 Respuesta del servidor (HTTP ${response.status}):`);
    console.log(JSON.stringify(data, null, 2));

    if (isDeclined) {
      console.log(
        '\n❌ [Rechazado]: Mira tu navegador. La pantalla de espera cambiará en segundos mostrando el motivo del rechazo.\n'
      );
    } else {
      console.log(
        '\n🎉 [Aprobado]: Mira tu navegador. La pantalla cambiará a verde "¡Pago completado con éxito!" en segundos.\n'
      );
    }
  } else {
    console.log(`🛡️ Respuesta esperada de seguridad (HTTP ${response.status}):`);
    console.log(JSON.stringify(data, null, 2));
    console.log(
      '\n🔒 [Protección activa]: La firma no coincide. El servidor bloqueó la petición y mantuvo la transacción intacta.\n'
    );
  }
} catch (err) {
  console.error('\n❌ No se pudo conectar con http://localhost:3000');
  console.error('Asegúrate de que la aplicación esté corriendo con "pnpm dev".');
  console.error(err.message);
}
