// ================== BỘ DỮ LIỆU THỐNG KÊ (GIỮ NGUYÊN) ==================
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
    "ttxtx": {"tai": 62, "xiu": 38}, "xxtxt": {"tai": 38, "xiu": 62},
    "ttxxt": {"tai": 55, "xiu": 45}, "xxttx": {"tai": 45, "xiu": 55},
    "tttttx": {"tai": 30, "xiu": 70}, "xxxxxt": {"tai": 70, "xiu": 30},
    "tttttttx": {"tai": 20, "xiu": 80}, "xxxxxxxt": {"tai": 80, "xiu": 20},
    "ttttttttx": {"tai": 15, "xiu": 85}, "xxxxxxxxt": {"tai": 85, "xiu": 15},
    "txtx": {"tai": 52, "xiu": 48}, "xtxt": {"tai": 48, "xiu": 52},
    "txtxt": {"tai": 53, "xiu": 47}, "xtxtx": {"tai": 47, "xiu": 53},
    "txtxtxt": {"tai": 57, "xiu": 43}, "xtxtxtx": {"tai": 43, "xiu": 57},
    "ttxxttxx": {"tai": 38, "xiu": 62}, "xxttxxtt": {"tai": 62, "xiu": 38},
    "ttxxxttx": {"tai": 45, "xiu": 55}, "xxttxxxt": {"tai": 55, "xiu": 45},
    "ttxtxttx": {"tai": 50, "xiu": 50}, "xxtxtxxt": {"tai": 50, "xiu": 50},
    "ttxttx": {"tai": 60, "xiu": 40}, "xxtxxt": {"tai": 40, "xiu": 60},
    "ttxxtx": {"tai": 58, "xiu": 42},
    "ttxtxtx": {"tai": 62, "xiu": 38}, "xxtxtxt": {"tai": 38, "xiu": 62},
    "ttxxtxt": {"tai": 55, "xiu": 45}, "xxtxttx": {"tai": 45, "xiu": 55},
    "ttxtxxt": {"tai": 65, "xiu": 35},
    "ttxtxttx": {"tai": 70, "xiu": 30}, "xxtxtxxt": {"tai": 30, "xiu": 70},
    "ttxxtxtx": {"tai": 68, "xiu": 32}, "xxtxtxtx": {"tai": 32, "xiu": 68},
    "ttxtxxtx": {"tai": 72, "xiu": 28},
    "ttxxtxxt": {"tai": 75, "xiu": 25},
};
const CAU_DEP = {
    "Tai": {
        "3": {"next_tai": 65, "next_xiu": 35}, "4": {"next_tai": 70, "next_xiu": 30},
        "5": {"next_tai": 75, "next_xiu": 25}, "6": {"next_tai": 80, "next_xiu": 20},
        "7": {"next_tai": 85, "next_xiu": 15}, "8": {"next_tai": 88, "next_xiu": 12},
        "9": {"next_tai": 90, "next_xiu": 10}, "10+": {"next_tai": 92, "next_xiu": 8}
    },
    "Xiu": {
        "3": {"next_tai": 35, "next_xiu": 65}, "4": {"next_tai": 30, "next_xiu": 70},
        "5": {"next_tai": 25, "next_xiu": 75}, "6": {"next_tai": 20, "next_xiu": 80},
        "7": {"next_tai": 15, "next_xiu": 85}, "8": {"next_tai": 12, "next_xiu": 88},
        "9": {"next_tai": 10, "next_xiu": 90}, "10+": {"next_tai": 8, "next_xiu": 92}
    }
};
const NUMBER_ZZZ = {
    "3-10": {"tai": 0, "xiu": 100}, "11": {"tai": 15, "xiu": 85},
    "12": {"tai": 25, "xiu": 75}, "13": {"tai": 40, "xiu": 60},
    "14": {"tai": 50, "xiu": 50}, "15": {"tai": 60, "xiu": 40},
    "16": {"tai": 75, "xiu": 25}, "17": {"tai": 85, "xiu": 15},
    "18": {"tai": 100, "xiu": 0}
};
const CAU_LIST_KEYS = Object.keys(CAU_LIST).sort((a, b) => b.length - a.length);

/**
 * HÀM DỰ ĐOÁN CHÍNH
 * @returns {Array} - [prediction, confidence, percent_tai, percent_xiu]
 */
function du_doan_matchrandom(history) {
    if (!history || history.length < 5) {
        return du_doan_ngau_nhien();
    }

    // Ưu tiên 1: Cầu Đẹp
    const cauDepResult = phan_tich_cau_dep(history);
    if (cauDepResult) {
        const { tai, xiu } = cauDepResult;
        const prediction = tai > xiu ? "Tài" : "Xỉu";
        const confidence = Math.max(tai, xiu);
        return [prediction, confidence, tai, xiu];
    }

    // Ưu tiên 2: Điểm Zzz
    const numberZzzResult = phan_tich_number_zzz(history);
    if (numberZzzResult) {
        const { tai, xiu } = numberZzzResult;
        if (tai !== 50 || xiu !== 50) {
            const prediction = tai > xiu ? "Tài" : "Xỉu";
            const confidence = Math.max(tai, xiu);
            return [prediction, confidence, tai, xiu === 100 ? 98 : xiu];
        }
    }

    // Ưu tiên 3: Cầu List
    const cauListResult = phan_tich_cau_list(history);
    if (cauListResult) {
        const { tai, xiu } = cauListResult;
        const prediction = tai > xiu ? "Tài" : "Xỉu";
        const confidence = Math.max(tai, xiu);
        return [prediction, confidence, tai, xiu];
    }
    
    // Fallback
    return du_doan_ngau_nhien();
}

function du_doan_ngau_nhien() {
    const tai_percent = 45 + Math.random() * 10; // 45-55%
    const xiu_percent = 100 - tai_percent;
    const prediction = tai_percent > xiu_percent ? "Tài" : "Xỉu";
    const confidence = Math.max(tai_percent, xiu_percent);
    return [prediction, confidence, tai_percent, xiu_percent];
}

function phan_tich_cau_dep(history) {
    if (history.length < 3) return null;
    const lastResult = history[0].result;
    let streak = 0;
    for (const item of history) {
        if (item.result === lastResult) streak++;
        else break;
    }
    if (streak >= 3) {
        const key = streak >= 10 ? "10+" : String(streak);
        const rule = CAU_DEP[lastResult === 'Tài' ? 'Tai' : 'Xiu'][key];
        if (rule) return { tai: rule.next_tai, xiu: rule.next_xiu };
    }
    return null;
}

function phan_tich_number_zzz(history) {
    const lastTotal = history[0].total;
    let key;
    if (lastTotal >= 3 && lastTotal <= 10) key = "3-10";
    else if (lastTotal >= 11 && lastTotal <= 18) key = String(lastTotal);
    if (key && NUMBER_ZZZ[key]) return NUMBER_ZZZ[key];
    return null;
}

function phan_tich_cau_list(history) {
    const history_str = history.map(p => p.result === 'Tài' ? 't' : 'x').join('');
    for (const key of CAU_LIST_KEYS) {
        if (history_str.startsWith(key)) return CAU_LIST[key];
    }
    return null;
}

module.exports = { du_doan_matchrandom };
