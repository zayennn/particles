const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const NOTES = [196.00, 220.00, 261.63, 293.66, 329.63, 392.00];

function createHarmonicSound(baseFreq) {
    const masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(0, audioContext.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
    masterGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 2);
    masterGain.connect(audioContext.destination);

    const convolver = audioContext.createConvolver();
    const reverbGain = audioContext.createGain();
    reverbGain.gain.value = 0.2;
    
    const osc = audioContext.createOscillator();
    osc.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
    osc.type = 'sine';
    
    const harmonic = audioContext.createOscillator();
    harmonic.frequency.setValueAtTime(baseFreq * 1.5, audioContext.currentTime);
    harmonic.type = 'sine';
    
    const harmonicGain = audioContext.createGain();
    harmonicGain.gain.value = 0.2;

    osc.connect(masterGain);
    harmonic.connect(harmonicGain);
    harmonicGain.connect(masterGain);
    
    osc.start();
    harmonic.start();
    osc.stop(audioContext.currentTime + 2);
    harmonic.stop(audioContext.currentTime + 2);
}

const SHAPES = {
    SQUARE: 0,
    TRIANGLE: 1,
    DIAMOND: 2,
    PENTAGON: 3,
    STAR: 4,
    CIRCLE: 5,
    CROSS: 6,
    SPIRAL: 7
};

const controls = {
    isShiftPressed: false,
    isCtrlPressed: false,
    activeKeys: new Set()
};

class Star {
    constructor(canvas) {
        this.canvas = canvas;
        this.reset();
    }

    reset() {
        if (!this.canvas || !isFinite(this.canvas.width) || !isFinite(this.canvas.height)) {
            return false;
        }
        this.x = Math.random() * this.canvas.width;
        this.y = Math.random() * this.canvas.height;
        this.size = Math.random() * 1.5;
        this.alpha = Math.random();
        this.twinkleSpeed = Math.random() * 0.05 + 0.02;
        return true;
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    update(time) {
        this.alpha = Math.abs(Math.sin(time * this.twinkleSpeed));
        const dx = this.canvas.width / 2 - this.x;
        const dy = this.canvas.height / 2 - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 200) {
            this.reset();
        }
    }
}

class Trail {
    constructor(x, y, color, size = 2) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.alpha = 0.5;
        this.size = size;
        this.rotation = Math.random() * Math.PI * 2;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Draw 3D-like shape
        ctx.beginPath();
        ctx.moveTo(-this.size, -this.size);
        ctx.lineTo(this.size, -this.size);
        ctx.lineTo(this.size, this.size);
        ctx.lineTo(-this.size, this.size);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
        
        ctx.restore();
    }

    update() {
        this.alpha *= 0.95;
        this.rotation += 0.05;
        this.size *= 0.98;
        return this.alpha > 0.01;
    }
}

class QuantumParticle {
    constructor(x, y, canvas) {
        this.x = x;
        this.y = y;
        this.canvas = canvas;
        this.reset();
        this.trailPoints = [];
        this.maxTrailLength = Math.floor(Math.random() * 10) + 5;
    }

    reset() {
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.size = Math.random() * 3 + 1;
        this.originalSize = this.size;
        this.life = 1;
        this.maxLife = Math.random() * 100 + 100;
        this.hue = Math.random() * 60 + 160;
        this.targetHue = this.hue;
        this.brightness = Math.random() * 30 + 70;
        this.alpha = Math.random() * 0.5 + 0.5;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.energy = Math.random();
        this.phase = Math.random() * Math.PI * 2;
        this.phaseSpeed = (Math.random() - 0.5) * 0.05;
        this.glowIntensity = Math.random();
        this.trailPoints = [];
    }

