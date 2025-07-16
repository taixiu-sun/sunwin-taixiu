const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');

const app = express();

// ✅ Cho phép nhiều domain gọi API
const allowedOrigins = [
  'https://tooltxwanin.site',
  'https://sunwin-taixiu-1.onrender.com'
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

const PORT = process.env.PORT || 5000;

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
      // Ignore malformed JSON
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

app.listen(PORT, () => {
  console.log(`[INFO] Server đang lắng nghe trên cổng ${PORT}`);
  connectWebSocket();
});
