import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TicketTypeCard } from '../src/components/event/TicketTypeCard.tsx';
test('sold-out types remain selectable so customers can join the correct waitlist', () => {
  const html=renderToStaticMarkup(React.createElement(TicketTypeCard,{ticketType:{id:'type-2',name:'Sold out type',price:123,availableQuantity:0,status:'SOLD_OUT'},selected:false,onSelect:()=>{}}));
  assert.doesNotMatch(html,/disabled/);
});
