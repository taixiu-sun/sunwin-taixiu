/**
 * Thuật toán dự đoán Tài/Xỉu dựa trên lịch sử các phiên.
 * @param {Array<Object>} ls - Lịch sử các phiên trước, mỗi object chứa { result: 'Tài'/'Xỉu', total: 14 }.
 * @returns {Array} - Một mảng chứa [Dự đoán, Độ tin cậy]. Ví dụ: ["Tài", 85].
 */
function du_doan_matchrandom(ls) {
  // =================================================================
  // ĐÂY LÀ NƠI BẠN ĐẶT THUẬT TOÁN "MATCHRANDOM" CỦA MÌNH
  //
  // Logic dưới đây chỉ là ví dụ mẫu.
  // Hãy thay thế nó bằng thuật toán thực tế của bạn.
  // =================================================================

  if (!ls || ls.length === 0) {
    return ["Tài", 50]; // Dự đoán mặc định nếu chưa có lịch sử
  }

  const lastResult = ls[0].result;
  const confidence = Math.random() * 25 + 70; // Tạo độ tin cậy ngẫu nhiên từ 70-95%

  // Ví dụ đơn giản: dự đoán ngược lại với kết quả cuối cùng
  if (lastResult === "Tài") {
    return ["Xỉu", confidence];
  } else {
    return ["Tài", confidence];
  }
}

// Xuất hàm để các file khác có thể sử dụng
module.exports = {
  du_doan_matchrandom
};
