const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');
const { predictNext } = require('./matchrandom.js'); // Import hàm dự đoán mới

const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;

// Cấu trúc dữ liệu trả về cho client
let currentData = {
  "phien_truoc": null,
  "ket_qua": "Đang chờ...",
  "Dice": [],
  "phien_hien_tai": null,
  "du_doan": "Đang chờ phiên mới...",
  "do_tin_cay": "0%",
  "percent_tai": "0%",
  "percent_xiu": "0%",
  "cau": "Chưa có dữ liệu",
  "ngay": "",
  "Id": "@ghetvietcode - Rinkivana"
};

let history = []; // Lịch sử các phiên đã qua (tối đa 100)

// Hàm phân tích xu hướng (giữ nguyên)
function pt_xh(ls) {
    if (ls.length < 5) return "Chưa đủ dữ liệu để phân tích xu hướng";
    const dem_t = ls.filter(s => s.result === "Tài").length;
    const dem_x = ls.length - dem_t;
    const kq_ht = ls[0].result;
    let chuoi_ht = 0;
    for (const item of ls) {
        if (item.result === kq_ht) chuoi_ht++;
        else break;
    }
    const tt_chuoi = chuoi_ht >= 3 ? `Cầu ${kq_ht} ${chuoi_ht} phiên` : "Cầu 1-1 hoặc 2-1";
    const mo_ta_xh = `Xu hướng ${dem_t > dem_x ? `Tài (${dem_t}/${ls.length})` : dem_x > dem_t ? `Xỉu (${dem_x}/${ls.length})` : 'cân bằng'}`;
    return `${mo_ta_xh}, ${tt_chuoi}`;
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
    headers: {"User-Agent": "Mozilla/5.0", "Origin": "https://play.sun.win"}
  });

  ws.on('open', () => {
    console.log('[LOG] WebSocket đã kết nối thành công.');
    messagesToSend.forEach((msg, i) => {
      setTimeout(() => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg)); }, i * 600);
    });
    setInterval(() => { if (ws.readyState === WebSocket.OPEN) ws.ping(); }, 15000);
  });

  ws.on('pong', () => console.log('[LOG] Ping... Pong! Kết nối vẫn ổn định.'));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (!Array.isArray(data) || typeof data[1] !== 'object') return;
      const cmd = data[1].cmd;
      const content = data[1];

      // Khi có phiên mới
      if (cmd === 1008 && content.sid) { 
        currentData.phien_hien_tai = content.sid;
        currentData.ket_qua = "Đang chờ...";
        currentData.Dice = [];
        
        // Gọi hàm dự đoán mới và nhận 4 giá trị trả về
        const [prediction, confidence, percent_tai, percent_xiu] = predictNext(history);

        // Cập nhật vào currentData
        currentData.du_doan = prediction;
        currentData.do_tin_cay = `${parseFloat(confidence).toFixed(2)}%`;
        currentData.percent_tai = `${parseFloat(percent_tai).toFixed(2)}%`;
        currentData.percent_xiu = `${parseFloat(percent_xiu).toFixed(2)}%`;
        currentData.ngay = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

        console.log(`\n[PHIÊN MỚI] Bắt đầu phiên ${content.sid}. Dự đoán: ${prediction} (${parseFloat(confidence).toFixed(2)}%) | TÀI: ${parseFloat(percent_tai).toFixed(2)}% - XỈU: ${parseFloat(percent_xiu).toFixed(2)}%`);
      }

      // Khi có kết quả phiên
      if (cmd === 1003 && content.gBB) { 
        const { d1, d2, d3, sid } = content;
        const total = d1 + d2 + d3;
        const result = total > 10 ? "Tài" : "Xỉu";
        
        // Chỉ thêm vào lịch sử nếu phiên này chưa tồn tại để tránh trùng lặp
        if (!history.some(item => item.sid === sid)) {
            // Thêm dữ liệu xúc xắc vào lịch sử
            history.unshift({ result, total, sid, dice: [d1, d2, d3] }); 
            if (history.length > 100) history.pop(); // Giới hạn lịch sử 100 phiên

            currentData.phien_truoc = sid;
            currentData.ket_qua = result;
            currentData.Dice = [d1, d2, d3];
            currentData.cau = pt_xh(history);
            currentData.ngay = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
            console.log(`[KẾT QUẢ] Phiên ${sid} → ${d1}-${d2}-${d3} = ${total} (${result})`);
        }
      }
    } catch (err) {
      console.error('[ERROR] Lỗi xử lý dữ liệu:', err.message);
    }
  });

  ws.on('close', () => {
    console.warn('[WARN] WebSocket đã mất kết nối. Thử lại sau 3 giây...');
    setTimeout(connectWebSocket, 3000);
  });

  ws.on('error', (err) => console.error('[ERROR] Lỗi WebSocket:', err.message));
}

app.get('/taixiu', (req, res) => res.json(currentData));
app.get('/', (req, res) => {
  res.send(`<div style="font-family: sans-serif; text-align: center; padding-top: 50px;"><h2>🚀 Sunwin Tài Xỉu API by VanwNhat & Rinkivana</h2><p>API đang hoạt động. Truy cập <a href="/taixiu">/taixiu</a> để xem kết quả JSON.</p></div>`);
});

app.listen(PORT, () => {
  console.log(`[LOG] Server đang chạy tại http://localhost:${PORT}`);
  connectWebSocket();
});
