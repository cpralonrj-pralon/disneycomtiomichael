import React, { useRef, useEffect, useState, useCallback } from "react";

interface MarqueeProps {
    children: React.ReactNode;
    speed?: number; // pixels per frame, approx
    className?: string;
}

const Marquee: React.FC<MarqueeProps> = ({
    children,
    speed = 1,
    className = ""
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // State for drag logic
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    // Animation state
    const xPos = useRef(0);
    const reqId = useRef<number>(0);
    const isHovered = useRef(false);

    const animate = useCallback(() => {
        if (!containerRef.current || !contentRef.current) return;

        if (!isDragging && !isHovered.current) {
            xPos.current -= speed;
        }

        // Infinite loop logic
        const contentWidth = contentRef.current.offsetWidth / 2; // Assuming content is doubled

        // Reset position when it goes too far left
        if (xPos.current <= -contentWidth) {
            xPos.current = 0;
        }
        // Reset position when dragged too far right
        if (xPos.current > 0) {
            xPos.current = -contentWidth;
        }

        if (containerRef.current) {
            containerRef.current.style.transform = `translate3d(${xPos.current}px, 0, 0)`;
        }

        reqId.current = requestAnimationFrame(animate);
    }, [isDragging, speed]);

    useEffect(() => {
        reqId.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(reqId.current);
    }, [animate]);

    // Drag Handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartX(e.pageX - xPos.current);
        if (containerRef.current) {
            containerRef.current.style.cursor = 'grabbing';
        }
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
        isHovered.current = false;
        if (containerRef.current) {
            containerRef.current.style.cursor = 'grab';
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        if (containerRef.current) {
            containerRef.current.style.cursor = 'grab';
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - startX;
        xPos.current = x;
        // Let the animation loop apply the transform
    };

    const handleMouseEnter = () => {
        isHovered.current = true;
    };

    return (
        <div
            className={`overflow-hidden relative cursor-grab active:cursor-grabbing ${className}`}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
        >
            <div
                ref={containerRef}
                className="flex gap-6 w-fit"
                style={{ willChange: 'transform' }}
            >
                <div ref={contentRef} className="flex gap-6 shrink-0">
                    {children}
                </div>
                {/* Duplicate content for seamless loop */}
                <div className="flex gap-6 shrink-0">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Marquee;
