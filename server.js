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

// ================== THUẬT TOÁN PHÂN TÍCH NÂNG CAO ==================

const ADVANCED_PATTERN = {
    "T,T,T,T,T,T,T": {"prediction": "X", "probability": 85, "description": "Chuỗi Tài dài hiếm gặp, khả năng cao đảo chiều"},
    "X,X,X,X,X,X,X": {"prediction": "T", "probability": 85, "description": "Chuỗi Xỉu dài hiếm gặp, khả năng cao đảo chiều"},
    "T,X,T,X,T,X,T": {"prediction": "X", "probability": 75, "description": "Xu hướng xen kẽ, khả năng tiếp tục"},
    "X,T,X,T,X,T,X": {"prediction": "T", "probability": 75, "description": "Xu hướng xen kẽ, khả năng tiếp tục"},
    "T,T,X,X,T,T,X": {"prediction": "X", "probability": 70, "description": "Mẫu lặp lại, khả năng tiếp tục"},
    "X,X,T,T,X,X,T": {"prediction": "T", "probability": 70, "description": "Mẫu lặp lại, khả năng tiếp tục"},
    "T,T,T,X,X,X,T": {"prediction": "T", "probability": 65, "description": "Xu hướng đảo chiều sớm"},
    "X,X,X,T,T,T,X": {"prediction": "X", "probability": 65, "description": "Xu hướng đảo chiều sớm"}
};

const SUNWIN_ALGORITHM = {
    "3-10": {"tai": 0, "xiu": 100},
    "11": {"tai": 10, "xiu": 90},
    "12": {"tai": 20, "xiu": 80},
    "13": {"tai": 35, "xiu": 65},
    "14": {"tai": 45, "xiu": 55},
    "15": {"tai": 65, "xiu": 35},
    "16": {"tai": 80, "xiu": 20},
    "17": {"tai": 90, "xiu": 10},
    "18": {"tai": 100, "xiu": 0}
};

function isCauDep(patternStr) {
    const beautifulPatterns = ["TXTXTX", "XTXTXT", "TTXXTTXX", "XXTTXXTT", "TTXTTX", "XXTXXT"];
    return beautifulPatterns.some(p => patternStr.includes(p));
}

function isCauXau(patternStr) {
    const uglyPatterns = ["TTTTTT", "XXXXXX", "TTXXTX", "XXTTXT", "TXXTXX", "XTTXTT"];
    return uglyPatterns.some(p => patternStr.includes(p));
}

function analyzeAdvancedPattern(history) {
    if (history.length < 7) {
        return { prediction: null, confidence: 0, details: null };
    }

    const patternStr = history.slice(0, 7).map(s => s.result[0].toUpperCase()).join(',');
    const cauText = patternStr.replace(/,/g, "");
    let prediction = null;
    let confidence = 0;
    const details = [];

    if (ADVANCED_PATTERN[patternStr]) {
        const data = ADVANCED_PATTERN[patternStr];
        prediction = data.prediction === "T" ? "Tài" : "Xỉu";
        confidence = data.probability;
        details.push(data.description);
    }

    if (isCauDep(cauText)) {
        details.push("Cầu đẹp ✅");
    } else if (isCauXau(cauText)) {
        details.push("Cầu xấu ⚠️");
    }

    return { prediction, confidence, details: details.length > 0 ? details.join(" | ") : null };
}

function analyzeBigStreak(history) {
    if (history.length < 2) {
        return { prediction: null, confidence: 0 };
    }

    let currentStreak = 1;
    const currentResult = history[0].result;

    for (let i = 1; i < history.length; i++) {
        if (history[i].result === currentResult) {
            currentStreak++;
        } else {
            break;
        }
    }

    if (currentStreak >= 3) {
        const lastTotal = history[0].total;
        let confidence;
        if (currentResult === "Tài") {
            confidence = lastTotal >= 17 ? Math.min(95 + (currentStreak - 3) * 5, 99) : Math.min(90 + (currentStreak - 3) * 5, 98);
        } else { // Xỉu
            confidence = lastTotal <= 10 ? Math.min(95 + (currentStreak - 3) * 5, 99) : Math.min(90 + (currentStreak - 3) * 5, 98);
        }
        return { prediction: currentResult, confidence };
    }

    return { prediction: null, confidence: 0 };
}

function analyzeSumTrend(history) {
    if (history.length === 0) {
        return { prediction: null, confidence: 0 };
    }

    const lastSum = history[0].total;
    let sumStats;
    
    if (lastSum >= 3 && lastSum <= 10) {
        sumStats = SUNWIN_ALGORITHM["3-10"];
    } else {
        sumStats = SUNWIN_ALGORITHM[String(lastSum)];
    }

    if (sumStats) {
        if (sumStats.tai === 100) return { prediction: "Tài", confidence: 95 };
        if (sumStats.xiu === 100) return { prediction: "Xỉu", confidence: 95 };
        
        return sumStats.tai > sumStats.xiu 
            ? { prediction: "Tài", confidence: sumStats.tai } 
            : { prediction: "Xỉu", confidence: sumStats.xiu };
    }

    return { prediction: null, confidence: 0 };
}

function patternPredict(history) {
    if (!history || history.length === 0) {
        return { prediction: "Tài", confidence: 50, details: "Lịch sử rỗng, dự đoán ngẫu nhiên" };
    }

    const { prediction: streakPred, confidence: streakConf } = analyzeBigStreak(history);
    if (streakPred && streakConf > 75) {
        return { prediction: streakPred, confidence: streakConf, details: `Bệt ${streakPred} (${streakConf}%)` };
    }

    const { prediction: advPred, confidence: advConf, details: advDetails } = analyzeAdvancedPattern(history);
    if (advPred && advConf > 70) {
        return { prediction: advPred, confidence: advConf, details: advDetails };
    }

    const { prediction: sumPred, confidence: sumConf } = analyzeSumTrend(history);
    if (sumPred && sumConf > 80) {
        return { prediction: sumPred, confidence: sumConf, details: `Phân tích tổng điểm (${sumConf}%)` };
    }

    const lastSession = history[0];
    const defaultPred = lastSession.total >= 11 ? "Tài" : "Xỉu";
    return { prediction: defaultPred, confidence: 55, details: "Dự đoán cơ bản" };
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
          
          // Thêm kết quả mới vào đầu mảng lịch sử
          history.unshift({ result: result, total: total });
          if (history.length > 100) { // Giới hạn lịch sử ở 100 phiên gần nhất
            history.pop();
          }

          // Gọi thuật toán dự đoán mới
          const { prediction, confidence, details } = patternPredict(history);

          currentData = {
            phien_truoc: id_phien_chua_co_kq,
            ket_qua: result,
            Dice: [d1, d2, d3],
            phien_hien_tai: id_phien_chua_co_kq + 1,
            du_doan: prediction,
            do_tin_cay: `${confidence.toFixed(2)}%`,
            cau: details || "Đang chờ dữ liệu...",
            ngay: new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
            Id: "Rinkivana"
          };

          console.log(`[LOG] Phiên ${id_phien_chua_co_kq} → ${d1}-${d2}-${d3} = ${total} (${result}) | Dự đoán: ${prediction} (${confidence.toFixed(2)}%) - ${details}`);
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
  
