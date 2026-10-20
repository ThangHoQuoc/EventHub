import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canActOnOffer, offerStatusLabel } from '../src/utils/waitlistState.ts';

test('converted offer remains converted and links to booking rather than skipped', () => {
  assert.equal(offerStatusLabel('CONVERTED_TO_BOOKING'), 'Đã tạo đơn');
  assert.equal(canActOnOffer({status:'CONVERTED_TO_BOOKING',expiresAt:'2026-10-21T00:00:00Z'}, Date.parse('2026-10-20T00:00:00Z')),false);
});
test('only an unexpired CREATED offer can be acted on', () => {
  const now = Date.parse('2026-10-20T00:00:00Z');
  assert.equal(canActOnOffer({status:'CREATED',expiresAt:'2026-10-20T00:00:00Z'},now),false);
  assert.equal(canActOnOffer({status:'CREATED',expiresAt:'2026-10-20T00:01:00Z'},now),true);
});
