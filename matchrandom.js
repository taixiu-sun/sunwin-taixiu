/**
 * Dự đoán kết quả và phân tích chi tiết.
 * @param {string[]} history - Mảng chứa lịch sử kết quả.
 * @returns {Array} - [dự đoán, độ tin cậy, % tài, % xỉu]
 */
function predictNext(history) {
  // Tính toán tỷ lệ % Tài/Xỉu một lần để sử dụng lại
  const counts = history.reduce((acc, val) => {
    acc[val.result] = (acc[val.result] || 0) + 1;
    return acc;
  }, { "Tài": 0, "Xỉu": 0 });

  const totalGames = history.length || 1; // Tránh chia cho 0
  const percentTai = (counts["Tài"] / totalGames) * 100;
  const percentXiu = (counts["Xỉu"] / totalGames) * 100;

  // 1. Nếu lịch sử quá ngắn
  if (history.length < 4) {
    const prediction = history.at(0)?.result || "Tài";
    // Trả về mảng 4 giá trị
    return [prediction, 30, percentTai, percentXiu];
  }

  const last = history[0].result;

  // 2. Quy tắc 1: Cầu bệt (độ tin cậy cao)
  if (history.slice(0, 4).every(k => k.result === last)) {
    return [last, 95, percentTai, percentXiu]; // Theo cầu
  }

  // 3. Quy tắc 2: Cầu 2-2
  const last4 = history.slice(0, 4);
  if (
    last4[0].result === last4[1].result &&
    last4[2].result === last4[3].result &&
    last4[0].result !== last4[2].result
  ) {
    const prediction = last === "Tài" ? "Xỉu" : "Tài";
    return [prediction, 85, percentTai, percentXiu]; // Bẻ cầu
  }

  // 4. Quy tắc 3: Cầu 1-2-1
  if (
    last4[0].result !== last4[1].result &&
    last4[1].result === last4[2].result &&
    last4[2].result !== last4[3].result
  ) {
    const prediction = last === "Tài" ? "Xỉu" : "Tài";
    return [prediction, 80, percentTai, percentXiu]; // Bẻ cầu
  }
  
  // 5. Quy tắc 4: Lặp lại chuỗi 3
  if (history.length >= 6) {
    const pattern = history.slice(3, 6).map(i => i.result).toString();
    const latest = history.slice(0, 3).map(i => i.result).toString();
    if (pattern === latest) {
      const prediction = history[2].result; // Lặp lại ký tự đầu của chuỗi 3
      return [prediction, 75, percentTai, percentXiu];
    }
  }

  // 6. Quy tắc cuối cùng: Thống kê và bẻ cầu (độ tin cậy thấp nhất)
  const prediction = percentTai > percentXiu ? "Xỉu" : "Tài";
  return [prediction, 55, percentTai, percentXiu];
}

// Export hàm để server.js có thể sử dụng
module.exports = { predictNext };
