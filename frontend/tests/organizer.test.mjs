import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eventUpdatePayload } from '../src/utils/organizerState.ts';
const form={title:'Updated',description:'Description',location:'Huế',thumbnailUrl:'',category:'Tech',startAt:'2026-12-01T00:00:00Z',endAt:'2026-12-02T00:00:00Z'};
test('published event updates exclude dates, thumbnail and category rejected or ignored by backend', () => {
  assert.deepEqual(eventUpdatePayload({status:'PUBLISHED'},form),{title:'Updated',description:'Description',location:'Huế'});
});
test('closed events cannot be submitted for update', () => {
  assert.throws(() => eventUpdatePayload({status:'COMPLETED'},form));
  assert.throws(() => eventUpdatePayload({status:'CANCELLED'},form));
});
