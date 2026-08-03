gsap.registerPlugin(ScrollTrigger);

// 1. WEBGL BACKGROUND (Simplex Noise)
const initWebGL = () => {
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const fragmentShader = `
        uniform float uTime;
        uniform float uScrollY;
        uniform vec2 uResolution;

        // Simplex 2D noise
        vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        float snoise(vec2 v){
            const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
            vec2 i  = floor(v + dot(v, C.yy) );
            vec2 x0 = v -   i + dot(i, C.xx);
            vec2 i1;
            i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod(i, 289.0);
            vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
            m = m*m ;
            m = m*m ;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
            vec3 g;
            g.x  = a0.x  * x0.x  + h.x  * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
        }

        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        void main() {
            vec2 uv = gl_FragCoord.xy / uResolution.xy;
            
            // Diagonal slow movement and scale adjustments to make it noticeably moving
            float n = snoise(uv * 3.5 + vec2(uTime * 0.15, uTime * 0.15 + uScrollY * 0.002));
            
            // Subtle animated grain to give it a real "texture" feel
            float grain = random(uv + fract(uTime));
            
            // Base color matching the exact #e5e1d8 lighter background
            vec3 color = vec3(0.90, 0.88, 0.85); 
            
            // Increased contrast for the cloudy noise
            color -= n * 0.07; 
            // Add the grain
            color -= grain * 0.04;
            
            gl_FragColor = vec4(color, 1.0);
        }
    `;

    const material = new THREE.ShaderMaterial({
        fragmentShader,
        uniforms: {
            uTime: { value: 0 },
            uScrollY: { value: 0 },
            uResolution: { value: new THREE.Vector2() }
        }
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const resize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', resize);
    resize();

    let scrollY = 0;
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
    });

    const clock = new THREE.Clock();
    const render = () => {
        material.uniforms.uTime.value = clock.getElapsedTime();
        // Smooth scroll uniform update
        material.uniforms.uScrollY.value += (scrollY - material.uniforms.uScrollY.value) * 0.1;
        
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    };
    render();
};

// 2. HERO DESKTOP ANIMATION
const initHero = () => {
    // Only run on desktop where scene is visible
    if (window.innerWidth < 1024) return;

    const tl = gsap.timeline({ defaults: { ease: "expo.out", duration: 1.5 } });

    // Initial state: hide text, setup images
    gsap.set('.el-text-main h1', { y: '100%' });
    gsap.set('.el-text-main p', { opacity: 0, y: 20 });
    gsap.set('.el-card', { opacity: 0, y: 30 });
    
    tl.to('.el-img-tr, .el-img-center, .el-img-bl, .el-img-mr, .el-img-br', {
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        stagger: 0.15,
        duration: 1.8
    }, 0.2)
    .to('.el-img-tr .img-inner, .el-img-center .img-inner, .el-img-bl .img-inner, .el-img-mr .img-inner, .el-img-br .img-inner', {
        scale: 1,
        stagger: 0.15,
        duration: 1.8
    }, 0.2)
    .to('.el-text-main h1', {
        y: '0%',
        stagger: 0.1,
        duration: 1.2
    }, 0.8)
    .to('.el-text-main p', {
        opacity: 1,
        y: 0,
        duration: 1.2
    }, 1.0)
    .to('.el-card', {
        opacity: 1,
        y: 0,
        duration: 1
    }, 1.2);

    // Parallax mouse move
    const scene = document.getElementById('scene');
    if (scene) {
        scene.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;

            gsap.to('.el-img-center .img-inner', { x: x * -15, y: y * -15, duration: 1, ease: "power2.out" });
            gsap.to('.el-img-tr .img-inner', { x: x * -10, y: y * -10, duration: 1, ease: "power2.out" });
            gsap.to('.el-img-bl .img-inner', { x: x * -25, y: y * -25, duration: 1, ease: "power2.out" });
            gsap.to('.el-img-mr .img-inner', { x: x * -5, y: y * -5, duration: 1, ease: "power2.out" });
            gsap.to('.el-img-br .img-inner', { x: x * -20, y: y * -20, duration: 1, ease: "power2.out" });
            gsap.to('.el-text-main', { x: x * 10, y: y * 10, duration: 1, ease: "power2.out" });
        });
    }
};

// 3. SCROLL REVEALS & PARALLAX
const initScrollReveals = () => {
    // Fade in up for sections
    gsap.utils.toArray('.gs-reveal').forEach(elem => {
        gsap.to(elem, {
            scrollTrigger: {
                trigger: elem,
                start: "top 85%",
                toggleActions: "play none none reverse"
            },
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "expo.out"
        });
    });

    // Image Parallax Effect on Scroll
    gsap.utils.toArray('.group').forEach(container => {
        const img = container.querySelector('img');
        if(img) {
            // Scale image slightly up to allow for parallax movement without showing edges
            gsap.set(img, { scale: 1.15, transformOrigin: "50% 50%" });
            
            gsap.to(img, {
                yPercent: 10,
                ease: "none",
                scrollTrigger: {
                    trigger: container,
                    start: "top bottom", // when the top of the container hits the bottom of the viewport
                    end: "bottom top",   // when the bottom of the container hits the top of the viewport
                    scrub: true          // smooth scrubbing linked to scroll
                }
            });
        }
    });
};

// 4. MOBILE MENU
const initMobileMenu = () => {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    const icon = btn?.querySelector('iconify-icon');
    
    if(!btn || !menu || !icon) return;

    let isOpen = false;

    btn.addEventListener('click', () => {
        isOpen = !isOpen;
        if (isOpen) {
            icon.setAttribute('icon', 'solar:close-circle-linear');
            gsap.to(menu, { opacity: 1, pointerEvents: 'auto', duration: 0.5, ease: "power2.out" });
            gsap.to('.mobile-link', { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "expo.out", delay: 0.2 });
        } else {
            icon.setAttribute('icon', 'solar:hamburger-menu-linear');
            gsap.to('.mobile-link', { y: 20, opacity: 0, duration: 0.3, stagger: 0.05, ease: "power2.in" });
            gsap.to(menu, { opacity: 0, pointerEvents: 'none', duration: 0.5, ease: "power2.in", delay: 0.2 });
        }
    });
};

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    initWebGL();
    initHero();
    initScrollReveals();
    initMobileMenu();
});