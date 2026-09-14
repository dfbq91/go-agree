/**
 * @file SupabaseSubscriptionRepository.ts
 * @description Supabase implementation of SubscriptionRepositoryPort.
 */

import type {
  SubscriptionRepositoryPort,
  UserSubscriptionDTO,
} from '@go-agree/application';
import { UserSubscription, UserId } from '@go-agree/domain';
import type { SupabaseClient } from '@supabase/supabase-js';

interface UserSubscriptionRow {
  id: string;
  user_id: string;
  plan_type: 'free' | 'pro';
  status: 'active' | 'expired';
  free_contracts_used: number;
  started_at: string;
  expires_at: string | null;
  current_period_billing_cycle: 'monthly' | 'annual' | null;
  last_payment_transaction_id: string | null;
  created_at?: string;
  updated_at?: string;
}

export class SupabaseSubscriptionRepository implements SubscriptionRepositoryPort {
  constructor(private readonly supabase: SupabaseClient) {}

  private mapRowToDTO(row: UserSubscriptionRow): UserSubscriptionDTO {
    return {
      id: row.id,
      userId: row.user_id,
      planType: row.plan_type,
      status: row.status,
      freeContractsUsed: row.free_contracts_used,
      startedAt: row.started_at,
      expiresAt: row.expires_at,
      currentPeriodBillingCycle: row.current_period_billing_cycle,
      lastPaymentTransactionId: row.last_payment_transaction_id,
    };
  }

  async getByUserId(userId: string): Promise<UserSubscriptionDTO> {
    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch subscription for user ${userId}: ${error.message}`);
    }

    if (!data) {
      // Create initial free subscription using domain entity defaults
      const defaultSub = UserSubscription.createDefaultFree(new UserId(userId));
      const dto: UserSubscriptionDTO = {
        id: defaultSub.id,
        userId: defaultSub.userId.value,
        planType: defaultSub.planType,
        status: defaultSub.status,
        freeContractsUsed: defaultSub.freeContractsUsed,
        startedAt: defaultSub.startedAt.toISOString(),
        expiresAt: defaultSub.expiresAt ? defaultSub.expiresAt.toISOString() : null,
        currentPeriodBillingCycle: defaultSub.currentPeriodBillingCycle,
        lastPaymentTransactionId: defaultSub.lastPaymentTransactionId,
      };

      try {
        await this.save(dto);
      } catch {
        // Fallback in-memory return if concurrent insert or permission limitation
      }

      return dto;
    }

    // Reconstitute domain entity to leverage domain business rules
    const row = data as UserSubscriptionRow;
    const subscription = UserSubscription.reconstitute({
      id: row.id,
      userId: new UserId(row.user_id),
      planType: row.plan_type,
      status: row.status,
      freeContractsUsed: row.free_contracts_used,
      startedAt: new Date(row.started_at),
      expiresAt: row.expires_at ? new Date(row.expires_at) : null,
      currentPeriodBillingCycle: row.current_period_billing_cycle,
      lastPaymentTransactionId: row.last_payment_transaction_id,
    });

    // Check if Pro subscription expired using the domain method
    if (subscription.isExpired()) {
      const expiredSub = subscription.revertToExpired();
      const updatedDTO: UserSubscriptionDTO = {
        id: expiredSub.id,
        userId: expiredSub.userId.value,
        planType: expiredSub.planType,
        status: expiredSub.status,
        freeContractsUsed: expiredSub.freeContractsUsed,
        startedAt: expiredSub.startedAt.toISOString(),
        expiresAt: expiredSub.expiresAt ? expiredSub.expiresAt.toISOString() : null,
        currentPeriodBillingCycle: expiredSub.currentPeriodBillingCycle,
        lastPaymentTransactionId: expiredSub.lastPaymentTransactionId,
      };

      await this.save(updatedDTO);
      return updatedDTO;
    }

    return this.mapRowToDTO(row);
  }

  async save(subscription: UserSubscriptionDTO): Promise<void> {
    const { error } = await this.supabase
      .from('user_subscriptions')
      .upsert({
        user_id: subscription.userId,
        plan_type: subscription.planType,
        status: subscription.status,
        free_contracts_used: subscription.freeContractsUsed,
        started_at: subscription.startedAt,
        expires_at: subscription.expiresAt,
        current_period_billing_cycle: subscription.currentPeriodBillingCycle,
        last_payment_transaction_id: subscription.lastPaymentTransactionId,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (error) {
      throw new Error(`Failed to save subscription for user ${subscription.userId}: ${error.message}`);
    }
  }

  async incrementFreeContractCount(userId: string): Promise<number> {
    const sub = await this.getByUserId(userId);
    const updatedCount = sub.freeContractsUsed + 1;

    const { error } = await this.supabase
      .from('user_subscriptions')
      .update({
        free_contracts_used: updatedCount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to increment free contract count for user ${userId}: ${error.message}`);
    }

    return updatedCount;
  }

  async activateProPlan(
    userId: string,
    billingCycle: 'monthly' | 'annual',
    expiresAt: Date,
    transactionId: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('user_subscriptions')
      .update({
        plan_type: 'pro',
        status: 'active',
        current_period_billing_cycle: billingCycle,
        expires_at: expiresAt.toISOString(),
        last_payment_transaction_id: transactionId,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to activate Pro plan for user ${userId}: ${error.message}`);
    }
  }

  async expireSubscriptions(now: Date = new Date()): Promise<number> {
    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .update({
        plan_type: 'free',
        status: 'expired',
        updated_at: new Date().toISOString(),
      })
      .eq('plan_type', 'pro')
      .lte('expires_at', now.toISOString())
      .select('id');

    if (error) {
      throw new Error(`Failed to expire subscriptions: ${error.message}`);
    }

    return data ? data.length : 0;
  }
}
