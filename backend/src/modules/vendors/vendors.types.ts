export type VendorName = 'gds' | 'sabre';

export interface TravelVendorProvider {
  readonly name: VendorName;
  getToken(body: unknown): Promise<unknown>;
  searchFlightOffers(query: unknown): Promise<unknown>;
  getFareRules(offerId: string): Promise<unknown>;
  verifyPrice(body: unknown): Promise<unknown>;
  getSeatMap(offerId: string): Promise<unknown>;
  getFlightSchedule(query: unknown): Promise<unknown>;
  getFlightStatus(query: unknown): Promise<unknown>;
  getAncillaries(body: unknown): Promise<unknown>;
  createFlightOrder(body: unknown): Promise<unknown>;
  getFlightOrder(orderId: string): Promise<unknown>;
  cancelFlightOrder(orderId: string): Promise<unknown>;
  issueTicket(orderId: string): Promise<unknown>;
  getTicket(ticketNumber: string): Promise<unknown>;
  voidTicket(ticketNumber: string): Promise<unknown>;
  reissueTicket(ticketNumber: string, body: unknown): Promise<unknown>;
  refundTicket(ticketNumber: string, body: unknown): Promise<unknown>;
}
