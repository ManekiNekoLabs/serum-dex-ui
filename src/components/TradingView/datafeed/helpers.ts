// @ts-nocheck

import { API_URL } from '../../../constants/env';

export async function makeApiRequest(path) {
    try {
        const response = await fetch(`${API_URL}${path}`);
        return response.json();
    } catch (error) {
        throw new Error(`Solscan request error: ${error.status}`);
    }
}

// Generate a symbol ID from a pair of the coins
export function generateSymbol(exchange, fromSymbol, toSymbol) {
    const short = `${fromSymbol ? fromSymbol.symbol : 'Unknown'}/${
        toSymbol ? toSymbol.symbol : 'Unknown'
    }`;
    return {
        short,
        full: `${exchange}:${short}`,
    };
}

export function parseFullSymbol(fullSymbol) {
    const match = fullSymbol.match(/^(\w+):(\w+)\/(\w+)$/);
    if (!match) {
        return null;
    }

    return {
        exchange: match[1],
        fromSymbol: match[2],
        toSymbol: match[3],
    };
}

const RESOLUTION_MAPPING = {
    '5': '5m',
    '15': '15m',
    '30': '30m',
    '60': '1H',
    '120': '2H',
    '240': '4H',
    '1D': '1D',
    '1W': '1W',
    '1M': '1M',
};

export function parseResolution(resolution) {
    if (!resolution || !RESOLUTION_MAPPING[resolution])
        return RESOLUTION_MAPPING[0];

    return RESOLUTION_MAPPING[resolution];
}