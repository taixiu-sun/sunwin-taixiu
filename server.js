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
let history = []; // Sử dụng mảng đối tượng thay vì chuỗi

// ================== THUẬT TOÁN TỪ PHP ĐÃ ĐƯỢC DỊCH VÀ TÍCH HỢP ==================

const CAU_LIST = {
    "tttt": {"tai": 73, "xiu": 27}, "xxxx": {"tai": 27, "xiu": 73},
    "tttttt": {"tai": 83, "xiu": 17}, "xxxxxx": {"tai": 17, "xiu": 83},
    "ttttx": {"tai": 40, "xiu": 60}, "xxxxt": {"tai": 60, "xiu": 40},
    "ttttttx": {"tai": 30, "xiu": 70}, "xxxxxxt": {"tai": 70, "xiu": 30},
    "ttxx": {"tai": 62, "xiu": 38}, "xxtt": {"tai": 38, "xiu": 62},
    "ttxxtt": {"tai": 32, "xiu": 68}, "xxttxx": {"tai": 68, "xiu": 32},
    "txx": {"tai": 60, "xiu": 40}, "xtt": {"tai": 40, "xiu": 60},
    "txxtx": {"tai": 63, "xiu": 37}, "xttxt": {"tai": 37, "xiu": 63},
    "tttxt": {"tai": 60, "xiu": 40}, "xxxtx": {"tai": 40, "xiu": 60},
    "tttxx": {"tai": 60, "xiu": 40}, "xxxtt": {"tai": 40, "xiu": 60},
    "txxt": {"tai": 60, "xiu": 40}, "xttx": {"tai": 40, "xiu": 60},
    "ttxxttx": {"tai": 30, "xiu": 70}, "xxttxxt": {"tai": 70, "xiu": 30},
    "tttttttt": {"tai": 88, "xiu": 12}, "xxxxxxxx": {"tai": 12, "xiu": 88},
    "tttttttx": {"tai": 25, "xiu": 75}, "xxxxxxxxt": {"tai": 75, "xiu": 25},
    "tttttxxx": {"tai": 35, "xiu": 65}, "xxxxtttt": {"tai": 65, "xiu": 35},
    "ttttxxxx": {"tai": 30, "xiu": 70}, "xxxxtttx": {"tai": 70, "xiu": 30},
    "txtxtx": {"tai": 68, "xiu": 32}, "xtxtxt": {"tai": 32, "xiu": 68},
    "ttxtxt": {"tai": 55, "xiu": 45}, "xxtxtx": {"tai": 45, "xiu": 55},
    "txtxxt": {"tai": 60, "xiu": 40}, "xtxttx": {"tai": 40, "xiu": 60},
    "ttx": {"tai": 65, "xiu": 35}, "xxt": {"tai": 35, "xiu": 65},
    "txt": {"tai": 58, "xiu": 42}, "xtx": {"tai": 42, "xiu": 58},
    "tttx": {"tai": 70, "xiu": 30}, "xxxt": {"tai": 30, "xiu": 70},
    "ttxt": {"tai": 63, "xiu": 37}, "xxtx": {"tai": 37, "xiu": 63},
    "txxx": {"tai": 25, "xiu": 75}, "xttt": {"tai": 75, "xiu": 25},
    "tttxx": {"tai": 60, "xiu": 40}, "xxxtt": {"tai": 40, "xiu": 60},
    "ttxtx": {"tai": 62, "xiu": 38}, "xxtxt": {"tai": 38, "xiu": 62},
    "ttxxt": {"tai": 55, "xiu": 45}, "xxttx": {"tai": 45, "xiu": 55},
    "ttttx": {"tai": 40, "xiu": 60}, "xxxxt": {"tai": 60, "xiu": 40},
    "tttttx": {"tai": 30, "xiu": 70}, "xxxxxt": {"tai": 70, "xiu": 30},
    "ttttttx": {"tai": 25, "xiu": 75}, "xxxxxxt": {"tai": 75, "xiu": 25},
    "tttttttx": {"tai": 20, "xiu": 80}, "xxxxxxxt": {"tai": 80, "xiu": 20},
    "ttttttttx": {"tai": 15, "xiu": 85}, "xxxxxxxxt": {"tai": 85, "xiu": 15},
    "txtx": {"tai": 52, "xiu": 48}, "xtxt": {"tai": 48, "xiu": 52},
    "txtxt": {"tai": 53, "xiu": 47}, "xtxtx": {"tai": 47, "xiu": 53},
    "txtxtx": {"tai": 55, "xiu": 45}, "xtxtxt": {"tai": 45, "xiu": 55},
    "txtxtxt": {"tai": 57, "xiu": 43}, "xtxtxtx": {"tai": 43, "xiu": 57},
    "ttxxttxx": {"tai": 38, "xiu": 62}, "xxttxxtt": {"tai": 62, "xiu": 38},
    "ttxxxttx": {"tai": 45, "xiu": 55}, "xxttxxxt": {"tai": 55, "xiu": 45},
    "ttxtxttx": {"tai": 50, "xiu": 50}, "xxtxtxxt": {"tai": 50, "xiu": 50},
    "ttxttx": {"tai": 60, "xiu": 40}, "xxtxxt": {"tai": 40, "xiu": 60},
    "ttxxtx": {"tai": 58, "xiu": 42}, "xxtxxt": {"tai": 42, "xiu": 58},
    "ttxtxtx": {"tai": 62, "xiu": 38}, "xxtxtxt": {"tai": 38, "xiu": 62},
    "ttxxtxt": {"tai": 55, "xiu": 45}, "xxtxttx": {"tai": 45, "xiu": 55},
    "ttxtxxt": {"tai": 65, "xiu": 35}, "xxtxttx": {"tai": 35, "xiu": 65},
    "ttxtxttx": {"tai": 70, "xiu": 30}, "xxtxtxxt": {"tai": 30, "xiu": 70},
    "ttxxtxtx": {"tai": 68, "xiu": 32}, "xxtxtxtx": {"tai": 32, "xiu": 68},
    "ttxtxxtx": {"tai": 72, "xiu": 28}, "xxtxtxxt": {"tai": 28, "xiu": 72},
    "ttxxtxxt": {"tai": 75, "xiu": 25}, "xxtxtxxt": {"tai": 25, "xiu": 75},
};

