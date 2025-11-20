// App.jsx
import React, { useState, useRef, useEffect } from "react";

const App = () => {
  const canvasRef = useRef(null);

  // Background and user images (Image objects)
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [userImage, setUserImage] = useState(null);

  // Simple error message display
  const [errorMessage, setErrorMessage] = useState("");

  // Placeholder rectangle for user photo
  const [placeholder, setPlaceholder] = useState({
    x: 200,
    y: 300,
    width: 400,
    height: 400,
  });

  // User image transform controls
  const [userTransform, setUserTransform] = useState({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    rotation: 0, // degrees
  });

  // Text settings
  const [posterText, setPosterText] = useState(
    "Your Poster Title\nYour Tagline Here"
  );
  const [textSettings, setTextSettings] = useState({
    fontFamily: "Poppins",
    fontSize: 48,
    color: "#ffffff",
    bold: true,
    italic: false,
    align: "center",
    x: 400,
    y: 150,
    lineHeight: 1.2,
  });

  const canvasWidth = 800;
  const canvasHeight = 1200;

  // ✅ Load Google Fonts via CDN once (Option B)
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?" +
      "family=Poppins:wght@300;400;600;700&" +
      "family=Montserrat:wght@300;400;500;600;700&" +
      "family=Inter:wght@300;400;500;600;700&" +
      "family=Roboto:wght@300;400;500;700&" +
      "family=Lato:wght@300;400;700&" +
      "family=Playfair+Display:wght@400;600;700&" +
      "family=Oswald:wght@300;400;500;700&" +
      "family=Bebas+Neue&" +
      "family=Nunito:wght@300;400;600;700&" +
      "family=DM+Sans:wght@300;400;500;700&display=swap";

    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // === Image Upload Helpers ===
  const handleImageUpload = (event, type) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please upload a valid image file (JPEG or PNG).");
      return;
    }

    setErrorMessage("");

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (type === "background") {
          setBackgroundImage(img);
        } else if (type === "user") {
          setUserImage(img);
        }
      };
      img.onerror = () => {
        setErrorMessage("Failed to load the image. Please try another file.");
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // === Canvas Drawing ===
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    if (backgroundImage) {
      const img = backgroundImage;
      const scale = Math.max(
        canvas.width / img.width,
        canvas.height / img.height
      );
      const drawWidth = img.width * scale;
      const drawHeight = img.height * scale;
      const dx = (canvas.width - drawWidth) / 2;
      const dy = (canvas.height - drawHeight) / 2;
      ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
    } else {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#0f172a");
      gradient.addColorStop(1, "#1f2937");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // User image / placeholder
    if (userImage) {
      const { x, y, width, height } = placeholder;
      const { scale, offsetX, offsetY, rotation } = userTransform;

      ctx.save();
      // Clip region
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      ctx.clip();

      // Center for rotation/scale
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);

      const img = userImage;
      const imgDrawWidth = img.width * scale;
      const imgDrawHeight = img.height * scale;

      const imgX = -imgDrawWidth / 2 + offsetX;
      const imgY = -imgDrawHeight / 2 + offsetY;

      ctx.drawImage(img, imgX, imgY, imgDrawWidth, imgDrawHeight);

      ctx.restore();

      // Border highlight
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      ctx.restore();
    } else {
      const { x, y, width, height } = placeholder;
      ctx.save();
      ctx.setLineDash([8, 6]);
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      ctx.font = "14px Poppins, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.textAlign = "center";
      ctx.fillText("User photo here", x + width / 2, y + height / 2);
      ctx.restore();
    }

    // Text
    if (posterText && posterText.trim() !== "") {
      const {
        fontFamily,
        fontSize,
        color,
        bold,
        italic,
        align,
        x,
        y,
        lineHeight,
      } = textSettings;

      ctx.save();
      let fontStyleStr = "";
      if (italic) fontStyleStr += "italic ";
      if (bold) fontStyleStr += "bold ";
      // Canvas font needs a full fallback stack
      const fontStack = `${fontFamily}, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.font = `${fontStyleStr}${fontSize}px ${fontStack}`;
      ctx.fillStyle = color;
      ctx.textAlign = align;

      const lines = posterText.split("\n");
      const lineSpacing = fontSize * (lineHeight || 1.2);

      lines.forEach((line, index) => {
        ctx.fillText(line, x, y + index * lineSpacing);
      });

      ctx.restore();
    }
  }, [
    backgroundImage,
    userImage,
    placeholder,
    userTransform,
    posterText,
    textSettings,
  ]);

  // === State helpers ===
  const updatePlaceholder = (field, value) => {
    const num = parseFloat(value);
    if (Number.isNaN(num)) return;
    setPlaceholder((prev) => {
      const updated = { ...prev, [field]: num };
      if (updated.width <= 0) updated.width = 10;
      if (updated.height <= 0) updated.height = 10;
      return updated;
    });
  };

  const updateUserTransform = (field, value) => {
    const num = parseFloat(value);
    if (Number.isNaN(num)) return;
    setUserTransform((prev) => {
      const updated = { ...prev, [field]: num };
      if (field === "scale" && updated.scale <= 0) updated.scale = 0.05;
      return updated;
    });
  };

  const updateTextSettings = (field, value) => {
    if (
      field === "fontSize" ||
      field === "x" ||
      field === "y" ||
      field === "lineHeight"
    ) {
      const num = parseFloat(value);
      if (Number.isNaN(num)) return;
      setTextSettings((prev) => {
        const updated = { ...prev, [field]: num };
        if (field === "fontSize" && updated.fontSize <= 0) {
          updated.fontSize = 10;
        }
        return updated;
      });
    } else {
      setTextSettings((prev) => ({ ...prev, [field]: value }));
    }
  };

  // === Download ===
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "poster.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Predefined Google fonts (must match the families in the CDN link)
  const googleFonts = [
    "Poppins",
    "Montserrat",
    "Inter",
    "Roboto",
    "Lato",
    "Playfair Display",
    "Oswald",
    "Bebas Neue",
    "Nunito",
    "DM Sans",
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex justify-center items-start px-4 py-6">
      <div className="w-full max-w-6xl bg-slate-900/80 border border-slate-700 rounded-2xl shadow-2xl shadow-black/40 backdrop-blur-md p-4 md:p-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold tracking-[0.2em] text-slate-50 uppercase">
              Poster Campaign Maker
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Upload background & photo, choose Google Fonts, customize text, and export your poster.
            </p>
          </div>
          <div className="hidden md:flex text-[11px] text-slate-400 gap-3">
            <span className="px-2 py-1 rounded-full bg-slate-800/80 border border-slate-600">
              Desktop
            </span>
            <span className="px-2 py-1 rounded-full bg-slate-800/80 border border-slate-600">
              Mobile Friendly
            </span>
          </div>
        </header>

        {/* Main layout */}
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">
          {/* Controls */}
          <div className="w-full lg:w-[360px] xl:w-[380px] max-h-[75vh] lg:max-h-[78vh] overflow-y-auto pr-1 space-y-4">
            {/* Card: Background */}
            <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-3 md:p-4 shadow-sm shadow-black/40">
              <h2 className="text-sm font-semibold text-slate-100 mb-2 flex items-center gap-2">
                <span className="inline-block w-1 h-4 bg-blue-500 rounded-full" />
                Background Image
              </h2>
              <div className="flex flex-col space-y-2 text-xs">
                <label className="text-slate-400">Upload (JPEG / PNG)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "background")}
                  className="block text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500">
                  If no background is uploaded, a dark gradient will be used.
                </p>
              </div>
            </div>

            {/* Card: Placeholder */}
            <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-3 md:p-4 shadow-sm shadow-black/40">
              <h2 className="text-sm font-semibold text-slate-100 mb-2 flex items-center gap-2">
                <span className="inline-block w-1 h-4 bg-emerald-500 rounded-full" />
                User Photo Placeholder
              </h2>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex flex-col">
                  <label className="mb-1 text-slate-400">X</label>
                  <input
                    type="number"
                    value={placeholder.x}
                    onChange={(e) => updatePlaceholder("x", e.target.value)}
                    className="bg-slate-800 border border-slate-600 rounded-md px-2 py-1 text-slate-100 outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 text-slate-400">Y</label>
                  <input
                    type="number"
                    value={placeholder.y}
                    onChange={(e) => updatePlaceholder("y", e.target.value)}
                    className="bg-slate-800 border border-slate-600 rounded-md px-2 py-1 text-slate-100 outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 text-slate-400">Width</label>
                  <input
                    type="number"
                    value={placeholder.width}
                    onChange={(e) => updatePlaceholder("width", e.target.value)}
                    className="bg-slate-800 border border-slate-600 rounded-md px-2 py-1 text-slate-100 outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 text-slate-400">Height</label>
                  <input
                    type="number"
                    value={placeholder.height}
                    onChange={(e) =>
                      updatePlaceholder("height", e.target.value)
                    }
                    className="bg-slate-800 border border-slate-600 rounded-md px-2 py-1 text-slate-100 outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Card: User Photo & Crop */}
            <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-3 md:p-4 shadow-sm shadow-black/40">
              <h2 className="text-sm font-semibold text-slate-100 mb-2 flex items-center gap-2">
                <span className="inline-block w-1 h-4 bg-pink-500 rounded-full" />
                User Photo & Crop
              </h2>
              <div className="flex flex-col space-y-3 text-xs">
                <div className="flex flex-col">
                  <label className="mb-1 text-slate-400">
                    Upload User Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "user")}
                    className="block text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-pink-600 file:text-white hover:file:bg-pink-500 cursor-pointer"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="mb-1 text-slate-400">
                    Scale (Zoom) — {userTransform.scale.toFixed(2)}x
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.01"
                    value={userTransform.scale}
                    onChange={(e) =>
                      updateUserTransform("scale", e.target.value)
                    }
                    className="w-full accent-pink-500"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="mb-1 text-slate-400">
                    Offset X (inside box)
                  </label>
                  <input
                    type="range"
                    min="-300"
                    max="300"
                    step="1"
                    value={userTransform.offsetX}
                    onChange={(e) =>
                      updateUserTransform("offsetX", e.target.value)
                    }
                    className="w-full accent-pink-500"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="mb-1 text-slate-400">
                    Offset Y (inside box)
                  </label>
                  <input
                    type="range"
                    min="-300"
                    max="300"
                    step="1"
                    value={userTransform.offsetY}
                    onChange={(e) =>
                      updateUserTransform("offsetY", e.target.value)
                    }
                    className="w-full accent-pink-500"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="mb-1 text-slate-400">
                    Rotation ({userTransform.rotation}°)
                  </label>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    step="1"
                    value={userTransform.rotation}
                    onChange={(e) =>
                      updateUserTransform("rotation", e.target.value)
                    }
                    className="w-full accent-pink-500"
                  />
                </div>
              </div>
            </div>

            {/* Card: Text */}
            <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-3 md:p-4 shadow-sm shadow-black/40 mb-2">
              <h2 className="text-sm font-semibold text-slate-100 mb-2 flex items-center gap-2">
                <span className="inline-block w-1 h-4 bg-amber-500 rounded-full" />
                Poster Text
              </h2>
              <div className="flex flex-col space-y-2 text-xs">
                <div className="flex flex-col">
                  <label className="mb-1 text-slate-400">Text Content</label>
                  <textarea
                    value={posterText}
                    onChange={(e) => setPosterText(e.target.value)}
                    className="bg-slate-800 border border-slate-600 rounded-md px-2 py-2 text-slate-100 min-h-[70px] resize-y outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className="mb-1 text-slate-400">Font Family</label>
                    <select
                      value={textSettings.fontFamily}
                      onChange={(e) =>
                        updateTextSettings("fontFamily", e.target.value)
                      }
                      className="bg-slate-800 border border-slate-600 rounded-md px-2 py-1 text-slate-100 outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      {googleFonts.map((font) => (
                        <option key={font} value={font}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 text-slate-400">Font Size</label>
                    <input
                      type="number"
                      value={textSettings.fontSize}
                      onChange={(e) =>
                        updateTextSettings("fontSize", e.target.value)
                      }
                      className="bg-slate-800 border border-slate-600 rounded-md px-2 py-1 text-slate-100 outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <label className="mb-1 text-slate-400 text-[11px]">
                      Font Color
                    </label>
                    <input
                      type="color"
                      value={textSettings.color}
                      onChange={(e) =>
                        updateTextSettings("color", e.target.value)
                      }
                      className="w-10 h-7 p-0 border border-slate-500 rounded-md bg-slate-800"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-1 text-[11px] text-slate-300">
                      <input
                        type="checkbox"
                        checked={textSettings.bold}
                        onChange={(e) =>
                          updateTextSettings("bold", e.target.checked)
                        }
                        className="w-3 h-3 rounded border-slate-500 bg-slate-800"
                      />
                      <span>B</span>
                    </label>
                    <label className="inline-flex items-center gap-1 text-[11px] text-slate-300">
                      <input
                        type="checkbox"
                        checked={textSettings.italic}
                        onChange={(e) =>
                          updateTextSettings("italic", e.target.checked)
                        }
                        className="w-3 h-3 rounded border-slate-500 bg-slate-800"
                      />
                      <span>I</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => updateTextSettings("align", "left")}
                    className={`text-[11px] px-2 py-1 rounded-md border ${
                      textSettings.align === "left"
                        ? "bg-amber-500 text-slate-900 border-amber-400"
                        : "bg-slate-800 text-slate-300 border-slate-600"
                    }`}
                  >
                    Left
                  </button>
                  <button
                    type="button"
                    onClick={() => updateTextSettings("align", "center")}
                    className={`text-[11px] px-2 py-1 rounded-md border ${
                      textSettings.align === "center"
                        ? "bg-amber-500 text-slate-900 border-amber-400"
                        : "bg-slate-800 text-slate-300 border-slate-600"
                    }`}
                  >
                    Center
                  </button>
                  <button
                    type="button"
                    onClick={() => updateTextSettings("align", "right")}
                    className={`text-[11px] px-2 py-1 rounded-md border ${
                      textSettings.align === "right"
                        ? "bg-amber-500 text-slate-900 border-amber-400"
                        : "bg-slate-800 text-slate-300 border-slate-600"
                    }`}
                  >
                    Right
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className="mb-1 text-slate-400 text-[11px]">
                      Text X
                    </label>
                    <input
                      type="number"
                      value={textSettings.x}
                      onChange={(e) =>
                        updateTextSettings("x", e.target.value)
                      }
                      className="bg-slate-800 border border-slate-600 rounded-md px-2 py-1 text-slate-100 outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 text-slate-400 text-[11px]">
                      Text Y
                    </label>
                    <input
                      type="number"
                      value={textSettings.y}
                      onChange={(e) =>
                        updateTextSettings("y", e.target.value)
                      }
                      className="bg-slate-800 border border-slate-600 rounded-md px-2 py-1 text-slate-100 outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="mb-1 text-slate-400 text-[11px]">
                    Line Height
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={textSettings.lineHeight}
                    onChange={(e) =>
                      updateTextSettings("lineHeight", e.target.value)
                    }
                    className="bg-slate-800 border border-slate-600 rounded-md px-2 py-1 text-slate-100 outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="text-xs text-red-400 bg-red-900/40 border border-red-500/60 rounded-md px-3 py-2">
                {errorMessage}
              </div>
            )}
          </div>

          {/* Canvas + Action */}
          <div className="flex-1 flex flex-col items-center gap-4 mt-3 lg:mt-0">
            <div className="w-full flex justify-center">
              <div className="relative bg-slate-950 border border-slate-700 rounded-2xl shadow-xl shadow-black/50 overflow-hidden w-full max-w-[420px] md:max-w-[460px] aspect-[2/3]">
                {/* Canvas is 800x1200 internally, but scaled visually */}
                <canvas ref={canvasRef} className="w-full h-full block" />
              </div>
            </div>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:from-blue-400 hover:to-indigo-400 transition-all duration-200 active:scale-[0.98]"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-white/80" />
              Download Poster as PNG
            </button>

            <p className="text-[11px] text-slate-500 text-center max-w-md">
              Tip: design once on desktop, then quickly tweak crop & text from your phone before sharing to
              Instagram or WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
