/**
 * Dự đoán kết quả tiếp theo dựa vào lịch sử.
 * @param {string[]} history - Mảng chứa lịch sử kết quả, ví dụ: ["Tài", "Xỉu", "Tài"].
 * @returns {string} - "Tài" hoặc "Xỉu".
 */
function predictNext(history) {
  // 1. Nếu lịch sử quá ngắn (< 4 phiên)
  if (history.length < 4) {
    // Ưu tiên trả về kết quả của phiên gần nhất, nếu không có thì mặc định là "Tài"
    return history.at(-1) || "Tài";
  }

  const last = history.at(-1); // Kết quả của phiên cuối cùng

  // 2. Quy tắc 1: Cầu bệt (dây)
  // Nếu 4 phiên cuối cùng giống hệt nhau (VD: T, T, T, T) -> theo cầu
  if (history.slice(-4).every(k => k === last)) {
    return last;
  }

  // 3. Quy tắc 2: Cầu 2-2
  // Nếu 4 phiên cuối có dạng X, X, T, T -> bẻ cầu
  if (
    history.length >= 4 &&
    history.at(-1) === history.at(-2) && // 2 cái cuối giống nhau
    history.at(-3) === history.at(-4) && // 2 cái trước đó giống nhau
    history.at(-1) !== history.at(-3)    // 2 cặp này khác nhau
  ) {
    return last === "Tài" ? "Xỉu" : "Tài"; // Dự đoán ngược lại
  }

  // 4. Quy tắc 3: Cầu 1-2-1
  // Nếu 4 phiên cuối có dạng T, X, X, T -> bẻ cầu
  const last4 = history.slice(-4);
  if (last4[0] !== last4[1] && last4[1] === last4[2] && last4[2] !== last4[3]) {
    return last === "Tài" ? "Xỉu" : "Tài"; // Dự đoán ngược lại
  }

  // 5. Quy tắc 4: Lặp lại chuỗi 3
  // Nếu chuỗi 3 phiên gần nhất giống hệt chuỗi 3 phiên trước đó (VD: T,X,T, T,X,T) -> theo cầu
  if (history.length >= 6) {
      const pattern = history.slice(-6, -3).toString();
      const latest = history.slice(-3).toString();
      if (pattern === latest) {
        return history.at(-1);
      }
  }

  // 6. Quy tắc cuối cùng: Thống kê và bẻ cầu
  // Nếu không có quy tắc nào ở trên được áp dụng
  const count = history.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
  
  // Đếm tổng số lần Tài/Xỉu trong toàn bộ lịch sử.
  // Nếu "Tài" ra nhiều hơn thì đoán "Xỉu" và ngược lại.
  return (count["Tài"] || 0) > (count["Xỉu"] || 0) ? "Xỉu" : "Tài";
}

// ✅ THÊM DÒNG NÀY VÀO CUỐI FILE
// Dòng này giúp các file khác (như server.js) có thể gọi được hàm predictNext
module.exports = { predictNext };
