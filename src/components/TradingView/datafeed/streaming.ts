// @ts-nocheck
import { parseResolution } from './helpers';
import { w3cwebsocket as W3CWebSocket } from './browser';
import { WS_URL } from '../../../constants/env';
import { WSOL } from '../../../constants';

const socket = new W3CWebSocket(
    WS_URL,
    'echo-protocol'
);

let subscriptionItem = null;

socket.onopen = () => {
    console.log('[WebSocket Client Connected]:==============================');
};

socket.onmessage = (message) => {
    const data = JSON.parse(message.data);
    if (!subscriptionItem || data.type !== 'PRICE_DATA' || !data.data) return;

    const tradeTime = data.unixTime * 1000;
    const lastDailyBar = subscriptionItem.lastDailyBar;
    const nextDailyBarTime = getNextDailyBarTime(lastDailyBar.time);

    const regex = /token\/(\w*)/g
    const matches = [...window.location.pathname.matchAll(regex)]
    const address = (matches.length > 0 && matches[0][1]) || WSOL.account;

    if (address.toLowerCase() !== data.data.address.toLowerCase()) return;

    let bar;
    if (tradeTime >= nextDailyBarTime) {
        bar = {
            time: nextDailyBarTime,
            open: data.data.o,
            high: data.data.h,
            low: data.data.l,
            close: data.data.c,
        };
        console.log('[socket] Generate new bar', bar);
    } else {
        bar = {
            ...lastDailyBar,
            high: Math.max(lastDailyBar.high, data.data.h),
            low: Math.min(lastDailyBar.low, data.data.l),
            close: data.data.c,
        };
        console.log('[socket] Update the latest bar by price');
    }
    subscriptionItem.lastDailyBar = bar;
    subscriptionItem.callback(bar);

    // send data to every subscriber of that symbol
    // subscriptionItem.handlers.forEach((handler) => handler.callback(bar));
};

// const channelToSubscription = new Map();

// socket.on('connect', () => {
//   console.log('[socket] Connected');
// });

// socket.on('disconnect', (reason) => {
//   console.log('[socket] Disconnected:', reason);
// });

// socket.on('error', (error) => {
//   console.log('[socket] Error:', error);
// });

// socket.on('m', (data) => {
//   console.log('[socket] Message:', data);
//   const [
//     eventTypeStr,
//     exchange,
//     fromSymbol,
//     toSymbol,
//     ,
//     ,
//     tradeTimeStr,
//     ,
//     tradePriceStr,
//   ] = data.split('~');

//   if (parseInt(eventTypeStr) !== 0) {
//     // skip all non-TRADE events
//     return;
//   }
//   const tradePrice = parseFloat(tradePriceStr);
//   const tradeTime = parseInt(tradeTimeStr);
//   const channelString = `0~${exchange}~${fromSymbol}~${toSymbol}`;
//   const subscriptionItem = channelToSubscription.get(channelString);
//   if (subscriptionItem === undefined) {
//     return;
//   }
//   const lastDailyBar = subscriptionItem.lastDailyBar;
//   const nextDailyBarTime = getNextDailyBarTime(lastDailyBar.time);

//   let bar;
//   if (tradeTime >= nextDailyBarTime) {
//     bar = {
//       time: nextDailyBarTime,
//       open: tradePrice,
//       high: tradePrice,
//       low: tradePrice,
//       close: tradePrice,
//     };
//     console.log('[socket] Generate new bar', bar);
//   } else {
//     bar = {
//       ...lastDailyBar,
//       high: Math.max(lastDailyBar.high, tradePrice),
//       low: Math.min(lastDailyBar.low, tradePrice),
//       close: tradePrice,
//     };
//     console.log('[socket] Update the latest bar by price', tradePrice);
//   }
//   subscriptionItem.lastDailyBar = bar;

//   // send data to every subscriber of that symbol
//   subscriptionItem.handlers.forEach((handler) => handler.callback(bar));
// });

function getNextDailyBarTime(barTime) {
    const date = new Date(barTime * 1000);
    date.setDate(date.getDate() + 1);
    return date.getTime() / 1000;
}

export function subscribeOnStream(
    symbolInfo,
    resolution,
    onRealtimeCallback,
    subscribeUID,
    onResetCacheNeededCallback,
    lastDailyBar
) {
    subscriptionItem = {
        callback: onRealtimeCallback,
        resolution,
        lastDailyBar,
    };

    const msg = {
        type: 'SUBSCRIBE_PRICE',
        data: {
            chartType: parseResolution(resolution),
            address: symbolInfo.address,
        },
    };

    socket.send(JSON.stringify(msg));
    // const parsedSymbol = parseFullSymbol(symbolInfo.full_name);
    // const channelString = `0~${parsedSymbol.exchange}~${parsedSymbol.fromSymbol}~${parsedSymbol.toSymbol}`;
    // const handler = {
    //   id: subscribeUID,
    //   callback: onRealtimeCallback,
    // };
    // let subscriptionItem = channelToSubscription.get(channelString);
    // if (subscriptionItem) {
    //   // already subscribed to the channel, use the existing subscription
    //   subscriptionItem.handlers.push(handler);
    //   return;
    // }
    // subscriptionItem = {
    //   subscribeUID,
    //   resolution,
    //   lastDailyBar,
    //   handlers: [handler],
    // };
    // channelToSubscription.set(channelString, subscriptionItem);
    // console.log(
    //   '[subscribeBars]: Subscribe to streaming. Channel:',
    //   channelString
    // );
    // socket.emit('SubAdd', { subs: [channelString] });
}

export function unsubscribeFromStream(subscriberUID) {
    // // find a subscription with id === subscriberUID
    // for (const channelString of channelToSubscription.keys()) {
    //   const subscriptionItem = channelToSubscription.get(channelString);
    //   const handlerIndex = subscriptionItem.handlers.findIndex(
    //     (handler) => handler.id === subscriberUID
    //   );
    //   if (handlerIndex !== -1) {
    //     // remove from handlers
    //     subscriptionItem.handlers.splice(handlerIndex, 1);
    //     if (subscriptionItem.handlers.length === 0) {
    //       // unsubscribe from the channel, if it was the last handler
    //       console.log(
    //         '[unsubscribeBars]: Unsubscribe from streaming. Channel:',
    //         channelString
    //       );
    //       socket.emit('SubRemove', { subs: [channelString] });
    //       channelToSubscription.delete(channelString);
    //       break;
    //     }
    //   }
    // }
}
