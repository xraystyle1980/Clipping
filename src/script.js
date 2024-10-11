import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';



/**
 * Base
 */

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()



/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const doorNormalTexture = textureLoader.load('./textures/modal/normal.png')
const matcapTexture = textureLoader.load('./textures/matcaps/8.png')
const gradientTexture = textureLoader.load('./textures/gradients/5.jpg')
const modalTexture = textureLoader.load('./textures/modal/modal-outline.png')
const modalMetalnessTexture = textureLoader.load('./textures/modal/metalness.png')
const modalRoughnessTexture = textureLoader.load('./textures/modal/roughness.png')
const modalHeightTexture = textureLoader.load('./textures/modal/height.png')
const particleTexture = textureLoader.load('./textures/modal/dust-gray.png');

// Color Space
modalTexture.colorSpace = THREE.SRGBColorSpace
matcapTexture.colorSpace = THREE.SRGBColorSpace



/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff)
ambientLight.intensity = 2.35
scene.add(ambientLight)

// Create a PointLight with all properties explicitly written
const pointLight = new THREE.PointLight();
pointLight.color = new THREE.Color(0xFDDCE9); // Set the color to white (hex value: 0xffffff)
pointLight.intensity = 19; // Set the light intensity to 9
pointLight.distance = 0; // Set the distance to 0 (infinite reach)
pointLight.decay = 0.125; // Set the rate at which the light intensity decays

// Set the position of the point light
pointLight.position.set(1.65, 0, -1); // Set x, y, z positions

// Add the light to the scene
scene.add(pointLight);



/**
 * Environment map
 */
const rgbeLoader = new RGBELoader()
rgbeLoader.load('./textures/environmentMap/HDR_space_nebula_edit.hdr', (environmentMap) =>
{
    environmentMap.mapping = THREE.EquirectangularReflectionMapping
    scene.background = environmentMap
    scene.environment = environmentMap

})



/**
 * Materials
 */

// MeshStandardMaterial with texture (applied to one face)
const texturedMaterial = new THREE.MeshStandardMaterial({
    map: modalTexture,
    metalness: 1,
    roughness: 0,
    metalnessMap: modalMetalnessTexture,
    roughnessMap: modalRoughnessTexture,
    transparent: false,
});

// Create a basic material for the other faces
const basicMaterial = new THREE.MeshStandardMaterial({
    color: 0x666565, // You can set any color you want for the other faces
    metalness: 1,
    roughness: 0,
});

// Create an array of materials, where only one face uses the texture
const materials = [
    basicMaterial,  // Right face
    basicMaterial,  // Left face
    basicMaterial,  // Top face
    basicMaterial,  // Bottom face
    texturedMaterial, // Front face (with texture)
    texturedMaterial,  // Back face
];

// Create the RoundedBoxGeometry
const roundedBoxGeometry = new RoundedBoxGeometry(1.44, 1, 0.05, 22, 22); // width, height, depth, segments, radius

// Use the same material
const roundedModal = new THREE.Mesh(roundedBoxGeometry, materials);
scene.add(roundedModal);



/**
 * Particles
 */
const particleCount = 3000;

// Create a BufferGeometry to hold the particle positions
const particlesGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3); // Each particle has x, y, z

// Randomly assign initial positions to each particle
for (let i = 0; i < particleCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 20; // x coordinate
  positions[i * 3 + 1] = (Math.random() - 0.5) * 20; // y coordinate
  positions[i * 3 + 2] = (Math.random() - 0.5) * 20; // z coordinate
}

// Add positions to the geometry
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// Create the Points Material
const particlesMaterial = new THREE.PointsMaterial({
  map: particleTexture,
  color: 0xffffff, // Color of the particles
  size: 0.0565, // Size of each particle
  transparent: true,
  opacity: 0.35,
});

// Create the Points object
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// Animate the particles to move them
const animateParticles = () => {
  requestAnimationFrame(animateParticles);

  // Get reference to particle positions array
  const positionsArray = particlesGeometry.attributes.position.array;

  // Update positions to make the particles move more horizontally (right to left)
  for (let i = 0; i < particleCount; i++) {
    const index = i * 3;

    // Move particles along the Z-axis
    positionsArray[index + 2] -= 0.1;

    // Move particles along the X-axis to simulate right-to-left motion
    positionsArray[index] += 0.005; // Positive X direction (or use -0.005 for left)

    // Reduce movement along the Y-axis to minimize up and down motion
    positionsArray[index + 1] += (Math.random() - 0.5) * 0.02; // Small random variation

    // Reset position when particles move too far
    if (positionsArray[index + 2] < -10) {
      positionsArray[index + 2] = 10; // Reset the particle to the starting position

      // Optionally reset X and Y to keep the spread controlled
      positionsArray[index] = (Math.random() - 0.5) * 20; // Randomize X position again
      positionsArray[index + 1] = (Math.random() - 0.5) * 20; // Randomize Y position again
    }
  }

  // Mark position attribute as needing update
  particlesGeometry.attributes.position.needsUpdate = true;

};
animateParticles();



/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})



/**
 * Camera
 */

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.x = -1.15
camera.position.y = -1.35
camera.position.z = 2.5
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)

// Enable damping for smoother movement
controls.enableDamping = true;
controls.dampingFactor = 0.05; // Adjust for smoothness of motion

// Adjust movement speed parameters
controls.rotateSpeed = 0.5; // Slower, smoother rotation
controls.zoomSpeed = 0.8; // Moderate zoom speed
controls.panSpeed = 0.4; // Slower panning for more control
controls.autoRotate = true
controls.autoRotateSpeed = 0.135

// Set the maximum distance the camera can zoom out
controls.maxDistance = 8; // Replace 50 with your desired value

// Set the minimum distance to prevent zooming in too much (optional)
controls.minDistance = 3; // Replace 5 with your desired value



/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))



/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update objects
    // roundedModal.rotation.y = 0.1 * elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}
tick()