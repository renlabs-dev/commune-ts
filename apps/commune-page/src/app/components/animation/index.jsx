/* eslint-disable import/no-unresolved */
"use client";

import React, { useEffect, useRef } from "react";
import * as dat from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import pointsVertexShader from "!!raw-loader!./shaders/points/vertex.glsl";
import linesFragmentShader from "!!raw-loader!./shaders/lines/fragment.glsl";
import pointsFragmentShader from "!!raw-loader!./shaders/points/fragment.glsl";

const getRandNum = (min, max) => {
  return Math.random() * (max - min) + min;
};

function createAnimation({ container, debug }) {
  const canvas = document.createElement("canvas");
  canvas.classList.add("webgl");
  container.appendChild(canvas);

  const sizes = {
    width: window.screen.availWidth,
    height: 600,
  };
  const clock = new THREE.Clock();

  const debugObject = {
    tubeRadius: 4,
    torusRadius: 4.5,
    radialSegments: 27,
    tabularSegments: 56,
  };

  let scene, camera, renderer, controls, objectsGroup;

  function init() {
    createScene();
    createCamera();
    // playIntroAnimation();
    createRenderer();
    createControls();
    createObjects();

    if (debug) {
      addDebugUI();
    }

    tick();
  }
  function createObjects() {
    const points = createPoints();
    const lines = createLines(points.geometry);

    objectsGroup = new THREE.Group();
    objectsGroup.add(points);
    objectsGroup.add(lines);
    objectsGroup.rotation.x = -Math.PI * 0.35;
    objectsGroup.position.y = 1.3;
    scene.add(objectsGroup);
  }

  function createLines(pointsGeomtry) {
    // Access pointsGeomtry attributes
    const positions = pointsGeomtry.attributes.position.array;
    const colors = pointsGeomtry.attributes.color.array;
    const normals = pointsGeomtry.attributes.normal.array;

    const linePositions = [];
    const lineColors = [];
    const lineNormals = [];
    const lineOpacity = [];

    const addLine = (vertexIndex1, vertexIndex2) => {
      const baseIndex1 = vertexIndex1 * 3;
      const baseIndex2 = vertexIndex2 * 3;

      if (!positions[baseIndex1]) return;
      if (!positions[baseIndex2]) return;

      linePositions.push(
        positions[baseIndex1],
        positions[baseIndex1 + 1],
        positions[baseIndex1 + 2],
        positions[baseIndex2],
        positions[baseIndex2 + 1],
        positions[baseIndex2 + 2]
      );

      lineColors.push(
        colors[baseIndex1],
        colors[baseIndex1 + 1],
        colors[baseIndex1 + 2],
        colors[baseIndex2],
        colors[baseIndex2 + 1],
        colors[baseIndex2 + 2]
      );
      lineNormals.push(
        normals[baseIndex1],
        normals[baseIndex1 + 1],
        normals[baseIndex1 + 2],
        normals[baseIndex2],
        normals[baseIndex2 + 1],
        normals[baseIndex2 + 2]
      );

      const [oMin, oMax] = [0.01, 0.15];

      lineOpacity.push(getRandNum(oMin, oMax), getRandNum(oMin, oMax));
    };

    // Randomly connect each vertex with up to 2 random neighbors that follow it in the array
    const numVertices = positions.length / 3;
    for (let i = 0; i < numVertices; i++) {
      const numConnections = Math.floor(Math.random() * 3); // Random number of connections (0, 1, or 2)
      const possibleConnections = [];

      // Find possible connections
      for (let j = i + 1; j < numVertices / 2; j++) {
        possibleConnections.push(j);
      }

      // Shuffle possible connections to randomize which vertices are selected
      for (let k = possibleConnections.length - 1; k > 0; k--) {
        const index = Math.floor(Math.random() * (k + 1));
        [possibleConnections[k], possibleConnections[index]] = [
          possibleConnections[index],
          possibleConnections[k],
        ];
      }

      // Add line positions for the selected number of connections
      for (
        let m = 0;
        m < numConnections && m < possibleConnections.length;
        m++
      ) {
        addLine(i, possibleConnections[m]);
      }
    }

    const lineGeometry = new THREE.BufferGeometry();

    lineGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(linePositions), 3)
    );

    lineGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(new Float32Array(lineColors), 3)
    );

    lineGeometry.setAttribute(
      "normal",
      new THREE.BufferAttribute(new Float32Array(lineNormals), 3)
    );

    lineGeometry.setAttribute(
      "aOpacity",
      new THREE.BufferAttribute(new Float32Array(lineOpacity), 1)
    );

    const { torusRadius, tubeRadius } = debugObject;

    const lineMaterial = new THREE.ShaderMaterial({
      vertexShader: pointsVertexShader,
      fragmentShader: linesFragmentShader,
      wireframe: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      uniforms: {
        uColorOpacity: { value: 0 },
        uTime: { value: 0 },
        uWeight: { value: 0 },
        uTorusRadius: { value: torusRadius },
        uTubeRadius: { value: tubeRadius },
      },
    });

    const lines = new THREE.Line(lineGeometry, lineMaterial);
    return lines;
  }

  function createPoints() {
    const { torusRadius, tubeRadius, radialSegments, tabularSegments } =
      debugObject;

    const torusGeometry = new THREE.TorusGeometry(
      torusRadius,
      tubeRadius,
      radialSegments,
      tabularSegments
    );

    torusGeometry.computeVertexNormals();

    // Copy the positions from the TorusGeometry
    const positions = torusGeometry.attributes.position.array;
    const normals = torusGeometry.attributes.normal.array;
    const maxPosition = Math.max(...positions);

    const customGeometry = new THREE.BufferGeometry();

    const colors = [];
    const scales = [];

    for (let i = 0; i < positions.length; i += 3) {
      const r = positions[i] / maxPosition + 0.3;
      const g = positions[i] / maxPosition + 3;
      const b = positions[i] / maxPosition + 0.3;

      colors.push(r, g * 2, b);
      scales.push(getRandNum(0.5, 3));
    }
    customGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(positions), 3)
    );

    customGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(new Float32Array(colors), 3)
    );

    customGeometry.setAttribute(
      "normal",
      new THREE.BufferAttribute(new Float32Array(normals), 3)
    );
    customGeometry.setAttribute(
      "aScale",
      new THREE.BufferAttribute(new Float32Array(scales), 1)
    );
    const torusMaterial = new THREE.ShaderMaterial({
      vertexShader: pointsVertexShader,
      fragmentShader: pointsFragmentShader,
      wireframe: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,

      uniforms: {
        uColorOpacity: { value: 1.0 },
        uTime: { value: 0 },
        uWeight: { value: 0 },
        uTorusRadius: { value: torusRadius },
        uTubeRadius: { value: tubeRadius },
      },
    });
    const points = new THREE.Points(customGeometry, torusMaterial);
    return points;
  }

  function addDebugUI() {
    const gui = new dat.GUI({ width: 340 });
    // eslint-disable-next-line array-callback-return
    Object.keys(debugObject).map((fieldName) => {
      gui
        .add(debugObject, fieldName)
        .name(fieldName)
        .onChange(() => {
          scene.clear();
          createObjects();
        });
    });

    gui.add(camera.position, "z").name("camera z position").min(10).max(30);
  }

  function createScene() {
    scene = new THREE.Scene();
  }

  const fov = window.innerWidth <= 768 ? 74 : 47;

  function createCamera() {
    camera = new THREE.PerspectiveCamera(
      fov,
      sizes.width / sizes.height,
      0.1,
      200
    );
    camera.position.set(0, 0.5, 20); // Set initial position (zoomed out)
    camera.rotation.x = -Math.PI / 4; // Set initial rotation (tilted)
    scene.add(camera);
  }

  function createRenderer() {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  function createControls() {
    controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.enableZoom = false;
  }

  // function playIntroAnimation() {
  //   const targetPosition = new THREE.Vector3(0, 0.5, 20); // Target position after the animation
  //   const targetRotation = new THREE.Euler(0, 0, 0); // Target rotation after the animation
  //   const duration = 12; // Duration of the animation in seconds

  //   const startTime = performance.now();

  //   function animate() {
  //     const currentTime = performance.now();
  //     const elapsedTime = (currentTime - startTime) / 4000;

  //     if (elapsedTime <= duration) {
  //       const t = elapsedTime / duration;

  //       // Interpolate position
  //       camera.position.lerpVectors(camera.position, targetPosition, t);

  //       // Interpolate rotation
  //       camera.rotation.x = THREE.MathUtils.lerp(
  //         camera.rotation.x,
  //         targetRotation.x,
  //         t
  //       );
  //       camera.rotation.y = THREE.MathUtils.lerp(0, Math.PI * 2, t); // Spin around the y-axis

  //       requestAnimationFrame(animate);
  //     } else {
  //       // Animation finished, set the final position and rotation
  //       camera.position.copy(targetPosition);
  //       camera.rotation.copy(targetRotation);
  //     }
  //   }

  //   animate();
  // }

  function tick() {
    const elapsedTime = clock.getElapsedTime() * 0.25;

    objectsGroup.children.forEach((child) => {
      const material = child.material;

      material.uniforms.uTime.value = elapsedTime;
      material.uniforms.uWeight.value = 0.05 * Math.sin(elapsedTime) + 1.2;
    });

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(() => tick());
  }

  init();
}

export default function Animation() {
  const graphRef = useRef(null);

  useEffect(() => {
    if (graphRef.current) {
      createAnimation({ container: graphRef.current, debug: false });
    }
  }, []);

  return <div id="graph" ref={graphRef} />;
}
