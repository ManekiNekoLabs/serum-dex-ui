interface AMM {
    amm: string
    firstPairAddress: string
    icon: string
    website: string
}
interface defaultAmmListProps {
    [ammName: string]: AMM
}

export const DEFAULT_AMM_LIST: defaultAmmListProps = {
    raydium: {
        amm: "raydium",
        firstPairAddress: "AVs9TA4nWDzfPJE9gGVNJMVhcQy3V9PGazuz33BfG2RA",
        website: "https://raydium.io",
        icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png",
    },
    orca: {
        amm: "orca",
        firstPairAddress: "EGZ7tiLeH62TPV1gL8WwbXGzEPa9zmcpVnnkPKKnrE2U",
        website: "https://www.orca.so",
        icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE/logo.png",
    },
};

export const WSOL = {
    account: "So11111111111111111111111111111111111111112"
}