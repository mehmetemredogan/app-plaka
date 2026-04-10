const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const cameraBtn = document.getElementById('cameraBtn');
const cameraVideo = document.getElementById('cameraVideo');
const imagePreview = document.getElementById('imagePreview');
const captureBtn = document.getElementById('captureBtn');
const closePreviewBtn = document.getElementById('closePreviewBtn');
const previewArea = document.getElementById('previewArea');
const contentArea = document.querySelector('.upload-content');
const scannerLine = document.getElementById('scannerLine');
const scanningText = document.getElementById('scanningText');
const resultSection = document.getElementById('resultSection');
const resultTitle = document.getElementById('resultTitle');
const statusBadge = document.getElementById('statusBadge');
const detectedPlateText = document.getElementById('detectedPlateText');
const checkList = document.getElementById('checkList');
const resetBtn = document.getElementById('resetBtn');

let currentStream = null;
let capturedImageSrc = null;

const TR_ALLOWED_LETTERS = 'ABCDEFGHIJKLMNPRSTUVYZ';
const OCR_ALPHA_TO_NUM = { O: '0', I: '1', B: '8', S: '5', Z: '2', G: '6' };
const OCR_NUM_TO_ALPHA = { 0: 'O', 1: 'I', 2: 'Z', 5: 'S', 6: 'G', 8: 'B' };

function isValidCityCode(code) {
    const n = parseInt(code, 10);
    return Number.isFinite(n) && n >= 1 && n <= 81;
}

function normalizeOCRText(raw) {
    return (raw || '')
        .toUpperCase()
        .replace(/[\n\r\t]/g, ' ')
        .replace(/[^A-Z0-9 ]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function tryParseCompactToken(token) {
    if (!token || token.length < 5 || token.length > 10) {
        return null;
    }

    const compact = token.replace(/\s+/g, '');
    if (!/^\d{2}[A-Z0-9]{1,6}\d{2,4}$/.test(compact)) {
        return null;
    }

    const city = compact.slice(0, 2);
    if (!isValidCityCode(city)) {
        return null;
    }

    const tail = compact.slice(2);
    for (let letterLen = 1; letterLen <= 3; letterLen++) {
        const lettersRaw = tail.slice(0, letterLen);
        const digitsRaw = tail.slice(letterLen);
        if (!digitsRaw || digitsRaw.length < 2 || digitsRaw.length > 4) {
            continue;
        }

        const letterReplacementCount = lettersRaw.split('').reduce((sum, ch) => {
            return sum + (OCR_NUM_TO_ALPHA[ch] ? 1 : 0);
        }, 0);
        const digitReplacementCount = digitsRaw.split('').reduce((sum, ch) => {
            return sum + (OCR_ALPHA_TO_NUM[ch] ? 1 : 0);
        }, 0);

        const letters = lettersRaw.split('').map(ch => OCR_NUM_TO_ALPHA[ch] || ch).join('');
        const digits = digitsRaw.split('').map(ch => OCR_ALPHA_TO_NUM[ch] || ch).join('');

        if (!new RegExp(`^[${TR_ALLOWED_LETTERS}]{1,3}$`).test(letters)) {
            continue;
        }
        if (!/^\d{2,4}$/.test(digits)) {
            continue;
        }

        // Avoid over-synthetic plates created mostly by OCR substitutions.
        if (letterLen >= 2 && letterReplacementCount === letterLen) {
            continue;
        }
        if (digitReplacementCount > 2) {
            continue;
        }
        if (letterReplacementCount + digitReplacementCount > 3) {
            continue;
        }

        return `${city} ${letters} ${digits}`;
    }

    return null;
}

function extractCompactCandidates(normalized) {
    const compact = normalized.replace(/\s+/g, '');
    const out = new Set();

    // Whole compact string and common OCR variants.
    out.add(compact);
    if (compact.startsWith('TR')) {
        out.add(compact.slice(2));
    }

    // Capture all plausible plate-like substrings from noisy OCR output.
    const pattern = /(?:TR)?([0-9]{2}[A-Z0-9]{3,8})/g;
    let match;
    while ((match = pattern.exec(compact)) !== null) {
        out.add(match[1]);
    }

    return Array.from(out).filter(item => item && item.length >= 5 && item.length <= 10);
}

function parsePlate(raw) {
    const normalized = normalizeOCRText(raw);
    if (!normalized) {
        return null;
    }

    const tokens = normalized.split(' ');

    // Candidate 0: compact extraction from whole OCR output (e.g. TR34APP081 -> 34 APP 081).
    const compactCandidates = extractCompactCandidates(normalized);
    for (const item of compactCandidates) {
        const parsed = tryParseCompactToken(item);
        if (parsed) {
            return parsed;
        }
    }

    // Candidate 1: full string compact parse.
    const fromFull = tryParseCompactToken(tokens.join(''));
    if (fromFull) {
        return fromFull;
    }

    // Candidate 2: sliding 3-token windows to isolate text in noisy OCR output.
    for (let i = 0; i < tokens.length; i++) {
        for (let j = i + 1; j <= Math.min(tokens.length, i + 3); j++) {
            const candidate = tryParseCompactToken(tokens.slice(i, j).join(''));
            if (candidate) {
                return candidate;
            }

            // Also try concatenating by dropping a leading TR in token windows.
            const windowCompact = tokens.slice(i, j).join('');
            if (windowCompact.startsWith('TR')) {
                const stripped = tryParseCompactToken(windowCompact.slice(2));
                if (stripped) {
                    return stripped;
                }
            }
        }
    }

    return null;
}

function preprocessImage(src, mode) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width * 2;
            canvas.height = img.height * 2;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                let gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

                if (mode === 'binary_high') {
                    gray = gray > 100 ? 255 : 0;
                } else if (mode === 'binary_low') {
                    gray = gray > 150 ? 255 : 0;
                } else if (mode === 'contrast') {
                    gray = Math.min(255, Math.max(0, (gray - 128) * 2.5 + 128));
                }

                data[i] = data[i + 1] = data[i + 2] = gray;
            }

            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.src = src;
    });
}

