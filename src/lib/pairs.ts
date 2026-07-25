export type Pair = {
  symbol: string;
  base: string;
  lev: string;
  vol: string;
  oi: string;
  price: string;
  change: string;
  up: boolean;
  color: string;
  liquidity: string;
  marketCap: string;
};

export const PAIRS: Pair[] = [
  { symbol: "BTCUSDT",    base: "BTC",  lev: "20x", vol: "$38,291,044", oi: "$2,104,983,221", price: "66,007.4",  change: "-0.52%", up: false, color: "#f7931a", liquidity: "$1.24B",  marketCap: "$1.30T" },
  { symbol: "ETHUSDT",    base: "ETH",  lev: "20x", vol: "$21,847,203", oi: "$1,341,002,104", price: "3,487.2",   change: "+1.14%", up: true,  color: "#627eea", liquidity: "$830M",   marketCap: "$419B"  },
  { symbol: "SOLUSDT",    base: "SOL",  lev: "20x", vol: "$14,203,991", oi: "$891,234,001",   price: "178.45",    change: "+2.31%", up: true,  color: "#9945ff", liquidity: "$312M",   marketCap: "$83B"   },
  { symbol: "WLDUSDT",    base: "WLD",  lev: "50x", vol: "$247,066",    oi: "$1,693,667",     price: "0.3850",    change: "-0.47%", up: false, color: "#1a1a2e", liquidity: "$4.1M",   marketCap: "$612M"  },
  { symbol: "OPENUSDT",   base: "OPEN", lev: "5x",  vol: "$3,218",      oi: "$433,066",       price: "0.1707",    change: "+4.60%", up: true,  color: "#ff6b35", liquidity: "$890K",   marketCap: "$47M"   },
  { symbol: "TRUSTUSDT",  base: "TRS",  lev: "5x",  vol: "$25,657",     oi: "$80,754",        price: "0.05005",   change: "+2.79%", up: true,  color: "#27ae60", liquidity: "$1.2M",   marketCap: "$28M"   },
  { symbol: "FETUSDT",    base: "FET",  lev: "10x", vol: "$15,430",     oi: "$184,540",       price: "0.1532",    change: "-1.42%", up: false, color: "#2d7dd2", liquidity: "$6.7M",   marketCap: "$130M"  },
  { symbol: "KITEUSDT",   base: "KITE", lev: "5x",  vol: "$6,433",      oi: "$877,955",       price: "0.11364",   change: "-6.97%", up: false, color: "#c0392b", liquidity: "$520K",   marketCap: "$19M"   },
  { symbol: "TAGUSDT",    base: "TAG",  lev: "5x",  vol: "$63,625",     oi: "$138,674",       price: "0.000997",  change: "-6.30%", up: false, color: "#00c896", liquidity: "$340K",   marketCap: "$9.4M"  },
  { symbol: "SAHARAUSDT", base: "SAH",  lev: "5x",  vol: "$3,235",      oi: "$130,043",       price: "0.00874",   change: "-2.02%", up: false, color: "#e8b84b", liquidity: "$210K",   marketCap: "$6.1M"  },
  { symbol: "FLOCKUSDT",  base: "FLK",  lev: "5x",  vol: "$5,110",      oi: "$16,060",        price: "0.03158",   change: "-0.63%", up: false, color: "#4a90e2", liquidity: "$180K",   marketCap: "$5.3M"  },
  { symbol: "HOLOUSDT",   base: "HOL",  lev: "5x",  vol: "$2,021",      oi: "$25,487",        price: "0.06649",   change: "+0.20%", up: true,  color: "#1db954", liquidity: "$95K",    marketCap: "$3.8M"  },
  { symbol: "RECALLUSDT", base: "REC",  lev: "5x",  vol: "$3,777",      oi: "$24,127",        price: "0.03067",   change: "-4.05%", up: false, color: "#aaa",    liquidity: "$78K",    marketCap: "$2.9M"  },
  { symbol: "CUSDT",      base: "C",    lev: "5x",  vol: "$83",         oi: "$13,890",        price: "0.06457",   change: "-0.94%", up: false, color: "#888",    liquidity: "$12K",    marketCap: "$1.1M"  },
];