const CAU_DEP = {
    "Tài": {
        "3": {"next_tai": 65, "next_xiu": 35}, "4": {"next_tai": 70, "next_xiu": 30},
        "5": {"next_tai": 75, "next_xiu": 25}, "6": {"next_tai": 80, "next_xiu": 20},
        "7": {"next_tai": 85, "next_xiu": 15}, "8": {"next_tai": 88, "next_xiu": 12},
        "9": {"next_tai": 90, "next_xiu": 10}, "10+": {"next_tai": 92, "next_xiu": 8}
    },
    "Xỉu": {
        "3": {"next_tai": 35, "next_xiu": 65}, "4": {"next_tai": 30, "next_xiu": 70},
        "5": {"next_tai": 25, "next_xiu": 75}, "6": {"next_tai": 20, "next_xiu": 80},
        "7": {"next_tai": 15, "next_xiu": 85}, "8": {"next_tai": 12, "next_xiu": 88},
        "9": {"next_tai": 10, "next_xiu": 90}, "10+": {"next_tai": 8, "next_xiu": 92}
    }
};

const Number_Zzz = {
    "3-10": {"tai": 0, "xiu": 100}, "11": {"tai": 15, "xiu": 85},
    "12": {"tai": 25, "xiu": 75}, "13": {"tai": 40, "xiu": 60},
    "14": {"tai": 50, "xiu": 50}, "15": {"tai": 60, "xiu": 40},
    "16": {"tai": 75, "xiu": 25}, "17": {"tai": 85, "xiu": 15},
    "18": {"tai": 100, "xiu": 0}
};

function tim_cau(chuoi) {
    if (!chuoi) return null;
    const keys = Object.keys(CAU_LIST).sort((a, b) => b.length - a.length);
    for (const key of keys) {
        if (chuoi.endsWith(key)) {
            return key;
        }
    }
    return null;
}

function pt_cau(ls) {
    if (!ls || ls.length === 0) return [null, 0];

    let chuoi = 0;
    let kq = null;

    for (const p of ls) {
        if (kq === null) {
            kq = p.result;
            chuoi = 1;
        } else if (p.result === kq) {
            chuoi++;
        } else {
            break;
        }
    }

    if (chuoi >= 3) {
        let key_chuoi = chuoi > 9 ? "10+" : String(chuoi);
        const tk = CAU_DEP[kq]?.[key_chuoi];
        if (tk) {
            if (tk.next_tai > tk.next_xiu) {
                return ["Tài", tk.next_tai];
            } else {
                return ["Xỉu", tk.next_xiu];
            }
        }
    }
    return [null, 0];
}

function pt_diem(ls) {
    if (!ls || ls.length === 0) return [null, 0];
    const tong = ls[0].total;
    let key_tong = null;

    if (tong >= 3 && tong <= 10) key_tong = "3-10";
    else if (tong >= 11 && tong <= 18) key_tong = String(tong);

    const tk_tong = Number_Zzz[key_tong];

    if (tk_tong) {
        if (tk_tong.tai === 100) return ["Tài", 95];
        if (tk_tong.xiu === 100) return ["Xỉu", 95];
        if (tk_tong.tai > tk_tong.xiu) {
            return ["Tài", tk_tong.tai];
        } else {
            return ["Xỉu", tk_tong.xiu];
        }
    }
    return [null, 0];
}

function du_doan(ls) {
    if (!ls || ls.length === 0) return ["Tài", 50];

    const [dd_c, dt_c] = pt_cau(ls);
    if (dd_c !== null && dt_c > 75) {
        return [dd_c, dt_c];
    }

    const [dd_d, dt_d] = pt_diem(ls);
    if (dd_d !== null && dt_d > 80) {
        return [dd_d, dt_d];
    }

    const chuoi_c = ls.map(s => (s.result === "Tài") ? "t" : "x").reverse().join("");
    const key_c = tim_cau(chuoi_c);

    if (key_c) {
        const dl = CAU_LIST[key_c];
        if (dl.tai === dl.xiu) {
            const phien_cuoi = ls[0];
            return phien_cuoi.total >= 11 ? ["Tài", 55] : ["Xỉu", 55];
        } else {
            const dd = dl.tai > dl.xiu ? "Tài" : "Xỉu";
            const dt = Math.max(dl.tai, dl.xiu);
            return [dd, dt];
        }
    } else {
        const phien_cuoi = ls[0];
        return phien_cuoi.total >= 11 ? ["Tài", 55] : ["Xỉu", 55];
    }
}

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

          // Gọi thuật toán dự đoán đã dịch từ PHP
          const [prediction, confidence] = du_doan(history);
          const trendAnalysis = pt_xh(history);

          currentData = {
            phien_truoc: id_phien_chua_co_kq,
            ket_qua: result,
            Dice: [d1, d2, d3],
            phien_hien_tai: id_phien_chua_co_kq + 1,
            du_doan: prediction, // <-- Sử dụng dự đoán gốc
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
