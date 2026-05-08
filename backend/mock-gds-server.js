/**
 * Mock GDS Server — simulates Amadeus / Sabre / Galileo APIs
 * Run: node mock-gds-server.js
 * Port: 4000
 *
 * All endpoints return realistic shaped data so your Search &
 * Core Booking services can be built and tested without real credentials.
 */

const express = require('express');
const crypto  = require('crypto');
const app     = express();
app.use(express.json());

// ─── In-memory stores ────────────────────────────────────────────────────────
const pnrs     = {};   // { [pnrCode]: pnrObject }
const tickets  = {};   // { [ticketNumber]: ticketObject }

// ─── Helpers ─────────────────────────────────────────────────────────────────
const randomId    = () => crypto.randomBytes(4).toString('hex').toUpperCase();
const randomPNR   = () => Math.random().toString(36).substring(2, 8).toUpperCase();
const randomTicket = () => '220' + Math.floor(Math.random() * 9000000000 + 1000000000);
const futureDate  = (days) => {
  const d = new Date(); d.setDate(d.getDate() + days);
  return d.toISOString();
};

// ─── Static seed data ─────────────────────────────────────────────────────────
const AIRLINES = {
  BG: 'Biman Bangladesh Airlines',
  EK: 'Emirates',
  QR: 'Qatar Airways',
  TK: 'Turkish Airlines',
  SQ: 'Singapore Airlines',
};

const AIRPORTS = {
  DAC: { city: 'Dhaka',      name: 'Hazrat Shahjalal International' },
  DXB: { city: 'Dubai',      name: 'Dubai International' },
  DOH: { city: 'Doha',       name: 'Hamad International' },
  IST: { city: 'Istanbul',   name: 'Istanbul Airport' },
  LHR: { city: 'London',     name: 'Heathrow' },
  SIN: { city: 'Singapore',  name: 'Changi' },
  JFK: { city: 'New York',   name: 'John F. Kennedy' },
};

// Builds a realistic flight offer object
function buildOffer({ origin, destination, departureDate, adults, cabin = 'ECONOMY', index = 0 }) {
  const carriers = Object.keys(AIRLINES);
  const carrier  = carriers[index % carriers.length];
  const depHour  = 6 + (index * 3) % 18;
  const duration = Math.floor(Math.random() * 4 + 3); // 3–7h
  const depAt    = `${departureDate}T${String(depHour).padStart(2,'0')}:00:00`;
  const arrDate  = new Date(`${departureDate}T${String(depHour).padStart(2,'0')}:00:00`);
  arrDate.setHours(arrDate.getHours() + duration);
  const arrAt    = arrDate.toISOString().slice(0,19);

  const basePrice = 150 + index * 40 + Math.floor(Math.random() * 50);
  const tax       = Math.floor(basePrice * 0.18);
  const total     = (basePrice + tax) * adults;

  const offerId = randomId();

  return {
    id: offerId,
    source: 'GDS',
    carrier,
    carrierName: AIRLINES[carrier],
    itineraries: [{
      duration: `PT${duration}H0M`,
      segments: [{
        id: randomId(),
        departure: { iataCode: origin,      at: depAt },
        arrival:   { iataCode: destination, at: arrAt },
        carrierCode: carrier,
        number: String(100 + index * 7),
        aircraft: { code: '77W' },
        duration: `PT${duration}H0M`,
        numberOfStops: 0,
      }],
    }],
    price: {
      currency: 'USD',
      base: String(basePrice * adults),
      taxes: String(tax * adults),
      total: String(total),
      perAdult: String(basePrice + tax),
    },
    pricingOptions: { fareType: ['PUBLISHED'], includedCheckedBagsOnly: true },
    travelerPricings: [{
      travelerId: '1',
      fareOption: 'STANDARD',
      travelerType: 'ADULT',
      price: { currency: 'USD', total: String(basePrice + tax) },
      fareDetailsBySegment: [{
        segmentId: '1',
        cabin,
        fareBasis: `${cabin[0]}OW`,
        brandedFare: cabin,
        includedCheckedBags: { quantity: cabin === 'ECONOMY' ? 1 : 2 },
      }],
    }],
  };
}

