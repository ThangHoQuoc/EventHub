import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterEvents } from '../src/utils/eventFilters.ts';

test('city and category combine instead of matching either group', () => {
  const events = [{title:'A',description:'',city:'Hà Nội',location:'Hà Nội',category:'Âm nhạc',tags:[],startAt:'2026-10-24T10:00:00Z'}, {title:'B',description:'',city:'TP.HCM',location:'TP.HCM',category:'Âm nhạc',tags:[],startAt:'2026-10-24T10:00:00Z'}];
  assert.deepEqual(filterEvents(events, '', ['Hà Nội', 'Âm nhạc'], new Date('2026-10-20T00:00:00Z')).map(e => e.title), ['A']);
});
test('weekend filtering uses dates rather than nonexistent event tags', () => {
  const event = {title:'A',description:'',city:'',location:'',category:'',tags:[],startAt:'2026-10-24T10:00:00Z'};
  assert.equal(filterEvents([event], '', ['Cuối tuần này'], new Date('2026-10-20T00:00:00Z')).length, 1);
});
