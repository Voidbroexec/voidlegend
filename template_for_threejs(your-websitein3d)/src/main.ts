import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import * as TWEEN from '@tweenjs/tween.js';
import './style.css';

// Scene setup
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.001);

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 50;
camera.position.y = 15;

// Renderer setup
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg') as HTMLCanvasElement,
    antialias: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 100;
controls.minDistance = 20;

// Create scenes for each page
const scenes = {
    home: createHomeScene(),
    skills: createSkillsScene(),
    projects: createProjectsScene()
};

let currentScene = 'home';

// Scene creation functions
function createHomeScene() {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.001);

    // Particle system
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 10000;
    const posArray = new Float32Array(particlesCount * 3);
    const scaleArray = new Float32Array(particlesCount);

    for(let i = 0; i < particlesCount * 3; i += 3) {
        const r = 50;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        posArray[i] = r * Math.sin(phi) * Math.cos(theta);
        posArray[i+1] = r * Math.sin(phi) * Math.sin(theta);
        posArray[i+2] = r * Math.cos(phi);
        scaleArray[i/3] = Math.random();
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('scale', new THREE.BufferAttribute(scaleArray, 1));

    const particlesMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            color: { value: new THREE.Color(0x00ffff) }
        },
        vertexShader: `
            attribute float scale;
            uniform float time;
            void main() {
                vec3 pos = position;
                pos.x += sin(time * 0.001 + position.y * 0.05) * 2.0;
                pos.z += cos(time * 0.001 + position.y * 0.05) * 2.0;
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = scale * 2.0 * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            void main() {
                float r = distance(gl_PointCoord, vec2(0.5));
                if (r > 0.5) discard;
                gl_FragColor = vec4(color, 1.0 - (r * 2.0));
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Add lights
    const pointLight1 = new THREE.PointLight(0x00ffff, 2, 100);
    pointLight1.position.set(20, 20, 20);
    const pointLight2 = new THREE.PointLight(0xff00ff, 2, 100);
    pointLight2.position.set(-20, -20, -20);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(pointLight1, pointLight2, ambientLight);

    return { scene, particlesMaterial, pointLight1, pointLight2 };
}

function createSkillsScene() {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.001);

    // Create DNA helix
    const dnaGroup = new THREE.Group();
    const sphereGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const material1 = new THREE.MeshStandardMaterial({ color: 0xff00ff, metalness: 0.8, roughness: 0.2 });
    const material2 = new THREE.MeshStandardMaterial({ color: 0x00ffff, metalness: 0.8, roughness: 0.2 });

    for(let i = 0; i < 50; i++) {
        const sphere1 = new THREE.Mesh(sphereGeometry, material1);
        const sphere2 = new THREE.Mesh(sphereGeometry, material2);
        
        const angle = (i / 2) * Math.PI;
        const y = i * 0.8;
        const radius = 5;
        
        sphere1.position.set(
            Math.cos(angle) * radius,
            y - 20,
            Math.sin(angle) * radius
        );
        
        sphere2.position.set(
            Math.cos(angle + Math.PI) * radius,
            y - 20,
            Math.sin(angle + Math.PI) * radius
        );
        
        dnaGroup.add(sphere1);
        dnaGroup.add(sphere2);
        
        if(i > 0) {
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                sphere1.position,
                sphere2.position
            ]);
            const lineMaterial = new THREE.LineBasicMaterial({ 
                color: 0xffffff,
                transparent: true,
                opacity: 0.3
            });
            const line = new THREE.Line(lineGeometry, lineMaterial);
            dnaGroup.add(line);
        }
    }

    scene.add(dnaGroup);

    // Add lights
    const pointLight = new THREE.PointLight(0xff00ff, 2, 100);
    pointLight.position.set(20, 20, 20);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(pointLight, ambientLight);

    return { scene, dnaGroup };
}

function createProjectsScene() {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.001);

    // Create floating cubes
    const cubes: THREE.Mesh[] = [];
    const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
    const cubeMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x004444
    });

    for(let i = 0; i < 20; i++) {
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(
            (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 40
        );
        cube.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        cubes.push(cube);
        scene.add(cube);
    }

    // Add lights
    const pointLight = new THREE.PointLight(0x00ffff, 2, 100);
    pointLight.position.set(20, 20, 20);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(pointLight, ambientLight);

    return { scene, cubes };
}

// Page transition
const navButtons = document.querySelectorAll('.nav-btn');
navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const page = button.getAttribute('data-page');
        if (page) {
            document.querySelector('.page.active')?.classList.remove('active');
            document.querySelector(`#${page}`)?.classList.add('active');
            document.querySelector('.nav-btn.active')?.classList.remove('active');
            button.classList.add('active');
            currentScene = page;
            
            // Smooth camera transition
            new TWEEN.Tween(camera.position)
                .to({ x: 0, y: 15, z: 50 }, 1000)
                .easing(TWEEN.Easing.Cubic.InOut)
                .start();
        }
    });
});

// Custom cursor
const cursor = document.querySelector('.cursor') as HTMLElement;
document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

document.querySelectorAll('button, a').forEach(elem => {
    elem.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    elem.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
});

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();

    const currentSceneData = scenes[currentScene as keyof typeof scenes];
    
    if (currentScene === 'home') {
        const homeScene = currentSceneData as ReturnType<typeof createHomeScene>;
        homeScene.particlesMaterial.uniforms.time.value += 1;
        homeScene.pointLight1.position.x = Math.sin(Date.now() * 0.001) * 30;
        homeScene.pointLight1.position.z = Math.cos(Date.now() * 0.001) * 30;
        homeScene.pointLight2.position.x = Math.sin(Date.now() * 0.001 + Math.PI) * 30;
        homeScene.pointLight2.position.z = Math.cos(Date.now() * 0.001 + Math.PI) * 30;
    } else if (currentScene === 'skills') {
        const skillsScene = currentSceneData as ReturnType<typeof createSkillsScene>;
        skillsScene.dnaGroup.rotation.y += 0.005;
    } else if (currentScene === 'projects') {
        const projectsScene = currentSceneData as ReturnType<typeof createProjectsScene>;
        projectsScene.cubes.forEach((cube, i) => {
            cube.rotation.x += 0.01 * (i % 2 ? 1 : -1);
            cube.rotation.y += 0.01 * (i % 3 ? 1 : -1);
            cube.position.y += Math.sin(Date.now() * 0.001 + i) * 0.02;
        });
    }

    controls.update();
    renderer.render(currentSceneData.scene, camera);
}

// Initialize skill bars
document.querySelectorAll('.skill-item').forEach(item => {
    const level = item.getAttribute('data-level');
    const fill = item.querySelector('.skill-fill') as HTMLElement;
    if (fill && level) {
        fill.style.width = `${level}%`;
    }
});

animate(); 