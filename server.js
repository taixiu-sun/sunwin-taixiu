const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;

// ================== DATA & STATE ==================
let currentData = {
  "phien_truoc": null,
  "ket_qua": "Đang chờ phiên mới...",
  "Dice": [],
  "phien_hien_tai": null,
  "du_doan": "Chờ dữ liệu...",
  "do_tin_cay": "0.00%",
  "cau": "Đang phân tích...",
  "ngay": new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
  "Id": "@ghetvietcode - Rinkivana"
};

let history = []; // Lịch sử các phiên
let id_phien_chua_co_kq = null;
let heartbeatInterval = null; // Biến để quản lý interval của heartbeat

// ================== THUẬT TOÁN PHÂN TÍCH ==================
const CAU_LIST = {
    "tttt": {"tai": 73, "xiu": 27}, "xxxx": {"tai": 27, "xiu": 73}, "tttttt": {"tai": 83, "xiu": 17}, "xxxxxx": {"tai": 17, "xiu": 83}, "ttttx": {"tai": 40, "xiu": 60}, "xxxxt": {"tai": 60, "xiu": 40}, "ttttttx": {"tai": 30, "xiu": 70}, "xxxxxxt": {"tai": 70, "xiu": 30}, "ttxx": {"tai": 62, "xiu": 38}, "xxtt": {"tai": 38, "xiu": 62}, "ttxxtt": {"tai": 32, "xiu": 68}, "xxttxx": {"tai": 68, "xiu": 32}, "txx": {"tai": 60, "xiu": 40}, "xtt": {"tai": 40, "xiu": 60}, "txxtx": {"tai": 63, "xiu": 37}, "xttxt": {"tai": 37, "xiu": 63}, "tttxt": {"tai": 60, "xiu": 40}, "xxxtx": {"tai": 40, "xiu": 60}, "tttxx": {"tai": 60, "xiu": 40}, "xxxtt": {"tai": 40, "xiu": 60}, "txxt": {"tai": 60, "xiu": 40}, "xttx": {"tai": 40, "xiu": 60}, "ttxxttx": {"tai": 30, "xiu": 70}, "xxttxxt": {"tai": 70, "xiu": 30}, "tttttttt": {"tai": 88, "xiu": 12}, "xxxxxxxx": {"tai": 12, "xiu": 88}, "tttttttx": {"tai": 25, "xiu": 75}, "xxxxxxxxt": {"tai": 75, "xiu": 25}, "tttttxxx": {"tai": 35, "xiu": 65}, "xxxxtttt": {"tai": 65, "xiu": 35}, "ttttxxxx": {"tai": 30, "xiu": 70}, "xxxxtttx": {"tai": 70, "xiu": 30}, "txtxtx": {"tai": 68, "xiu": 32}, "xtxtxt": {"tai": 32, "xiu": 68}, "ttxtxt": {"tai": 55, "xiu": 45}, "xxtxtx": {"tai": 45, "xiu": 55}, "txtxxt": {"tai": 60, "xiu": 40}, "xtxttx": {"tai": 40, "xiu": 60}, "ttx": {"tai": 65, "xiu": 35}, "xxt": {"tai": 35, "xiu": 65}, "txt": {"tai": 58, "xiu": 42}, "xtx": {"tai": 42, "xiu": 58}, "tttx": {"tai": 70, "xiu": 30}, "xxxt": {"tai": 30, "xiu": 70}, "ttxt": {"tai": 63, "xiu": 37}, "xxtx": {"tai": 37, "xiu": 63}, "txxx": {"tai": 25, "xiu": 75}, "xttt": {"tai": 75, "xiu": 25}, "tttxx": {"tai": 60, "xiu": 40}, "xxxtt": {"tai": 40, "xiu": 60}, "ttxtx": {"tai": 62, "xiu": 38}, "xxtxt": {"tai": 38, "xiu": 62}, "ttxxt": {"tai": 55, "xiu": 45}, "xxttx": {"tai": 45, "xiu": 55}, "ttttx": {"tai": 40, "xiu": 60}, "xxxxt": {"tai": 60, "xiu": 40}, "tttttx": {"tai": 30, "xiu": 70}, "xxxxxt": {"tai": 70, "xiu": 30}, "ttttttx": {"tai": 25, "xiu": 75}, "xxxxxxt": {"tai": 75, "xiu": 25}, "tttttttx": {"tai": 20, "xiu": 80}, "xxxxxxxt": {"tai": 80, "xiu": 20}, "ttttttttx": {"tai": 15, "xiu": 85}, "xxxxxxxxt": {"tai": 85, "xiu": 15}, "txtx": {"tai": 52, "xiu": 48}, "xtxt": {"tai": 48, "xiu": 52}, "txtxt": {"tai": 53, "xiu": 47}, "xtxtx": {"tai": 47, "xiu": 53}, "txtxtx": {"tai": 55, "xiu": 45}, "xtxtxt": {"tai": 45, "xiu": 55}, "txtxtxt": {"tai": 57, "xiu": 43}, "xtxtxtx": {"tai": 43, "xiu": 57}, "ttxxttxx": {"tai": 38, "xiu": 62}, "xxttxxtt": {"tai": 62, "xiu": 38}, "ttxxxttx": {"tai": 45, "xiu": 55}, "xxttxxxt": {"tai": 55, "xiu": 45}, "ttxtxttx": {"tai": 50, "xiu": 50}, "xxtxtxxt": {"tai": 50, "xiu": 50}, "ttxttx": {"tai": 60, "xiu": 40}, "xxtxxt": {"tai": 40, "xiu": 60}, "ttxxtx": {"tai": 58, "xiu": 42}, "xxtxxt": {"tai": 42, "xiu": 58}, "ttxtxtx": {"tai": 62, "xiu": 38}, "xxtxtxt": {"tai": 38, "xiu": 62}, "ttxxtxt": {"tai": 55, "xiu": 45}, "xxtxttx": {"tai": 45, "xiu": 55}, "ttxtxxt": {"tai": 65, "xiu": 35}, "xxtxttx": {"tai": 35, "xiu": 65}, "ttxtxttx": {"tai": 70, "xiu": 30}, "xxtxtxxt": {"tai": 30, "xiu": 70}, "ttxxtxtx": {"tai": 68, "xiu": 32}, "xxtxtxtx": {"tai": 32, "xiu": 68}, "ttxtxxtx": {"tai": 72, "xiu": 28}, "xxtxtxxt": {"tai": 28, "xiu": 72}, "ttxxtxxt": {"tai": 75, "xiu": 25}, "xxtxtxxt": {"tai": 25, "xiu": 75},
};
const CAU_DEP = {"Tài": {"3": {"next_tai": 65, "next_xiu": 35}, "4": {"next_tai": 70, "next_xiu": 30}, "5": {"next_tai": 75, "next_xiu": 25}, "6": {"next_tai": 80, "next_xiu": 20}, "7": {"next_tai": 85, "next_xiu": 15}, "8": {"next_tai": 88, "next_xiu": 12}, "9": {"next_tai": 90, "next_xiu": 10}, "10+": {"next_tai": 92, "next_xiu": 8}}, "Xỉu": {"3": {"next_tai": 35, "next_xiu": 65}, "4": {"next_tai": 30, "next_xiu": 70}, "5": {"next_tai": 25, "next_xiu": 75}, "6": {"next_tai": 20, "next_xiu": 80}, "7": {"next_tai": 15, "next_xiu": 85}, "8": {"next_tai": 12, "next_xiu": 88}, "9": {"next_tai": 10, "next_xiu": 90}, "10+": {"next_tai": 8, "next_xiu": 92}}};
const Number_Zzz = {"3-10": {"tai": 0, "xiu": 100}, "11": {"tai": 15, "xiu": 85}, "12": {"tai": 25, "xiu": 75}, "13": {"tai": 40, "xiu": 60}, "14": {"tai": 50, "xiu": 50}, "15": {"tai": 60, "xiu": 40}, "16": {"tai": 75, "xiu": 25}, "17": {"tai": 85, "xiu": 15}, "18": {"tai": 100, "xiu": 0}};

