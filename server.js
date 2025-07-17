const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

const SUNWIN_WS_URL = "wss://websocket.azhkthg1.net/websocket?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhbW91bnQiOjAsInVzZXJuYW1lIjoiU0NfYXBpc3Vud2luMTIzIn0.hgrRbSV6vnBwJMg9ZFtbx3rRu9mX_hZMZ_m5gMNhkw0";
const RECONNECT_DELAY = 5000;
const MAX_RECONNECT_ATTEMPTS = 10;

let currentData = {
  phien_truoc: null,
  ket_qua: "",
  Dice: [],
  phien_hien_tai: null,
  du_doan: "",
  do_tin_cay: "",
  cau: "",
  ngay: "",
  Id: "@ghetvietcode-Rinkivana"
};

let id_phien_chua_co_kq = null;
let history = [];
let wsClient = null;
let reconnectAttempts = 0;
let isManualClose = false;
let lastResultTime = 0;

function predictNext(historyArr) {
  if (historyArr.length < 4) return historyArr.at(-1)?.ket_qua || "Tài";

  const last = historyArr.at(-1).ket_qua;

  if (historyArr.slice(-4).every(k => k.ket_qua === last)) return last;

  if (
    historyArr.length >= 4 &&
    historyArr.at(-1).ket_qua === historyArr.at(-2).ket_qua &&
    historyArr.at(-3).ket_qua === historyArr.at(-4).ket_qua &&
    historyArr.at(-1).ket_qua !== historyArr.at(-3).ket_qua
  ) {
    return last === "Tài" ? "Xỉu" : "Tài";
  }

  const last4 = historyArr.slice(-4);
  if (
    last4[0].ket_qua !== last4[1].ket_qua &&
    last4[1].ket_qua === last4[2].ket_qua &&
    last4[2].ket_qua !== last4[3].ket_qua
  ) {
    return last === "Tài" ? "Xỉu" : "Tài";
  }

  const pattern = historyArr.slice(-6, -3).map(e => e.ket_qua).toString();
  const latest = historyArr.slice(-3).map(e => e.ket_qua).toString();
  if (pattern === latest) return last;

  if (new Set(historyArr.slice(-3).map(e => e.ket_qua)).size === 3) {
    return Math.random() < 0.5 ? "Tài" : "Xỉu";
  }

  const count = historyArr.reduce((acc, val) => {
    acc[val.ket_qua] = (acc[val.ket_qua] || 0) + 1;
    return acc;
  }, {});
  return (count["Tài"] || 0) > (count["Xỉu"] || 0) ? "Xỉu" : "Tài";
}

function handleGameResult(data) {
  const { d1, d2, d3, sid } = data;
  const total = d1 + d2 + d3;
  const result = total > 10 ? "Tài" : "Xỉu";

  const entry = {
    phien: sid,
    Dice: [d1, d2, d3],
    ket_qua: result,
    time: new Date().toISOString()
  };

  history.push(entry);
  if (history.length > 20) history.shift();

  const prediction = predictNext(history);

  currentData = {
    phien_truoc: sid,
    ket_qua: `${d1}-${d2}-${d3} = ${total} (${result})`,
    Dice: [d1, d2, d3],
    phien_hien_tai: sid + 1,
    du_doan: prediction,
    do_tin_cay: history.length >= 6 ? "Cao" : "Thấp",
    cau: history.map(h => h.ket_qua === "Tài" ? "T" : "X").join(''),
    ngay: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
    Id: "@ghetvietcode-Rinkivana"
  };

  lastResultTime = Date.now();
  console.log(`[KẾT QUẢ] Phiên ${sid}: ${currentData.ket_qua} | Dự đoán tiếp: ${prediction}`);

  broadcastToClients(currentData);
}

function connectToSunwin() {
  if (isManualClose) return;

  console.log(`[WS] Đang kết nối đến Sunwin... (Lần thử ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`);
  
  wsClient = new WebSocket(SUNWIN_WS_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Origin": "https://play.sun.win"
    },
    handshakeTimeout: 10000
  });

  wsClient.on('open', () => {
    console.log('[WS] Đã kết nối đến Sunwin');
    currentData.status = "connected";
    reconnectAttempts = 0;

    const initMessages = [
      [1, "MiniGame", "SC_apisunwin123", "binhlamtool90", {}],
      [6, "MiniGame", "taixiuPlugin", { cmd: 1005 }],
      [6, "MiniGame", "lobbyPlugin", { cmd: 10001 }]
    ];

    initMessages.forEach((msg, i) => {
      setTimeout(() => {
        if (wsClient.readyState === WebSocket.OPEN) {
          wsClient.send(JSON.stringify(msg));
        }
      }, i * 600);
    });
  });

  wsClient.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      if (Array.isArray(message) && message[1]?.cmd === 1003 && message[1]?.gBB) {
        handleGameResult(message[1]);
      }
    } catch (e) {
      console.error('[ERROR] Lỗi xử lý message:', e.message);
    }
  });

  wsClient.on('close', (code, reason) => {
    console.log(`[WS] Mất kết nối (Code: ${code}, Lý do: ${reason || 'Không rõ'})`);
    currentData.status = "disconnected";
    scheduleReconnect();
  });

  wsClient.on('error', (err) => {
    console.error('[WS ERROR]', err.message);
    currentData.status = "error";
  });
}

const wss = new WebSocket.Server({ 
  server,
  path: '/api/sunwin'
});

function broadcastToClients(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

wss.on('connection', (ws) => {
  console.log('[CLIENT] Client mới kết nối');
  ws.send(JSON.stringify(currentData));

  ws.on('close', () => {
    console.log('[CLIENT] Client ngắt kết nối');
  });
});

function scheduleReconnect() {
  if (isManualClose || reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) return;

  const now = Date.now();
  const timeSinceLastResult = now - lastResultTime;
  const baseDelay = Math.min(RECONNECT_DELAY * Math.pow(2, reconnectAttempts), 30000);
  const optimalReconnectTime = lastResultTime + 55000;
  const delay = Math.max(baseDelay, optimalReconnectTime - now);

  reconnectAttempts++;
  console.log(`[RECONNECT] Sẽ thử lại sau ${Math.round(delay / 1000)} giây...`);

  setTimeout(() => {
    if (Date.now() - lastResultTime > 120000) {
      console.log('[RECONNECT] Quá lâu không có kết quả, kết nối lại');
      connectToSunwin();
    } else {
      checkServerStatus().then(isActive => {
        if (isActive) {
          console.log('[RECONNECT] Server đang hoạt động, kết nối lại');
          connectToSunwin();
        } else {
          console.log('[RECONNECT] Server có vẻ đang lỗi, đợi thêm...');
          scheduleReconnect();
        }
      });
    }
  }, delay);
}

async function checkServerStatus() {
  try {
    const response = await axios.get('https://play.sun.win', { timeout: 5000 });
    return response.status === 200;
  } catch (e) {
    return false;
  }
}

server.listen(PORT, () => {
  console.log(`[SERVER] Đang chạy tại http://localhost:${PORT}`);
  connectToSunwin();
});

process.on('SIGINT', () => {
  console.log('[SERVER] Đang tắt server...');
  isManualClose = true;

  if (wsClient) wsClient.close(1000, 'Server shutdown');
  wss.clients.forEach(client => client.close(1001, 'Server shutdown'));
  server.close(() => process.exit(0));
});
