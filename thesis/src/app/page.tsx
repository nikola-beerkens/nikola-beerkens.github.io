'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [robotX, setRobotX] = useState(0);
  const maxX = 55; // Maximum movement to the right
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'a') {
        setRobotX((prev) => Math.max(prev - 20, -maxX));
      } else if (e.key.toLowerCase() === 'd') {
        setRobotX((prev) => Math.min(prev + 20, maxX));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    // try to autoplay unmuted
    if (!audioRef.current) return;
    const audio = audioRef.current;
    audio.loop = true;
    audio.volume = 1;
    audio.play().then(() => {
      setIsPlaying(true);
      setAutoplayBlocked(false);
    }).catch(() => {
      // Autoplay with sound was blocked by the browser
      setIsPlaying(false);
      setAutoplayBlocked(true);
    });

    return () => {
      audio.pause();
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#c0b597ff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {/* Top-left icons (play / pause) */}
      <div style={{ position: 'fixed', top: 12, left: 12, zIndex: 100, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={async () => {
            const a = audioRef.current;
            if (!a) return;
            if (isPlaying) {
              // stop playback
              a.pause();
              setIsPlaying(false);
            } else {
              try {
                await a.play();
                setIsPlaying(true);
                setAutoplayBlocked(false);
              } catch {
                setAutoplayBlocked(true);
              }
            }
          }}
          aria-label={isPlaying ? 'Stop music' : 'Play music'}
          style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          <Image src={isPlaying ? '/music_icon.png' : '/music_icon_crossed.png'} alt="music toggle" width={40} height={40} />
        </button>
      </div>

      <div style={{ position: 'relative', width: '300px', height: '525px', border: '10px solid #3f2716ff' }}>
        {/* Background music (unmuted attempt). Top-left icons control play/pause. */}
        <audio ref={audioRef} src="/music.mp3" />
        {/* Background */}
        <Image src="/bg.png" alt="background" fill style={{ position: 'absolute', objectFit: 'contain', zIndex: 1 }} />
        
        {/* Ovens */}
        <Image src="/ovens.png" alt="ovens" fill style={{ position: 'absolute', objectFit: 'contain', zIndex: 2 }} />
        
        {/* Shelf */}
        <Image src="/shelf.png" alt="shelf" fill style={{ position: 'absolute', objectFit: 'contain', zIndex: 3 }} />
        
        {/* Robot Baker */}
        <div style={{ position: 'absolute', zIndex: 4, transform: `translateX(${robotX}px)`, transition: 'transform 0.1s ease', top: '32%', width: '100%', height: '48%' }}>
          <Image src="/robot_baker.png" alt="robot baker" fill style={{ objectFit: 'contain' }} />
        </div>
        
        {/* Counter */}
        <Image src="/counter.png" alt="counter" fill style={{ position: 'absolute', objectFit: 'contain', zIndex: 5 }} />
      </div>
    </div>
  );
}
