const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;

let currentData = {
  "phien_truoc": null,
  "ket_qua": "",
  "Dice": [],
  "phien_hien_tai": null,
  "du_doan": "",
  "do_tin_cay": "",
  "cau": "",
  "ngay": "",
  "Id": "Rinkivana"
};

let id_phien_chua_co_kq = null;
let historyString = "";

// ================== Công thức dán trực tiếp =====================
const ruleLines = `
XTXXT|T
XXXXT|T
XTXXT|X
TXXTT|T
XTXTX|X
TTXXT|X
XXXTX|X
TXXTX|T
TXXTT|T
XTTTX|X
TTXTT|T
TXTTT|T
TTTXX|T
XTTTX|X
TXXXX|T
TTXXT|X
XXXXT|T
XXXXX|T
TTXTX|X
TXXXX|X
XTXTX|X
XXXTX|X
TXXTT|X
TTTTX|X
XTXXX|T
TXTXT|T
XTTTT|X
XXXTX|X
XXTXT|T
TTTXX|X
XTXXX|T
XTXTT|X
XXTTX|X
XXTTT|T
TXXXX|T
TTXXX|X
TXXXX|T
XXTXX|T
XTXXT|X
TXTXT|T
TTTXX|X
TXTXT|X
XXXXX|X
TXXTX|X
XXXTX|X
TXTTT|T
XXXXX|T
XTTXX|T
XXXXX|T
TXTTX|X
TTXXT|T
XXTTT|X
XTXXT|T
XXTXX|T
TXXTX|T
XXXXT|X
XXXXT|X
TXTTX|T
XXTTT|T
TTTXT|T
TTXXX|T
TXXXT|X
XTTTT|X
TTXTX|T
TXXTT|T
TTTTX|T
XXTTX|X
XXTTX|X
TTTXX|T
TXTXX|X
XXXXX|X
TTXXT|X
XXTTT|T
TXXTX|T
XTTXT|T
TTXTX|X
XXTTX|X
TXTTX|T
XXXTX|X
XXXTT|X
TXTTT|T
TXXTT|X
XTXXX|T
TTTTT|X
TTTXX|X
TXTTX|X
XXTTX|X
TXXXT|X
TTTTX|T
XXXXX|T
XTXXT|T
TTXTX|T
TTXXX|T
TXXXX|T
TXXTX|T
XXTXT|X
XTTXT|T
XXTXT|T
XXTXT|T
XTXXT|T
XTTTX|T
TXTTX|X
TTXXX|X
TXXTT|X
TTTTX|X
XTXTT|T
XTTXX|T
XTTTX|T
TXXXX|X
XXTXT|X
XTTTX|X
XTXTX|T
TXXXX|X
TTXXX|X
XXTTT|X
TXTXT|T
XTTXT|T
TXXTX|X
XTXTX|X
TXXXT|T
XTTTX|X
XXTXX|X
TXXXX|X
XTXTT|T
TXXTX|X
XTXXX|T
TTTXX|T
TTTTT|T
TXXTX|T
XXXXT|T
XXTXT|X
TXXTX|X
TXXXX|T
XXXTT|T
XTTTX|X
TTXXT|X
XXTTX|X
TTTXX|X
TTTTX|T
XXTXX|T
TXXTX|X
TTTTX|T
XTXXT|X
TTXTT|X
TTTXX|X
TXXXT|T
TXXXX|T
XTTXX|T
XTXXX|T
XXXTX|T
XTXXT|T
TTTTT|X
TTTXX|X
XTXXT|T
XXTTX|X
TTTTT|T
TXTXX|T
TXXTT|X
TXTTT|T
XTTTX|T
TXXXX|X
TTTXT|T
XTXTT|X
TXXTX|T
TXTXX|X
XTTTX|X
XXTTT|T
XXXTX|X
XXTTX|T
XTXTT|T
TXTTX|T
XTXXX|T
XXTXX|T
XTTXT|X
XXTTT|X
TXTTX|T
XTXXT|T
XXTTT|X
TTXTT|T
XTTXX|T
XXTTT|T
XTTTX|T
TTXTX|X
TXTXT|X
TTTTX|X
XXXXT|T
TXTXT|T
XTTXT|X
XTTXX|T
TTXTX|T
XTTXT|T
XXXTT|X
TTTXT|T
TTTXX|X
TXTXT|T
TTTXX|T
XTTTX|X
XXTXX|T
TXTTX|X
TXTXT|X
TTTTX|T
TXXTX|T
XXTTX|T
TXXTX|X
TTXTX|X
TXTTX|T
XXTTX|T
TXXXT|T
XXTXT|T
TXTTT|X
TTXTX|T
TXXXX|X
TTTTT|T
TTXTT|T
TTXXT|T
TTXXT|T
TTXXX|X
XXXTX|X
XTTTT|X
TTXTT|X
XXXTT|X
XXXTX|X
XXXXX|T
TXTXT|X
XTTXX|X
TTTXX|T
XXXTT|X
XXTTX|T
TXTTX|X
XTXXT|T
XTTXT|X
TTXXX|T
TTXTT|X
TTXXT|X
XTTXX|X
XXXXX|X
XTTXX|T
TTTXX|X
TTXTX|X
XTXXX|X
XTTTX|X
TTTXT|X
TXTXT|T
XXXTX|X
XXTXT|T
TTTTT|T
XXTXT|T
XXTXX|T
XXXXT|T
XXXXT|X
TTTXX|X
TTXTX|T
XXXTT|T
XTTTT|X
XXTTX|X
XTXXX|T
TTTTT|X
TXXTX|T
XTXXT|T
XTTTX|X
TTXXT|T
TTTXT|T
TXTTX|T
TTTXX|T
`;