// ════════════════════════════════════════════════════════════════════════════
// 1. AUTH — token endpoint (Amadeus uses OAuth2 client_credentials)
// ════════════════════════════════════════════════════════════════════════════
app.post('/v1/security/oauth2/token', (req, res) => {
  const { client_id, client_secret, grant_type } = req.body;
  if (!client_id || !client_secret || grant_type !== 'client_credentials') {
    return res.status(400).json({ error: 'invalid_client' });
  }
  res.json({
    type: 'amadeusOAuth2Token',
    username: 'mock@ota.com',
    application_name: 'MockOTA',
    client_id,
    token_type: 'Bearer',
    access_token: 'mock_access_token_' + randomId(),
    expires_in: 1799,
    state: 'approved',
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 2. FLIGHT SEARCH
// GET /v2/shopping/flight-offers
// ════════════════════════════════════════════════════════════════════════════
app.get('/v2/shopping/flight-offers', (req, res) => {
  const {
    originLocationCode,
    destinationLocationCode,
    departureDate,
    adults = 1,
    travelClass = 'ECONOMY',
    returnDate,
    max = 5,
  } = req.query;

  if (!originLocationCode || !destinationLocationCode || !departureDate) {
    return res.status(400).json({
      errors: [{ code: 32171, title: 'MANDATORY DATA MISSING', detail: 'originLocationCode, destinationLocationCode, departureDate are required' }],
    });
  }

  const offers = Array.from({ length: Number(max) }, (_, i) =>
    buildOffer({
      origin: originLocationCode,
      destination: destinationLocationCode,
      departureDate,
      adults: Number(adults),
      cabin: travelClass,
      index: i,
    })
  );

  res.json({
    meta: { count: offers.length, links: { self: req.originalUrl } },
    data: offers,
    dictionaries: {
      locations: {
        [originLocationCode]:      AIRPORTS[originLocationCode]      || { city: originLocationCode },
        [destinationLocationCode]: AIRPORTS[destinationLocationCode] || { city: destinationLocationCode },
      },
      carriers: AIRLINES,
      aircraft: { '77W': 'Boeing 777-300ER', '32A': 'Airbus A320' },
    },
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 3. FARE RULES
// GET /v1/shopping/flight-offers/prediction  (simplified)
// ════════════════════════════════════════════════════════════════════════════
app.get('/v1/shopping/flight-offers/:offerId/fare-rules', (req, res) => {
  res.json({
    data: {
      offerId: req.params.offerId,
      fareRules: {
        currency: 'USD',
        rules: [
          { category: 'REFUND',      maxPenaltyAmount: '150.00', applicable: true,  refundable: true },
          { category: 'EXCHANGE',    maxPenaltyAmount: '100.00', applicable: true,  refundable: false },
          { category: 'REVALIDATION',maxPenaltyAmount: '0.00',   applicable: false, refundable: false },
        ],
      },
    },
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 4. PRICE VERIFICATION (fare lock before booking)
// POST /v1/shopping/flight-offers/pricing
// ════════════════════════════════════════════════════════════════════════════
app.post('/v1/shopping/flight-offers/pricing', (req, res) => {
  const offer = req.body?.data?.flightOffers?.[0];
  if (!offer) {
    return res.status(400).json({ errors: [{ title: 'flightOffers required' }] });
  }

  // Simulate 10% chance of price change
  const priceChanged = Math.random() < 0.1;
  if (priceChanged) {
    const newTotal = (parseFloat(offer.price.total) * 1.05).toFixed(2);
    offer.price.total = newTotal;
  }

  res.json({
    data: {
      type: 'flight-offers-pricing',
      flightOffers: [{ ...offer, priceVerified: true, priceChanged }],
    },
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 5. SEAT MAP
// GET /v1/catalog/availability/seat-maps
// ════════════════════════════════════════════════════════════════════════════
app.get('/v1/catalog/availability/seat-maps', (req, res) => {
  const buildRow = (rowNum, cabinClass) => {
    const cols = cabinClass === 'BUSINESS' ? ['A','C','D','F'] : ['A','B','C','D','E','F'];
    return {
      number: String(rowNum),
      travelClass: cabinClass,
      seats: cols.map(col => ({
        number: `${rowNum}${col}`,
        column: col,
        characteristicsCodes: col === 'A' || col === 'F' ? ['W'] : col === 'C' || col === 'D' ? ['A'] : ['MS'],
        travelerPricing: [{
          seatAvailabilityStatus: Math.random() > 0.3 ? 'AVAILABLE' : 'OCCUPIED',
          price: { currency: 'USD', total: cabinClass === 'BUSINESS' ? '85.00' : '25.00' },
        }],
      })),
    };
  };

  const businessRows = Array.from({ length: 4 },  (_, i) => buildRow(i + 1,  'BUSINESS'));
  const economyRows  = Array.from({ length: 30 }, (_, i) => buildRow(i + 10, 'ECONOMY'));

  res.json({
    meta: { count: 1 },
    data: [{
      type: 'seat-map',
      flightOfferXml: null,
      segmentId: '1',
      aircraft: { code: '77W' },
      cabins: [
        { number: 1, name: 'BUSINESS', rows: { firstRow: 1,  lastRow: 4,  detail: businessRows } },
        { number: 2, name: 'ECONOMY',  rows: { firstRow: 10, lastRow: 39, detail: economyRows } },
      ],
    }],
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 6. CREATE PNR (HOLD BOOKING)
// POST /v1/booking/flight-orders
// ════════════════════════════════════════════════════════════════════════════
app.post('/v1/booking/flight-orders', (req, res) => {
  const { flightOffers, travelers, contacts } = req.body?.data || {};

  if (!flightOffers || !travelers) {
    return res.status(400).json({ errors: [{ title: 'flightOffers and travelers required' }] });
  }

  const pnrCode = randomPNR();
  const orderId = 'ORDER_' + randomId();

  const pnr = {
    id: orderId,
    pnrCode,
    status: 'HELD',
    createdAt: new Date().toISOString(),
    expiresAt: futureDate(1),  // hold expires in 24h
    flightOffers,
    travelers,
    contacts: contacts || [],
    associatedRecords: [{ reference: pnrCode, originSystemCode: 'GDS' }],
  };

  pnrs[pnrCode] = pnr;

  res.status(201).json({ data: pnr });
});

// ════════════════════════════════════════════════════════════════════════════
// 7. RETRIEVE PNR
// GET /v1/booking/flight-orders/:orderId
// ════════════════════════════════════════════════════════════════════════════
app.get('/v1/booking/flight-orders/:orderId', (req, res) => {
  const pnr = Object.values(pnrs).find(p => p.id === req.params.orderId);
  if (!pnr) return res.status(404).json({ errors: [{ title: 'PNR not found' }] });
  res.json({ data: pnr });
});

// ════════════════════════════════════════════════════════════════════════════
// 8. CANCEL PNR
// DELETE /v1/booking/flight-orders/:orderId
// ════════════════════════════════════════════════════════════════════════════
app.delete('/v1/booking/flight-orders/:orderId', (req, res) => {
  const pnr = Object.values(pnrs).find(p => p.id === req.params.orderId);
  if (!pnr) return res.status(404).json({ errors: [{ title: 'PNR not found' }] });

  if (pnr.status === 'TICKETED') {
    return res.status(400).json({ errors: [{ title: 'Cannot cancel ticketed order — use void or refund' }] });
  }

  pnr.status    = 'CANCELLED';
  pnr.cancelledAt = new Date().toISOString();

  res.status(200).json({ data: { id: pnr.id, status: 'CANCELLED' } });
});

// ════════════════════════════════════════════════════════════════════════════
// 9. ISSUE TICKET (PNR → E-Ticket)
// POST /v1/booking/flight-orders/:orderId/tickets
// ════════════════════════════════════════════════════════════════════════════
app.post('/v1/booking/flight-orders/:orderId/tickets', (req, res) => {
  const pnr = Object.values(pnrs).find(p => p.id === req.params.orderId);
  if (!pnr) return res.status(404).json({ errors: [{ title: 'PNR not found' }] });
  if (pnr.status === 'CANCELLED') return res.status(400).json({ errors: [{ title: 'PNR is cancelled' }] });
  if (pnr.status === 'TICKETED')  return res.status(400).json({ errors: [{ title: 'Already ticketed' }] });

  const etickets = (pnr.travelers || []).map(t => {
    const num = randomTicket();
    const ticket = {
      number: num,
      pnrCode: pnr.pnrCode,
      travelerId: t.id,
      passengerName: `${t.name?.firstName} ${t.name?.lastName}`,
      status: 'ISSUED',
      issuedAt: new Date().toISOString(),
      couponStatus: 'OK',
      flightCoupons: pnr.flightOffers?.[0]?.itineraries?.[0]?.segments?.map(seg => ({
        originDestination: `${seg.departure.iataCode}-${seg.arrival.iataCode}`,
        departure: seg.departure,
        arrival: seg.arrival,
        carrier: seg.carrierCode,
        flightNumber: seg.number,
        couponStatus: 'OK',
      })) || [],
    };
    tickets[num] = ticket;
    return ticket;
  });

  pnr.status    = 'TICKETED';
  pnr.etickets  = etickets;
  pnr.ticketedAt = new Date().toISOString();

  res.status(201).json({ data: { orderId: pnr.id, pnrCode: pnr.pnrCode, etickets } });
});

// ════════════════════════════════════════════════════════════════════════════
// 10. VOID TICKET (same BSP day cancellation)
// POST /v1/booking/tickets/:ticketNumber/void
// ════════════════════════════════════════════════════════════════════════════
app.post('/v1/booking/tickets/:ticketNumber/void', (req, res) => {
  const ticket = tickets[req.params.ticketNumber];
  if (!ticket) return res.status(404).json({ errors: [{ title: 'Ticket not found' }] });
  if (ticket.status === 'VOIDED') return res.status(400).json({ errors: [{ title: 'Already voided' }] });

  // Void only allowed same day
  const issuedAt  = new Date(ticket.issuedAt);
  const now       = new Date();
  const sameDay   = issuedAt.toDateString() === now.toDateString();
  if (!sameDay) {
    return res.status(400).json({ errors: [{ title: 'Void period expired — use refund instead' }] });
  }

  ticket.status  = 'VOIDED';
  ticket.voidedAt = now.toISOString();

  res.json({ data: { ticketNumber: ticket.number, status: 'VOIDED', refundAmount: 'FULL' } });
});

// ════════════════════════════════════════════════════════════════════════════
// 11. REISSUE TICKET (flight change after ticketing)
// POST /v1/booking/tickets/:ticketNumber/reissue
// ════════════════════════════════════════════════════════════════════════════
app.post('/v1/booking/tickets/:ticketNumber/reissue', (req, res) => {
  const ticket = tickets[req.params.ticketNumber];
  if (!ticket) return res.status(404).json({ errors: [{ title: 'Ticket not found' }] });

  const { newFlightOffer, fareDifference } = req.body;
  const newTicketNumber = randomTicket();
  const newTicket = {
    ...ticket,
    number: newTicketNumber,
    status: 'REISSUED',
    reissuedFrom: ticket.number,
    reissuedAt: new Date().toISOString(),
    fareDifference: fareDifference || '0.00',
    flightCoupons: newFlightOffer?.itineraries?.[0]?.segments?.map(seg => ({
      originDestination: `${seg.departure.iataCode}-${seg.arrival.iataCode}`,
      departure: seg.departure,
      arrival: seg.arrival,
      carrier: seg.carrierCode,
      flightNumber: seg.number,
      couponStatus: 'OK',
    })) || ticket.flightCoupons,
  };

  ticket.status      = 'EXCHANGED';
  tickets[newTicketNumber] = newTicket;

  res.json({ data: { oldTicket: ticket.number, newTicket: newTicketNumber, fareDifference: fareDifference || '0.00' } });
});

// ════════════════════════════════════════════════════════════════════════════
// 12. REFUND TICKET
// POST /v1/booking/tickets/:ticketNumber/refund
// ════════════════════════════════════════════════════════════════════════════
app.post('/v1/booking/tickets/:ticketNumber/refund', (req, res) => {
  const ticket = tickets[req.params.ticketNumber];
  if (!ticket) return res.status(404).json({ errors: [{ title: 'Ticket not found' }] });
  if (['VOIDED','REFUNDED'].includes(ticket.status)) {
    return res.status(400).json({ errors: [{ title: `Ticket already ${ticket.status.toLowerCase()}` }] });
  }

  const penalty    = parseFloat(req.body.penalty || '150.00');
  const baseAmount = parseFloat(req.body.originalAmount || '300.00');
  const refundAmt  = Math.max(0, baseAmount - penalty).toFixed(2);

  ticket.status    = 'REFUNDED';
  ticket.refundedAt = new Date().toISOString();

  res.json({
    data: {
      ticketNumber: ticket.number,
      status: 'REFUNDED',
      originalAmount: String(baseAmount),
      penalty: String(penalty),
      refundAmount: refundAmt,
      currency: 'USD',
      processingDays: 7,
    },
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 13. FLIGHT SCHEDULES
// GET /v2/schedule/flights
// ════════════════════════════════════════════════════════════════════════════
app.get('/v2/schedule/flights', (req, res) => {
  const { carrierCode, flightNumber, scheduledDepartureDate } = req.query;

  res.json({
    meta: { count: 1 },
    data: [{
      type: 'flight',
      scheduledDepartureDate,
      flightDesignator: { carrierCode, flightNumber },
      flightPoints: [
        { iataCode: 'DAC', departure: { timings: [{ qualifier: 'STD', value: `${scheduledDepartureDate}T08:00:00` }] } },
        { iataCode: 'DXB', arrival:   { timings: [{ qualifier: 'STA', value: `${scheduledDepartureDate}T11:30:00` }] } },
      ],
      segments: [{ boardPointIataCode: 'DAC', offPointIataCode: 'DXB', scheduledSegmentDuration: 'PT3H30M' }],
      legs: [{ boardPointIataCode: 'DAC', offPointIataCode: 'DXB', aircraftEquipment: { aircraftType: '77W' } }],
    }],
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 14. FLIGHT STATUS (real-time)
// GET /v2/airport/predictions/on-time
// ════════════════════════════════════════════════════════════════════════════
app.get('/v2/flight/status', (req, res) => {
  const { carrierCode, flightNumber, scheduledDepartureDate } = req.query;
  const statuses = ['ON_TIME', 'DELAYED', 'CANCELLED', 'BOARDING', 'DEPARTED'];
  const status   = statuses[Math.floor(Math.random() * statuses.length)];

  res.json({
    data: [{
      flightDesignator: { carrierCode, flightNumber },
      scheduledDepartureDate,
      status,
      delayMinutes: status === 'DELAYED' ? Math.floor(Math.random() * 120 + 15) : 0,
      departure: { iataCode: 'DAC', terminal: '1', gate: 'A12' },
      arrival:   { iataCode: 'DXB', terminal: '3', gate: 'C8' },
    }],
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 15. ANCILLARIES — extra baggage, meals, SSR
// POST /v1/shopping/flight-offers/upselling
// ════════════════════════════════════════════════════════════════════════════
app.post('/v1/shopping/flight-offers/upselling', (req, res) => {
  const offer = req.body?.data?.flightOffers?.[0];
  if (!offer) return res.status(400).json({ errors: [{ title: 'flightOffers required' }] });

  res.json({
    data: {
      type: 'flight-offers-upselling',
      flightOffers: [offer],
      ancillaries: [
        { type: 'EXTRA_BAGGAGE', quantity: 1, weight: '23KG',  price: { total: '45.00', currency: 'USD' } },
        { type: 'EXTRA_BAGGAGE', quantity: 1, weight: '32KG',  price: { total: '70.00', currency: 'USD' } },
        { type: 'MEAL',          code: 'VGML', description: 'Vegetarian Meal',    price: { total: '0.00', currency: 'USD' } },
        { type: 'MEAL',          code: 'HNML', description: 'Hindu Non-Veg Meal', price: { total: '0.00', currency: 'USD' } },
        { type: 'MEAL',          code: 'KSML', description: 'Kosher Meal',        price: { total: '0.00', currency: 'USD' } },
        { type: 'SSR',           code: 'WCHR', description: 'Wheelchair',         price: { total: '0.00', currency: 'USD' } },
        { type: 'SSR',           code: 'INFT', description: 'Infant in Arms',     price: { total: '30.00', currency: 'USD' } },
      ],
    },
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 16. GET TICKET (retrieve issued ticket)
// GET /v1/booking/tickets/:ticketNumber
// ════════════════════════════════════════════════════════════════════════════
app.get('/v1/booking/tickets/:ticketNumber', (req, res) => {
  const ticket = tickets[req.params.ticketNumber];
  if (!ticket) return res.status(404).json({ errors: [{ title: 'Ticket not found' }] });
  res.json({ data: ticket });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n🛫  Mock GDS Server running on http://localhost:${PORT}`);
  console.log('\nAvailable endpoints:');
  console.log('  POST   /v1/security/oauth2/token');
  console.log('  GET    /v2/shopping/flight-offers');
  console.log('  GET    /v1/shopping/flight-offers/:offerId/fare-rules');
  console.log('  POST   /v1/shopping/flight-offers/pricing');
  console.log('  GET    /v1/catalog/availability/seat-maps');
  console.log('  POST   /v1/booking/flight-orders');
  console.log('  GET    /v1/booking/flight-orders/:orderId');
  console.log('  DELETE /v1/booking/flight-orders/:orderId');
  console.log('  POST   /v1/booking/flight-orders/:orderId/tickets');
  console.log('  POST   /v1/booking/tickets/:ticketNumber/void');
  console.log('  POST   /v1/booking/tickets/:ticketNumber/reissue');
  console.log('  POST   /v1/booking/tickets/:ticketNumber/refund');
  console.log('  GET    /v2/schedule/flights');
  console.log('  GET    /v2/flight/status');
  console.log('  POST   /v1/shopping/flight-offers/upselling');
  console.log('  GET    /v1/booking/tickets/:ticketNumber\n');
});
