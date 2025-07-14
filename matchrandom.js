const crypto = require('crypto');

/**
 * =================================================================
 * BỘ THUẬT TOÁN DỰ ĐOÁN MỚI (CHUYỂN THỂ TỪ PYTHON)
 * Tác giả: VanwNhat & Rinkivana
 * Phiên bản: V2.1 - Loại bỏ trạng thái "Chờ"
 * =================================================================
 */

// Helper function: Xác định Tài hay Xỉu từ tổng điểm
function getTaiXiu(total) {
  return total > 10 ? "Tài" : "Xỉu";
}

// ===== CÁC THUẬT TOÁN CON =====
function du_doan_v1(totals_list) {
  if (totals_list.length < 4) return ["Chờ", "Đợi thêm dữ liệu"];
  const last_result = getTaiXiu(totals_list.at(-1));
  const last_3 = totals_list.slice(-3);
  if (last_3[0] === last_3[2] && last_3[0] !== last_3[1]) {
    return [last_result === "Tài" ? "Xỉu" : "Tài", `Cầu sandwich ${last_3.join('-')}`];
  }
  return [last_result === "Tài" ? "Xỉu" : "Tài", "Cầu 1-1 mặc định"];
}

function du_doan_v2(totals_list) {
  if (totals_list.length < 4) return ["Chờ", 0, "Chưa đủ dữ liệu"];
  const last_result = getTaiXiu(totals_list.at(-1));
  const last_3 = totals_list.slice(-3);
  const last_4 = totals_list.slice(-4);
  if (last_4[0] === last_4[2] && last_4[0] === last_4[3] && last_4[0] !== last_4[1]) {
    return ["Tài", 85, `Cầu đặc biệt ${last_4.join('-')}`];
  }
  if (last_3[0] === last_3[2] && last_3[0] !== last_3[1]) {
    return [last_result === "Tài" ? "Xỉu" : "Tài", 83, `Cầu sandwich ${last_3.join('-')}`];
  }
  return [last_result === "Tài" ? "Xỉu" : "Tài", 71, "Không có cầu đặc biệt, bẻ cầu 1-1"];
}

function du_doan_v3(totals_list) {
  if (totals_list.length < 4) return ["Chờ", 0, "Không đủ dữ liệu"];
  const last_result = getTaiXiu(totals_list.at(-1));
  const types_list = totals_list.map(t => getTaiXiu(t));
  let chain = 1;
  for (let i = types_list.length - 1; i > 0; i--) {
    if (types_list[i] === types_list[i-1]) chain++;
    else break;
  }
  if (chain >= 4) {
    return [last_result === "Tài" ? "Xỉu" : "Tài", 78, `Chuỗi ${chain} ${types_list.at(-1)}`];
  }
  return [last_result === "Tài" ? "Xỉu" : "Tài", 70, "Không có quy tắc nổi bật"];
}

function du_doan_v4(kq_list, tong_list) {
  if (kq_list.length < 3) return ["Chờ", 50];
  const last_3_kq = kq_list.slice(-3);
  const last_tong = tong_list.at(-1);
  if (last_3_kq.join(',') === 'Tài,Tài,Tài') return ["Xỉu", 70];
  if (last_3_kq.join(',') === 'Xỉu,Xỉu,Xỉu') return ["Tài", 70];
  if (last_tong >= 15) return ["Xỉu", 60];
  if (last_tong <= 9) return ["Tài", 60];
  return [kq_list.at(-1), 50];
}

function du_doan_phan_tram(ma_phien) {
  if (!ma_phien) return ["Tài", 50];
  const algo1 = parseInt(crypto.createHash('sha256').update(ma_phien.toString()).digest('hex'), 16) % 100;
  const algo2 = [...ma_phien.toString()].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 100;
  const algo3 = parseInt(crypto.createHash('sha1').update(ma_phien.toString()).digest('hex').slice(-2), 16) % 100;
  const confidence = (algo1 + algo2 + algo3) / 3;
  return [confidence >= 50 ? "Tài" : "Xỉu", confidence];
}

