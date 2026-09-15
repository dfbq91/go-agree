/**
 * @file ListPaymentProvidersUseCase.ts
 * @description Use case for querying available payment gateways filtered by country.
 */

import {
  type CountryCode,
  type PaymentProviderInfo,
  PaymentProviderRegistry,
} from '@go-agree/domain';

export interface ListPaymentProvidersInput {
  readonly countryCode?: CountryCode;
}

export class ListPaymentProvidersUseCase {
  async execute(input: ListPaymentProvidersInput = {}): Promise<PaymentProviderInfo[]> {
    const country = input.countryCode ?? 'CO';
    return PaymentProviderRegistry.getProvidersForCountry(country);
  }
}
