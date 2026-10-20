import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getPublicEvents } from '../src/api/events.ts';
test('public event requests do not send a stored session token', async () => {
  globalThis.localStorage={getItem:()=> 'expired-test-token'};
  globalThis.fetch=async (url, options) => {
    assert.equal(options.headers.get('Authorization'),null);
    return Response.json({code:1000,result:{content:[],totalPages:0,totalElements:0}});
  };
  assert.deepEqual((await getPublicEvents()).content,[]);
});