function du_doan_v7(dice_list) {
    if (!dice_list || dice_list.length === 0) return ["Chờ", 50];
    const [d1, d2, d3] = dice_list.at(-1);
    const total = d1 + d2 + d3;
    const results = [d1, d2, d3].map(d => ((d + total) % 6) % 2 === 0 ? "Tài" : "Xỉu");
    const tai_count = results.filter(r => r === "Tài").length;
    const prediction = tai_count >= 2 ? "Tài" : "Xỉu";
    const confidence = (tai_count / 3) * 100;
    return [prediction, confidence];
}

function du_doan_v8(ds_tong) {
  let do_tin_cay = 0;
  const now = new Date();
  if (now.getHours() >= 0 && now.getHours() < 5) {
      return ["Chờ", 0, "Không áp dụng công thức vào 0h-5h sáng"];
  }
  if (ds_tong.length < 3) return ["Chờ", 0, "Không đủ dữ liệu"];
  if (ds_tong.at(-1) > 10 && ds_tong.at(-2) > 10 && ds_tong.at(-3) > 10) do_tin_cay += 15;
  if (ds_tong.at(-1) <= 10 && ds_tong.at(-2) <= 10 && ds_tong.at(-3) <= 10) do_tin_cay += 15;
  const du_doan = ds_tong.at(-1) > 10 ? "Xỉu" : "Tài";
  return [du_doan, Math.min(do_tin_cay, 100)];
}

/**
 * Hàm dự đoán chính, tổng hợp từ nhiều thuật toán con.
 * @param {Array} history - Mảng lịch sử kết quả, mỗi phần tử là { result, total, sid, dice }
 * @returns {Array} - [dự đoán cuối cùng, độ tin cậy, % tài, % xỉu]
 */
function predictNext(history) {
  // 1. Tính toán thống kê cơ bản
  const counts = history.reduce((acc, val) => {
    acc[val.result] = (acc[val.result] || 0) + 1;
    return acc;
  }, { "Tài": 0, "Xỉu": 0 });
  const totalGames = history.length || 1;
  const percentTai = (counts["Tài"] / totalGames) * 100;
  const percentXiu = (counts["Xỉu"] / totalGames) * 100;

  // 2. Luôn đưa ra dự đoán ngay cả khi lịch sử ngắn
  if (history.length < 5) {
    if (history.length === 0) {
      return ["Tài", 40, 0, 0];
    }
    const lastResult = history[0].result;
    const prediction = lastResult === "Tài" ? "Xỉu" : "Tài";
    const confidence = 40 + history.length * 5; 
    return [prediction, confidence, percentTai, percentXiu];
  }

  // 3. Chuẩn bị dữ liệu đầu vào cho các thuật toán
  const totals_list = history.map(h => h.total).reverse();
  const kq_list = history.map(h => h.result).reverse();
  const dice_list = history.map(h => h.dice).filter(Boolean).reverse();
  const ma_phien = history[0].sid;

  // 4. Chạy tất cả các thuật toán
  const predictions = [];
  predictions.push(du_doan_v1(totals_list)[0]);
  predictions.push(du_doan_v2(totals_list)[0]);
  predictions.push(du_doan_v3(totals_list)[0]);
  predictions.push(du_doan_v4(kq_list, totals_list)[0]);
  predictions.push(du_doan_phan_tram(ma_phien)[0]);
  if(dice_list.length > 0) predictions.push(du_doan_v7(dice_list)[0]);
  predictions.push(du_doan_v8(totals_list)[0]);
  
  const valid_predictions = predictions.filter(p => p === "Tài" || p === "Xỉu");

  // 5. Tổng hợp kết quả
  const tai_count = valid_predictions.filter(p => p === "Tài").length;
  const xiu_count = valid_predictions.filter(p => p === "Xỉu").length;

  let final_prediction;
  let confidence;

  if (tai_count > xiu_count) {
    final_prediction = "Tài";
    confidence = (tai_count / valid_predictions.length) * 100;
  } else if (xiu_count > tai_count) {
    final_prediction = "Xỉu";
    confidence = (xiu_count / valid_predictions.length) * 100;
  } else {
    final_prediction = kq_list.at(-1) === "Tài" ? "Xỉu" : "Tài";
    confidence = 55;
  }

  confidence = Math.max(55, Math.min(98, confidence));

  return [final_prediction, confidence, percentTai, percentXiu];
}

// Export hàm để server.js có thể sử dụng
module.exports = { predictNext };
