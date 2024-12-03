// @ts-nocheck
import { useRef } from "react";
import { Bounds, Edges } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Depth, Fresnel, LayerMaterial } from "lamina";

export const CubeObject = () => (
  <Canvas
    orthographic
    dpr={[2, 4]}
    camera={{ position: [0, 0, 20], zoom: 400 }}
  >
    <group rotation={[Math.PI / 5, -Math.PI / 5, Math.PI / 2]}>
      <Bounds clip observe margin={1.6}>
        <Cube scale={[1, 1, 1]} opacity={0.5} position={[0.25, 0, 0]} />
      </Bounds>
      <gridHelper
        args={[10, 40, "#191919", "#191919"]}
        position={[-0.25, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      />
    </group>
  </Canvas>
);

function Cube(props) {
  const ref = useRef();

  // Animate gradient
  useFrame((state) => {
    const sin = Math.sin(state.clock.elapsedTime / 2);
    const cos = Math.cos(state.clock.elapsedTime / 2);
    ref.current.layers[0].origin.set(cos / 2, 0, 0);
    ref.current.layers[1].origin.set(cos, sin, cos);
    ref.current.layers[2].origin.set(sin, cos, sin);
    ref.current.layers[3].origin.set(cos, sin, cos);
  });

  return (
    <mesh {...props}>
      <boxGeometry args={[1, 1, 1]} />
      <LayerMaterial ref={ref} toneMapped={false}>
        <Depth
          colorA="#ff0080"
          colorB="black"
          alpha={1}
          mode="normal"
          near={0.5}
          far={0.5}
          origin={[0, 0, 0]}
        />
        <Depth
          colorA="green"
          colorB="#f7b955"
          alpha={1}
          mode="add"
          near={2}
          far={2}
          origin={[0, 1, 1]}
        />
        <Depth
          colorA="green"
          colorB="#f7b955"
          alpha={1}
          mode="add"
          near={3}
          far={3}
          origin={[0, 1, -1]}
        />
        <Depth
          colorA="white"
          colorB="red"
          alpha={1}
          mode="overlay"
          near={1.5}
          far={1.5}
          origin={[1, -1, -1]}
        />
        <Fresnel
          mode="add"
          color="white"
          intensity={0.4}
          power={1.5}
          bias={0.05}
        />
      </LayerMaterial>
      <Edges color="black" />
    </mesh>
  );
}
