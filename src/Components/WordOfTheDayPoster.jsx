// WordOfTheDayPoster.jsx
import React, { useState, useRef, useEffect } from "react";

/**
 * Color palette – tuned to resemble the reference poster.
 */
const COLORS = {
  blue: "#1550B3", // deep royal blue
  blueDark: "#0E3A83",
  blueLight: "#1F6BD4",
  orange: "#F26A21",
  white: "#FFFFFF",
  dark: "#333333",
};

/**
 * Hard-coded background shapes (letters) to simulate the playful alphabet pattern.
 * Used only when no backgroundImageUrl is provided.
 */
const BG_LETTERS = [
  { char: "s", x: 80, y: 160, size: 160, color: COLORS.white, rot: -20 },
  { char: "c", x: 160, y: 420, size: 250, color: COLORS.orange, rot: -10 },
  { char: "e", x: 80, y: 900, size: 140, color: COLORS.orange, rot: 15 },
  { char: "p", x: 990, y: 480, size: 180, color: COLORS.white, rot: 20 },
  { char: "u", x: 900, y: 160, size: 170, color: COLORS.orange, rot: 25 },
  { char: "s", x: 920, y: 880, size: 140, color: COLORS.blueLight, rot: -30 },
  { char: "e", x: 140, y: 1380, size: 160, color: COLORS.white, rot: -10 },
  { char: "p", x: 980, y: 1420, size: 180, color: COLORS.orange, rot: 12 },
  { char: "s", x: 540, y: 1820, size: 160, color: COLORS.white, rot: 0 },
];

/**
 * Draw a rounded rectangle path on canvas.
 */
function drawRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Word-wrapping helper: splits text into lines that fit maxWidth
 * and draws them starting at (x,y).
 */
function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
  if (!text) return;
  const paragraphs = String(text).split("\n");
  let offsetY = 0;

  paragraphs.forEach((para, pIndex) => {
    const words = para.split(" ");
    let line = "";

    words.forEach((word) => {
      const testLine = line ? line + " " + word : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line) {
        ctx.fillText(line, x, y + offsetY);
        offsetY += lineHeight;
        line = word;
      } else {
        line = testLine;
      }
    });

    if (line) {
      ctx.fillText(line, x, y + offsetY);
      offsetY += lineHeight;
    }

    if (pIndex < paragraphs.length - 1) {
      offsetY += lineHeight * 0.5;
    }
  });
}

/**
 * Reusable component: WordOfTheDayPoster (Tailwind version)
 *
 * Props:
 *  - backgroundImageUrl?: string  (from your JSON)
 *  - initialWord?: string
 *  - initialMeaning?: string
 *  - initialExample?: string
 *  - footerTitle?: string
 *  - footerSubtitle?: string
 */