function tim_cau(chuoi) {
    if (!chuoi) return null;
    const keys = Object.keys(CAU_LIST).sort((a, b) => b.length - a.length);
    for (const key of keys) { if (chuoi.endsWith(key)) { return key; } }
    return null;
}
function pt_cau(ls) {
    if (!ls || ls.length === 0) return [null, 0];
    let chuoi = 0, kq = null;
    for (const p of ls) { if (kq === null) { kq = p.result; chuoi = 1; } else if (p.result === kq) { chuoi++; } else { break; } }
    if (chuoi >= 3) {
        let key_chuoi = chuoi > 9 ? "10+" : String(chuoi);
        const tk = CAU_DEP[kq]?.[key_chuoi];
        if (tk) { return tk.next_tai > tk.next_xiu ? ["Tài", tk.next_tai] : ["Xỉu", tk.next_xiu]; }
    }
    return [null, 0];
}
function pt_diem(ls) {
    if (!ls || ls.length === 0) return [null, 0];
    const tong = ls[0].total;
    let key_tong = (tong >= 3 && tong <= 10) ? "3-10" : (tong >= 11 && tong <= 18) ? String(tong) : null;
    const tk_tong = Number_Zzz[key_tong];
    if (tk_tong) {
        if (tk_tong.tai === 100) return ["Tài", 95];
        if (tk_tong.xiu === 100) return ["Xỉu", 95];
        return tk_tong.tai > tk_tong.xiu ? ["Tài", tk_tong.tai] : ["Xỉu", tk_tong.xiu];
    }
    return [null, 0];
}
function du_doan(ls) {
    if (!ls || ls.length === 0) return ["Tài", 50];
    const [dd_c, dt_c] = pt_cau(ls); if (dd_c !== null && dt_c > 75) { return [dd_c, dt_c]; }
    const [dd_d, dt_d] = pt_diem(ls); if (dd_d !== null && dt_d > 80) { return [dd_d, dt_d]; }
    const chuoi_c = ls.map(s => (s.result === "Tài") ? "t" : "x").reverse().join("");
    const key_c = tim_cau(chuoi_c);
    if (key_c) {
        const dl = CAU_LIST[key_c];
        if (dl.tai === dl.xiu) { return ls[0].total >= 11 ? ["Tài", 55] : ["Xỉu", 55]; }
        else { return dl.tai > dl.xiu ? ["Tài", Math.max(dl.tai, dl.xiu)] : ["Xỉu", Math.max(dl.tai, dl.xiu)]; }
    } else { return ls[0].total >= 11 ? ["Tài", 55] : ["Xỉu", 55]; }
}
function pt_xh(ls) {
    if (ls.length < 5) { return "Chưa đủ dữ liệu để phân tích xu hướng"; }
    let dem_t = ls.filter(s => s.result === "Tài").length;
    const dem_x = ls.length - dem_t;
    let chuoi_ht = 1; const kq_ht = ls[0].result;
    for (let i = 1; i < ls.length; i++) { if (ls[i].result === kq_ht) chuoi_ht++; else break; }
    let tt_chuoi = chuoi_ht >= 3 ? `Cầu ${kq_ht} ${chuoi_ht} nút` : "";
    const tong_diem_c = ls[0].total;
    let pt_tong = (tong_diem_c <= 10) ? `Tổng thấp (${tong_diem_c})` : (tong_diem_c >= 17) ? `Tổng cao (${tong_diem_c})` : "";
    let mo_ta_xh = (dem_t > dem_x) ? `Xu hướng Tài (${dem_t}/${ls.length})` : (dem_x > dem_t) ? `Xu hướng Xỉu (${dem_x}/${ls.length})` : "Xu hướng cân bằng";
    return [mo_ta_xh, tt_chuoi, pt_tong].filter(Boolean).join(", ");
}

