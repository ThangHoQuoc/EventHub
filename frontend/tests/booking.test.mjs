import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bookingStatusLabel, paymentResultStatus, readSelection } from '../src/utils/bookingState.ts';

test('confirmed, pending, expired and cancelled bookings retain server status', () => {
  assert.equal(paymentResultStatus('CONFIRMED'), 'success');
  assert.equal(paymentResultStatus('PENDING_PAYMENT'), 'processing');
  assert.equal(paymentResultStatus('EXPIRED'), 'failed');
  assert.equal(bookingStatusLabel('PENDING_PAYMENT'), 'Chờ xác nhận thanh toán');
});
test('unknown or absent status never means payment success', () => {
  assert.equal(paymentResultStatus(undefined), 'processing');
  assert.equal(paymentResultStatus('UNRECOGNIZED'), 'processing');
});
test('checkout rejects missing IDs, non-integer or invalid quantities', () => {
  assert.equal(readSelection(new URLSearchParams('eventId=e&ticketTypeId=t&quantity=1.5')), null);
  assert.equal(readSelection(new URLSearchParams('eventId=e&quantity=1')), null);
  assert.deepEqual(readSelection(new URLSearchParams('eventId=e&ticketTypeId=t&quantity=2')), {eventId:'e',ticketTypeId:'t',quantity:2});
});
