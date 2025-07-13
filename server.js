const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');

// ================== IMPORT YOUR ALGORITHM ==================
const { du_doan_matchrandom } = require('./matchrandom.js');
// ===========================================================

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
let history = []; // Sử dụng mảng đối tượng thay vì chuỗi

// ================== OLD ALGORITHM (Can be removed or kept for reference) ==================
// The old functions like pt_cau, pt_diem, tim_cau, and the old du_doan can be deleted
// if they are no longer needed. We'll leave pt_xh as it's used for trend analysis.

function pt_xh(ls) {
    if (ls.length < 5) {
        return "Chưa đủ dữ liệu để phân tích xu hướng";
    }

    let dem_t = 0;
    ls.forEach(s => {
        if (s.result === "Tài") dem_t++;
    });
    const dem_x = ls.length - dem_t;

    let chuoi_ht = 1;
    const kq_ht = ls[0].result;
    for (let i = 1; i < ls.length; i++) {
        if (ls[i].result === kq_ht) chuoi_ht++;
        else break;
    }

    let tt_chuoi = "";
    if (chuoi_ht >= 3) {
        tt_chuoi = `Cầu ${kq_ht} ${chuoi_ht} nút`;
    }

    let pt_tong = "";
    const tong_diem_c = ls[0].total;
    if (tong_diem_c <= 10) pt_tong = `Tổng thấp (${tong_diem_c})`;
    else if (tong_diem_c >= 17) pt_tong = `Tổng cao (${tong_diem_c})`;

    let mo_ta_xh = "";
    if (dem_t > dem_x) mo_ta_xh = `Xu hướng Tài (${dem_t}/${ls.length})`;
    else if (dem_x > dem_t) mo_ta_xh = `Xu hướng Xỉu (${dem_x}/${ls.length})`;
    else mo_ta_xh = "Xu hướng cân bằng";

    let xh_day_du = mo_ta_xh;
    if (tt_chuoi) xh_day_du += ", " + tt_chuoi;
    if (pt_tong) xh_day_du += ", " + pt_tong;

    return xh_day_du;
}


// ================== KẾT NỐI VÀ XỬ LÝ DỮ LIỆU =====================

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
          
          history.unshift({ result: result, total: total });
          if (history.length > 100) {
            history.pop();
          }

          // ================== USE THE IMPORTED ALGORITHM ==================
          const [prediction, confidence] = du_doan_matchrandom(history);
          // ================================================================
          
          const trendAnalysis = pt_xh(history);

          currentData = {
            phien_truoc: id_phien_chua_co_kq,
            ket_qua: result,
            Dice: [d1, d2, d3],
            phien_hien_tai: id_phien_chua_co_kq + 1,
            du_doan: prediction,
            do_tin_cay: `${confidence.toFixed(2)}%`,
            cau: trendAnalysis,
            ngay: new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
            Id: "Rinkivana"
          };
          
          console.log(`[LOG] Phiên ${id_phien_chua_co_kq} → ${d1}-${d2}-${d3} = ${total} (${result}) | Dự đoán: ${prediction} (${confidence.toFixed(2)}%) - ${trendAnalysis}`);
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
