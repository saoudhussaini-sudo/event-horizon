import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { blackHoleVertexShader, blackHoleFragmentShader } from '../shaders/blackHole';

export default function BlackHole({ mass = 1.0, spin = 1.0, diskIntensity = 1.0 }) {
    const materialRef = useRef();
    const { size, camera } = useThree();

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uResolution: { value: new THREE.Vector2(size.width, size.height) },
            uMass: { value: mass },
            uSpin: { value: spin },
            uDiskIntensity: { value: diskIntensity },
            uCameraPos: { value: new THREE.Vector3() },
            uCameraDir: { value: new THREE.Vector3() },
            uCameraUp: { value: new THREE.Vector3() },
            uCameraRight: { value: new THREE.Vector3() },
            uFov: { value: 0 },
        }),
        []
    );

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = t;
            
            // Adjust resolution for device pixel ratio
            const pixelRatio = state.gl.getPixelRatio();
            materialRef.current.uniforms.uResolution.value.set(
                size.width * pixelRatio, 
                size.height * pixelRatio
            );
            
            // Smoothly interpolate parameters
            materialRef.current.uniforms.uMass.value = THREE.MathUtils.lerp(materialRef.current.uniforms.uMass.value, mass, 0.05);
            materialRef.current.uniforms.uSpin.value = THREE.MathUtils.lerp(materialRef.current.uniforms.uSpin.value, spin, 0.05);
            materialRef.current.uniforms.uDiskIntensity.value = THREE.MathUtils.lerp(materialRef.current.uniforms.uDiskIntensity.value, diskIntensity, 0.05);

            // Update camera uniforms for raymarching
            camera.getWorldPosition(materialRef.current.uniforms.uCameraPos.value);
            camera.getWorldDirection(materialRef.current.uniforms.uCameraDir.value);
            
            const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion).normalize();
            const right = new THREE.Vector3().crossVectors(materialRef.current.uniforms.uCameraDir.value, up).normalize();
            
            materialRef.current.uniforms.uCameraUp.value.copy(up);
            materialRef.current.uniforms.uCameraRight.value.copy(right);
            
            // Fov calculation based on canvas height (vertical fov)
            const fov = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2.0);
            materialRef.current.uniforms.uFov.value = fov * (size.width / size.height); // Adjust for aspect ratio
        }
    });

    return (
        <mesh>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={blackHoleVertexShader}
                fragmentShader={blackHoleFragmentShader}
                uniforms={uniforms}
                depthWrite={false}
                depthTest={false}
            />
        </mesh>
    );
}
