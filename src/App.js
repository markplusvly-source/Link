// App.jsx
import { useState, useRef, useEffect } from "react";

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
    fontFamily: "Arial",
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

  // Helper: validate and load image from file input
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

  // Draw everything on the canvas whenever state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background: if image exists, draw it; otherwise draw gradient
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
      gradient.addColorStop(0, "#111827");
      gradient.addColorStop(1, "#1f2937");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw user image or placeholder rectangle
    if (userImage) {
      const { x, y, width, height } = placeholder;
      const { scale, offsetX, offsetY, rotation } = userTransform;

      ctx.save();
      // Define clipping region (the photo placeholder box)
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      ctx.clip();

      // Move to center of placeholder for rotation & scaling
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);

      const img = userImage;
      const imgDrawWidth = img.width * scale;
      const imgDrawHeight = img.height * scale;

      // Apply offset inside the placeholder
      const imgX = -imgDrawWidth / 2 + offsetX;
      const imgY = -imgDrawHeight / 2 + offsetY;

      // Draw user image (cropped by clipping region)
      ctx.drawImage(img, imgX, imgY, imgDrawWidth, imgDrawHeight);

      ctx.restore();

      // Optional: draw a subtle border to show the placeholder
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      ctx.restore();
    } else {
      // Draw placeholder box when no user image yet
      const { x, y, width, height } = placeholder;
      ctx.save();
      ctx.setLineDash([8, 6]);
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      ctx.font = "14px Arial";
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.textAlign = "center";
      ctx.fillText("User photo here", x + width / 2, y + height / 2);
      ctx.restore();
    }

    // Draw text
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
      ctx.font = `${fontStyleStr}${fontSize}px ${fontFamily}`;
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

  // Helpers to update numeric state safely
  const updatePlaceholder = (field, value) => {
    const num = parseFloat(value);
    if (Number.isNaN(num)) return;
    setPlaceholder((prev) => {
      const updated = { ...prev, [field]: num };
      // Prevent non-positive width/height
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
      if (field === "scale" && updated.scale <= 0) updated.scale = 0.01;
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

  // Download current canvas as PNG
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

  return (
    <div className="min-h-screen flex justify-center items-start bg-gray-100 p-5">
      <div className="bg-white w-full max-w-5xl rounded-lg shadow-lg p-5">
        <header className="text-center mb-5">
          <h1 className="text-xl font-semibold tracking-widest text-gray-900">
            Poster Campaign Maker
          </h1>
        </header>

        <div className="flex flex-col md:flex-row gap-5">
          {/* Controls Panel */}
          <div className="w-full md:w-2/5 md:max-w-sm md:pr-2 max-h-[80vh] overflow-y-auto space-y-4">
            <div className="border-b border-gray-200 pb-3">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">
                Background Image
              </h2>
              <div className="flex flex-col space-y-2">
                <div className="flex flex-col text-xs">
                  <label className="mb-1 text-gray-600">
                    Upload Background (JPEG/PNG)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "background")}
                    className="text-xs"
                  />
                </div>
                <p className="text-[11px] text-gray-500">
                  If no background is uploaded, a dark gradient will be used.
                </p>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-3">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">
                User Photo Placeholder
              </h2>
              <div className="flex flex-col space-y-2 text-xs">
                <div className="flex flex-col">
                  <label className="mb-1 text-gray-600">Placeholder X</label>
                  <input
                    type="number"
                    value={placeholder.x}
                    onChange={(e) => updatePlaceholder("x", e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 text-gray-600">Placeholder Y</label>
                  <input
                    type="number"
                    value={placeholder.y}
                    onChange={(e) => updatePlaceholder("y", e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 text-gray-600">
                    Placeholder Width
                  </label>
                  <input
                    type="number"
                    value={placeholder.width}
                    onChange={(e) => updatePlaceholder("width", e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 text-gray-600">
                    Placeholder Height
                  </label>
                  <input
                    type="number"
                    value={placeholder.height}
                    onChange={(e) =>
                      updatePlaceholder("height", e.target.value)
                    }
                    className="border border-gray-300 rounded px-2 py-1"
                  />
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-3">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">
                User Photo
              </h2>
              <div className="flex flex-col space-y-2 text-xs">
                <div className="flex flex-col">
                  <label className="mb-1 text-gray-600">
                    Upload User Photo (JPEG/PNG)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "user")}
                    className="text-xs"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="mb-1 text-gray-600">Scale (Zoom)</label>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.01"
                    value={userTransform.scale}
                    onChange={(e) =>
                      updateUserTransform("scale", e.target.value)
                    }
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="mb-1 text-gray-600">
                    Offset X (move inside box)
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
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="mb-1 text-gray-600">
                    Offset Y (move inside box)
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
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="mb-1 text-gray-600">
                    Rotation (degrees)
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
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="pb-1">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">
                Poster Text
              </h2>
              <div className="flex flex-col space-y-2 text-xs">
                <div className="flex flex-col">
                  <label className="mb-1 text-gray-600">Text Content</label>
                  <textarea
                    value={posterText}
                    onChange={(e) => setPosterText(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 min-h-[60px] resize-y"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="mb-1 text-gray-600">Font Family</label>
                  <select
                    value={textSettings.fontFamily}
                    onChange={(e) =>
                      updateTextSettings("fontFamily", e.target.value)
                    }
                    className="border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Times New Roman">Times New Roman</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="mb-1 text-gray-600">Font Size (px)</label>
                  <input
                    type="number"
                    value={textSettings.fontSize}
                    onChange={(e) =>
                      updateTextSettings("fontSize", e.target.value)
                    }
                    className="border border-gray-300 rounded px-2 py-1"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="mb-1 text-gray-600">Font Color</label>
                  <input
                    type="color"
                    value={textSettings.color}
                    onChange={(e) =>
                      updateTextSettings("color", e.target.value)
                    }
                    className="w-16 h-8 p-0 border border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={textSettings.bold}
                    onChange={(e) =>
                      updateTextSettings("bold", e.target.checked)
                    }
                    className="w-3 h-3"
                  />
                  <span>Bold</span>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={textSettings.italic}
                    onChange={(e) =>
                      updateTextSettings("italic", e.target.checked)
                    }
                    className="w-3 h-3"
                  />
                  <span>Italic</span>
                </div>

                <div className="flex flex-col">
                  <label className="mb-1 text-gray-600">Alignment</label>
                  <select
                    value={textSettings.align}
                    onChange={(e) =>
                      updateTextSettings("align", e.target.value)
                    }
                    className="border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="mb-1 text-gray-600">Text Position X</label>
                  <input
                    type="number"
                    value={textSettings.x}
                    onChange={(e) =>
                      updateTextSettings("x", e.target.value)
                    }
                    className="border border-gray-300 rounded px-2 py-1"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="mb-1 text-gray-600">Text Position Y</label>
                  <input
                    type="number"
                    value={textSettings.y}
                    onChange={(e) =>
                      updateTextSettings("y", e.target.value)
                    }
                    className="border border-gray-300 rounded px-2 py-1"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="mb-1 text-gray-600">
                    Line Height (multiplier)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={textSettings.lineHeight}
                    onChange={(e) =>
                      updateTextSettings("lineHeight", e.target.value)
                    }
                    className="border border-gray-300 rounded px-2 py-1"
                  />
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="text-red-600 text-xs mt-1">{errorMessage}</div>
            )}
          </div>

          {/* Canvas Preview */}
          <div className="flex-1 flex flex-col items-center space-y-3 mt-4 md:mt-0">
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-slate-900">
              {/* Canvas size is controlled in JS; style just makes it block-level */}
              <canvas ref={canvasRef} className="block" />
            </div>
            <button
              onClick={handleDownload}
              className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Download Poster as PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;