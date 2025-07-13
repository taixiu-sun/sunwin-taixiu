/**
 * Thuật toán "AI" phân tích đa yếu tố để dự đoán Tài/Xỉu.
 *
 * @param {Array<Object>} history - Lịch sử các phiên, [{result: 'Tài', total: 11}, ...]
 * @returns {Array} - Mảng chứa [Dự đoán, Độ tin cậy], ví dụ: ["Tài", 85.5]
 */
function du_doan_matchrandom(history) {
    if (!history || history.length < 5) {
        return ["Chờ đủ dữ liệu", 50]; // Cần ít nhất 5 phiên để phân tích
    }

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
    const tansuat_analysis = phan_tich_tan_suat(history, 20); // Phân tích trong 20 phiên gần nhất
    if (tansuat_analysis.prediction === 'Tài') {
        tai_score += tansuat_analysis.weight;
    } else if (tansuat_analysis.prediction === 'Xỉu') {
        xiu_score += tansuat_analysis.weight;
    }

    // --- Tổng hợp kết quả và tính độ tin cậy ---
    const final_prediction = tai_score > xiu_score ? 'Tài' : 'Xỉu';
    const total_score = tai_score + xiu_score;
    let confidence = 50;

    if (total_score > 0) {
        const winning_score = Math.max(tai_score, xiu_score);
        // Tính độ tin cậy dựa trên mức độ áp đảo của bên thắng
        confidence = 50 + (winning_score / total_score) * 45;
    }
    
    // Đảm bảo độ tin cậy không vượt quá 95%
    confidence = Math.min(confidence, 95);

    return [final_prediction, confidence];
}


// ================== CÁC HÀM PHÂN TÍCH CHI TIẾT ==================

/**
 * 🔗 Phân tích các loại cầu đang chạy.
 */
function phan_tich_cau(ls) {
    const weights = { "bệt": 40, "1-1": 40, "1-2": 35, "2-2": 35 };
    const history_str = ls.map(p => p.result === 'Tài' ? 't' : 'x').slice(0, 6).join('');

    // Cầu bệt (4+ nút)
    if (history_str.startsWith('tttt')) return { prediction: 'Tài', weight: weights.bệt };
    if (history_str.startsWith('xxxx')) return { prediction: 'Xỉu', weight: weights.bệt };

    // Cầu 1-1 (4+ nút)
    if (history_str.startsWith('txtx')) return { prediction: 'Tài', weight: weights["1-1"] };
    if (history_str.startsWith('xtxt')) return { prediction: 'Xỉu', weight: weights["1-1"] };
    
    // Cầu 1-2 (6 nút)
    if (history_str.startsWith('txxtxx')) return { prediction: 'Tài', weight: weights["1-2"] };
    if (history_str.startsWith('xttott')) return { prediction: 'Xỉu', weight: weights["1-2"] };

    // Cầu 2-2 (4 nút)
    if (history_str.startsWith('ttxx')) return { prediction: 'Tài', weight: weights["2-2"] };
    if (history_str.startsWith('xxtt')) return { prediction: 'Xỉu', weight: weights["2-2"] };

    // Bẻ cầu ngắn, theo cầu dài hơn (nếu có)
    const last_3 = history_str.substring(0, 3);
    if (last_3 === 'ttt') return { prediction: 'Tài', weight: 20 };
    if (last_3 === 'xxx') return { prediction: 'Xỉu', weight: 20 };

    return { prediction: null, weight: 0 }; // Không tìm thấy cầu rõ ràng
}

/**
 * 🎲 Phân tích điểm của phiên gần nhất.
 */
function phan_tich_diem(ls) {
    const last_total = ls[0].total;
    const weight = 25;

    if (last_total >= 3 && last_total <= 8) {
        // Điểm thấp, có xu hướng về Xỉu
        return { prediction: 'Xỉu', weight: weight };
    }
    if (last_total >= 13 && last_total <= 18) {
        // Điểm cao, có xu hướng về Tài
        return { prediction: 'Tài', weight: weight };
    }
    // Điểm trung bình, không có chỉ báo rõ ràng
    return { prediction: null, weight: 0 };
}

/**
 * 📊 Phân tích tần suất Tài/Xỉu trong một khoảng phiên.
 */
function phan_tich_tan_suat(ls, window_size) {
    const recent_history = ls.slice(0, window_size);
    const tai_count = recent_history.filter(p => p.result === 'Tài').length;
    const xiu_count = recent_history.length - tai_count;

    const percentage_diff = Math.abs(tai_count - xiu_count) / recent_history.length;
    const weight = 15 * percentage_diff; // Trọng số càng cao nếu chênh lệch càng lớn

    if (tai_count > xiu_count) {
        return { prediction: 'Tài', weight: weight };
    }
    if (xiu_count > tai_count) {
        return { prediction: 'Xỉu', weight: weight };
    }
    return { prediction: null, weight: 0 };
}


// Xuất hàm để server.js có thể sử dụng
module.exports = {
    du_doan_matchrandom
};