async function ocrPass(worker, image, psm) {
    await worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ ',
        tessedit_pageseg_mode: String(psm),
    });
    const { data } = await worker.recognize(image);
    return {
        text: data?.text || '',
        confidence: Number.isFinite(data?.confidence) ? data.confidence : 0,
    };
}

async function detectPlateFeatures(imageSrc) {
    return new Promise((resolve) => {
        if (typeof cv === 'undefined' || !cv.Mat) {
            setTimeout(() => resolve({
                plateFound: false,
                isStandardRatio: false,
                ratio: 0,
                croppedImg: null,
                blueBandScore: 0,
                blueBandDetected: false,
                charCount: 0,
                charDensity: 0,
                isFontLikelyBold: false,
                logoScore: 0,
                logoDetected: false,
                edgeSharpnessScore: 0,
                sealComplexityScore: 0,
                wavyStripeScore: 0,
            }), 500);
            return;
        }

        const img = new Image();
        img.onload = () => {
            let src;
            let gray;
            let blurred;
            let edges;
            let contours;
            let hierarchy;
            try {
                src = cv.imread(img);
                gray = new cv.Mat();
                cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

                blurred = new cv.Mat();
                cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);

                edges = new cv.Mat();
                cv.Canny(blurred, edges, 50, 150, 3, false);

                contours = new cv.MatVector();
                hierarchy = new cv.Mat();
                cv.findContours(edges, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

                let maxArea = 0;
                let bestRect = null;
                let bestRatio = 0;

                for (let i = 0; i < contours.size(); ++i) {
                    const cnt = contours.get(i);
                    const area = cv.contourArea(cnt);
                    if (area < 1200) {
                        cnt.delete();
                        continue;
                    }

                    const rect = cv.boundingRect(cnt);
                    const ratio = rect.width / Math.max(1, rect.height);
                    const plausible = (ratio > 3.0 && ratio < 6.6) || (ratio > 1.2 && ratio < 2.0);
                    if (plausible && area > maxArea) {
                        maxArea = area;
                        bestRect = rect;
                        bestRatio = ratio;
                    }
                    cnt.delete();
                }

                if (!bestRect) {
                    resolve({
                        plateFound: false,
                        isStandardRatio: false,
                        ratio: 0,
                        croppedImg: null,
                        blueBandScore: 0,
                        blueBandDetected: false,
                        charCount: 0,
                        charDensity: 0,
                        isFontLikelyBold: false,
                        logoScore: 0,
                        logoDetected: false,
                        edgeSharpnessScore: 0,
                        sealComplexityScore: 0,
                        wavyStripeScore: 0,
                    });
                    return;
                }

                const isRectangular = bestRatio >= 4.0 && bestRatio <= 5.4;
                const isSquare = bestRatio >= 1.3 && bestRatio <= 1.7;
                const isStandardRatio = isRectangular || isSquare;

                const marginX = Math.floor(bestRect.width * 0.02);
                const marginYTop = Math.floor(bestRect.height * 0.02);
                const marginYBot = Math.floor(bestRect.height * 0.12);

                const rx = Math.max(0, bestRect.x + marginX);
                const ry = Math.max(0, bestRect.y + marginYTop);
                const rw = Math.min(src.cols - rx, bestRect.width - (2 * marginX));
                const rh = Math.min(src.rows - ry, bestRect.height - marginYTop - marginYBot);

                if (rw <= 20 || rh <= 10) {
                    resolve({
                        plateFound: false,
                        isStandardRatio,
                        ratio: bestRatio,
                        croppedImg: null,
                        blueBandScore: 0,
                        blueBandDetected: false,
                        charCount: 0,
                        charDensity: 0,
                        isFontLikelyBold: false,
                        logoScore: 0,
                        logoDetected: false,
                        edgeSharpnessScore: 0,
                        sealComplexityScore: 0,
                        wavyStripeScore: 0,
                    });
                    return;
                }

                const roi = new cv.Rect(rx, ry, rw, rh);
                const plate = src.roi(roi);

                const previewCanvas = document.createElement('canvas');
                cv.imshow(previewCanvas, plate);
                const croppedImg = previewCanvas.toDataURL('image/png');

                // 1) TR mavi bant olasılığı: sol %18 alanda mavi piksel oranı.
                const hsv = new cv.Mat();
                cv.cvtColor(plate, hsv, cv.COLOR_RGBA2HSV, 0);

                const bandW = Math.max(1, Math.floor(plate.cols * 0.18));
                const bandRect = new cv.Rect(0, 0, bandW, plate.rows);
                const leftBand = hsv.roi(bandRect);

                const lowBlue = new cv.Mat(leftBand.rows, leftBand.cols, leftBand.type(), [90, 60, 50, 0]);
                const highBlue = new cv.Mat(leftBand.rows, leftBand.cols, leftBand.type(), [140, 255, 255, 255]);
                const blueMask = new cv.Mat();
                cv.inRange(leftBand, lowBlue, highBlue, blueMask);

                const bluePixels = cv.countNonZero(blueMask);
                const blueBandScore = bluePixels / Math.max(1, leftBand.rows * leftBand.cols);
                const blueBandDetected = blueBandScore > 0.14;

                // 2) Karakter yoğunluğu/kalınlık heuristiği.
                const plateGray = new cv.Mat();
                cv.cvtColor(plate, plateGray, cv.COLOR_RGBA2GRAY, 0);
                const thr = new cv.Mat();
                cv.threshold(plateGray, thr, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU);

                const charContours = new cv.MatVector();
                const charHierarchy = new cv.Mat();
                cv.findContours(thr, charContours, charHierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

                let charCount = 0;
                let fillSum = 0;
                for (let i = 0; i < charContours.size(); ++i) {
                    const cnt = charContours.get(i);
                    const rect = cv.boundingRect(cnt);
                    const h = rect.height;
                    const w = rect.width;
                    const area = cv.contourArea(cnt);

                    if (h > plate.rows * 0.35 && h < plate.rows * 0.95 && w > 3 && w < plate.cols * 0.25) {
                        const boxArea = Math.max(1, w * h);
                        const fill = area / boxArea;
                        if (fill > 0.1 && fill < 0.95) {
                            charCount += 1;
                            fillSum += fill;
                        }
                    }
                    cnt.delete();
                }
                const charDensity = charCount > 0 ? fillSum / charCount : 0;
                const isFontLikelyBold = charCount >= 4 && charDensity > 0.48;

                // 3) Logo (ayyıldız) tespiti: mavi bantta beyaz piksel kümesi.
                const lowWhite = new cv.Mat(leftBand.rows, leftBand.cols, leftBand.type(), [0, 0, 190, 0]);
                const highWhite = new cv.Mat(leftBand.rows, leftBand.cols, leftBand.type(), [180, 50, 255, 255]);
                const logoMask = new cv.Mat();
                cv.inRange(leftBand, lowWhite, highWhite, logoMask);
                const logoWhitePixels = cv.countNonZero(logoMask);
                const logoScore = logoWhitePixels / Math.max(1, leftBand.rows * leftBand.cols);
                const logoDetected = blueBandDetected && logoScore > 0.03 && logoScore < 0.50;
                lowWhite.delete();
                highWhite.delete();
                logoMask.delete();

                // 4) Kenar keskinliği (emboss kalitesi): Laplacian ortalaması.
                const lapMat = new cv.Mat();
                cv.Laplacian(plateGray, lapMat, cv.CV_64F, 1, 1, 0, cv.BORDER_DEFAULT);
                const lapAbs = new cv.Mat();
                cv.convertScaleAbs(lapMat, lapAbs);
                const lapMean = cv.mean(lapAbs);
                const edgeSharpnessScore = Math.min(1, lapMean[0] / 40);
                lapMat.delete();
                lapAbs.delete();

                // 5) Mühür bölgesi karmaşıklığı: sağ alt köşe ROI.
                let sealComplexityScore = 0;
                const sealX = rx + Math.floor(rw * 0.72);
                const sealY = ry + Math.floor(rh * 0.52);
                const sealW = Math.min(src.cols - sealX, Math.floor(rw * 0.26));
                const sealH = Math.min(src.rows - sealY, Math.floor(rh * 0.46));
                if (sealW > 6 && sealH > 6) {
                    const sealROI = src.roi(new cv.Rect(sealX, sealY, sealW, sealH));
                    const sealGray = new cv.Mat();
                    cv.cvtColor(sealROI, sealGray, cv.COLOR_RGBA2GRAY, 0);
                    const sealThr = new cv.Mat();
                    cv.threshold(sealGray, sealThr, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU);
                    const sealCtr = new cv.MatVector();
                    const sealHier = new cv.Mat();
                    cv.findContours(sealThr, sealCtr, sealHier, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
                    let sealSmallCount = 0;
                    for (let i = 0; i < sealCtr.size(); ++i) {
                        const cnt = sealCtr.get(i);
                        const area = cv.contourArea(cnt);
                        if (area >= 2 && area <= sealW * sealH * 0.12) {
                            sealSmallCount++;
                        }
                        cnt.delete();
                    }
                    sealComplexityScore = Math.min(1, sealSmallCount / 8);
                    sealROI.delete();
                    sealGray.delete();
                    sealThr.delete();
                    sealCtr.delete();
                    sealHier.delete();
                }

                // 6) Dalgalı güvenlik şeridi: plaka alt kenar bölgesi gradyan karmaşıklığı.
                let wavyStripeScore = 0;
                const stripeRy = Math.max(0, ry + rh);
                const stripeRh = Math.min(src.rows - stripeRy, marginYBot);
                const stripeRw = Math.min(src.cols - rx, rw);
                if (stripeRh > 3 && stripeRw > 20) {
                    const stripeROI = src.roi(new cv.Rect(rx, stripeRy, stripeRw, stripeRh));
                    const stripeGray = new cv.Mat();
                    cv.cvtColor(stripeROI, stripeGray, cv.COLOR_RGBA2GRAY, 0);
                    const stripeLap = new cv.Mat();
                    cv.Laplacian(stripeGray, stripeLap, cv.CV_64F, 1, 1, 0, cv.BORDER_DEFAULT);
                    const stripeLapAbs = new cv.Mat();
                    cv.convertScaleAbs(stripeLap, stripeLapAbs);
                    const stripeMean = cv.mean(stripeLapAbs);
                    wavyStripeScore = Math.min(1, stripeMean[0] / 25);
                    stripeROI.delete();
                    stripeGray.delete();
                    stripeLap.delete();
                    stripeLapAbs.delete();
                }

                plate.delete();
                hsv.delete();
                leftBand.delete();
                lowBlue.delete();
                highBlue.delete();
                blueMask.delete();
                plateGray.delete();
                thr.delete();
                charContours.delete();
                charHierarchy.delete();

                resolve({
                    plateFound: true,
                    isStandardRatio,
                    ratio: bestRatio,
                    croppedImg,
                    blueBandScore,
                    blueBandDetected,
                    charCount,
                    charDensity,
                    isFontLikelyBold,
                    logoScore,
                    logoDetected,
                    edgeSharpnessScore,
                    sealComplexityScore,
                    wavyStripeScore,
                });
            } catch (e) {
                console.error('OpenCV analysis error:', e);
                resolve({
                    plateFound: false,
                    isStandardRatio: false,
                    ratio: 0,
                    croppedImg: null,
                    blueBandScore: 0,
                    blueBandDetected: false,
                    charCount: 0,
                    charDensity: 0,
                    isFontLikelyBold: false,
                    logoScore: 0,
                    logoDetected: false,
                    edgeSharpnessScore: 0,
                    sealComplexityScore: 0,
                    wavyStripeScore: 0,
                });
            } finally {
                if (src) src.delete();
                if (gray) gray.delete();
                if (blurred) blurred.delete();
                if (edges) edges.delete();
                if (contours) contours.delete();
                if (hierarchy) hierarchy.delete();
            }
        };
        img.src = imageSrc;
    });
}

async function runOCR(imageSrc) {
    try {
        const [binHigh, binLow, contrast] = await Promise.all([
            preprocessImage(imageSrc, 'binary_high'),
            preprocessImage(imageSrc, 'binary_low'),
            preprocessImage(imageSrc, 'contrast')
        ]);

        const worker = await Tesseract.createWorker('eng', 1, { logger: () => { } });
        const ocrCandidates = [];

        for (const psm of [7, 6, 8]) {
            for (const img of [binHigh, binLow, contrast, imageSrc]) {
                const pass = await ocrPass(worker, img, psm);
                const plate = parsePlate(pass.text);
                const normalized = normalizeOCRText(pass.text);

                ocrCandidates.push({
                    raw: normalized,
                    plate,
                    confidence: pass.confidence,
                    baseScore: (plate ? 60 : 0) + Math.max(0, Math.min(40, pass.confidence * 0.4)),
                    score: 0,
                });
            }
        }

        await worker.terminate();

        if (ocrCandidates.length === 0) {
            return { plateText: null, rawText: '', confidence: 0 };
        }

        const plateVotes = new Map();
        for (const candidate of ocrCandidates) {
            if (!candidate.plate) {
                continue;
            }
            plateVotes.set(candidate.plate, (plateVotes.get(candidate.plate) || 0) + 1);
        }

        for (const candidate of ocrCandidates) {
            const votes = candidate.plate ? (plateVotes.get(candidate.plate) || 0) : 0;
            const consensusBonus = candidate.plate ? Math.max(0, votes - 1) * 12 : 0;
            const lowConfidencePenalty = candidate.plate && candidate.confidence < 35 ? 18 : 0;
            candidate.score = candidate.baseScore + consensusBonus - lowConfidencePenalty;
        }

        ocrCandidates.sort((a, b) => b.score - a.score);
        const best = ocrCandidates[0];

        console.log('OCR Adayları:', ocrCandidates.slice(0, 5).map(c => ({ 
            plate: c.plate, 
            raw: c.raw.substring(0, 50), 
            score: c.score.toFixed(1) 
        })));
        console.log('En İyi Aday:', best);

        return {
            plateText: best.plate,
            rawText: best.raw,
            confidence: Math.round(best.confidence || 0),
        };
    } catch (e) {
        console.error('OCR Error:', e);
        return { plateText: null, rawText: '', confidence: 0 };
    }
}

function evaluatePlate(ocr, visual) {
    const checks = [];
    let complianceScore = 0;
    let authenticityScore = 0;
    let suspicion = 0;

    if (ocr.plateText) {
        complianceScore += 35;
        checks.push({ type: 'pass', text: `TR formatında plaka okundu: ${ocr.plateText}` });
    } else {
        suspicion += 35;
        checks.push({ type: 'fail', text: 'TR plaka formatı güvenilir şekilde okunamadı.' });
    }

    if (ocr.confidence >= 60) {
        complianceScore += 20;
        checks.push({ type: 'pass', text: `OCR güveni iyi (%${ocr.confidence}).` });
    } else if (ocr.confidence >= 35) {
        complianceScore += 10;
        suspicion += 10;
        checks.push({ type: 'warn', text: `OCR güveni orta (%${ocr.confidence}), karakter eksik/yanlış olabilir.` });
    } else {
        suspicion += 20;
        checks.push({ type: 'warn', text: `OCR güveni düşük (%${ocr.confidence}), daha net açı/ışık önerilir.` });
    }

    if (visual.plateFound) {
        complianceScore += 12;
        checks.push({ type: 'pass', text: 'Plaka benzeri dikdörtgen bölge tespit edildi.' });
    } else {
        suspicion += 30;
        checks.push({ type: 'fail', text: 'Görüntüde güçlü plaka bölgesi bulunamadı.' });
    }

    if (visual.isStandardRatio) {
        complianceScore += 10;
        authenticityScore += 20;
        checks.push({ type: 'pass', text: `Plaka oranı standart aralıkta (oran: ${visual.ratio.toFixed(2)}).` });
    } else if (visual.ratio > 0) {
        suspicion += 15;
        checks.push({ type: 'warn', text: `Plaka oranı standart dışı olabilir (oran: ${visual.ratio.toFixed(2)}).` });
    }

    if (visual.blueBandDetected) {
        authenticityScore += 40;
        checks.push({ type: 'pass', text: `Sol bantta TR mavi alan olasılığı yüksek (%${Math.round(visual.blueBandScore * 100)}).` });
    } else {
        suspicion += 15;
        checks.push({ type: 'warn', text: 'Sol bantta TR mavi alan zayıf; APP ya da açı/ışık kaynaklı olabilir.' });
    }

    if (visual.charCount >= 5 && visual.charCount <= 9) {
        complianceScore += 8;
        authenticityScore += 20;
        checks.push({ type: 'pass', text: `Karakter segment sayısı makul (${visual.charCount}).` });
    } else if (visual.charCount > 0) {
        suspicion += 10;
        checks.push({ type: 'warn', text: `Karakter segment sayısı sıra dışı (${visual.charCount}); eksik/fazla karakter olabilir.` });
    }

    if (visual.isFontLikelyBold) {
        suspicion += 18;
        checks.push({ type: 'warn', text: 'Karakter doluluk oranı yüksek: APP/bold font ihtimali var.' });
    }

    // Güvenlik özelliği sinyalleri: logo, mühür, şerit, emboss kalitesi.
    if (visual.logoDetected) {
        authenticityScore += 30;
        checks.push({ type: 'pass', text: `Mavi bantta ayyıldız logo sinyali tespit edildi (%${Math.round(visual.logoScore * 100)}).` });
    } else if (visual.blueBandDetected) {
        suspicion += 15;
        checks.push({ type: 'warn', text: 'Mavi bantta logo sinyali zayıf; APP plaka veya düşük çözünürlük olabilir.' });
    }

    if (visual.sealComplexityScore > 0.45) {
        authenticityScore += 20;
        checks.push({ type: 'pass', text: `Mühür bölgesi karmaşıklığı gerçek baskıyla uyumlu (%${Math.round(visual.sealComplexityScore * 100)}).` });
    } else if (visual.plateFound) {
        suspicion += 12;
        checks.push({ type: 'warn', text: 'Mühür bölgesi karmaşıklığı düşük; APP baskı veya düşük çözünürlük olabilir.' });
    }

    if (visual.wavyStripeScore > 0.30) {
        authenticityScore += 10;
        checks.push({ type: 'pass', text: `Alt kenarda güvenlik şeridi sinyali mevcut (%${Math.round(visual.wavyStripeScore * 100)}).` });
    }

    if (visual.edgeSharpnessScore > 0.35) {
        authenticityScore += 10;
        checks.push({ type: 'pass', text: `Karakter kenar keskinliği kabartma baskıyla uyumlu (%${Math.round(visual.edgeSharpnessScore * 100)}).` });
    } else if (visual.plateFound) {
        suspicion += 10;
        checks.push({ type: 'warn', text: 'Karakter kenarları düz baskıya benziyor; APP veya düşük odak olabilir.' });
    }

    complianceScore = Math.max(0, Math.min(100, complianceScore - Math.round(suspicion * 0.25)));
    authenticityScore = Math.max(0, Math.min(100, authenticityScore - Math.round(suspicion * 0.2)));

    let verdict = 'NOT_PLATE';
    if (ocr.plateText && complianceScore >= 75 && authenticityScore >= 55 && suspicion < 45) {
        verdict = 'VALID_TR';
    } else if (ocr.plateText && complianceScore >= 45) {
        verdict = 'SUSPICIOUS';
    }

    return {
        verdict,
        complianceScore,
        authenticityScore,
        suspicion,
        checks,
    };
}

function showPreview() {
    contentArea.style.display = 'none';
    previewArea.style.display = 'block';
}

function hidePreview() {
    contentArea.style.display = 'block';
    previewArea.style.display = 'none';
    cameraVideo.style.display = 'none';
    imagePreview.style.display = 'none';
    captureBtn.style.display = 'none';
}

async function startCamera() {
    try {
        currentStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        cameraVideo.srcObject = currentStream;
        cameraVideo.style.display = 'block';
        captureBtn.style.display = 'block';
        showPreview();
    } catch {
        Swal.fire({
            icon: 'error',
            title: 'Kamera Hatası',
            text: 'Kameraya erişim reddedildi veya cihazda kamera bulunamadı.',
            background: '#fff',
            color: '#000'
        });
    }
}

function captureFrame() {
    const canvas = document.getElementById('cameraCanvas');
    canvas.width = cameraVideo.videoWidth;
    canvas.height = cameraVideo.videoHeight;
    canvas.getContext('2d').drawImage(cameraVideo, 0, 0);
    capturedImageSrc = canvas.toDataURL('image/jpeg');
    imagePreview.src = capturedImageSrc;
    currentStream.getTracks().forEach(t => t.stop());
    cameraVideo.style.display = 'none';
    captureBtn.style.display = 'none';
    imagePreview.style.display = 'block';
    startScanning(capturedImageSrc);
}

function closePreview() {
    if (currentStream) {
        currentStream.getTracks().forEach(t => t.stop());
        currentStream = null;
    }
    hidePreview();
    fileInput.value = '';
    capturedImageSrc = null;
    scannerLine.style.display = 'none';
    scanningText.style.display = 'none';
}

fileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
        capturedImageSrc = event.target.result;
        imagePreview.src = capturedImageSrc;
        imagePreview.style.display = 'block';
        cameraVideo.style.display = 'none';
        captureBtn.style.display = 'none';
        showPreview();
        startScanning(capturedImageSrc);
    };
    reader.readAsDataURL(file);
});

