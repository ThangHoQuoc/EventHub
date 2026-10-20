import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { QRCode } from '../src/components/ui/QRCode.tsx';

test('different issued ticket payloads produce different scannable QR symbols', () => {
  const first = renderToStaticMarkup(React.createElement(QRCode, {value:'eventhub:ticket:abc-123'}));
  const second = renderToStaticMarkup(React.createElement(QRCode, {value:'eventhub:ticket:def-456'}));
  assert.notEqual(first, second);
  assert.match(first, /<svg/);
});
test('missing payload never renders a decorative code as a real ticket', () => {
  const html = renderToStaticMarkup(React.createElement(QRCode));
  assert.doesNotMatch(html, /role="img"/);
});
