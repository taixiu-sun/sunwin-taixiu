const express = require('express');
const cors = require('cors');
const ƯebSocketloomf = require('ws');

const app = express();

const allowedOrigins = [
  'https://tooltxwanin.site',
  'https://sunwin-taixiu-1.onrender.com',
  'http://localhost:9898'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Không được phép CORS'));
    }
  }
}));

let currentData = {
  phien_truoc: null,
  ket_qua: "",
  Dice: [],
  phien_hien_tai: null,
  du_doan: "",
  do_tin_cay: "N/A",
  cau: "",
  ngay: "",
  Id: "@ghetvietcode - Rinkivana"
};

let id_phien_chua_co_kq = null;
let history = [];

function predictNext(history) {
  if (history.length < 4) return history[0] || "Tài";
  const last = history[0];
  const past = [...history].reverse();
  if (past.slice(-4).every(k => k === last)) return last;
  if (
    past.length >= 4 &&
    past.at(-1) === past.at(-2) &&
    past.at(-3) === past.at(-4) &&
    past.at(-1) !== past.at(-3)
  ) {
    return last === "Tài" ? "Xỉu" : "Tài";
  }
  const last4 = past.slice(-4);
  if (last4[0] !== last4[1] && last4[1] === last4[2] && last4[2] !== last4[3]) {
    return last === "Tài" ? "Xỉu" : "Tài";
  }
  if (past.length >= 6) {
    const pattern = past.slice(-6, -3).toString();
    const latest = past.slice(-3).toString();
    if (pattern === latest) return past.at(-1);
  }
  const count = history.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
  return (count["Tài"] || 0) > (count["Xỉu"] || 0) ? "Xỉu" : "Tài";
}

const messagesToSend = [
  [1, "Simms", "SC_thatoidisun112233", "112233", {
    "info": "{\"ipAddress\":\"2a09:bac5:d46f:16dc::247:13\",\"userId\":\"a867d30e-417d-47e5-a5c5-8a11e11746f0\",\"username\":\"SC_thatoidisun112233\",\"timestamp\":1752735812697,\"refreshToken\":\"e2e6f309ef844b22b8f88938223327b9.da49c2c8fe3a4f6dbe2d5f9c0b040319\"}",
    "signature": "0659600D4D3B6209AF13B6DDBD55A42F8D14B2FE8598925EF22C8F9EEB4FC06146DC18BD0B1AA8E5AD524FD92110477FAA258B632288F8D34840E4D915BDC404CA8A70705D0F15884BF346A28200825959F43A7D9DA0063D8DC04B37BA207A0974803DF03BB39B9048DCE72463C16F211F8426507E1A02AC605EA348DDD53FB7"
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
    console.log('[LOG] WebSocket đã kết nối thành công.');
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

  ws.on('pong', () => console.log('[LOG] Ping/Pong duy trì kết nối OK.'));

  ws.on('message', (message) => {
    console.log('[RECEIVED]', message.toString());
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
          history.unshift(result);
          if (history.length > 100) history.pop();
          const prediction = predictNext(history);
          currentData = {
            phien_truoc: id_phien_chua_co_kq,
            ket_qua: result,
            Dice: [d1, d2, d3],
            phien_hien_tai: id_phien_chua_co_kq + 1,
            du_doan: prediction,
            do_tin_cay: "N/A",
            cau: history.slice(0, 10).map(r => r === "Tài" ? "T" : "X").join(''),
            ngay: new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
            Id: "@ghetvietcode - Rinkivana"
          };
          console.log(`[DATA] Phiên ${id_phien_chua_co_kq}: ${result} (${total}) | Dự đoán phiên sau: ${prediction}`);
          id_phien_chua_co_kq = null;
        }
      }
    } catch (err) {
      console.error('[ERROR] Lỗi khi parse dữ liệu:', err.message);
    }
  });

  ws.on('close', () => {
    console.log('[WARN] WebSocket đã đóng. Đang kết nối lại sau 2.5 giây...');
    setTimeout(connectWebSocket, 2500);
  });

  ws.on('error', (err) => {
    console.error('[ERROR] WebSocket gặp lỗi:', err.message);
    ws.close();
  });
}

app.get('/taixiu', (req, res) => {
  res.json(currentData);
});

app.get('/', (req, res) => {
  res.send(`<h2>API Dự Đoán Sunwin</h2><p>Server đang hoạt động. Trạng thái WebSocket và dữ liệu được cập nhật liên tục.</p><p><a href="/taixiu">Xem dữ liệu JSON</a></p>`);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[INFO] Server đang chạy tại cổng ${PORT}`);
  connectWebSocket();
});