    update(flowField, audioLevel = 0, complexity = 3) {
        // Update phase for oscillating effects
        this.phase += this.phaseSpeed;
        
        // Flow field influence with audio reactivity
        const fx = Math.floor(this.x / 20);
        const fy = Math.floor(this.y / 20);
        const flowIndex = (fy * Math.floor(this.canvas.width / 20) + fx) * 2;
        
        if (flowField[flowIndex] !== undefined) {
            const audioInfluence = 0.2 + audioLevel * 0.3;
            this.vx += flowField[flowIndex] * audioInfluence;
            this.vy += flowField[flowIndex + 1] * audioInfluence;
        }

        // Complex motion behavior
        const angle = Math.atan2(this.vy, this.vx) + 
                     (Math.sin(this.life * 0.1) * complexity * 0.1) +
                     (Math.cos(this.phase) * 0.2);
        
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        // Apply velocity with audio-reactive damping
        const damping = 0.99 - audioLevel * 0.1;
        this.vx *= damping;
        this.vy *= damping;
        this.x += this.vx;
        this.y += this.vy;

        // Update trail
        this.trailPoints.unshift({ x: this.x, y: this.y, alpha: this.alpha });
        if (this.trailPoints.length > this.maxTrailLength) {
            this.trailPoints.pop();
        }

        // Dynamic color shifting
        const hueShift = Math.sin(this.life * 0.05) * 20;
        this.targetHue = 160 + hueShift + audioLevel * 40;
        this.hue += (this.targetHue - this.hue) * 0.1;

        // Audio-reactive size and energy
        const sizePulse = Math.sin(this.phase) * 0.3 + 1;
        this.size = this.originalSize * (1 + audioLevel * 2) * sizePulse;
        this.energy = Math.min(1, this.energy + audioLevel * 0.1);
        
        // Glow intensity modulation
        this.glowIntensity = Math.sin(this.life * 0.1) * 0.5 + 0.5;

        // Update life and rotation
        this.life++;
        this.rotation += this.rotationSpeed + audioLevel * 0.1;
        this.alpha = Math.min(1, (this.maxLife - this.life) / 100);

        // Boundary behavior: wrap around with momentum preservation
        if (this.x < 0) { this.x = this.canvas.width; this.trailPoints = []; }
        if (this.x > this.canvas.width) { this.x = 0; this.trailPoints = []; }
        if (this.y < 0) { this.y = this.canvas.height; this.trailPoints = []; }
        if (this.y > this.canvas.height) { this.y = 0; this.trailPoints = []; }

        return this.life < this.maxLife;
    }

    draw(ctx) {
        ctx.save();
        
        // Draw trail
        if (this.trailPoints.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.trailPoints[0].x, this.trailPoints[0].y);
            
            for (let i = 1; i < this.trailPoints.length; i++) {
                const point = this.trailPoints[i];
                const prevPoint = this.trailPoints[i - 1];
                const xc = (point.x + prevPoint.x) * 0.5;
                const yc = (point.y + prevPoint.y) * 0.5;
                ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, xc, yc);
                
                ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${point.alpha * 0.3})`;
                ctx.lineWidth = this.size * 0.5;
                ctx.stroke();
            }
        }

        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Draw glow effect
        const glowSize = this.size * 3;
        const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
        glowGradient.addColorStop(0, `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha * 0.5 * this.glowIntensity})`);
        glowGradient.addColorStop(1, `hsla(${this.hue}, 100%, ${this.brightness}%, 0)`);
        
        ctx.beginPath();
        ctx.fillStyle = glowGradient;
        ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Draw core
        const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 2);
        coreGradient.addColorStop(0, `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`);
        coreGradient.addColorStop(0.5, `hsla(${this.hue + 30}, 100%, ${this.brightness - 10}%, ${this.alpha * 0.5})`);
        coreGradient.addColorStop(1, `hsla(${this.hue + 60}, 100%, ${this.brightness - 20}%, 0)`);

        ctx.beginPath();
        ctx.fillStyle = coreGradient;
        ctx.arc(0, 0, this.size * 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw energy field
        if (this.energy > 0.5) {
            const energyPoints = 6;
            const energyLength = this.size * 4 * this.energy;
            
            ctx.beginPath();
            for (let i = 0; i < energyPoints; i++) {
                const angle = (i * Math.PI * 2 / energyPoints) + this.rotation;
                const length = energyLength * (0.8 + Math.sin(this.phase + i) * 0.2);
                
                ctx.moveTo(0, 0);
                ctx.lineTo(
                    Math.cos(angle) * length,
                    Math.sin(angle) * length
                );
            }
            
            ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha * 0.3})`;
            ctx.lineWidth = this.size * 0.3;
            ctx.stroke();
        }

        ctx.restore();
    }
}

