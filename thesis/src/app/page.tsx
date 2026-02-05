'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import DialogueCloud from './components/DialogueCloud';

export default function Home() {
  const router = useRouter();
  const [robotX, setRobotX] = useState(0);
  const [objectiveCompleted, setObjectiveCompleted] = useState(false);
  const [level2Completed, setLevel2Completed] = useState(false);
  const [level3Completed, setLevel3Completed] = useState(false);
  const [level4Completed, setLevel4Completed] = useState(false); // NEW
  const maxX = 55;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('completed') === 'true') setObjectiveCompleted(true);
    if (urlParams.get('level2Completed') === 'true') setLevel2Completed(true);
    if (urlParams.get('level3Completed') === 'true') setLevel3Completed(true);
    if (urlParams.get('level4Completed') === 'true') setLevel4Completed(true); // NEW
  }, []);

  // Add keyframe animation for bounce
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes bounce {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-8px);
        }
      }
      .bounce-icon {
        animation: bounce 1.5s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'a') {
        setRobotX((prev) => Math.max(prev - 10, -maxX));
      } else if (e.key.toLowerCase() === 'd') {
        setRobotX((prev) => Math.min(prev + 10, maxX));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [maxX]);

  useEffect(() => {
    // try to autoplay unmuted
    if (!audioRef.current) return;
    const audio = audioRef.current;
    audio.loop = true;
    audio.volume = 0.08;
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
    <div style={{ minHeight: '100vh',  display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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

      <div style={{ position: 'relative', width: '300px', height: '510px', border: '10px solid #6f5643' }}>
        {/* Background music (unmuted attempt). Top-left icons control play/pause. */}
        <audio ref={audioRef} src="/music2.mp3" />
        {/* Example dialogue cloud placed above the robot */}
        {/* <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', zIndex: 70 }}>
          <DialogueCloud>
            Hello, I&apos;m Clank the robot baker!
          </DialogueCloud>
        </div> */}
        {/* Background */}
        <Image src="/bg.png" alt="background" fill style={{ position: 'absolute', objectFit: 'contain', zIndex: 1 }} />
        
        {/* Ovens */}
        <Image src="/ovens.png" alt="ovens" fill style={{ position: 'absolute', objectFit: 'contain', zIndex: 2 }} />
        
        {/* Shelf */}
        <Image src="/shelf.png" alt="shelf" fill style={{ position: 'absolute', objectFit: 'contain', zIndex: 3 }} />
        
        {/* Robot Baker */}
  <div style={{ position: 'absolute', zIndex: 4, transform: `translateX(${robotX}px)`, transition: 'transform 0.1s ease', top: '34%', width: '100%', height: '48%' }}>
          <Image src="/robot_baker.png" alt="robot baker" fill style={{ objectFit: 'contain' }} />
        </div>
        
        {/* Counter */}
        <Image src="/counter.png" alt="counter" fill style={{ position: 'absolute', objectFit: 'contain', zIndex: 5 }} />

        {/* Cash register */}
        <Image src="/cashregister.png" alt="register" fill style={{ position: 'absolute', objectFit: 'contain', zIndex: 6 }} />

          {/* Note */}
        <Image src="/note.png" alt="note" fill style={{ position: 'absolute', objectFit: 'contain', zIndex: 7 }} />

         {/* Note */}
        <Image src="/postit.png" alt="postit" fill style={{ position: 'absolute', objectFit: 'contain', zIndex: 8 }} />
        
          {/* Objective icon on register (hidden after level 1 completion) */}
          {!objectiveCompleted && !level4Completed && (
            <button
              onClick={() => router.push('/level_1')}
              className="bounce-icon"
              aria-label="Start level 1"
              style={{ position: 'absolute', top: '53%', left: '13%', zIndex: 70, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <Image src="/objective.png" alt="objective" width={40} height={40} />
            </button>
          )}

          {/* After returning from level_1 show objective above the note (until level 2 is completed) */}
          {objectiveCompleted && !level2Completed && !level4Completed && (
            <button
              onClick={() => router.push('/level_2')}
              className="bounce-icon"
              aria-label="Start level 2"
              style={{ position: 'absolute', top: '61%', left: '61%', zIndex: 70, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer'}}>
              <Image src="/objective.png" alt="objective level 2" width={48} height={48} />
            </button>
          )}

          {/* After completing level 2 show objective above the post-it (until level 3 is completed) */}
          {objectiveCompleted && level2Completed && !level3Completed && !level4Completed && (
            <button
              onClick={() => router.push('/level_3')}
              className="bounce-icon"
              aria-label="Start level 3"
              style={{ position: 'absolute', top: '29%', left: '11%', zIndex: 70, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <Image src="/objective.png" alt="objective level 3" width={48} height={48} />
            </button>
          )}

          {/* After completing level 3 show objective pointing at the bread shelf */}
          {objectiveCompleted && level2Completed && level3Completed && !level4Completed && (
            <button
              onClick={() => router.push('/level_4')} // adjust if your Level 4 route differs
              className="bounce-icon"
              aria-label="Start level 4"
              // NOTE: tweak top/left to align exactly with the bread shelf in /shelf.png
              style={{ position: 'absolute', top: '80%', left: '65%', zIndex: 70, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <Image src="/objective.png" alt="objective level 4" width={48} height={48} />
            </button>
          )}

          {/* Clank dialogue after completing Level 4 */}
          {level4Completed && (
            <div
              style={{
                position: 'absolute',
                top: '20%',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 70,
              }}
            >
              <DialogueCloud>Good job! Thank you for completing my training!</DialogueCloud>
            </div>
          )}
      </div>
    </div>
  );
}
