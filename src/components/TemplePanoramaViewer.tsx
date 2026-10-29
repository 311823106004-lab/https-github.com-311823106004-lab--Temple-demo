import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  Compass,
  RotateCcw,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Hand,
  Play,
  Pause,
  MapPin,
  Eye,
  EyeOff,
  Sparkles,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';

export interface PanoramaViewpoint {
  id: string;
  name: string;
  nameTamil: string;
  subtitle: string;
  imageUrl: string;
  thumbUrl: string;
  defaultLon: number;
  defaultLat: number;
}

export const TEMPLE_VIEWPOINTS: PanoramaViewpoint[] = [
  {
    id: 'rajagopuram',
    name: 'Rajagopuram & Sanctum Courtyard',
    nameTamil: 'ராஜகோபுரம் & பிரகாரம்',
    subtitle: '145-Foot Dravidian Tower & Golden Kalasam',
    imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=2400&q=90',
    thumbUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=300&q=80',
    defaultLon: 0,
    defaultLat: 10,
  },
  {
    id: 'sanctum',
    name: 'Sanctum Brass Deepam & Oil Lamps',
    nameTamil: 'சன்னதி தீபாராதனை & நெய் விளக்குகள்',
    subtitle: 'Sacred Oil Lamps & Sanctum Illumination',
    imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=2400&q=90',
    thumbUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=300&q=80',
    defaultLon: 90,
    defaultLat: 0,
  },
  {
    id: 'mandapam',
    name: 'Inner Pillared Praharam & Mandapam',
    nameTamil: 'தூண் மண்டபம் & உற்சவ அலங்காரம்',
    subtitle: 'Carved Granite Pillars & Divine Alankaram',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=2400&q=90',
    thumbUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80',
    defaultLon: 180,
    defaultLat: 5,
  },
  {
    id: 'teertham',
    name: 'Sacred Teertham & Sthala Vriksham',
    nameTamil: 'புனித தீர்த்தம் & தல விருட்சம்',
    subtitle: 'Auspicious Temple Tank & Sacred Neem Tree',
    imageUrl: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=2400&q=90',
    thumbUrl: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=300&q=80',
    defaultLon: 270,
    defaultLat: 5,
  },
];

interface TemplePanoramaViewerProps {
  customImageUrl?: string;
  children?: React.ReactNode;
}

