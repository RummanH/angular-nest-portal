import { Injectable } from '@nestjs/common';
import { SabreClientService } from '../../sabre/sabre-client.service';
import { TravelVendorProvider, VendorName } from '../vendors.types';

@Injectable()
export class SabreVendorProvider implements TravelVendorProvider {
  readonly name: VendorName = 'sabre';

  constructor(private readonly sabreClient: SabreClientService) {}

  getToken(body: unknown): Promise<unknown> {
    return this.sabreClient.post('/v1/security/oauth2/token', body);
  }

  searchFlightOffers(query: unknown): Promise<unknown> {
    return this.sabreClient.get(
      '/v2/shopping/flight-offers',
      query as Record<string, string | number | undefined>,
    );
  }

  getFareRules(offerId: string): Promise<unknown> {
    return this.sabreClient.get(
      `/v1/shopping/flight-offers/${offerId}/fare-rules`,
    );
  }

  verifyPrice(body: unknown): Promise<unknown> {
    return this.sabreClient.post('/v1/shopping/flight-offers/pricing', body);
  }

  getSeatMap(offerId: string): Promise<unknown> {
    return this.sabreClient.get('/v1/catalog/availability/seat-maps', {
      offerId,
    });
  }

  getFlightSchedule(query: unknown): Promise<unknown> {
    return this.sabreClient.get(
      '/v2/schedule/flights',
      query as Record<string, string | number | undefined>,
    );
  }

  getFlightStatus(query: unknown): Promise<unknown> {
    return this.sabreClient.get(
      '/v2/flight/status',
      query as Record<string, string | number | undefined>,
    );
  }

  getAncillaries(body: unknown): Promise<unknown> {
    return this.sabreClient.post('/v1/shopping/flight-offers/upselling', body);
  }

  createFlightOrder(body: unknown): Promise<unknown> {
    return this.sabreClient.post('/v1/booking/flight-orders', body);
  }

  getFlightOrder(orderId: string): Promise<unknown> {
    return this.sabreClient.get(`/v1/booking/flight-orders/${orderId}`);
  }

  cancelFlightOrder(orderId: string): Promise<unknown> {
    return this.sabreClient.delete(`/v1/booking/flight-orders/${orderId}`);
  }

  issueTicket(orderId: string): Promise<unknown> {
    return this.sabreClient.post(
      `/v1/booking/flight-orders/${orderId}/tickets`,
      {},
    );
  }

  getTicket(ticketNumber: string): Promise<unknown> {
    return this.sabreClient.get(`/v1/booking/tickets/${ticketNumber}`);
  }

  voidTicket(ticketNumber: string): Promise<unknown> {
    return this.sabreClient.post(
      `/v1/booking/tickets/${ticketNumber}/void`,
      {},
    );
  }

  reissueTicket(ticketNumber: string, body: unknown): Promise<unknown> {
    return this.sabreClient.post(
      `/v1/booking/tickets/${ticketNumber}/reissue`,
      body,
    );
  }

  refundTicket(ticketNumber: string, body: unknown): Promise<unknown> {
    return this.sabreClient.post(
      `/v1/booking/tickets/${ticketNumber}/refund`,
      body,
    );
  }
}
