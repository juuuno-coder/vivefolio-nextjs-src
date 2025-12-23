"use client";

import { useState } from "react";
import { X, Image, MonitorPlay, Code, Figma, Box, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (code: string) => void;
  type: "media" | "prototype" | "3d";
}

const modalConfigs = {
  media: {
    title: "미디어 임베드",
    subtitle: "Adobe XD, Vimeo, YouTube, GIPHY, SoundCloud, Spotify 등에서 공유",
    placeholder: "임베드 코드 붙여넣기\n\n예시:\n<iframe src=\"https://www.youtube.com/embed/...\" />\n\n또는 URL:\nhttps://www.youtube.com/watch?v=...",
  },
  prototype: {
    title: "프로토타입 임베드",
    subtitle: "XD, Figma, Marvel, Codepen 등에서 공유",
    placeholder: "임베드 코드 붙여넣기\n\n예시:\n<iframe src=\"https://www.figma.com/embed?...\" />\n\n또는 URL:\nhttps://www.figma.com/file/...",
  },
  "3d": {
    title: "3D 모델 임베드",
    subtitle: "Sketchfab, Spline, 등에서 공유",
    placeholder: "임베드 코드 붙여넣기\n\n예시:\n<iframe src=\"https://sketchfab.com/models/.../embed\" />\n\n또는 URL:\nhttps://sketchfab.com/3d-models/...",
  },
};

export function EmbedModal({ isOpen, onClose, onSubmit, type }: EmbedModalProps) {
  const [embedCode, setEmbedCode] = useState("");
  const config = modalConfigs[type];

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (embedCode.trim()) {
      onSubmit(embedCode.trim());
      setEmbedCode("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{config.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{config.subtitle}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            임베드 코드 붙여넣기
          </label>
          <textarea
            value={embedCode}
            onChange={(e) => setEmbedCode(e.target.value)}
            placeholder={config.placeholder}
            className="w-full h-48 p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm"
          />
          <p className="text-xs text-gray-400 mt-3">
            지원되는 임베드의 전체 목록을 확인하고{" "}
            <a href="#" className="text-blue-500 hover:underline">여기</a>
            에서 새 임베드를 요청하십시오.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-6 border-t border-gray-100">
          <Button
            onClick={handleSubmit}
            disabled={!embedCode.trim()}
            className="bg-green-500 hover:bg-green-600 text-white px-6"
          >
            임베드
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-500"
          >
            취소
          </Button>
        </div>
      </div>
    </div>
  );
}

// 포토 그리드 블록 컴포넌트
interface PhotoGridBlockProps {
  onAddImage: () => void;
  onAddLightroom?: () => void;
}

export function PhotoGridBlock({ onAddImage, onAddLightroom }: PhotoGridBlockProps) {
  return (
    <div className="border-2 border-blue-400 border-dashed rounded-xl bg-blue-50/30 p-12 my-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-sm">
          <span>&#x2190;&#x2192;</span>
        </button>
      </div>
      
      <div className="text-center py-12">
        <p className="text-lg text-gray-600 mb-8">그리드 제작을 위해 사진 추가:</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onAddImage}
            className="flex flex-col items-center gap-3 px-8 py-6 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Image className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">이미지</span>
          </button>
          
          <button
            onClick={onAddLightroom}
            className="flex flex-col items-center gap-3 px-8 py-6 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <MonitorPlay className="w-6 h-6 text-gray-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Lightroom</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// 텍스트 블록 컴포넌트 (검은 툴바 포함)
interface TextBlockProps {
  onTextChange?: (text: string) => void;
  initialText?: string;
}

export function TextBlockToolbar() {
  return (
    <div className="bg-gray-900 text-white rounded-lg p-2 flex items-center gap-1 mb-4 flex-wrap">
      <select className="bg-transparent border-0 text-sm px-2 py-1 appearance-none cursor-pointer hover:bg-gray-800 rounded">
        <option>단락</option>
        <option>제목 1</option>
        <option>제목 2</option>
        <option>제목 3</option>
      </select>
      
      <div className="w-px h-6 bg-gray-700 mx-1"></div>
      
      <select className="bg-transparent border-0 text-sm px-2 py-1 appearance-none cursor-pointer hover:bg-gray-800 rounded">
        <option>Helvetica</option>
        <option>Arial</option>
        <option>Georgia</option>
      </select>
      
      <div className="w-px h-6 bg-gray-700 mx-1"></div>
      
      <select className="bg-transparent border-0 text-sm px-2 py-1 w-16 appearance-none cursor-pointer hover:bg-gray-800 rounded">
        <option>20</option>
        <option>16</option>
        <option>14</option>
        <option>24</option>
        <option>32</option>
      </select>
      
      <div className="w-px h-6 bg-gray-700 mx-1"></div>
      
      <button className="p-2 hover:bg-gray-800 rounded" title="텍스트 색상">
        <span className="font-bold">T</span>
      </button>
      <button className="p-2 hover:bg-gray-800 rounded font-bold" title="굵게">B</button>
      <button className="p-2 hover:bg-gray-800 rounded italic" title="기울임">I</button>
      <button className="p-2 hover:bg-gray-800 rounded underline" title="밑줄">U</button>
      
      <div className="w-px h-6 bg-gray-700 mx-1"></div>
      
      <button className="p-2 hover:bg-gray-800 rounded" title="왼쪽 정렬">≡</button>
      <button className="p-2 hover:bg-gray-800 rounded" title="가운데 정렬">≡</button>
      <button className="p-2 hover:bg-gray-800 rounded" title="오른쪽 정렬">≡</button>
      
      <div className="w-px h-6 bg-gray-700 mx-1"></div>
      
      <button className="p-2 hover:bg-gray-800 rounded" title="링크">🔗</button>
      <button className="p-2 hover:bg-gray-800 rounded" title="이미지">🖼️</button>
      <button className="p-2 hover:bg-gray-800 rounded" title="텍스트 강조">Tx</button>
      <button className="p-2 hover:bg-gray-800 rounded" title="수식">Σ</button>
    </div>
  );
}
