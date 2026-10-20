import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getEventTicketTypes, mapDtoToEvent } from '../src/api/events.ts';

globalThis.localStorage = { getItem: () => null };

test('ticket type request preserves authentication errors instead of reporting an empty inventory', async () => {
  globalThis.fetch = async () => Response.json({ code: 1006, message: 'Unauthorized' }, { status: 401 });
  await assert.rejects(getEventTicketTypes('event-1'), { status: 401 });
});

test('a public event without ticket data does not claim a free ticket or available stock', () => {
  const event = mapDtoToEvent({ id: 'event-1', title: 'Concert', location: 'Huế', status: 'PUBLISHED' });
  assert.equal(event.priceKnown, false);
  assert.equal(event.ticketAvailability, 'UNKNOWN');
  assert.equal(event.city, '');
});
