const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');

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
  [1, "Simms", "SC_dcumay1234aaa", "11223344p", {
    "info": "{\"ipAddress\":\"2402:800:62cd:7c2b:dd77:8326:ba05:f657\",\"userId\":\"8443d14b-e229-4a4f-9fa4-37b27c1a7640\",\"username\":\"SC_dcumay1234aaa\",\"timestamp\":1752731508082,\"refreshToken\":\"14231d1135184d5480f58e2b77b3fa24.8cf3006656e8402d8cedc6ee861bdad7\"}",
    "signature": "08B26DDF93721B3580272A08F01ED70F95813F8DAF50157CCDA89EE917C0BDF5F5D543D2C7AD2F469FCCEA7557E9F5B7531524ECCF33A5A500DD2377FE227B3EB2FC26C018640978AA88D30C5C8F90A62C182A99DA912A264CA9DBA9BED06A621798CCF16E95DF5148451617A3C58C5298925E02E25EEEFD620CBEA65CA55628",
    "pid": 5,
    "subi": true
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
      // Bỏ qua lỗi JSON không hợp lệ
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

// API ENDPOINT
app.get('/taixiu', (req, res) => {
  res.json(currentData);
});

app.get('/', (req, res) => {
  res.send(`<h2>API Dự Đoán Sunwin</h2><p>Server đang hoạt động. Trạng thái WebSocket và dữ liệu được cập nhật liên tục.</p><p><a href="/taixiu">Xem dữ liệu JSON</a></p>`);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[INFO] Server đang lắng nghe trên cổng ${PORT}`);
  connectWebSocket();
});
