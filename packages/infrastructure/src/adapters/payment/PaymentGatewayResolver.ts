/**
 * @file PaymentGatewayResolver.ts
 * @description Dynamic resolver for payment gateway adapters supporting multi-provider architecture.
 */

import type { PaymentGatewayPort } from '@go-agree/application';

export class PaymentGatewayResolver {
  private readonly gateways: Map<string, PaymentGatewayPort> = new Map();

  constructor(initialGateways: PaymentGatewayPort[] = []) {
    for (const gw of initialGateways) {
      this.register(gw);
    }
  }

  register(gateway: PaymentGatewayPort): void {
    this.gateways.set(gateway.providerId.toLowerCase(), gateway);
  }

  resolve(providerId: string): PaymentGatewayPort {
    const gateway = this.gateways.get(providerId.toLowerCase());
    if (!gateway) {
      throw new Error(`Proveedor de pago no soportado o no configurado: ${providerId}`);
    }
    return gateway;
  }

  has(providerId: string): boolean {
    return this.gateways.has(providerId.toLowerCase());
  }
}
