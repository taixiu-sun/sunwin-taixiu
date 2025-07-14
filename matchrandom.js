/**
 * Thuật toán "AI" phân tích đa yếu tố để dự đoán Tài/Xỉu.
 * - Khi có dưới 5 phiên, dự đoán NGẪU NHIÊN.
 * - Khi có từ 5 phiên trở lên, sử dụng logic AI phức tạp.
 *
 * @param {Array<Object>} history - Lịch sử các phiên, [{result: 'Tài', total: 11}, ...]
 * @returns {Array} - Mảng chứa [Dự đoán, Độ tin cậy, % Tài, % Xỉu], ví dụ: ["Tài", 75.5, 75.5, 24.5]
 */
function du_doan_matchrandom(history) {
    // Khi có dưới 5 phiên, dùng logic dự phòng ngẫu nhiên
    if (!history || history.length < 5) {
        return du_doan_ngau_nhien();
    }

    // Khi đã có đủ 5 phiên, chạy logic AI đầy đủ
    let tai_score = 0;
    let xiu_score = 0;

    // --- 1. Phân tích Cầu (Trọng số: 60%) ---
    const cau_analysis = phan_tich_cau(history);
    if (cau_analysis.prediction === 'Tài') {
        tai_score += cau_analysis.weight;
    } else if (cau_analysis.prediction === 'Xỉu') {
        xiu_score += cau_analysis.weight;
    }

    // --- 2. Phân tích Điểm Phiên Trước (Trọng số: 25%) ---
    const diem_analysis = phan_tich_diem(history);
    if (diem_analysis.prediction === 'Tài') {
        tai_score += diem_analysis.weight;
    } else if (diem_analysis.prediction === 'Xỉu') {
        xiu_score += diem_analysis.weight;
    }

    // --- 3. Phân tích Tần Suất (Trọng số: 15%) ---
    const tansuat_analysis = phan_tich_tan_suat(history, 20);
    if (tansuat_analysis.prediction === 'Tài') {
        tai_score += tansuat_analysis.weight;
    } else if (tansuat_analysis.prediction === 'Xỉu') {
        xiu_score += tansuat_analysis.weight;
    }

    // --- Tổng hợp kết quả và tính toán phần trăm ---
    const total_score = tai_score + xiu_score;

    let percent_tai = 50.0;
    let percent_xiu = 50.0;

    if (total_score > 0) {
        percent_tai = (tai_score / total_score) * 100;
        percent_xiu = 100 - percent_tai;
    }
    
    const final_prediction = percent_tai >= percent_xiu ? 'Tài' : 'Xỉu';
    const confidence = Math.max(percent_tai, percent_xiu);

    return [final_prediction, confidence, percent_tai, percent_xiu];
}

/**
 * Logic dự đoán ngẫu nhiên khi chưa có đủ lịch sử.
 * @returns {Array} - [Dự đoán, Độ tin cậy, % Tài, % Xỉu]
 */
function du_doan_ngau_nhien() {
    // 🎲 Chọn ngẫu nhiên giữa Tài và Xỉu
    const prediction = Math.random() < 0.5 ? "Tài" : "Xỉu";
    // Độ tin cậy ngẫu nhiên ở mức thấp
    const confidence = 50 + Math.random() * 15; // 50-65%
    
    let percent_tai, percent_xiu;

    if (prediction === 'Tài') {
        percent_tai = confidence;
        percent_xiu = 100 - confidence;
    } else {
        percent_xiu = confidence;
        percent_tai = 100 - confidence;
    }

    return [prediction, confidence, percent_tai, percent_xiu];
}


// ================== CÁC HÀM PHÂN TÍCH CHI TIẾT (GIỮ NGUYÊN) ==================

function phan_tich_cau(ls) {
    const weights = { "bệt": 40, "1-1": 40, "1-2": 35, "2-2": 35 };
    const history_str = ls.map(p => p.result === 'Tài' ? 't' : 'x').slice(0, 6).join('');
    if (history_str.startsWith('tttt')) return { prediction: 'Tài', weight: weights.bệt };
    if (history_str.startsWith('xxxx')) return { prediction: 'Xỉu', weight: weights.bệt };
    if (history_str.startsWith('txtx')) return { prediction: 'Tài', weight: weights["1-1"] };
    if (history_str.startsWith('xtxt')) return { prediction: 'Xỉu', weight: weights["1-1"] };
    if (history_str.startsWith('txxtxx')) return { prediction: 'Tài', weight: weights["1-2"] };
    if (history_str.startsWith('xttott')) return { prediction: 'Xỉu', weight: weights["1-2"] };
    if (history_str.startsWith('ttxx')) return { prediction: 'Tài', weight: weights["2-2"] };
    if (history_str.startsWith('xxtt')) return { prediction: 'Xỉu', weight: weights["2-2"] };
    const last_3 = history_str.substring(0, 3);
    if (last_3 === 'ttt') return { prediction: 'Tài', weight: 20 };
    if (last_3 === 'xxx') return { prediction: 'Xỉu', weight: 20 };
    return { prediction: null, weight: 0 };
}

function phan_tich_diem(ls) {
    const last_total = ls[0].total;
    const weight = 25;
    if (last_total >= 3 && last_total <= 8) return { prediction: 'Xỉu', weight: weight };
    if (last_total >= 13 && last_total <= 18) return { prediction: 'Tài', weight: weight };
    return { prediction: null, weight: 0 };
}

function phan_tich_tan_suat(ls, window_size) {
    const recent_history = ls.slice(0, window_size);
    const tai_count = recent_history.filter(p => p.result === 'Tài').length;
    const xiu_count = recent_history.length - tai_count;
    const percentage_diff = Math.abs(tai_count - xiu_count) / recent_history.length;
    const weight = 15 * percentage_diff;
    if (tai_count > xiu_count) return { prediction: 'Tài', weight: weight };
    if (xiu_count > tai_count) return { prediction: 'Xỉu', weight: weight };
    return { prediction: null, weight: 0 };
}

// Xuất hàm để server.js có thể sử dụng
module.exports = {
    du_doan_matchrandom
};
