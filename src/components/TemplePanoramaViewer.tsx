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
} from 'lucide-react';

export interface PanoramaViewpoint {
  id: string;
  name: string;
  subtitle: string;
  imageUrl?: string;
  defaultLon: number;
  defaultLat: number;
}

export const TEMPLE_VIEWPOINTS: PanoramaViewpoint[] = [
  {
    id: 'rajagopuram',
    name: 'Rajagopuram & Sanctum Courtyard',
    subtitle: '145-Foot Dravidian Tower & Golden Dwajasthambam',
    defaultLon: 0,
    defaultLat: 10,
  },
  {
    id: 'mandapam',
    name: 'Inner Pillared Praharam & Mandapam',
    subtitle: 'Carved Yali Pillars & Sanctum Silver Entrance',
    defaultLon: 90,
    defaultLat: 0,
  },
  {
    id: 'teertham',
    name: 'Sacred Teertham & Sthala Vriksham',
    subtitle: 'Auspicious Temple Tank & Consecrated Margosa Tree',
    defaultLon: 210,
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

  // Three.js instances stored in refs to prevent unnecessary re-creations
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sphereMeshRef = useRef<THREE.Mesh | null>(null);
  const textureLoaderRef = useRef<THREE.TextureLoader | null>(null);

  // Viewpoint State
  const [selectedViewpoint, setSelectedViewpoint] = useState<PanoramaViewpoint>(TEMPLE_VIEWPOINTS[0]);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [headingDegree, setHeadingDegree] = useState(0);
  const [showOverlayText, setShowOverlayText] = useState(true);
  const [isLoadingTexture, setIsLoadingTexture] = useState(true);

  // Interaction coordinates (in spherical angles: longitude and latitude in degrees)
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
  // Procedural Equirectangular Panorama Generator (Zero external 404 risk)
  // Generates rich, realistic 360° temple environment textures (4096x2048)
  // --------------------------------------------------------------------------
  const generateProceduralTemplePanorama = useCallback((viewpointId: string): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 4096;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const w = canvas.width;
    const h = canvas.height;

    // 1. Sky & Celestial Lighting Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.58);
    if (viewpointId === 'mandapam') {
      // Warm sanctum interior ceiling with wooden beams & hanging lamps
      skyGrad.addColorStop(0, '#10051a');
      skyGrad.addColorStop(0.3, '#210b36');
      skyGrad.addColorStop(0.55, '#3b1254');
    } else {
      // Golden hour twilight sky over Chennai Mylapore
      skyGrad.addColorStop(0, '#0a0d24');
      skyGrad.addColorStop(0.25, '#1e1b4b');
      skyGrad.addColorStop(0.42, '#4c1d95');
      skyGrad.addColorStop(0.52, '#9a3412');
      skyGrad.addColorStop(0.58, '#f59e0b');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.58);

    // Stars & evening celestial glow
    if (viewpointId !== 'mandapam') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      for (let i = 0; i < 400; i++) {
        const sx = (Math.sin(i * 123.45) * 0.5 + 0.5) * w;
        const sy = (Math.cos(i * 678.9) * 0.5 + 0.5) * (h * 0.4);
        const sr = (i % 3 === 0) ? 1.8 : 1.0;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }
      // Crescent Moon in sky
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(w * 0.15, h * 0.18, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(w * 0.15 + 10, h * 0.18 - 4, 24, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Temple Ground / Granite Prakaram Courtyard
    const groundGrad = ctx.createLinearGradient(0, h * 0.58, 0, h);
    groundGrad.addColorStop(0, '#1c1917');
    groundGrad.addColorStop(0.25, '#292524');
    groundGrad.addColorStop(0.7, '#44403c');
    groundGrad.addColorStop(1, '#292524');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, h * 0.58, w, h * 0.42);

    // Granite stone slabs & Kolam pattern on ground
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.18)';
    ctx.lineWidth = 2;
    for (let gy = h * 0.6; gy < h; gy += 45) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
    }

    // Sacred Kolam / Mandala in courtyard center
    const kolamX = w * 0.5;
    const kolamY = h * 0.82;
    ctx.save();
    ctx.translate(kolamX, kolamY);
    ctx.scale(2.4, 0.9);
    ctx.strokeStyle = 'rgba(254, 243, 199, 0.45)';
    ctx.lineWidth = 3;
    for (let k = 0; k < 12; k++) {
      ctx.rotate((Math.PI * 2) / 12);
      ctx.beginPath();
      ctx.ellipse(0, 50, 20, 45, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 35, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(217, 119, 6, 0.3)';
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 3. Viewpoint Specific Architecture:
    if (viewpointId === 'rajagopuram') {
      // ----------------------------------------------------
      // Viewpoint 1: Grand 11-tiered Dravidian Rajagopuram at Center (0° - 360°)
      // ----------------------------------------------------
      const gopX = w * 0.5;
      const gopBaseY = h * 0.62;

      // Draw 11 tiers of the Rajagopuram
      const tiers = 11;
      let curWidth = 720;
      let curY = gopBaseY;

      for (let t = 0; t < tiers; t++) {
        const tierHeight = 44 - t * 1.8;
        curY -= tierHeight;
        curWidth *= 0.91;

        // Tier base block
        const tierGrad = ctx.createLinearGradient(gopX - curWidth / 2, curY, gopX + curWidth / 2, curY);
        tierGrad.addColorStop(0, '#581c87');
        tierGrad.addColorStop(0.3, '#7c2d12');
        tierGrad.addColorStop(0.5, '#d97706');
        tierGrad.addColorStop(0.7, '#7c2d12');
        tierGrad.addColorStop(1, '#581c87');
        ctx.fillStyle = tierGrad;
        ctx.fillRect(gopX - curWidth / 2, curY, curWidth, tierHeight);

        // Agamic miniature sculpted niches and deities
        const niches = 10 - t;
        for (let n = 0; n < niches; n++) {
          const nx = gopX - curWidth / 2 + (curWidth / (niches + 1)) * (n + 1);
          ctx.fillStyle = n % 2 === 0 ? '#fbbf24' : '#f59e0b';
          ctx.beginPath();
          ctx.arc(nx, curY + tierHeight * 0.5, 4.5, 0, Math.PI * 2);
          ctx.fill();
          // Arch outline
          ctx.strokeStyle = '#3b0764';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // Golden Kalasams (Finials on top)
      const kalasamWidth = curWidth * 0.8;
      const kalasamCount = 9;
      for (let k = 0; k < kalasamCount; k++) {
        const kx = gopX - kalasamWidth / 2 + (kalasamWidth / (kalasamCount - 1)) * k;
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.moveTo(kx, curY - 26);
        ctx.lineTo(kx - 6, curY - 6);
        ctx.lineTo(kx + 6, curY - 6);
        ctx.closePath();
        ctx.fill();
        // Kalasam pot
        ctx.beginPath();
        ctx.arc(kx, curY - 4, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Main Gopuram Gateway Door (Torana Entrance)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(gopX - 110, gopBaseY - 140, 220, 140, [80, 80, 0, 0]);
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 5;
      ctx.stroke();

      // Golden Dwajasthambam (Flagstaff) in front
      const flagX = gopX + 220;
      const flagBaseY = h * 0.76;
      ctx.fillStyle = '#b45309';
      ctx.fillRect(flagX - 14, flagBaseY - 32, 28, 32);
      // Gold pole soaring up
      const goldGrad = ctx.createLinearGradient(flagX - 5, 0, flagX + 5, 0);
      goldGrad.addColorStop(0, '#d97706');
      goldGrad.addColorStop(0.5, '#fde047');
      goldGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = goldGrad;
      ctx.fillRect(flagX - 5, flagBaseY - 380, 10, 350);
      // Bell and Kalasam on top
      ctx.beginPath();
      ctx.arc(flagX, flagBaseY - 385, 12, 0, Math.PI * 2);
      ctx.fill();

      // Deepam pillar with glowing brass oil lamps on both sides
      [-320, 380].forEach((ox) => {
        const lx = gopX + ox;
        const ly = h * 0.72;
        // Stone pillar
        ctx.fillStyle = '#44403c';
        ctx.fillRect(lx - 8, ly - 140, 16, 140);
        // Multi-tier lamp bowls
        for (let tier = 0; tier < 5; tier++) {
          const ty = ly - 25 - tier * 26;
          ctx.fillStyle = '#d97706';
          ctx.fillRect(lx - 24 + tier * 2, ty, 48 - tier * 4, 6);
          // Glowing flames
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(lx - 20 + tier * 2, ty - 5, 5, 0, Math.PI * 2);
          ctx.arc(lx + 20 - tier * 2, ty - 5, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    } else if (viewpointId === 'mandapam') {
      // ----------------------------------------------------
      // Viewpoint 2: 1000-Pillared Mandapam & Sanctum Corridor
      // ----------------------------------------------------
      // Heavy Agamic Stone Ceiling
      const ceilGrad = ctx.createLinearGradient(0, 0, 0, h * 0.4);
      ceilGrad.addColorStop(0, '#1e1b4b');
      ceilGrad.addColorStop(0.5, '#311042');
      ceilGrad.addColorStop(1, '#4c1d95');
      ctx.fillStyle = ceilGrad;
      ctx.fillRect(0, 0, w, h * 0.4);

      // Carved stone beams
      ctx.strokeStyle = '#581c87';
      ctx.lineWidth = 14;
      for (let bx = 0; bx < w; bx += 320) {
        ctx.beginPath();
        ctx.moveTo(bx, 0);
        ctx.lineTo(bx, h * 0.4);
        ctx.stroke();
      }

      // Pillars row extending in perspective across 360 degrees
      const pillarCount = 20;
      for (let p = 0; p < pillarCount; p++) {
        const px = (w / pillarCount) * p;
        const pillarW = 54;
        const pTop = h * 0.32;
        const pBottom = h * 0.85;

        // Pillar granite gradient
        const pGrad = ctx.createLinearGradient(px - pillarW / 2, 0, px + pillarW / 2, 0);
        pGrad.addColorStop(0, '#292524');
        pGrad.addColorStop(0.35, '#57534e');
        pGrad.addColorStop(0.7, '#78716c');
        pGrad.addColorStop(1, '#1c1917');
        ctx.fillStyle = pGrad;
        ctx.fillRect(px - pillarW / 2, pTop, pillarW, pBottom - pTop);

        // Yali / Lion carved capitals on pillar head
        ctx.fillStyle = '#d97706';
        ctx.fillRect(px - pillarW * 0.8, pTop - 15, pillarW * 1.6, 20);

        // Hanging brass Deepam lamp between pillars
        if (p % 2 === 0) {
          const lampX = px + (w / pillarCount) * 0.5;
          const chainY = h * 0.35;
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(lampX, chainY);
          ctx.lineTo(lampX, chainY + 80);
          ctx.stroke();

          // Brass lamp bell
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(lampX, chainY + 90, 14, 0, Math.PI);
          ctx.fill();

          // Luminous flame
          const flameGrad = ctx.createRadialGradient(lampX, chainY + 86, 2, lampX, chainY + 86, 24);
          flameGrad.addColorStop(0, '#ffffff');
          flameGrad.addColorStop(0.3, '#fde047');
          flameGrad.addColorStop(0.7, 'rgba(249, 115, 22, 0.6)');
          flameGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
          ctx.fillStyle = flameGrad;
          ctx.beginPath();
          ctx.arc(lampX, chainY + 86, 24, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Silver Sanctum Entrance in the Distance at 0° (Center)
      const sanctumX = w * 0.5;
      const sanctumY = h * 0.6;
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(sanctumX - 100, sanctumY - 140, 200, 140);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 8;
      ctx.strokeRect(sanctumX - 100, sanctumY - 140, 200, 140);

      // Sanctum Holy Light Aura
      const sanctumGlow = ctx.createRadialGradient(sanctumX, sanctumY - 70, 10, sanctumX, sanctumY - 70, 120);
      sanctumGlow.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
      sanctumGlow.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)');
      sanctumGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = sanctumGlow;
      ctx.beginPath();
      ctx.arc(sanctumX, sanctumY - 70, 120, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // ----------------------------------------------------
      // Viewpoint 3: Pavitra Teertham (Sacred Pond) & Margosa Tree
      // ----------------------------------------------------
      // Sacred Pond water reflecting temple spires
      const pondY = h * 0.62;
      const waterGrad = ctx.createLinearGradient(0, pondY, 0, h);
      waterGrad.addColorStop(0, '#0c4a6e');
      waterGrad.addColorStop(0.3, '#0369a1');
      waterGrad.addColorStop(0.8, '#082f49');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, pondY, w * 0.7, h - pondY);

      // Lotus flowers in pond
      for (let l = 0; l < 25; l++) {
        const lx = (l * 137.5) % (w * 0.65);
        const ly = pondY + 40 + (l * 29) % (h * 0.28);
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.ellipse(lx, ly, 12, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.ellipse(lx + 8, ly + 2, 16, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Temple Teertham stone steps (Ghats)
      for (let st = 0; st < 6; st++) {
        const stepY = pondY + st * 15;
        ctx.strokeStyle = '#78716c';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, stepY);
        ctx.lineTo(w * 0.7, stepY);
        ctx.stroke();
      }

      // Sthala Vriksham (Sacred Margosa / Neem Tree) at right flank (w * 0.8)
      const treeX = w * 0.82;
      const treeBaseY = h * 0.68;
      // Trunk
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.moveTo(treeX - 35, treeBaseY);
      ctx.lineTo(treeX - 15, treeBaseY - 220);
      ctx.lineTo(treeX + 15, treeBaseY - 220);
      ctx.lineTo(treeX + 35, treeBaseY);
      ctx.fill();

      // Lush leafy canopy
      ctx.fillStyle = '#166534';
      for (let c = 0; c < 12; c++) {
        const cx = treeX + (Math.sin(c) * 80);
        const cy = treeBaseY - 240 + (Math.cos(c) * 60);
        ctx.beginPath();
        ctx.arc(cx, cy, 75, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sacred Trishulam (Trident) beneath the tree with lemon garland
      const triX = treeX - 70;
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(triX, treeBaseY);
      ctx.lineTo(triX, treeBaseY - 110);
      ctx.stroke();
      // Three prongs
      ctx.beginPath();
      ctx.arc(triX, treeBaseY - 110, 22, Math.PI, 0, false);
      ctx.stroke();
      // Yellow lemon garland dots
      ctx.fillStyle = '#fde047';
      for (let lm = 0; lm < 8; lm++) {
        ctx.beginPath();
        ctx.arc(triX - 18 + lm * 5, treeBaseY - 95 + (lm % 2) * 4, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    return canvas.toDataURL('image/jpeg', 0.92);
  }, []);

  // --------------------------------------------------------------------------
  // Initialize Three.js WebGL Scene & Panorama Sphere
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const width = canvasMountRef.current.clientWidth || window.innerWidth;
    const height = canvasMountRef.current.clientHeight || 640;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera: Perspective inside the sphere (FOV: 75)
    const camera = new THREE.PerspectiveCamera(75, width / height, 1, 1100);
    cameraRef.current = camera;

    // 3. Renderer with antialias and SRGB color space
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

    // 4. Inverted Sphere Geometry (radius 500)
    // Scale on X inverted to map equirectangular image to inside of sphere
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);

    // Initial Material
    const material = new THREE.MeshBasicMaterial({
      color: 0x111111,
      side: THREE.FrontSide, // FrontSide because geometry is inverted (-1 x)
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    sphereMeshRef.current = mesh;

    // Texture loader
    textureLoaderRef.current = new THREE.TextureLoader();

    // 5. Load Panorama Texture
    loadPanoramaTexture(selectedViewpoint);

    // 6. Animation Loop with smooth inertia & damping
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);

      // Auto rotation when idle and enabled
      if (autoRotate && !isUserInteracting.current) {
        targetLon.current += 0.08;
      }

      // Smooth inertia / momentum damping
      if (!isUserInteracting.current) {
        targetLon.current += velocityLon.current;
        targetLat.current += velocityLat.current;
        velocityLon.current *= 0.92;
        velocityLat.current *= 0.92;
      }

      // Clamp latitude between -85 and +85 degrees to prevent flipping
      targetLat.current = Math.max(-85, Math.min(85, targetLat.current));

      // Damped interpolation towards target coordinates
      lon.current += (targetLon.current - lon.current) * 0.12;
      lat.current += (targetLat.current - lat.current) * 0.12;

      // Smooth FOV interpolation (zoom)
      if (cameraRef.current) {
        currentFov.current += (targetFov.current - currentFov.current) * 0.15;
        if (Math.abs(cameraRef.current.fov - currentFov.current) > 0.01) {
          cameraRef.current.fov = currentFov.current;
          cameraRef.current.updateProjectionMatrix();
        }
      }

      // Convert spherical coordinates (lat, lon) to Cartesian lookAt target
      const phi = THREE.MathUtils.degToRad(90 - lat.current);
      const theta = THREE.MathUtils.degToRad(lon.current);

      const targetX = 500 * Math.sin(phi) * Math.cos(theta);
      const targetY = 500 * Math.cos(phi);
      const targetZ = 500 * Math.sin(phi) * Math.sin(theta);

      camera.lookAt(targetX, targetY, targetZ);

      // Update heading compass orientation (0° to 360°)
      const normHeading = Math.round(((lon.current % 360) + 360) % 360);
      setHeadingDegree(normHeading);

      renderer.render(scene, camera);
    };

    animate();

    // 7. Handle Resize
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
  }, []);

  // --------------------------------------------------------------------------
  // Texture Loader Helper
  // --------------------------------------------------------------------------
  const loadPanoramaTexture = (viewpoint: PanoramaViewpoint) => {
    setIsLoadingTexture(true);

    const applyTexture = (texture: THREE.Texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      if (sphereMeshRef.current) {
        (sphereMeshRef.current.material as THREE.MeshBasicMaterial).map = texture;
        (sphereMeshRef.current.material as THREE.MeshBasicMaterial).needsUpdate = true;
      }
      setIsLoadingTexture(false);
    };

    // If custom image or viewpoint URL provided, attempt loading with fallback
    const targetUrl = customImageUrl || viewpoint.imageUrl;
    if (targetUrl && textureLoaderRef.current) {
      textureLoaderRef.current.load(
        targetUrl,
        (tex) => applyTexture(tex),
        undefined,
        () => {
          // Fallback to high-res procedural generation on network failure
          const fallbackData = generateProceduralTemplePanorama(viewpoint.id);
          new THREE.TextureLoader().load(fallbackData, applyTexture);
        }
      );
    } else {
      // High-res procedural synthesis
      const proceduralData = generateProceduralTemplePanorama(viewpoint.id);
      new THREE.TextureLoader().load(proceduralData, applyTexture);
    }
  };

  // Switch viewpoint
  const handleSelectViewpoint = (vp: PanoramaViewpoint) => {
    setSelectedViewpoint(vp);
    targetLon.current = vp.defaultLon;
    targetLat.current = vp.defaultLat;
    targetFov.current = 75;
    loadPanoramaTexture(vp);
  };

  // --------------------------------------------------------------------------
  // Touch & Mouse Drag Event Handlers with momentum & pinch-to-zoom
  // --------------------------------------------------------------------------
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    isUserInteracting.current = true;
    setHasInteracted(true);
    setAutoRotate(false);

    // Stop existing momentum
    velocityLon.current = 0;
    velocityLat.current = 0;

    onPointerDownPointerX.current = event.clientX;
    onPointerDownPointerY.current = event.clientY;
    onPointerDownLon.current = targetLon.current;
    onPointerDownLat.current = targetLat.current;

    lastMoveX.current = event.clientX;
    lastMoveY.current = event.clientY;
    lastPointerMoveTime.current = performance.now();

    // Capture pointer to track outside bounds smoothly
    if (containerRef.current && (event.target as HTMLElement).setPointerCapture) {
      try {
        (event.target as HTMLElement).setPointerCapture(event.pointerId);
      } catch {
        // Fallback gracefully
      }
    }
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isUserInteracting.current) return;

    // Prevent page scrolling while user is interacting with the 360 viewer
    event.preventDefault();

    const now = performance.now();
    const dt = Math.max(1, now - lastPointerMoveTime.current);

    const deltaX = event.clientX - onPointerDownPointerX.current;
    const deltaY = event.clientY - onPointerDownPointerY.current;

    // Street view natural direction: dragging mouse left moves view right
    const sensitivity = 0.16 * (currentFov.current / 75);
    targetLon.current = onPointerDownLon.current - deltaX * sensitivity;
    targetLat.current = onPointerDownLat.current + deltaY * sensitivity;

    // Calculate release velocity for natural momentum
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
    // Only zoom when mouse is over viewer, prevent page scrolling
    event.preventDefault();
    setHasInteracted(true);
    const zoomDelta = event.deltaY * 0.05;
    targetFov.current = Math.max(MIN_FOV, Math.min(MAX_FOV, targetFov.current + zoomDelta));
  };

  // Reset view to default
  const handleResetView = () => {
    targetLon.current = selectedViewpoint.defaultLon;
    targetLat.current = selectedViewpoint.defaultLat;
    targetFov.current = 75;
    velocityLon.current = 0;
    velocityLat.current = 0;
  };

  // Fullscreen toggle
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Zoom buttons
  const handleZoomIn = () => {
    targetFov.current = Math.max(MIN_FOV, targetFov.current - 12);
  };

  const handleZoomOut = () => {
    targetFov.current = Math.min(MAX_FOV, targetFov.current + 12);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden select-none bg-slate-950 transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen' : 'min-h-[580px] sm:min-h-[640px]'
      }`}
      onWheel={onWheel}
    >
      {/* 3D WebGL Canvas Mount Container */}
      <div
        ref={canvasMountRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none z-0"
        style={{ touchAction: 'none' }}
      />

      {/* Atmospheric Vignette & Temple Dark Blue/Purple Lighting Gradient (doesn't block interaction) */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/60 pointer-events-none z-10" />

      {/* Loading Overlay */}
      {isLoadingTexture && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs z-30 pointer-events-none transition-opacity">
          <div className="flex flex-col items-center gap-3 text-amber-300">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-amber-400 rounded-full animate-spin" />
            <span className="text-xs font-semibold tracking-wider font-cinzel">
              Loading 360° Temple Sanctum...
            </span>
          </div>
        </div>
      )}

      {/* Top 360° HUD Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-500/40 text-amber-300 text-xs font-bold shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="tracking-wide uppercase font-cinzel">Interactive 360° Darshan</span>
        </div>

        {/* Compass Heading Indicator */}
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
              : 'W (Goshala)'}
          </span>
        </div>
      </div>

      {/* Drag / Swipe Instruction Overlay (Hides automatically on first user interaction) */}
      {!hasInteracted && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-all duration-500 animate-fade-in">
          <div className="flex items-center gap-2.5 bg-purple-950/85 backdrop-blur-md px-4 py-2 rounded-full border border-amber-400/60 text-white text-xs font-semibold shadow-2xl shadow-purple-950/80">
            <Hand className="w-4 h-4 text-amber-300" />
            <span>Click & Drag or Swipe to explore 360° surroundings</span>
          </div>
        </div>
      )}

      {/* Right-Side Viewport Action Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        {/* Toggle details overlay (Focus Mode) */}
        <button
          onClick={() => setShowOverlayText(!showOverlayText)}
          className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800 backdrop-blur-md shadow-md transition-all active:scale-95"
          title={showOverlayText ? 'Hide text overlay (Focus on 360°)' : 'Show temple details'}
        >
          {showOverlayText ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Reset View */}
        <button
          onClick={handleResetView}
          className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800 backdrop-blur-md shadow-md transition-all active:scale-95"
          title="Reset to Center View"
        >
          <RotateCcw className="w-4 h-4 text-amber-400" />
        </button>

        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800 backdrop-blur-md shadow-md transition-all active:scale-95"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4 text-amber-400" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800 backdrop-blur-md shadow-md transition-all active:scale-95"
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
              : 'bg-slate-950/80 hover:bg-slate-900 text-slate-300 border-slate-800'
          }`}
          title={autoRotate ? 'Pause Auto-Rotation' : 'Auto-Rotate 360°'}
        >
          {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={handleToggleFullscreen}
          className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800 backdrop-blur-md shadow-md transition-all active:scale-95"
          title={isFullscreen ? 'Exit Fullscreen' : 'Immersive Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4 text-amber-400" />}
        </button>
      </div>

      {/* Center/Children Overlay Content (Temple Name, Slogan, CTA Buttons) */}
      {showOverlayText && (
        <div className="relative z-20 pointer-events-none flex flex-col justify-center items-center min-h-[580px] sm:min-h-[640px] px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="pointer-events-auto max-w-4xl mx-auto space-y-6">
            {children}
          </div>
        </div>
      )}

      {/* Bottom Viewpoint Switcher Dock */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-3xl px-4 pointer-events-auto">
        <div className="bg-slate-950/85 backdrop-blur-md border border-purple-800/40 rounded-2xl p-2 shadow-2xl flex items-center justify-between gap-1.5 overflow-x-auto scrollbar-none">
          {TEMPLE_VIEWPOINTS.map((vp) => {
            const isSelected = selectedViewpoint.id === vp.id;
            return (
              <button
                key={vp.id}
                onClick={() => handleSelectViewpoint(vp)}
                className={`flex-1 min-w-[170px] sm:min-w-0 py-2 px-3 rounded-xl text-left transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-900 to-indigo-900 border border-amber-400/60 text-white shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold truncate">
                  <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span className="truncate">{vp.name}</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate pl-5">
                  {vp.subtitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
