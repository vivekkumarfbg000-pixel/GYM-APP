// Parallax Scrolling Component
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface ParallaxProps {
    children: React.ReactNode;
    speed?: number;
    className?: string;
}

export function Parallax({ children, speed = 0.5, className }: ParallaxProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start'],
    });

    // Smooth parallax with spring animation
    const y = useSpring(
        useTransform(scrollYProgress, [0, 1], ['0%', `${speed * 100}%`]),
        { stiffness: 100, damping: 30, restDelta: 0.001 }
    );

    return (
        <div ref={ref} className={className}>
            <motion.div style={{ y }}>{children}</motion.div>
        </div>
    );
}

interface ParallaxHeroProps {
    title: string;
    subtitle?: string;
    backgroundImage?: string;
    overlay?: boolean;
    className?: string;
}

export function ParallaxHero({
    title,
    subtitle,
    backgroundImage,
    overlay = true,
    className,
}: ParallaxHeroProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end start'],
    });

    const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

    return (
        <div ref={ref} className={`relative h-[70vh] overflow-hidden ${className}`}>
            {/* Background with parallax */}
            <motion.div
                className="absolute inset-0"
                style={{
                    y,
                    scale,
                    backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {!backgroundImage && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600" />
                )}
            </motion.div>

            {/* Overlay */}
            {overlay && <div className="absolute inset-0 bg-black/30" />}

            {/* Content */}
            <motion.div
                className="relative h-full flex flex-col items-center justify-center text-white px-6 text-center"
                style={{ opacity }}
            >
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-lg"
                >
                    {title}
                </motion.h1>
                {subtitle && (
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl md:text-2xl text-white/90 max-w-2xl drop-shadow"
                    >
                        {subtitle}
                    </motion.p>
                )}
            </motion.div>
        </div>
    );
}

interface ParallaxSectionProps {
    children: React.ReactNode;
    className?: string;
}

export function ParallaxSection({ children, className }: ParallaxSectionProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, []);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Floating elements with parallax
export function FloatingElement({
    children,
    speed = 0.3,
    className,
}: ParallaxProps) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX - window.innerWidth / 2) * speed,
                y: (e.clientY - window.innerHeight / 2) * speed,
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [speed]);

    return (
        <motion.div
            className={className}
            animate={{
                x: mousePosition.x,
                y: mousePosition.y,
            }}
            transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        >
            {children}
        </motion.div>
    );
}