cameraBtn.addEventListener('click', startCamera);
closePreviewBtn.addEventListener('click', closePreview);
resetBtn.addEventListener('click', resetApp);
captureBtn.addEventListener('click', captureFrame);

const disclaimerBtn = document.getElementById('disclaimerBtn');
const disclaimerModal = document.getElementById('disclaimerModal');
const closeDisclaimerBtn = document.getElementById('closeDisclaimerBtn');

disclaimerBtn.addEventListener('click', () => {
    disclaimerModal.style.display = 'flex';
});

closeDisclaimerBtn.addEventListener('click', () => {
    disclaimerModal.style.display = 'none';
});

async function startScanning(imageSrc) {
    scannerLine.style.display = 'block';
    scanningText.style.display = 'block';
    scanningText.innerText = 'Plaka Analiz Ediliyor...';
    closePreviewBtn.style.display = 'none';

    const visual = await detectPlateFeatures(imageSrc);
    const targetImage = visual.croppedImg || imageSrc;

    const ocrPromise = runOCR(targetImage);
    const minWait = new Promise(res => setTimeout(res, 2200));
    const [ocr] = await Promise.all([ocrPromise, minWait]);

    console.log('=== Plaka Analiz Sonucu ===');
    console.log('OCR Metin:', ocr.rawText);
    console.log('Tespit Edilen Plaka:', ocr.plateText);
    console.log('OCR Güveni:', ocr.confidence);
    console.log('Plaka Bulundu mu:', visual.plateFound);
    console.log('Mavi Bant Skoru:', visual.blueBandScore);
    console.log('Logo Skoru:', visual.logoScore?.toFixed(3), '| Tespit:', visual.logoDetected);
    console.log('Mühür Karmaşıklığı:', visual.sealComplexityScore?.toFixed(3));
    console.log('Şerit Skoru:', visual.wavyStripeScore?.toFixed(3));
    console.log('Kenar Keskinliği:', visual.edgeSharpnessScore?.toFixed(3));

    const decision = evaluatePlate(ocr, visual);

    scannerLine.style.display = 'none';
    scanningText.style.display = 'none';
    closePreviewBtn.style.display = 'block';
    showResults(ocr, decision);
}

