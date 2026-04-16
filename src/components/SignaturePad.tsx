"use client";

import { useRef, useEffect, useState } from "react";
import { X, RotateCcw, PenTool } from "lucide-react";

interface SignaturePadProps {
    onSave: (signature: string | null) => void;
}

export function SignaturePad({ onSave }: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set high resolution for better quality
        const ratio = window.devicePixelRatio || 1;
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        ctx.scale(ratio, ratio);

        ctx.strokeStyle = "#1e293b"; // Slate-800 for visibility on light backgrounds
        ctx.lineWidth = 3; // Slightly thicker for better legibility
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
    }, []);

    const startDrawing = (e: React.PointerEvent | React.MouseEvent) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e as any).clientX - rect.left;
        const y = (e as any).clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.PointerEvent | React.MouseEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e as any).clientX - rect.left;
        const y = (e as any).clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
        setIsEmpty(false);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        saveSignature();
    };

    const clear = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setIsEmpty(true);
        onSave(null);
    };

    const saveSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas || isEmpty) return;
        const dataUrl = canvas.toDataURL("image/png");
        onSave(dataUrl);
    };

    return (
        <div className="space-y-4">
            <div className="relative glass-card rounded-2xl overflow-hidden border-2 border-dashed border-white/20 h-48 group">
                <canvas
                    ref={canvasRef}
                    onPointerDown={startDrawing}
                    onPointerMove={draw}
                    onPointerUp={stopDrawing}
                    onPointerLeave={stopDrawing}
                    className="w-full h-full cursor-crosshair touch-none"
                    style={{ background: "#f8fafc" }} // Light background for dark ink
                />

                {isEmpty && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity">
                        <PenTool size={32} />
                        <p className="text-[10px] font-bold uppercase tracking-widest mt-2">Dibuje su firma aquí</p>
                    </div>
                )}

                <button
                    type="button"
                    onClick={clear}
                    className="absolute top-4 right-4 p-2 bg-slate-200 hover:bg-slate-300 rounded-full text-slate-600 transition-colors"
                    title="Limpiar firma"
                >
                    <RotateCcw size={16} />
                </button>
            </div>
            <p className="text-[10px] opacity-40 italic">La firma digital tiene validez legal conforme a la normativa ACMA.</p>
        </div>
    );
}
