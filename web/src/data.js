// Course content. To add a recording from YouTube (plays on every phone), add yt:"VIDEO_ID" to a class.
export const PDF_FOLDER = "https://drive.google.com/drive/u/0/folders/1obKEM8mnOUr4eGRdvCj5LysDaQes75Wr";
export const JOIN_URL = "https://joinedge.vercel.app/#course";
export const SITE_URL = "https://www.edgeacademy.ae";

export const MODULES = ["Forex Foundations", "Platforms & Tools", "Technical Analysis", "Risk & Fundamentals", "Smart Money Concepts"];
export const MOD_BLURB = [
  "How the currency market works, how pips and lots turn into money, and how to read a candle.",
  "Set up TradingView for analysis and place every order type on MT5.",
  "Read trend with structure, find pullbacks with Fibonacci, trade continuation and reversal patterns.",
  "A capital plan with 1% risk and position sizing, plus the US news that moves the dollar.",
  "Where liquidity sits, how fair value gaps form, and how to trade order blocks."
];

const R = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

const RAW = [
  { m: 0, t: "What is Forex Trading", id: "1QxguVYCygBDJsqYWH3SN30oDJ5qyRRy_", deck: "c1", pages: R(1, 19), thumb: "c1-07",
    d: "Starts with physical versus digital trading and the share market, then moves into forex: why it runs round the clock with around $8 trillion traded daily, who the participants are, what brokers do, and how currency pairs are grouped. Closes with commodities and crypto.",
    w: ["Physical vs digital trading", "Foreign and domestic institutional investors", "Retailers, institutions and liquidity providers", "Major, minor and exotic pairs", "Base and quote currency", "Gold, silver, oil and crypto symbols"] },
  { m: 0, t: "Pip and Lot Size Calculation", id: "1DhIdM6p84JY9vBPP58Od6oQmHWfLuciy", deck: "c2", pages: R(1, 12), thumb: "c2-04",
    d: "The units every trade is measured in: trading terms and session time zones, pips and pipettes on 5-, 3- and 2-digit quotes, micro to standard lots, and profit and loss worked examples on EURUSD, USDJPY and XAUUSD.",
    w: ["Long, short, spread and swap", "Market time zones", "Pip vs pipette", "Micro 0.01, mini 0.10, standard 1.00", "Calculating profit and loss", "Practice P/L questions"] },
  { m: 0, t: "Candlestick Patterns", id: "19CHStCkxAq54Gh8vERz_nvNpOBtY04P1", deck: "c3", pages: R(1, 26), thumb: "c3-05",
    d: "A full pattern library: single-candle signals like the hammer, shooting star, marubozu and doji; two-candle setups like engulfing, harami and tweezers; and three-candle formations such as morning star and three white soldiers.",
    w: ["Bullish and bearish candle anatomy", "Hammer, hanging man, shooting star, doji", "Bullish and bearish engulfing", "Harami, piercing, dark cloud cover", "Morning and evening star", "Soldiers, crows and three methods"] },
  { m: 1, t: "How to Use TradingView", id: "13aadIK39eN33YbHeiQG9XtLt9LRnDnqc", deck: null, pages: [], thumb: null,
    d: "A screen-share walkthrough of TradingView for chart analysis: layouts, timeframes, drawing tools, indicators and alerts. This class is video only.",
    w: ["Chart layout and timeframes", "Drawing tools", "Indicators", "Price alerts"] },
  { m: 1, t: "How to Use MetaTrader", id: "1I5WraAFvE5fWCyZ9bUOBCuhGc-y_LRpT", deck: "c4", pages: R(21, 25), thumb: "c4-22",
    d: "Placing trades on MT5: market execution and each pending order type, with when to use a buy limit, sell limit, buy stop or sell stop.",
    w: ["Market execution", "Buy limit and sell limit", "Buy stop and sell stop", "Stop loss and take profit"] },
  { m: 2, t: "Market Structure Analysis", id: "1ZLx1CU7RsZ_9W_bmwS9PMsd_TO4jzTiB", deck: "c5", pages: R(1, 15), thumb: "c5-04",
    d: "Identifying the trend before anything else: uptrends, downtrends and ranges, impulse and correction waves, trendlines, and support and resistance.",
    w: ["Higher highs and higher lows", "Lower highs and lower lows", "Sideways markets", "Impulse vs correction", "Trendlines", "Support and resistance"] },
  { m: 2, t: "How to Use Fibonacci", id: "1eJFzt7pG69wAhtnqBmqpc0Ywepjeh_Fe", deck: null, pages: [], thumb: null,
    d: "Drawing Fibonacci retracements on a valid swing to find pullback zones, and using them with market structure. This class is video only.",
    w: ["Picking the swing", "Key retracement levels", "Confluence with structure", "Planning targets"] },
  { m: 2, t: "Chart Patterns 1", id: "1v1tCPhqpHsfT8E2Z-mrKWWf2eE7jptzN", deck: "c67", pages: R(1, 12), thumb: "c67-05",
    d: "Continuation and reversal patterns: bullish and bearish flags, pennants, double and triple tops and bottoms, head and shoulders, and the inverted head and shoulders.",
    w: ["Continuation, bilateral, reversal", "Bull and bear flag and pole", "Pennants", "Double and triple tops and bottoms", "Head and shoulders", "Inverted head and shoulders"] },
  { m: 2, t: "Chart Patterns 2", id: "1WRawWkPWluHSlUOPc4A7PDnSTaeyxhp_", deck: "c67", pages: [1, ...R(13, 20)], thumb: "c67-14",
    d: "Bilateral triangle patterns: how ascending, descending and symmetrical triangles are built, what the flat and sloping lines tell you, and which way the breakout usually goes.",
    w: ["Ascending triangle", "Descending triangle", "Symmetrical triangle", "Reading pattern structure"] },
  { m: 3, t: "Risk & Money Management", id: "1jLhUD2kgU6lhaYlSztTGxRMCet2bi1fm", deck: "c4", pages: R(1, 20), thumb: "c4-05",
    d: "A worked capital plan on a $5,000 account: 1% daily risk, how 1:1, 1:1.5 and 1:2 risk-reward change the win rate you need, position sizing with a risk calculator, and what 5% a month compounds to over two, three and five years.",
    w: ["1% risk per day on $5,000", "Risk-reward vs win rate", "Monthly plan at 50% accuracy", "Position sizing in 3 steps", "Compounding over 2, 3 and 5 years"] },
  { m: 3, t: "Major Forex News", id: "1KDn6F-Ao_-0ByFCgo90GG7ptKjxuObw5", deck: "c8", pages: R(1, 13), thumb: "c8-10",
    d: "The nine US releases that move the dollar: CPI, PPI, retail sales, GDP, the FOMC decision, Powell speeches, trade balance, jobless claims and NFP, with when each comes out and which way it pushes USD.",
    w: ["CPI and PPI", "Retail sales and GDP", "FOMC and Powell", "Trade balance and jobless claims", "Non-Farm Payrolls", "Summary table"] },
  { m: 4, t: "What is Liquidity", id: "1d139aSTyy1N8ExmBvPHsJoS5hg9EuUbN", deck: "c9", pages: R(1, 7), thumb: "c9-03",
    d: "Liquidity as the place where stop losses and pending orders cluster: why price is drawn to it, where it usually sits, and a simple build-up to reversal model.",
    w: ["What liquidity is", "Why price goes to liquidity", "Highs, lows and round numbers", "Build-up to reversal model"] },
  { m: 4, t: "FVG & BPR", id: "1ndp5WlAYqyTcdNiiBIa2apMJ7oTJ1aZV", deck: "c10", pages: R(1, 4), thumb: "c10-02",
    d: "Fair value gaps, where price moves so fast it skips an area and later returns to it, and the balanced price range that forms when two opposite gaps overlap.",
    w: ["How a fair value gap forms", "Bullish and bearish FVG", "Balanced price range", "Gaps as entry areas"] },
  { m: 4, t: "Order Block (Supply & Demand Zone)", id: "1F52wb1aiuCL9tLCqPngrAEcLoq-V_zuO", deck: "c11", pages: R(1, 4), thumb: "c11-03",
    d: "Where big players place orders before a strong move: order blocks, and how to mark demand (buy) and supply (sell) zones that price often returns to.",
    w: ["What an order block is", "Demand zone", "Supply zone", "Trading the return to a zone"] }
];

const pad2 = n => String(n).padStart(2, "0");
export const CLASSES = RAW.map((c, i) => ({
  ...c,
  n: i + 1,
  slides: c.deck ? c.pages.map(p => `s/${c.deck}-${pad2(p)}.jpg`) : []
}));
export const TOTAL_SLIDES = CLASSES.reduce((a, c) => a + c.slides.length, 0);
export const THUMBS = [...new Set(CLASSES.filter(c => c.thumb).map(c => `s/${c.thumb}.jpg`))];
export const ALL_SLIDES = [...new Set(CLASSES.flatMap(c => c.slides))];

export const viewUrl = id => `https://drive.google.com/file/d/${id}/view`;
export const driveEmbed = id => `https://drive.google.com/file/d/${id}/preview`;
export const ytEmbed = yt => `https://www.youtube-nocookie.com/embed/${yt}?rel=0&modestbranding=1&playsinline=1`;
export const pad = pad2;