const WordOfTheDayPoster = ({
  backgroundImageUrl,
  initialWord = "Curious",
  initialMeaning = "Wanting to know or learn something.",
  initialExample = "The curious cat looked inside the box.",
  footerTitle = "KRHS INTERNATIONAL",
  footerSubtitle = "Kooriyad, Tirurangadi, Malappuram, Kerala - 676306",
}) => {
  const canvasRef = useRef(null);

  // Editable text state
  const [word, setWord] = useState(initialWord);
  const [meaning, setMeaning] = useState(initialMeaning);
  const [example, setExample] = useState(initialExample);

  // Optional background image loaded from URL
  const [bgImage, setBgImage] = useState(null);

  // Load Inter font once
  useEffect(() => {
    if (document.getElementById("inter-font-link")) return;
    const link = document.createElement("link");
    link.id = "inter-font-link";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap";
    document.head.appendChild(link);
  }, []);

  // Load background image whenever backgroundImageUrl changes
  useEffect(() => {
    if (!backgroundImageUrl) {
      setBgImage(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setBgImage(img);
    img.onerror = () => setBgImage(null);
    img.src = backgroundImageUrl;
  }, [backgroundImageUrl]);

  // Draw poster whenever content or background image changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = 1080;
    const height = 1350;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "middle";

    // 1. BACKGROUND
    if (bgImage) {
      const img = bgImage;
      const scale = Math.max(width / img.width, height / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const dx = (width - drawW) / 2;
      const dy = (height - drawH) / 2;
      ctx.drawImage(img, dx, dy, drawW, drawH);
    } else {
      ctx.fillStyle = COLORS.blue;
      ctx.fillRect(0, 0, width, height);

      BG_LETTERS.forEach((item) => {
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate((item.rot * Math.PI) / 180);
        ctx.fillStyle = item.color;
        ctx.font = `${item.size}px 'Inter', system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(item.char, 0, 0);
        ctx.restore();
      });
    }

    // 2. MAIN WHITE CARD
    const cardMarginX = 90;
    const cardMarginTop = 210;
    const cardMarginBottom = 260;
    const cardX = cardMarginX;
    const cardY = cardMarginTop;
    const cardW = width - cardMarginX * 2;
    const cardH = height - cardMarginTop - cardMarginBottom;

    // ctx.save();
    // ctx.fillStyle = COLORS.white;
    // drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 60);
    // ctx.fill();
    // ctx.restore();

    const centerX = width / 2;

    // 4. TEXT INSIDE CARD

    // Word of the Day (editable)
    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = COLORS.orange;
    ctx.font = `800 120px 'Inter', system-ui, sans-serif`;
    ctx.fillText(word, centerX, cardY + 450);
    ctx.restore();

    // Meaning label
    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = COLORS.dark;
    ctx.font = `500 40px 'Inter', system-ui, sans-serif`;
    ctx.fillText("Meaning:", centerX, cardY + 530);
    ctx.restore();

    // Meaning text – wrapped bold, centered
    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = COLORS.dark;
    ctx.font = `700 40px 'Inter', system-ui, sans-serif`;
    drawWrappedText(ctx, meaning, centerX, cardY + 580, 600, 40);
    ctx.restore();

    // Example label
    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = COLORS.dark;
    ctx.font = `500 40px 'Inter', system-ui, sans-serif`;
    ctx.fillText("Example:", centerX, cardY + 700);
    ctx.restore();

    // Example text – wrapped, centered
    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = COLORS.dark;
    ctx.font = `600 38px 'Inter', system-ui, sans-serif`;
    drawWrappedText(ctx, example, centerX, cardY + 750, 700, 25);
    ctx.restore();

  }, [word, meaning, example, bgImage, footerTitle, footerSubtitle]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "word-of-the-day.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex justify-center items-start px-4 py-6">
      <div className="w-full max-w-6xl bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl shadow-black/50 px-4 py-5 md:px-6 md:py-6 font-sans text-slate-100">
        {/* Header */}
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-5">
          <div>
            <h1 className="text-base md:text-xl font-semibold tracking-[0.22em] uppercase text-slate-50">
              Word of the Day Poster
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-xl">
              Edit the word, meaning and example — the canvas updates live, then
              export it as a high-resolution PNG.
            </p>
          </div>
          <div className="mt-1 sm:mt-0 inline-flex items-center gap-2 text-[10px] md:text-[11px] text-slate-300">
            <span className="px-2 py-1 rounded-full border border-slate-600 bg-slate-800/80">
              Reusable component
            </span>
            <span className="px-2 py-1 rounded-full border border-slate-600 bg-slate-800/80">
              Canvas · Inter · PNG
            </span>
          </div>
        </header>

        {/* Main layout */}
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">
          {/* Controls panel */}
          <div className="w-full lg:w-[360px] xl:w-[380px] rounded-2xl border border-slate-800 bg-slate-900/95 px-3 py-3 md:px-4 md:py-4">
            <div className="max-h-[60vh] lg:max-h-[70vh] overflow-y-auto pr-1 space-y-3">
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-1">
                <span className="inline-block w-1 h-4 rounded-full bg-blue-500" />
                Content
              </h2>

              <div className="space-y-3 text-xs md:text-[13px]">
                <div>
                  <label className="block mb-1 text-slate-300">
                    Word of the Day
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-slate-50 outline-none text-xs md:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/70"
                    type="text"
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    placeholder="Enter the word"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-slate-300">Meaning</label>
                  <textarea
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-slate-50 outline-none text-xs md:text-sm min-h-[70px] resize-y focus:border-blue-500 focus:ring-1 focus:ring-blue-500/70"
                    value={meaning}
                    onChange={(e) => setMeaning(e.target.value)}
                    placeholder="Type the meaning here..."
                  />
                </div>

                <div>
                  <label className="block mb-1 text-slate-300">
                    Example sentence
                  </label>
                  <textarea
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-slate-50 outline-none text-xs md:text-sm min-h-[70px] resize-y focus:border-blue-500 focus:ring-1 focus:ring-blue-500/70"
                    value={example}
                    onChange={(e) => setExample(e.target.value)}
                    placeholder="Type an example sentence..."
                  />
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Tip: keep the word short and the sentences concise so they fit
                  nicely on the poster. You can also insert manual line breaks
                  using <code>\n</code>.
                </p>
              </div>
            </div>
          </div>

          {/* Canvas area */}
          <div className="flex-1 flex flex-col items-center gap-3 mt-2 lg:mt-0">
            <div className="w-full max-w-[420px] md:max-w-[440px] bg-black/90 border border-slate-800 rounded-3xl shadow-[0_22px_60px_rgba(0,0,0,0.85)] overflow-hidden">
              {/* Canvas is 1080x1920 internally; CSS keeps 9:16 ratio */}
              <div className="w-full aspect-[3/4]">
                <canvas ref={canvasRef} className="w-full h-full block" />
              </div>
            </div>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 mt-1 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-[11px] md:text-sm font-semibold text-white tracking-[0.12em] uppercase shadow-lg shadow-blue-500/40 hover:shadow-blue-500/60 hover:from-blue-400 hover:to-indigo-400 transition-all active:scale-[0.97]"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-white/90" />
              Download Poster as PNG
            </button>

            <p className="text-[11px] md:text-[12px] text-slate-400 text-center max-w-sm leading-relaxed">
              The downloaded image will be a high-resolution 1080×1920 PNG,
              matching the Word Warriors layout. You can reuse this component on
              multiple routes with different background images and default text.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordOfTheDayPoster;