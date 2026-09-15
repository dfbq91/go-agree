import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import type { CorrelationContext, CorrelationContextPort } from '@go-agree/application';

export class CorrelationStorage implements CorrelationContextPort {
  private readonly storage = new AsyncLocalStorage<CorrelationContext>();

  getContext(): CorrelationContext | undefined {
    return this.storage.getStore();
  }

  getCorrelationId(): string {
    const store = this.storage.getStore();
    return store?.correlationId ?? randomUUID();
  }

  setUserId(userId: string): void {
    const store = this.storage.getStore();
    if (store) {
      store.userId = userId;
    }
  }

  setContractId(contractId: string): void {
    const store = this.storage.getStore();
    if (store) {
      store.contractId = contractId;
    }
  }

  runWithContext<T>(context: CorrelationContext, fn: () => Promise<T>): Promise<T> {
    return this.storage.run(context, fn);
  }
}

export const correlationStorage = new CorrelationStorage();
