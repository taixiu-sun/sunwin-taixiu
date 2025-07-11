const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;

// === Biến lưu trạng thái ===
let currentData = {
  id: "rinkivana",
  id_phien: null,
  ket_qua: "",
  pattern: "",
  du_doan: "?"
};
let id_phien_chua_co_kq = null;
let patternHistory = [];

// === Danh sách tin nhắn gửi lên server WebSocket ===
const messagesToSend = [
  [1, "MiniGame", "SC_thataoduocko112233", "112233", {
    info: {
      ipAddress: "2402:800:62cd:ef90:a445:40de:a24a:765e",
      userId: "1a46e9cd-135d-4f29-9cd5-0b61bd2fb2a9",
      username: "SC_thataoduocko112233",
      timestamp: 1752257356729,
      refreshToken: "fe70e712cf3c4737a4ae22cbb3700c8e.f413950acf984ed6b373906f83a4f796"
    },
    signature: "16916AC7F4F163CD00B319824B5B90FFE11BC5E7D232D58E7594C47E271A5CDE0492BB1C3F3FF20171B3A344BEFEAA5C4E9D28800CF18880FEA6AC3770016F2841FA847063B80AF8C8A747A689546CE75E99A7B559612BC30FBA5FED9288B69013C099FD6349ABC2646D5ECC2D5B2A1C5A9817FE5587844B41C752D0A0F6F304"
  }],
  [6, "MiniGame", "taixiuPlugin", { cmd: 1005 }],
  [6, "MiniGame", "lobbyPlugin", { cmd: 10001 }]
];

// === WebSocket ===
let ws = null;
let pingInterval = null;
let reconnectTimeout = null;
let isManuallyClosed = false;

function duDoanTiepTheo(pattern) {
  if (pattern.length < 6) return "?";

  const last3 = pattern.slice(-3).join('');
  const last4 = pattern.slice(-4).join('');

  const count = pattern.join('').split(last3).length - 1;
  if (count >= 2) return last3[0];

  const count4 = pattern.join('').split(last4).length - 1;
  if (count4 >= 2) return last4[0];

  return "?";
}

function connectWebSocket() {
  ws = new WebSocket("wss://websocket.azhkthg1.net/websocket?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhbW91bnQiOjAsInVzZXJuYW1lIjoiU0NfdGhhdGFvZHVvY2tvMTEyMjMzIn0.nDkpWqUt3hXIX_8I4qPUOBV9sPMyyoGZwPAjxK8GnSg", {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Origin": "https://play.sun.win"
    }
  });

  ws.on('open', () => {
    console.log('[✅] WebSocket kết nối');
    messagesToSend.forEach((msg, i) => {
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(msg));
        }
      }, i * 600);
    });

    pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, 15000);
  });

  ws.on('pong', () => {
    console.log('[📶] Ping OK');
  });

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
          const result = total > 10 ? "T" : "X";

          patternHistory.push(result);
          if (patternHistory.length > 20) patternHistory.shift();

          const text = `${d1}-${d2}-${d3} = ${total} (${result === 'T' ? 'Tài' : 'Xỉu'})`;

          const du_doan = duDoanTiepTheo(patternHistory);

          currentData = {
            id: "binhtool90",
            id_phien: id_phien_chua_co_kq,
            ket_qua: text,
            pattern: patternHistory.join(''),
            du_doan: du_doan === "T" ? "Tài" : du_doan === "X" ? "Xỉu" : "?"
          };

          console.log(`Phiên ${id_phien_chua_co_kq}: ${text} → Dự đoán tiếp: ${currentData.du_doan}`);
          id_phien_chua_co_kq = null;
        }
      }
    } catch (e) {
      console.error('[Lỗi JSON]:', e.message);
    }
  });

  ws.on('close', () => {
    console.log('[🔌] WebSocket ngắt. Đang kết nối lại...');
    clearInterval(pingInterval);
    if (!isManuallyClosed) {
      reconnectTimeout = setTimeout(connectWebSocket, 2500);
    }
  });

  ws.on('error', (err) => {
    console.error('[❌] WebSocket lỗi:', err.message);
  });
}

// === API ===
app.get('/taixiu', (req, res) => {
  res.json(currentData);
});

app.get('/', (req, res) => {
  res.send(`<h2>🎯 Kết quả Sunwin Tài Xỉu</h2><p><a href="/taixiu">Xem kết quả JSON</a></p>`);
});

// === Khởi động server ===
app.listen(PORT, () => {
  console.log(`[🌐] Server chạy tại http://localhost:${PORT}`);
  connectWebSocket();
});
