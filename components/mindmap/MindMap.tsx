"use client";

import { useEffect, useRef, useState } from "react";
import { Transformer } from "markmap-lib";
import { Markmap, loadCSS, loadJS } from "markmap-view";
import { toPng, toSvg } from "html-to-image";

interface MindMapProps {
  markdown: string;
  userName?: string;
}

export function MindMap({ markdown, userName = "ユーザー" }: MindMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>("");

  useEffect(() => {
    if (!svgRef.current || !markdown) return;

    // コンポーネントがマウントされているかを追跡
    let isMounted = true;
    let markmap: any = null;

    // SVGコンテナの初期化を待つ
    const timer = setTimeout(() => {
      if (!isMounted || !svgRef.current) return;

      try {
        const transformer = new Transformer();
        const { root, features } = transformer.transform(markdown);

        // Load required CSS and JS
        const { styles, scripts } = transformer.getUsedAssets(features);
        if (styles) loadCSS(styles);
        if (scripts) loadJS(scripts);

        // 既存のマークマップをクリア
        if (svgRef.current) {
          svgRef.current.innerHTML = '';
        }

        // SVG要素のサイズを確認
        const svgElement = svgRef.current;
        if (!svgElement || !svgElement.getBoundingClientRect) return;

        const rect = svgElement.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          console.warn('SVG element has no dimensions');
          return;
        }

        const mm = Markmap.create(svgElement, {
          color: (node) => {
            // カラフルなノードカラーを設定
            const colors = [
              "#3b82f6", // blue
              "#8b5cf6", // purple
              "#ec4899", // pink
              "#10b981", // green
              "#f59e0b", // amber
              "#ef4444", // red
            ];
            return colors[node.state.depth % colors.length];
          },
          paddingX: 30,
          spacingHorizontal: 100,
          spacingVertical: 20,
          duration: 500,
          maxWidth: 250,
          initialExpandLevel: 3,
          autoFit: true,
          zoom: true,
          pan: true,
          embedGlobalCSS: true,
        });

        if (isMounted) {
          markmap = mm;
          mm.setData(root);
          mm.fit();
        }
      } catch (error) {
        console.error('Error rendering mindmap:', error);
      }
    }, 150); // 150ms遅延

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (markmap) {
        try {
          markmap.destroy();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [markdown]);

  const handleDownloadPNG = async () => {
    if (!containerRef.current) return;

    setIsDownloading(true);
    try {
      const dataUrl = await toPng(containerRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      link.download = `${userName}_reading_mindmap.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to download PNG:", error);
      alert("画像のダウンロードに失敗しました");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadSVG = async () => {
    if (!containerRef.current) return;

    setIsDownloading(true);
    try {
      const dataUrl = await toSvg(containerRef.current, {
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      link.download = `${userName}_reading_mindmap.svg`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to download SVG:", error);
      alert("SVGのダウンロードに失敗しました");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareX = async () => {
    if (!containerRef.current) return;

    try {
      // まず画像をダウンロード
      setIsDownloading(true);
      const dataUrl = await toPng(containerRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      link.download = `${userName}_reading_mindmap.png`;
      link.href = dataUrl;
      link.click();

      // 少し待ってからSNS共有ダイアログを開く
      setTimeout(() => {
        const text = `${userName}の読書マインドマップ 📚\n\n#BooksFan #読書記録 #マインドマップ\n\n※ダウンロードした画像を添付してください`;
        const url = window.location.href;

        const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          text
        )}&url=${encodeURIComponent(url)}`;

        window.open(xUrl, "_blank", "width=600,height=400");
        setIsDownloading(false);
      }, 500);
    } catch (error) {
      console.error("Failed to share on X:", error);
      setIsDownloading(false);
      alert("共有に失敗しました");
    }
  };

  const handleShareFacebook = () => {
    const url = window.location.href;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url
    )}`;

    window.open(facebookUrl, "_blank", "width=600,height=400");
  };

  return (
    <div className="space-y-4">
      {/* アクションボタン */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleDownloadPNG}
          disabled={isDownloading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          PNG
        </button>

        <button
          onClick={handleDownloadSVG}
          disabled={isDownloading}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          SVG
        </button>

        <button
          onClick={handleShareX}
          className="bg-black text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          X
        </button>

        <button
          onClick={handleShareFacebook}
          className="bg-[#1877F2] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#166fe5] transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </button>
      </div>

      {/* マインドマップ */}
      <div
        ref={containerRef}
        className="bg-white rounded-xl shadow-lg p-6"
        style={{ minHeight: "700px", overflow: "visible" }}
      >
        <svg
          ref={svgRef}
          className="w-full"
          style={{
            height: "700px",
            display: "block",
          }}
        />
      </div>

      {isDownloading && (
        <div className="text-center text-gray-600">
          画像を生成しています...
        </div>
      )}
    </div>
  );
}