const ruleMap = new Map();
ruleLines.split('\n').forEach(line => {
  const [pattern, result] = line.trim().split('|');
  if (pattern && result) ruleMap.set(pattern.trim(), result.trim());
});

function predictResult(history) {
  const last5 = history.slice(-5);
  const prediction = ruleMap.get(last5) || "Không rõ";
  const confidence = prediction === "Tài" || prediction === "Xỉu" ? "67.86%" : "0%";
  return { prediction, confidence, pattern: last5 };
}

const messagesToSend = [
  [1, "MiniGame", "SC_thataoduocko112233", "112233", {
    "info": "{\"ipAddress\":\"2402:800:62cd:ef90:a445:40de:a24a:765e\",\"userId\":\"1a46e9cd-135d-4f29-9cd5-0b61bd2fb2a9\",\"username\":\"SC_thataoduocko112233\",\"timestamp\":1752257356729,\"refreshToken\":\"fe70e712cf3c4737a4ae22cbb3700c8e.f413950acf984ed6b373906f83a4f796\"}",
    "signature": "16916AC7F4F163CD00B319824B5B90FFE11BC5E7D232D58E7594C47E271A5CDE0492BB1C3F3FF20171B3A344BEFEAA5C4E9D28800CF18880FEA6AC3770016F2841FA847063B80AF8C8A747A689546CE75E99A7B559612BC30FBA5FED9288B69013C099FD6349ABC2646D5ECC2D5B2A1C5A9817FE5587844B41C752D0A0F6F304"
  }],
  [6, "MiniGame", "taixiuPlugin", { cmd: 1005 }],
  [6, "MiniGame", "lobbyPlugin", { cmd: 10001 }]
];

function connectWebSocket() {
  const ws = new WebSocket("wss://websocket.azhkthg1.net/websocket?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhbW91bnQiOjAsInVzZXJuYW1lIjoiU0NfYXBpc3Vud2luMTIzIn0.hgrRbSV6vnBwJMg9ZFtbx3rRu9mX_hZMZ_m5gMNhkw0", {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Origin": "https://play.sun.win"
    }
  });

  ws.on('open', () => {
    console.log('[LOG] WebSocket kết nối');
    messagesToSend.forEach((msg, i) => {
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(msg));
        }
      }, i * 600);
    });

    setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, 15000);
  });

  ws.on('pong', () => console.log('[LOG] Ping OK'));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (Array.isArray(data) && typeof data[1] === 'object') {
        const cmd = data[1].cmd;

        if (cmd === 1008 && data[1].sid) {
          id_phien_chua_co_kq = data[1].sid;
        }

        if (cmd === 1003 && data[1].gBB) {
          const { d1, d2, d3 } = data[1];
          const total = d1 + d2 + d3;
          const result = total > 10 ? "Tài" : "Xỉu";
          const symbol = result === "Tài" ? "T" : "X";

          historyString += symbol;
          if (historyString.length > 100) {
            historyString = historyString.slice(-100);
          }

          const { prediction, confidence, pattern } = predictResult(historyString);

          currentData = {
            phien_truoc: id_phien_chua_co_kq,
            ket_qua: result,
            Dice: [d1, d2, d3],
            phien_hien_tai: id_phien_chua_co_kq + 1,
            du_doan: prediction,
            do_tin_cay: confidence,
            cau: pattern,
            ngay: new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
            Id: "Rinkivana"
          };

          console.log(`[LOG] Phiên ${id_phien_chua_co_kq} → ${d1}-${d2}-${d3} = ${total} (${result})`);
          id_phien_chua_co_kq = null;
        }
      }
    } catch (err) {
      console.error('[ERROR] Lỗi xử lý dữ liệu:', err.message);
    }
  });

  ws.on('close', () => {
    console.log('[WARN] WebSocket mất kết nối. Đang thử lại sau 2s...');
    setTimeout(connectWebSocket, 2500);
  });

  ws.on('error', (err) => {
    console.error('[ERROR] WebSocket lỗi:', err.message);
  });
}

app.get('/taixiu', (req, res) => res.json(currentData));

app.get('/', (req, res) => {
  res.send(`<h2>Sunwin Tài Xỉu API</h2><p><a href="/taixiu">Xem kết quả JSON</a></p>`);
});

app.listen(PORT, () => {
  console.log(`[LOG] Server đang chạy tại http://localhost:${PORT}`);
  connectWebSocket();
});