function renderChecks(checks, metricsText) {
    const rows = checks.map(item => {
        const icon = item.type === 'pass'
            ? 'fa-check-circle'
            : (item.type === 'fail' ? 'fa-times-circle' : 'fa-exclamation-triangle');
        const klass = item.type === 'pass'
            ? 'check-pass'
            : (item.type === 'fail' ? 'check-fail' : 'check-warn');
        return `<li class="${klass}"><i class="fa-solid ${icon}"></i><span>${item.text}</span></li>`;
    }).join('');

    return `${rows}<li class="check-warn"><i class="fa-solid fa-circle-info"></i><span>${metricsText}</span></li>`;
}

function showResults(ocr, decision) {
    const plateWrapper = document.querySelector('.plate-display');
    plateWrapper.className = 'plate-display';
    statusBadge.className = 'status-badge';

    const plateText = ocr.plateText || '-- --- ---';
    detectedPlateText.innerText = plateText;
    const visualPlate = document.querySelector('.plate-display .plate-text');
    if (visualPlate) {
        visualPlate.innerText = plateText;
    }

    const metricsText = `Uyumluluk skoru: %${decision.complianceScore} | Otantiklik skoru: %${decision.authenticityScore} | Şüphe puanı: ${decision.suspicion}`;

    if (decision.verdict === 'VALID_TR') {
        resultTitle.innerText = 'TR Standartlarına Uygun (Yüksek Olasılık)';
        statusBadge.innerText = 'UYGUN';
        statusBadge.classList.add('status-valid');
        checkList.innerHTML = renderChecks(decision.checks, metricsText);
    } else if (decision.verdict === 'SUSPICIOUS') {
        resultTitle.innerText = 'Şüpheli / APP Olasılığı Var';
        statusBadge.innerText = 'ŞÜPHELİ';
        statusBadge.classList.add('status-warning');
        plateWrapper.classList.add('app-plate');
        checkList.innerHTML = renderChecks(decision.checks, `${metricsText}. Yüksek çözünürlükte ikinci kareyle tekrar doğrulama önerilir.`);
    } else {
        resultTitle.innerText = 'Plaka Değil veya Okuma Başarısız';
        statusBadge.innerText = 'TESPİT YOK';
        statusBadge.classList.add('status-invalid');
        checkList.innerHTML = renderChecks(decision.checks, `${metricsText}. Plakaya daha yakın, dik açı ve yansımasız çekim deneyin.`);
    }

    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetApp() {
    resultSection.style.display = 'none';
    closePreview();
}