// ================== WEBSOCKET CONNECTION =====================

const messagesToSend = [
    [1, "MiniGame", "SC_thataoduocko112233", "112233", {"info": "...", "signature": "..."}], // Giữ nguyên data của bạn
    [6, "MiniGame", "taixiuPlugin", { cmd: 1005 }],
    [6, "MiniGame", "lobbyPlugin", { cmd: 10001 }]
];

function connectWebSocket() {
    console.log('[LOG] Đang khởi tạo kết nối WebSocket...');
    const ws = new WebSocket("wss://websocket.azhkthg1.net/websocket?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhbW91bnQiOjAsInVzZXJuYW1lIjoiU0NfYXBpc3Vud2luMTIzIn0.hgrRbSV6vnBwJMg9ZFtbx3rRu9mX_hZMZ_m5gMNhkw0", {
        headers: { "User-Agent": "Mozilla/5.0", "Origin": "https://play.sun.win" },
        handshakeTimeout: 10000 // Timeout cho kết nối ban đầu
    });

    ws.on('open', () => {
        console.log('[LOG] WebSocket kết nối thành công.');
        messagesToSend.forEach((msg, i) => {
            setTimeout(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(msg));
                }
            }, i * 600);
        });

        // **Thiết lập heartbeat (ping/pong) để giữ kết nối**
        clearInterval(heartbeatInterval); // Xóa interval cũ nếu có
        heartbeatInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.ping(); // Gửi ping từ client
            }
        }, 30000); // Gửi ping mỗi 30 giây
    });

    ws.on('pong', () => {
        // Pong nhận được từ server, không cần làm gì nhưng có thể log để debug
        console.log('[LOG] Ping OK');
    });

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (!Array.isArray(data) || typeof data[1] !== 'object') return;
            
            const cmd = data[1].cmd;

            if (cmd === 1008 && data[1].sid) {
                id_phien_chua_co_kq = data[1].sid;
            }

            if (cmd === 1003 && data[1].gBB) {
                const { d1, d2, d3 } = data[1];
                const total = d1 + d2 + d3;
                const result = total > 10 ? "Tài" : "Xỉu";
                
                history.unshift({ result: result, total: total });
                if (history.length > 100) history.pop();

                const [prediction, confidence] = du_doan(history);
                const trendAnalysis = pt_xh(history);

                currentData = {
                    phien_truoc: id_phien_chua_co_kq,
                    ket_qua: `${result} - ${total}`,
                    Dice: [d1, d2, d3],
                    phien_hien_tai: id_phien_chua_co_kq ? id_phien_chua_co_kq + 1 : null,
                    du_doan: prediction,
                    do_tin_cay: `${confidence.toFixed(2)}%`,
                    cau: trendAnalysis,
                    ngay: new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
                    Id: "@ghetvietcode - Rinkivana"
                };
                
                console.log(`[LOG] Phiên ${id_phien_chua_co_kq} → ${d1}-${d2}-${d3} = ${total} (${result}) | Dự đoán: ${prediction} (${confidence.toFixed(2)}%) - ${trendAnalysis}`);
                id_phien_chua_co_kq = null;
            }
        } catch (err) {
            console.error('[ERROR] Lỗi xử lý message:', err.message);
        }
    });

    ws.on('close', () => {
        console.log('[WARN] WebSocket mất kết nối. Đang thử lại sau 2.5s...');
        clearInterval(heartbeatInterval); // **Quan trọng: Dọn dẹp interval khi kết nối đóng**
        setTimeout(connectWebSocket, 2500);
    });

    ws.on('error', (err) => {
        console.error('[ERROR] WebSocket gặp lỗi:', err.message);
        // Không cần gọi connectWebSocket ở đây, sự kiện 'close' sẽ được kích hoạt ngay sau đó và xử lý việc kết nối lại.
        ws.close(); // Đảm bảo đóng kết nối để kích hoạt 'close' event
    });
}

// ================== EXPRESS SERVER =====================
app.get('/taixiu', (req, res) => {
    res.json(currentData);
});

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>API Status</title>
        </head>
        <body>
            <h2>Sunwin Tài Xỉu API</h2>
            <p>API đang hoạt động. Trạng thái kết nối WebSocket được log trong console của server.</p>
            <p>
                <a href="/taixiu" target="_blank">Xem kết quả JSON mới nhất</a>
            </p>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`[LOG] Server Express đang chạy tại http://localhost:${PORT}`);
    // **Khởi tạo kết nối WebSocket với xử lý lỗi để tránh crash server**
    try {
        connectWebSocket();
    } catch (error) {
        console.error('[FATAL] Không thể khởi tạo WebSocket. Server vẫn chạy nhưng không có dữ liệu.', error.message);
    }
});