export const TemplePanoramaViewer: React.FC<TemplePanoramaViewerProps> = ({
  customImageUrl,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasMountRef = useRef<HTMLDivElement>(null);

  // Three.js instances stored in refs
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sphereMeshRef = useRef<THREE.Mesh | null>(null);

  // Viewpoint State
  const [selectedViewpoint, setSelectedViewpoint] = useState<PanoramaViewpoint>(TEMPLE_VIEWPOINTS[0]);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [headingDegree, setHeadingDegree] = useState(0);
  const [showOverlayText, setShowOverlayText] = useState(true);
  const [isLoadingTexture, setIsLoadingTexture] = useState(true);
  const [activeMode, setActiveMode] = useState<'360' | 'photo'>('360');

  // Coordinates (lon, lat in degrees)
  const isUserInteracting = useRef(false);
  const lon = useRef(selectedViewpoint.defaultLon);
  const lat = useRef(selectedViewpoint.defaultLat);
  const targetLon = useRef(selectedViewpoint.defaultLon);
  const targetLat = useRef(selectedViewpoint.defaultLat);

  // Pointer drag trackers
  const onPointerDownPointerX = useRef(0);
  const onPointerDownPointerY = useRef(0);
  const onPointerDownLon = useRef(0);
  const onPointerDownLat = useRef(0);

  // Momentum velocity
  const velocityLon = useRef(0);
  const velocityLat = useRef(0);
  const lastPointerMoveTime = useRef(0);
  const lastMoveX = useRef(0);
  const lastMoveY = useRef(0);

  // Pinch-to-zoom tracking
  const pinchStartDist = useRef(0);
  const pinchStartFov = useRef(75);

  // Camera field of view
  const currentFov = useRef(75);
  const targetFov = useRef(75);
  const MIN_FOV = 35;
  const MAX_FOV = 95;

  const animationFrameId = useRef<number>(0);

  // --------------------------------------------------------------------------
  // High-Resolution 360 Equirectangular Canvas Generator
  // Integrates the real temple photo directly into a seamless 360° panorama
  // --------------------------------------------------------------------------
  const createEquirectangularPanoramaFromImage = useCallback(
    (img: HTMLImageElement, viewpoint: PanoramaViewpoint): HTMLCanvasElement => {
      const canvas = document.createElement('canvas');
      canvas.width = 4096;
      canvas.height = 2048;
      const ctx = canvas.getContext('2d');
      if (!ctx) return canvas;

      const w = canvas.width;
      const h = canvas.height;

      // 1. Sky & Celestial Lighting Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
      if (viewpoint.id === 'sanctum') {
        skyGrad.addColorStop(0, '#10051a');
        skyGrad.addColorStop(0.3, '#260d3d');
        skyGrad.addColorStop(0.7, '#4a154b');
        skyGrad.addColorStop(1, '#701a75');
      } else {
        skyGrad.addColorStop(0, '#0a0d24');
        skyGrad.addColorStop(0.3, '#1e1b4b');
        skyGrad.addColorStop(0.6, '#4c1d95');
        skyGrad.addColorStop(0.85, '#b45309');
        skyGrad.addColorStop(1, '#f59e0b');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * 0.6);

      // Evening stars & moon in sky
      if (viewpoint.id !== 'sanctum') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        for (let i = 0; i < 350; i++) {
          const sx = (Math.sin(i * 127.1) * 0.5 + 0.5) * w;
          const sy = (Math.cos(i * 311.7) * 0.5 + 0.5) * (h * 0.35);
          ctx.beginPath();
          ctx.arc(sx, sy, (i % 3 === 0) ? 2 : 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 2. Temple Stone Ground / Courtyard
      const groundGrad = ctx.createLinearGradient(0, h * 0.55, 0, h);
      groundGrad.addColorStop(0, '#1c1917');
      groundGrad.addColorStop(0.3, '#292524');
      groundGrad.addColorStop(0.8, '#44403c');
      groundGrad.addColorStop(1, '#292524');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, h * 0.55, w, h * 0.45);

      // Traditional red and white Agamic temple stripes (Pattai) on walls
      const wallY = h * 0.5;
      const wallH = h * 0.12;
      const stripeW = 80;
      for (let x = 0; x < w; x += stripeW * 2) {
        ctx.fillStyle = '#dc2626'; // Sacred Vermilion Red
        ctx.fillRect(x, wallY, stripeW, wallH);
        ctx.fillStyle = '#f8fafc'; // Sacred Chunam White
        ctx.fillRect(x + stripeW, wallY, stripeW, wallH);
      }

      // 3. Draw the REAL Temple Photograph directly in high definition!
      // Center position (lon = 0°)
      const imgTargetW = w * 0.55;
      const imgTargetH = h * 0.75;
      const imgCenterX = w * 0.5;
      const imgTopY = h * 0.12;

      // Soft vignette behind the photo to blend smoothly into 360 sphere
      ctx.save();
      // Draw primary photo in front field
      ctx.drawImage(img, imgCenterX - imgTargetW / 2, imgTopY, imgTargetW, imgTargetH);

      // Mirror / secondary photo on the opposite side (180°) for complete 360 immersion
      const oppCenterX = 0;
      ctx.drawImage(img, oppCenterX - imgTargetW / 2, imgTopY, imgTargetW, imgTargetH);
      const oppRightX = w;
      ctx.drawImage(img, oppRightX - imgTargetW / 2, imgTopY, imgTargetW, imgTargetH);
      ctx.restore();

      // 4. Courtyard Sacred Kolam
      const kolamX = w * 0.5;
      const kolamY = h * 0.82;
      ctx.save();
      ctx.translate(kolamX, kolamY);
      ctx.scale(2.5, 0.9);
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.6)';
      ctx.lineWidth = 3.5;
      for (let k = 0; k < 12; k++) {
        ctx.rotate((Math.PI * 2) / 12);
        ctx.beginPath();
        ctx.ellipse(0, 50, 20, 45, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(0, 0, 35, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(217, 119, 6, 0.4)';
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // 5. Traditional Brass Deepams with warm golden flames at left & right flanks
      [w * 0.22, w * 0.78].forEach((lx) => {
        const ly = h * 0.75;
        ctx.fillStyle = '#78716c';
        ctx.fillRect(lx - 10, ly - 160, 20, 160);
        for (let tier = 0; tier < 5; tier++) {
          const ty = ly - 30 - tier * 28;
          ctx.fillStyle = '#d97706';
          ctx.fillRect(lx - 30 + tier * 3, ty, 60 - tier * 6, 8);
          // Glowing Flame
          const flameGlow = ctx.createRadialGradient(lx, ty - 6, 2, lx, ty - 6, 28);
          flameGlow.addColorStop(0, '#ffffff');
          flameGlow.addColorStop(0.3, '#fde047');
          flameGlow.addColorStop(0.7, 'rgba(249, 115, 22, 0.6)');
          flameGlow.addColorStop(1, 'transparent');
          ctx.fillStyle = flameGlow;
          ctx.beginPath();
          ctx.arc(lx, ty - 6, 28, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      return canvas;
    },
    []
  );

  // --------------------------------------------------------------------------
  // Procedural Fallback if image network fails
  // --------------------------------------------------------------------------
  const generateProceduralFallback = useCallback((viewpointId: string): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = 4096;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const w = canvas.width;
    const h = canvas.height;

    // Golden divine twilight sky
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    sky.addColorStop(0, '#1e1b4b');
    sky.addColorStop(0.4, '#4c1d95');
    sky.addColorStop(0.7, '#d97706');
    sky.addColorStop(1, '#fde047');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h * 0.6);

    // Granite ground
    ctx.fillStyle = '#292524';
    ctx.fillRect(0, h * 0.6, w, h * 0.4);

    // Grand Gopuram in center
    const gopX = w * 0.5;
    let curY = h * 0.6;
    let curW = 800;
    for (let t = 0; t < 11; t++) {
      curY -= 45;
      curW *= 0.91;
      ctx.fillStyle = t % 2 === 0 ? '#b45309' : '#d97706';
      ctx.fillRect(gopX - curW / 2, curY, curW, 45);
      // Niches
      for (let n = 0; n < 8; n++) {
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(gopX - curW / 2 + (curW / 9) * (n + 1), curY + 22, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    return canvas;
  }, []);

  // --------------------------------------------------------------------------
  // Apply Texture to Three.js Mesh
  // --------------------------------------------------------------------------
  const applyCanvasToSphere = useCallback((canvas: HTMLCanvasElement) => {
    if (!sphereMeshRef.current) return;

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const material = sphereMeshRef.current.material as THREE.MeshBasicMaterial;
    material.color.setHex(0xffffff); // CRITICAL: 100% white for full vibrant brightness!
    material.map = texture;
    material.side = THREE.DoubleSide; // Visible from both sides
    material.needsUpdate = true;

    setIsLoadingTexture(false);
  }, []);

  // --------------------------------------------------------------------------
  // Texture Loader Function
  // --------------------------------------------------------------------------
  const loadPanoramaTexture = useCallback(
    (viewpoint: PanoramaViewpoint) => {
      setIsLoadingTexture(true);

      const imageUrl = customImageUrl || viewpoint.imageUrl;
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = createEquirectangularPanoramaFromImage(img, viewpoint);
        applyCanvasToSphere(canvas);
      };

      img.onerror = () => {
        console.warn('Image failed to load via CORS, applying procedural fallback:', imageUrl);
        const fallbackCanvas = generateProceduralFallback(viewpoint.id);
        applyCanvasToSphere(fallbackCanvas);
      };

      img.src = imageUrl;
    },
    [customImageUrl, createEquirectangularPanoramaFromImage, generateProceduralFallback, applyCanvasToSphere]
  );

  // --------------------------------------------------------------------------
  // Initialize Three.js WebGL Scene
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const width = canvasMountRef.current.clientWidth || window.innerWidth;
    const height = canvasMountRef.current.clientHeight || 640;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 1, 1100);
    cameraRef.current = camera;

    // 3. Renderer (SRGB & antialias)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    canvasMountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Inverted Sphere Geometry
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);

    // Initial material with full white color
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    sphereMeshRef.current = mesh;

    // 5. Load Initial Texture
    loadPanoramaTexture(selectedViewpoint);

    // 6. Animation Render Loop with damping & inertia
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);

      // Auto rotation
      if (autoRotate && !isUserInteracting.current) {
        targetLon.current += 0.08;
      }

      // Smooth inertia
      if (!isUserInteracting.current) {
        targetLon.current += velocityLon.current;
        targetLat.current += velocityLat.current;
        velocityLon.current *= 0.92;
        velocityLat.current *= 0.92;
      }

      // Clamp latitude between -85 and +85 degrees
      targetLat.current = Math.max(-85, Math.min(85, targetLat.current));

      // Damped interpolation
      lon.current += (targetLon.current - lon.current) * 0.12;
      lat.current += (targetLat.current - lat.current) * 0.12;

      // Smooth FOV zoom interpolation
      if (cameraRef.current) {
        currentFov.current += (targetFov.current - currentFov.current) * 0.15;
        if (Math.abs(cameraRef.current.fov - currentFov.current) > 0.01) {
          cameraRef.current.fov = currentFov.current;
          cameraRef.current.updateProjectionMatrix();
        }
      }

      // Convert spherical coordinates to Cartesian lookAt target
      const phi = THREE.MathUtils.degToRad(90 - lat.current);
      const theta = THREE.MathUtils.degToRad(lon.current);

      const targetX = 500 * Math.sin(phi) * Math.cos(theta);
      const targetY = 500 * Math.cos(phi);
      const targetZ = 500 * Math.sin(phi) * Math.sin(theta);

      camera.lookAt(targetX, targetY, targetZ);

      // Heading compass orientation
      const normHeading = Math.round(((lon.current % 360) + 360) % 360);
      setHeadingDegree(normHeading);

      renderer.render(scene, camera);
    };

    animate();

    // 7. Resize handling
    const handleResize = () => {
      if (!canvasMountRef.current || !rendererRef.current || !cameraRef.current) return;
      const newWidth = canvasMountRef.current.clientWidth;
      const newHeight = canvasMountRef.current.clientHeight;
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', handleResize);
      if (canvasMountRef.current && renderer.domElement) {
        canvasMountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [loadPanoramaTexture, selectedViewpoint, autoRotate]);

  // Switch viewpoint handler
  const handleSelectViewpoint = (vp: PanoramaViewpoint) => {
    setSelectedViewpoint(vp);
    targetLon.current = vp.defaultLon;
    targetLat.current = vp.defaultLat;
    targetFov.current = 75;
    loadPanoramaTexture(vp);
  };

  // --------------------------------------------------------------------------
  // Touch & Mouse Drag Handlers
  // --------------------------------------------------------------------------
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    isUserInteracting.current = true;
    setHasInteracted(true);
    setAutoRotate(false);

    velocityLon.current = 0;
    velocityLat.current = 0;

    onPointerDownPointerX.current = event.clientX;
    onPointerDownPointerY.current = event.clientY;
    onPointerDownLon.current = targetLon.current;
    onPointerDownLat.current = targetLat.current;

    lastMoveX.current = event.clientX;
    lastMoveY.current = event.clientY;
    lastPointerMoveTime.current = performance.now();

    if (containerRef.current && (event.target as HTMLElement).setPointerCapture) {
      try {
        (event.target as HTMLElement).setPointerCapture(event.pointerId);
      } catch {
        // Fallback
      }
    }
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isUserInteracting.current) return;
    event.preventDefault();

    const now = performance.now();
    const dt = Math.max(1, now - lastPointerMoveTime.current);

    const deltaX = event.clientX - onPointerDownPointerX.current;
    const deltaY = event.clientY - onPointerDownPointerY.current;

    const sensitivity = 0.16 * (currentFov.current / 75);
    targetLon.current = onPointerDownLon.current - deltaX * sensitivity;
    targetLat.current = onPointerDownLat.current + deltaY * sensitivity;

    const instantVx = (event.clientX - lastMoveX.current) / dt;
    const instantVy = (event.clientY - lastMoveY.current) / dt;
    velocityLon.current = -instantVx * 1.5;
    velocityLat.current = instantVy * 1.5;

    lastMoveX.current = event.clientX;
    lastMoveY.current = event.clientY;
    lastPointerMoveTime.current = now;
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    isUserInteracting.current = false;
    if (containerRef.current && (event.target as HTMLElement).releasePointerCapture) {
      try {
        (event.target as HTMLElement).releasePointerCapture(event.pointerId);
      } catch {
        // Fallback
      }
    }
  };

  // Pinch-to-zoom on touch devices
  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 2) {
      setHasInteracted(true);
      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      pinchStartDist.current = Math.hypot(dx, dy);
      pinchStartFov.current = targetFov.current;
    }
  };

  const onTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 2) {
      event.preventDefault();
      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const factor = pinchStartDist.current / Math.max(dist, 1);
      const newFov = Math.max(MIN_FOV, Math.min(MAX_FOV, pinchStartFov.current * factor));
      targetFov.current = newFov;
    }
  };

  // Mouse wheel zoom
  const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    setHasInteracted(true);
    const zoomDelta = event.deltaY * 0.05;
    targetFov.current = Math.max(MIN_FOV, Math.min(MAX_FOV, targetFov.current + zoomDelta));
  };

  const handleResetView = () => {
    targetLon.current = selectedViewpoint.defaultLon;
    targetLat.current = selectedViewpoint.defaultLat;
    targetFov.current = 75;
    velocityLon.current = 0;
    velocityLat.current = 0;
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden select-none bg-slate-950 transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen' : 'min-h-[580px] sm:min-h-[640px]'
      }`}
      onWheel={onWheel}
    >
      {/* MODE 1: 3D WebGL Canvas Mount Container */}
      <div
        ref={canvasMountRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        className={`absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none z-0 transition-opacity duration-300 ${
          activeMode === '360' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ touchAction: 'none' }}
      />

      {/* MODE 2: High-Definition Direct Temple Photo View */}
      {activeMode === 'photo' && (
        <div className="absolute inset-0 z-0 bg-slate-950 overflow-hidden">
          <img
            src={customImageUrl || selectedViewpoint.imageUrl}
            alt={selectedViewpoint.name}
            className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000"
          />
        </div>
      )}

      {/* Subtle Atmospheric Bottom Vignette (Leaves the temple image 100% bright and clear) */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-black/30 pointer-events-none z-10" />

      {/* Loading Overlay */}
      {isLoadingTexture && activeMode === '360' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs z-30 pointer-events-none transition-opacity">
          <div className="flex flex-col items-center gap-3 text-amber-300">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-amber-400 rounded-full animate-spin" />
            <span className="text-xs font-semibold tracking-wider font-cinzel">
              Loading 360° Temple Sanctum...
            </span>
          </div>
        </div>
      )}

      {/* Top 360° HUD Badge with Tamil & English Title */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-500/50 text-amber-300 text-xs font-bold shadow-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="tracking-wide uppercase font-cinzel">
            {activeMode === '360' ? '360° கோவில் தரிசனம்' : 'கோவில் காட்சி (Direct Photo)'}
          </span>
        </div>

        {/* 360 / Photo View Switcher Pill */}
        <div className="bg-slate-900/90 backdrop-blur-md p-1 rounded-full border border-slate-700 flex items-center gap-1 shadow">
          <button
            onClick={() => setActiveMode('360')}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeMode === '360'
                ? 'bg-amber-500 text-slate-950 shadow font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>360° Drag View</span>
          </button>
          <button
            onClick={() => setActiveMode('photo')}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeMode === 'photo'
                ? 'bg-amber-500 text-slate-950 shadow font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>HD Photo View</span>
          </button>
        </div>

        {/* Compass Heading Indicator */}
        {activeMode === '360' && (
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 text-slate-300 text-xs font-mono shadow">
            <Compass
              className="w-3.5 h-3.5 text-amber-400 transition-transform duration-75"
              style={{ transform: `rotate(${-headingDegree}deg)` }}
            />
            <span>{headingDegree}°</span>
            <span className="text-[10px] text-amber-400 font-bold">
              {headingDegree >= 315 || headingDegree < 45
                ? 'N (Sanctum)'
                : headingDegree >= 45 && headingDegree < 135
                ? 'E (Gopuram)'
                : headingDegree >= 135 && headingDegree < 225
                ? 'S (Teertham)'
                : 'W (Mandapam)'}
            </span>
          </div>
        )}
      </div>

      {/* Drag / Swipe Instruction Overlay (Hides automatically on first user interaction) */}
      {!hasInteracted && activeMode === '360' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-all duration-500 animate-fade-in">
          <div className="flex items-center gap-2.5 bg-purple-950/90 backdrop-blur-md px-4 py-2 rounded-full border border-amber-400/70 text-white text-xs font-semibold shadow-2xl">
            <Hand className="w-4 h-4 text-amber-300 animate-bounce" />
            <span>கோவில் சுற்றுப்புறத்தை 360° பார்க்க சுழற்றுங்கள் (Click & Drag to explore)</span>
          </div>
        </div>
      )}

      {/* Right-Side Viewport Action Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        {/* Toggle details overlay (Focus Mode) */}
        <button
          onClick={() => setShowOverlayText(!showOverlayText)}
          className="p-2.5 rounded-xl bg-slate-950/85 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800 backdrop-blur-md shadow-md transition-all active:scale-95"
          title={showOverlayText ? 'Hide text overlay (Focus on Temple)' : 'Show temple details'}
        >
          {showOverlayText ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-amber-400" />}
        </button>

        {activeMode === '360' && (
          <>
            {/* Reset View */}
            <button
              onClick={handleResetView}
              className="p-2.5 rounded-xl bg-slate-950/85 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800 backdrop-blur-md shadow-md transition-all active:scale-95"
              title="Reset to Center View"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
            </button>

            {/* Zoom In */}
            <button
              onClick={() => {
                targetFov.current = Math.max(MIN_FOV, targetFov.current - 12);
              }}
              className="p-2.5 rounded-xl bg-slate-950/85 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800 backdrop-blur-md shadow-md transition-all active:scale-95"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 text-amber-400" />
            </button>

            {/* Zoom Out */}
            <button
              onClick={() => {
                targetFov.current = Math.min(MAX_FOV, targetFov.current + 12);
              }}
              className="p-2.5 rounded-xl bg-slate-950/85 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800 backdrop-blur-md shadow-md transition-all active:scale-95"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 text-amber-400" />
            </button>

            {/* Auto Rotate Toggle */}
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`p-2.5 rounded-xl border backdrop-blur-md shadow-md transition-all active:scale-95 ${
                autoRotate
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                  : 'bg-slate-950/85 hover:bg-slate-900 text-slate-300 border-slate-800'
              }`}
              title={autoRotate ? 'Pause Auto-Rotation' : 'Auto-Rotate 360°'}
            >
              {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-amber-400" />}
            </button>
          </>
        )}

        {/* Fullscreen Toggle */}
        <button
          onClick={handleToggleFullscreen}
          className="p-2.5 rounded-xl bg-slate-950/85 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800 backdrop-blur-md shadow-md transition-all active:scale-95"
          title={isFullscreen ? 'Exit Fullscreen' : 'Immersive Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4 text-amber-400" />}
        </button>
      </div>

      {/* Center Overlay Content (Temple Name, Slogan, CTA Buttons) */}
      {showOverlayText && (
        <div className="relative z-20 pointer-events-none flex flex-col justify-center items-center min-h-[580px] sm:min-h-[640px] px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="pointer-events-auto max-w-4xl mx-auto space-y-6">
            {children}
          </div>
        </div>
      )}

      {/* Bottom Viewpoint Switcher Dock with Real Temple Image Thumbnails */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-4xl px-4 pointer-events-auto">
        <div className="bg-slate-950/90 backdrop-blur-md border border-purple-800/50 rounded-2xl p-2.5 shadow-2xl flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          {TEMPLE_VIEWPOINTS.map((vp) => {
            const isSelected = selectedViewpoint.id === vp.id;
            return (
              <button
                key={vp.id}
                onClick={() => handleSelectViewpoint(vp)}
                className={`flex-1 min-w-[200px] sm:min-w-0 p-2 rounded-xl text-left transition-all flex items-center gap-2.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-900/90 to-indigo-900/90 border-2 border-amber-400 text-white shadow-lg'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                }`}
              >
                {/* Temple Thumbnail */}
                <img
                  src={vp.thumbUrl}
                  alt={vp.name}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-amber-400/40"
                />
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1 text-xs font-bold truncate">
                    <span className="truncate">{vp.name}</span>
                  </div>
                  <div className="text-[11px] text-amber-300 font-medium truncate">
                    {vp.nameTamil}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {vp.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
