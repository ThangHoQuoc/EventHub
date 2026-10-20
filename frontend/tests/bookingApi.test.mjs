import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBookingApi, cancelBookingApi } from '../src/api/booking.ts';
import { confirmPaymentApi } from '../src/api/payments.ts';
globalThis.localStorage = { getItem: () => 'test-token' };

test('booking API sends selected ticket quantity and preserves the server amount/status', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/v1/bookings');
    assert.deepEqual(JSON.parse(options.body), {items:[{ticketTypeId:'type-1',quantity:2}]});
    return Response.json({result:{id:'booking-1',status:'PENDING_PAYMENT',totalAmount:246},code:1000});
  };
  const result = await createBookingApi({items:[{ticketTypeId:'type-1',quantity:2}]});
  assert.equal(result.totalAmount,246);
  assert.equal(result.status,'PENDING_PAYMENT');
});
test('failed cancellation does not return a fake cancelled booking', async () => {
  globalThis.fetch = async () => Response.json({message:'Already confirmed'}, {status:400});
  await assert.rejects(cancelBookingApi('booking-1'), {status:400});
});
test('manual confirmation sends reference only and uses amount calculated by backend', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/v1/payments/confirm');
    assert.deepEqual(JSON.parse(options.body), {bookingId:'booking-1',provider:'MANUAL',providerTransactionId:'test-ref'});
    return Response.json({code:1000,result:{bookingId:'booking-1',amount:246,bookingStatus:'CONFIRMED'}});
  };
  assert.equal((await confirmPaymentApi({bookingId:'booking-1',provider:'MANUAL',providerTransactionId:'test-ref'})).bookingStatus,'CONFIRMED');
});