class QuantumNexus {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d', {
            alpha: false,  // Performance optimization
            desynchronized: true // Reduce latency
        });
        this.particles = [];
        this.flowField = [];
        this.mouse = { x: 0, y: 0 };
        this.lastMouse = { x: 0, y: 0 };
        this.isMouseDown = false;
        this.time = 0;
        this.audioInitialized = false;
        this.attractors = [];
        this.lastInteractionTime = 0;
        this.lastFrame = 0;
        this.frameCount = 0;

        // Settings - Optimized values
        this.particleCount = 200; // Reduced for better performance
        this.intensity = 0.5;
        this.complexity = 3;
        this.flowSpeed = 0.7;
        this.baseHue = 160;
        this.hueRange = 60;
        this.autoMode = true;
        this.autoModeInterval = null;
        this.fpsLimit = 60;
        this.lastFrameTime = 0;

        // Initialize
        this.setupAudio();
        this.resize();
        this.setupEventListeners();
        this.generateFlowField();
        this.createInitialParticles();
        this.startAutoMode();
        this.animate();
    }

    async setupAudio() {
        try {
            await Tone.start();
            this.audioInitialized = true;

            // Create audio analyzer
            this.analyzer = new Tone.Analyser("waveform", 256);
            
            // Create synth and effects
            this.synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: {
                    type: "sine"
                },
                envelope: {
                    attack: 0.02,
                    decay: 0.3,
                    sustain: 0.2,
                    release: 1
                }
            }).connect(this.analyzer);

            // Create effects chain
            this.reverb = new Tone.Reverb({
                decay: 4,
                wet: 0.5,
                preDelay: 0.25
            }).toDestination();

            this.delay = new Tone.PingPongDelay({
                delayTime: "8n",
                feedback: 0.6,
                wet: 0.3
            }).toDestination();

            this.chorus = new Tone.Chorus({
                frequency: 1.5,
                delayTime: 3.5,
                depth: 0.7,
                wet: 0.5
            }).toDestination();

            // Connect effects
            this.synth.chain(this.chorus, this.reverb, this.delay);
            
            // Set initial volume
            this.synth.volume.value = -20;
        } catch (e) {
            console.log("Audio initialization failed:", e);
        }
    }

    playNote(forcePlay = false) {
        if (!this.audioInitialized) return;
        
        const now = performance.now();
        if (!forcePlay && now - this.lastInteractionTime < 100) return;
        this.lastInteractionTime = now;

        const notes = ["C4", "D4", "E4", "G4", "A4", "C5", "D5", "E5"];
        const intervals = ["4n", "8n", "16n"];
        
        const note = notes[Math.floor(Math.random() * notes.length)];
        const interval = intervals[Math.floor(Math.random() * intervals.length)];
        const velocity = Math.random() * 0.5 + 0.5;
        
        this.synth.triggerAttackRelease(note, interval, undefined, velocity);
    }

    startAutoMode() {
        if (this.autoModeInterval) clearInterval(this.autoModeInterval);
        
        this.autoModeInterval = setInterval(() => {
            if (!this.autoMode || document.hidden) return;
            
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            this.createAttractor(x, y);
            
            if (Math.random() < 0.3 && !document.hidden) {
                this.playNote(true);
            }
        }, 3000); // Reduced frequency
    }

    createAttractor(x, y, strength = 1) {
        const attractor = {
            x,
            y,
            strength,
            life: 0,
            maxLife: 100,
            radius: Math.random() * 100 + 50
        };
        
        this.attractors.push(attractor);
        
        // Remove old attractors if there are too many
        if (this.attractors.length > 3) {
            this.attractors.shift();
        }
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.generateFlowField();
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resize());
        
        this.canvas.addEventListener('mousemove', (e) => {
            this.lastMouse.x = this.mouse.x;
            this.lastMouse.y = this.mouse.y;
            this.mouse.x = e.offsetX;
            this.mouse.y = e.offsetY;
            
            if (this.isMouseDown) {
                this.createParticlesBurst(e.offsetX, e.offsetY, 5);
                if (Math.random() < 0.3) this.playNote();
            }
        });

        this.canvas.addEventListener('mousedown', (e) => {
            this.isMouseDown = true;
            this.createParticlesBurst(e.offsetX, e.offsetY, 20);
            this.createAttractor(e.offsetX, e.offsetY, 2);
            this.playNote();
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                const x = this.canvas.width / 2;
                const y = this.canvas.height / 2;
                this.createParticlesBurst(x, y, 50, true);
                this.createAttractor(x, y, 3);
            }
        });

        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const x = touch.clientX;
            const y = touch.clientY;
            this.createParticlesBurst(x, y, 20);
            this.createAttractor(x, y, 2);
            this.playNote();
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            if (Math.random() < 0.3) {
                this.createParticlesBurst(touch.clientX, touch.clientY, 5);
                this.playNote();
            }
        });

        // UI Controls
        document.getElementById('intensity').addEventListener('input', (e) => {
            this.intensity = e.target.value / 100;
        });

        document.getElementById('complexity').addEventListener('input', (e) => {
            this.complexity = parseFloat(e.target.value);
        });

        document.getElementById('flow').addEventListener('input', (e) => {
            this.flowSpeed = e.target.value / 100;
        });
    }

    createParticlesBurst(x, y, count, isSpaceBurst = false) {
        // Limit burst size based on performance
        const actualCount = Math.min(count, isSpaceBurst ? 50 : 30);
        const hue = this.baseHue + Math.sin(this.time * 0.01) * this.hueRange;
        
        // Create particles in circular formation for space burst
        if (isSpaceBurst) {
            const rings = 5; // Number of expanding rings
            const particlesPerRing = Math.floor(actualCount / rings);
            
            for (let ring = 0; ring < rings; ring++) {
                const ringDelay = ring * 100; // Stagger the rings
                const ringRadius = 20 + ring * 30; // Increasing radius per ring
                const ringSpeed = 2 + ring * 0.5; // Increasing speed per ring
                
                setTimeout(() => {
                    for (let i = 0; i < particlesPerRing; i++) {
                        if (this.particles.length < 500) {
                            const angle = (i / particlesPerRing) * Math.PI * 2;
                            const particle = new QuantumParticle(x, y, this.canvas);
                            
                            // Set initial position slightly offset from center
                            particle.x = x + Math.cos(angle) * 5;
                            particle.y = y + Math.sin(angle) * 5;
                            
                            // Set velocity based on angle and ring
                            particle.vx = Math.cos(angle) * ringSpeed;
                            particle.vy = Math.sin(angle) * ringSpeed;
                            
                            // Customize particle properties for space burst
                            particle.energy = 1;
                            particle.hue = hue + (Math.random() - 0.5) * 20;
                            particle.maxLife *= 1.5; // Longer lifetime
                            particle.size *= 1.2; // Slightly larger
                            
                            // Add some randomness to make it more organic
                            const randomAngle = angle + (Math.random() - 0.5) * 0.2;
                            const randomSpeed = ringSpeed * (0.8 + Math.random() * 0.4);
                            particle.vx += Math.cos(randomAngle) * randomSpeed * 0.3;
                            particle.vy += Math.sin(randomAngle) * randomSpeed * 0.3;
                            
                            this.particles.push(particle);
                        }
                    }
                    
                    // Play a note for each ring
                    if (ring % 2 === 0) {
                        this.playNote(true);
                    }
                }, ringDelay);
            }
        } else {
            // Regular burst behavior for mouse clicks
            for (let i = 0; i < actualCount; i++) {
                if (this.particles.length < 500) {
                    const particle = new QuantumParticle(x, y, this.canvas);
                    particle.vx = (Math.random() - 0.5) * 8;
                    particle.vy = (Math.random() - 0.5) * 8;
                    particle.energy = 1;
                    particle.hue = hue + Math.random() * 20 - 10;
                    this.particles.push(particle);
                }
            }
        }
    }

    createInitialParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            this.particles.push(new QuantumParticle(x, y, this.canvas));
        }
    }

    generateFlowField() {
        const resolution = 20;
        const cols = Math.floor(this.canvas.width / resolution);
        const rows = Math.floor(this.canvas.height / resolution);
        this.flowField = new Array(cols * rows * 2);

        let yoff = 0;
        for (let y = 0; y < rows; y++) {
            let xoff = 0;
            for (let x = 0; x < cols; x++) {
                const index = (y * cols + x) * 2;
                const angle = Math.sin(xoff) * Math.cos(yoff) * Math.PI * 2;
                this.flowField[index] = Math.cos(angle);
                this.flowField[index + 1] = Math.sin(angle);
                xoff += 0.1;
            }
            yoff += 0.1;
        }
    }

    updateFlowField() {
        const resolution = 20;
        const cols = Math.floor(this.canvas.width / resolution);
        const rows = Math.floor(this.canvas.height / resolution);
        
        let yoff = this.time * 0.001;
        for (let y = 0; y < rows; y++) {
            let xoff = this.time * 0.001;
            for (let x = 0; x < cols; x++) {
                const index = (y * cols + x) * 2;
                
                // Create more complex flow patterns
                const angle = Math.sin(xoff * this.flowSpeed) * Math.cos(yoff * this.flowSpeed) * Math.PI * 2
                           + Math.sin(this.time * 0.001) * 0.5;
                
                this.flowField[index] = Math.cos(angle) * this.intensity;
                this.flowField[index + 1] = Math.sin(angle) * this.intensity;
                xoff += 0.1;
            }
            yoff += 0.1;
        }
    }

    getAudioLevel() {
        if (!this.audioInitialized || !this.analyzer) return 0;
        const waveform = this.analyzer.getValue();
        return waveform.reduce((acc, val) => acc + Math.abs(val), 0) / waveform.length;
    }

    draw() {
        const ctx = this.ctx;
        const now = performance.now();
        const deltaTime = now - this.lastFrameTime;

        // Frame limiting for performance
        if (deltaTime < (1000 / this.fpsLimit)) return;
        this.lastFrameTime = now;
        
        // Clear with optimized fade
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Performance monitoring
        this.frameCount++;
        if (now - this.lastFrame >= 1000) {
            const fps = this.frameCount;
            this.frameCount = 0;
            this.lastFrame = now;
            
            // Auto-adjust particle count based on FPS
            if (fps < 30 && this.particleCount > 100) {
                this.particleCount = Math.max(100, this.particleCount - 10);
            } else if (fps > 55 && this.particleCount < 300) {
                this.particleCount = Math.min(300, this.particleCount + 5);
            }
        }

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const audioLevel = this.getAudioLevel();

        // Optimized background effects
        if (!document.hidden) {
            // Primary glow
            const glowSize = Math.min(this.canvas.width, this.canvas.height) * 0.4;
            const glowGradient = ctx.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, glowSize
            );
            
            const glowOpacity = 0.1 + audioLevel * 0.15;
            glowGradient.addColorStop(0, `hsla(${this.baseHue}, 100%, 50%, ${glowOpacity})`);
            glowGradient.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
            
            ctx.fillStyle = glowGradient;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Simplified rays - only draw when audio is playing
            if (audioLevel > 0.01) {
                const rayCount = 8; // Reduced count
                const rayLength = Math.min(this.canvas.width, this.canvas.height) * 0.6;
                
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(this.time * 0.0001);
                
                for (let i = 0; i < rayCount; i++) {
                    const angle = (i / rayCount) * Math.PI * 2;
                    const rayOpacity = 0.03 + audioLevel * 0.05;
                    
                    ctx.beginPath();
                    ctx.strokeStyle = `hsla(${this.baseHue}, 100%, 50%, ${rayOpacity})`;
                    ctx.lineWidth = 1 + audioLevel * 3;
                    ctx.moveTo(0, 0);
                    ctx.lineTo(
                        Math.cos(angle) * rayLength,
                        Math.sin(angle) * rayLength
                    );
                    ctx.stroke();
                }
                ctx.restore();
            }
        }

        // Update and draw attractors with optimized effects
        this.attractors = this.attractors.filter(attractor => {
            attractor.life++;
            const progress = attractor.life / attractor.maxLife;
            const alpha = Math.max(0, 1 - progress);
            
            if (alpha > 0.05) {  // Only draw if visible enough
                const attGradient = ctx.createRadialGradient(
                    attractor.x, attractor.y, 0,
                    attractor.x, attractor.y, attractor.radius
                );
                
                const attOpacity = alpha * 0.2;
                attGradient.addColorStop(0, `hsla(${this.baseHue}, 100%, 50%, ${attOpacity})`);
                attGradient.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
                
                ctx.fillStyle = attGradient;
                ctx.fillRect(
                    attractor.x - attractor.radius,
                    attractor.y - attractor.radius,
                    attractor.radius * 2,
                    attractor.radius * 2
                );
            }
            
            return attractor.life < attractor.maxLife;
        });

        // Update base hue more efficiently
        this.baseHue = (this.baseHue + 0.1) % 360;

        // Batch process particles for better performance
        const activeParticles = [];
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            if (particle.update(this.flowField, audioLevel, this.complexity)) {
                // Simplified attractor influence
                for (let j = 0; j < this.attractors.length; j++) {
                    const attractor = this.attractors[j];
                    const dx = attractor.x - particle.x;
                    const dy = attractor.y - particle.y;
                    const distSq = dx * dx + dy * dy;
                    const radiusSq = attractor.radius * attractor.radius;
                    
                    if (distSq < radiusSq) {
                        const force = (1 - Math.sqrt(distSq) / attractor.radius) * attractor.strength;
                        particle.vx += dx * force * 0.001;
                        particle.vy += dy * force * 0.001;
                    }
                }
                
                particle.draw(ctx);
                activeParticles.push(particle);
            }
        }
        this.particles = activeParticles;

        // Maintain particle count efficiently
        const particlesToAdd = Math.min(
            5, // Add max 5 particles per frame
            this.particleCount - this.particles.length
        );
        
        for (let i = 0; i < particlesToAdd; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const particle = new QuantumParticle(x, y, this.canvas);
            particle.hue = this.baseHue + (Math.random() - 0.5) * 30;
            this.particles.push(particle);
        }
    }

    animate() {
        if (!document.hidden) {
            this.time++;
            this.updateFlowField();
            this.draw();
        }
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when the window loads
window.addEventListener('load', () => {
    new QuantumNexus();
});