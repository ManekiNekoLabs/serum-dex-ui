// @ts-nocheck
import {
    makeApiRequest,
    generateSymbol,
    // parseFullSymbol,
    parseResolution,
} from './helpers';
import { subscribeOnStream } from './streaming';
import { calcPrecision, sessionCache } from '../../../utils';

const lastBarsCache = new Map();

const configurationData = {
    supported_resolutions: [
        '5',
        '15',
        '30',
        '60',
        '120',
        '240',
        '1D',
        '1W',
        '1M',
    ],
    intraday_multipliers: ['5', '15', '30', '60', '120', '240'],
    exchanges: [],
    symbols_types: [
        {
            name: 'crypto',
            // `symbolType` argument for the `searchSymbols` method, if a user selects this symbol type
            value: 'crypto',
        },
    ],
};

async function getAllSymbols() {
    // const data = await makeApiRequest('amm/pairs?source=raydium');
    const pairs = sessionCache.getItem('ammPairs');

    let allSymbols = [];
    const exchange = configurationData.exchanges[0];

    // for (const exchange of configurationData.exchanges) {
    //   const pairs = data.Data[exchange.value].pairs;

    // for (const leftPairPart of Object.keys(pairs)) {
    const symbols = pairs.map((pair) => {
        const symbol = generateSymbol(pair.source, pair.base, pair.quote);
        return {
            symbol: symbol.short,
            full_name: pair.address,
            description: symbol.short,
            exchange: exchange.value,
            type: 'crypto',
            ...pair,
        };
    });
    allSymbols = [...allSymbols, ...symbols];
    // }
    // }
    return allSymbols;
}

const datafeed = {
    onReady: (callback) => {
        console.log('[onReady]: Method call');
        setTimeout(() => callback(configurationData));
    },

    searchSymbols: async (
    ) => {
        console.log('[searchSymbols]: Method call');
    },

    resolveSymbol: async (
        symbolName,
        onSymbolResolvedCallback,
        onResolveErrorCallback
    ) => {
        console.log('[resolveSymbol]: Method call', symbolName);

        const tokenMap = sessionCache.getItem('tokenMap');

        const symbolItem = tokenMap && tokenMap[symbolName] ? tokenMap[symbolName] : {address: symbolName};
        if (!symbolItem) {
            console.log('[resolveSymbol]: Cannot resolve symbol', symbolName);
            // onResolveErrorCallback('cannot resolve symbol');
            // return;
        }

        const symbolInfo = {
            ...symbolItem,
            ticker: symbolItem.address,
            name: symbolItem.symbol ? `${symbolItem.symbol}/USD` : 'UNKNOWN/USD',
            description: symbolItem.description,
            type: symbolItem.type,
            session: '24x7',
            timezone: 'Etc/UTC',
            exchange: symbolItem.exchange,
            minmov: 1,
            pricescale: 10 ** calcPrecision(symbolItem.price),
            has_intraday: true,
            has_no_volume: false,
            has_weekly_and_monthly: true,
            supported_resolutions: configurationData.supported_resolutions,
            intraday_multipliers: configurationData.intraday_multipliers,
            volume_precision: 4,
            data_status: 'streaming',
        };

        console.log('[resolveSymbol]: Symbol resolved', symbolName);
        onSymbolResolvedCallback(symbolInfo);
    },

    getBars: async (
        symbolInfo,
        resolution,
        periodParams,
        onHistoryCallback,
        onErrorCallback
    ) => {
        const { from, to, firstDataRequest } = periodParams;
        // console.log('[getBars]: Method call', symbolInfo, resolution, from, to);
        // const parsedSymbol = parseFullSymbol(symbolInfo.full_name);

        const urlParameters = {
            address: symbolInfo.address,
            type: parseResolution(resolution),
            time_from: from,
            time_to: to,
        };
        const query = Object.keys(urlParameters)
            .map((name) => `${name}=${encodeURIComponent(urlParameters[name])}`)
            .join('&');
        try {
            const result = await makeApiRequest(`amm/ohlcv?${query}`);

            if (!result.success || result.data.items === 0) {
                // 'noData' should be set if there is no data in the requested period.
                onHistoryCallback([], {
                    noData: true,
                });
                return;
            }
            let bars = [];
            result.data.items.forEach((bar) => {
                if (bar.unixTime >= from && bar.unixTime < to) {
                    bars = [
                        ...bars,
                        {
                            time: bar.unixTime * 1000,
                            low: bar.l,
                            high: bar.h,
                            open: bar.o,
                            close: bar.c,
                            volume: bar.v,
                        },
                    ];
                }
            });
            if (firstDataRequest) {
                lastBarsCache.set(symbolInfo.full_name, {
                    ...bars[bars.length - 1],
                });
            }
            // console.log(`[getBars]: returned ${bars.length} bar(s)`);
            onHistoryCallback(bars, {
                noData: true,
            });
        } catch (error) {
            console.log('[getBars]: Get error', error);
            onErrorCallback(error);
        }
    },

    subscribeBars: (
        symbolInfo,
        resolution,
        onRealtimeCallback,
        subscribeUID,
        onResetCacheNeededCallback
    ) => {
        console.log(
            '[subscribeBars]: Method call with subscribeUID:',
            subscribeUID
        );
        subscribeOnStream(
            symbolInfo,
            resolution,
            onRealtimeCallback,
            subscribeUID,
            onResetCacheNeededCallback,
            lastBarsCache.get(symbolInfo.full_name)
        );
    },

    unsubscribeBars: (subscriberUID) => {
        console.log(
          '[unsubscribeBars]: Method call with subscriberUID:',
          subscriberUID
        );
        // unsubscribeFromStream(subscriberUID);
    },
};

export default datafeed;