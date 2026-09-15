import { AsyncLocalStorage } from 'node:async_hooks';
import type { CorrelationContext, CorrelationContextPort } from '@go-agree/application';
import { TYPE_ID_PREFIXES, ensureTypeId, generateTypeId } from '@go-agree/domain';

export class CorrelationStorage implements CorrelationContextPort {
  private readonly storage = new AsyncLocalStorage<CorrelationContext>();

  getContext(): CorrelationContext | undefined {
    return this.storage.getStore();
  }

  getCorrelationId(): string {
    const store = this.storage.getStore();
    return store?.correlationId ?? generateTypeId(TYPE_ID_PREFIXES.CORRELATION);
  }

  setUserId(userId: string): void {
    const store = this.storage.getStore();
    if (store) {
      store.userId = ensureTypeId(TYPE_ID_PREFIXES.USER, userId);
    }
  }

  setContractId(contractId: string): void {
    const store = this.storage.getStore();
    if (store) {
      store.contractId = ensureTypeId(TYPE_ID_PREFIXES.CONTRACT, contractId);
    }
  }

  runWithContext<T>(context: CorrelationContext, fn: () => Promise<T>): Promise<T> {
    return this.storage.run(context, fn);
  }
}

export const correlationStorage = new CorrelationStorage();
