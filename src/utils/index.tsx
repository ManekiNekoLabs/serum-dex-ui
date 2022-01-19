import BigNumber from "bignumber.js";
import { formatDistance, format, addMinutes } from "date-fns";

import { DEFAULT_AMM_LIST } from "../constants";

type Number = number | string | undefined | null;

export function toSol(num: Number, decimals: number = 8) {
    if (!num) {
        return num;
    }

    return new BigNumber(num).div(10 ** decimals).toNumber();
}

export function calcPrecision(num: number) {
    if (!num) return 8

    switch (true) {
        case Math.abs(+num) < 1:
            return 8;

        case Math.abs(+num) < 10:
            return 4;

        case Math.abs(+num) >= 10:
            return 2;
    }
}

export function formatNumber(num: Number, precision?: number) {
    if (!num) {
        return num;
    }

    if (!precision) {
        precision = calcPrecision(+num);
    }

    let formated = new BigNumber(num).toFormat(precision);

    if (formated.match(/\.[0]+$/g)) {
        formated = formated.replace(/\.[0]+$/g, "");
    }

    if (formated.match(/\.\d+[0]+$/g)) {
        formated = formated.replace(/[0]+$/g, "");
    }

    return formated;
}

export function timeFormatUtc(
    timestamp: number | undefined,
    pattern: string = "MMMM dd, yyyy HH:mm:ss a '+UTC'"
) {
    if (!timestamp) {
        return null;
    }

    const dateLocal = new Date(timestamp * 1000);
    return format(addMinutes(dateLocal, dateLocal.getTimezoneOffset()), pattern);
}

export function timeFormatDistance(timestamp: number | undefined) {
    if (!timestamp) {
        return;
    }

    return formatDistance(timestamp * 1000, new Date(), {
        addSuffix: true,
    });
}

export function formatChangePercentage(percent = 0) {
    if (percent < 0) return formatNumber(percent, 2);
    else return `+${formatNumber(percent, 2)}`;
}

export { sessionCache } from "./cache";

export function getSwapUrlBySource(item: any) {
    if (item.source === "raydium") {
        return `${DEFAULT_AMM_LIST[item.source].website}/swap?ammId=${
            item.address
        }`;
    }

    return DEFAULT_AMM_LIST[item.source].website;
}

export function abbr(text: string, num = 4, symbol = '...') {
    if (!text) return ''

    const newText = text.toString()
    if (!newText) return ''
    if (newText.length <= 2 * num) return newText

    const firtPart = newText.slice(0, num)
    const lastPart = newText.slice(-num)

    return firtPart + symbol + lastPart
}