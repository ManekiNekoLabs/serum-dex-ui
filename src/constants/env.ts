let API_URL: string | undefined;
let WS_URL: string | undefined;

// API_URL = 'https://api.birdeye.so/';
// WS_URL = 'wss://socket.birdeye.so/socket';
// API_URL = "https://api.solscan.io/";
// WS_URL = "wss://beta-socket.solscan.io/socket";

if (process.env) {
    API_URL = "https://api.solscan.io/";
    WS_URL = "wss://beta-socket.solscan.io/socket";
} else {
    API_URL = 'https://api.birdeye.so/';
    WS_URL = 'wss://socket.birdeye.so/socket';
}

export {
    API_URL,
    WS_URL,
}