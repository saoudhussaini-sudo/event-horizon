export const blackHoleVertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}
`;

export const blackHoleFragmentShader = `
uniform float uTime;
uniform vec2 uResolution;
uniform float uMass;
uniform float uSpin;
uniform float uDiskIntensity;
uniform vec3 uCameraPos;
uniform vec3 uCameraDir;
uniform vec3 uCameraUp;
uniform vec3 uCameraRight;
uniform float uFov;

varying vec2 vUv;

#define MAX_STEPS 100
#define MAX_DIST 50.0
#define SURF_DIST 0.001

// 3D Noise for accretion disk
float hash(float n) { return fract(sin(n) * 1e4); }
float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }
float noise(vec3 x) {
    const vec3 step = vec3(110, 241, 171);
    vec3 i = floor(x);
    vec3 f = fract(x);
    float n = dot(i, step);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix( hash(n + dot(step, vec3(0, 0, 0))), hash(n + dot(step, vec3(1, 0, 0))), u.x),
                   mix( hash(n + dot(step, vec3(0, 1, 0))), hash(n + dot(step, vec3(1, 1, 0))), u.x), u.y),
               mix(mix( hash(n + dot(step, vec3(0, 0, 1))), hash(n + dot(step, vec3(1, 0, 1))), u.x),
                   mix( hash(n + dot(step, vec3(0, 1, 1))), hash(n + dot(step, vec3(1, 1, 1))), u.x), u.y), u.z);
}

float fbm(vec3 p) {
    float f = 0.0;
    float w = 0.5;
    for (int i = 0; i < 5; i++) {
        f += w * noise(p);
        p *= 2.01;
        w *= 0.5;
    }
    return f;
}

// Background starfield
vec3 getStarfield(vec3 rayDir) {
    vec3 color = vec3(0.0);
    float n = noise(rayDir * 200.0);
    if (n > 0.85) {
        color = vec3(pow(n, 10.0)) * 2.0;
    }
    // Add some galaxy dust
    float dust = fbm(rayDir * 5.0);
    color += vec3(0.1, 0.2, 0.4) * dust * 0.3;
    return color;
}

void main() {
    // Screen coordinates
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;

    // Ray direction from camera setup
    vec3 rd = normalize(uCameraDir + uv.x * uCameraRight * uFov + uv.y * uCameraUp * uFov);
    vec3 ro = uCameraPos;

    float rs = 1.0 * uMass; // Schwarzschild radius
    float rs2 = rs * rs;

    vec3 col = vec3(0.0);
    vec3 diskCol = vec3(0.0);
    
    // Raymarching for Gravitational Lensing and Volumetric Disk
    float dt = 0.05;
    float t = 0.0;
    vec3 p = ro;
    
    float totalDensity = 0.0;
    vec3 accumulatedLight = vec3(0.0);
    float transmittance = 1.0;
    
    bool hitBlackHole = false;

    // Step along the ray
    for(int i = 0; i < 150; i++) {
        float r2 = dot(p, p);
        float r = sqrt(r2);
        
        // Inside Event Horizon
        if (r < rs) {
            hitBlackHole = true;
            break;
        }

        // Space curvature - bend the ray
        // Simplified lensing equation: deflection inversely proportional to distance
        if (r < rs * 10.0) {
            vec3 gravityDir = -normalize(p);
            // Deflection strength based on r
            float deflection = (rs2) / (r2 * r);
            rd = normalize(rd + gravityDir * deflection * dt * 5.0);
        }

        // Accretion Disk - Volumetric rendering
        // Disk lies roughly in the XZ plane
        float diskThickness = 0.2 + (r - rs) * 0.1;
        if (abs(p.y) < diskThickness && r > rs * 1.5 && r < rs * 8.0) {
            // Distance from disk center
            float distToCenter = length(p.xz);
            
            // Spin angle
            float angle = atan(p.z, p.x);
            angle += uTime * uSpin * (rs / r); // Differential rotation
            
            vec3 samplingPos = vec3(distToCenter * cos(angle), p.y * 5.0, distToCenter * sin(angle));
            
            float density = fbm(samplingPos * 2.0 - vec3(0.0, uTime * 0.5, 0.0));
            density = smoothstep(0.4, 0.8, density);
            
            // Fade out at edges
            float radialFade = smoothstep(rs * 1.5, rs * 2.5, distToCenter) * smoothstep(rs * 8.0, rs * 6.0, distToCenter);
            float verticalFade = 1.0 - abs(p.y) / diskThickness;
            
            density *= radialFade * verticalFade;
            
            if (density > 0.0) {
                // Doppler effect (blueshift when moving towards, redshift when away)
                // Approximated by dot product of view dir and flow dir
                vec3 flowDir = normalize(vec3(-p.z, 0.0, p.x)); // Circular flow
                float doppler = 1.0 + 0.8 * dot(rd, flowDir) * uSpin;
                
                // Color gradient based on radius
                vec3 baseColor = mix(vec3(1.0, 0.3, 0.05), vec3(1.0, 0.8, 0.4), density);
                if (distToCenter < rs * 2.5) {
                    baseColor = mix(vec3(0.2, 0.6, 1.0), baseColor, (distToCenter - rs * 1.5) / rs);
                }
                
                vec3 emission = baseColor * density * doppler * uDiskIntensity * 5.0;
                
                // Add to accumulated light
                accumulatedLight += emission * transmittance * dt;
                transmittance *= (1.0 - density * dt * 2.0); // Absorption
            }
        }
        
        // Optimization: if fully absorbed, stop
        if (transmittance < 0.01) break;

        // Move forward
        // Increase step size further away for performance
        dt = 0.02 + r * 0.01;
        p += rd * dt;
        t += dt;
        
        if (t > MAX_DIST) break;
    }

    if (!hitBlackHole) {
        // Sample background skybox with final bent ray direction
        vec3 sky = getStarfield(rd);
        col = sky * transmittance + accumulatedLight;
        
        // Add photon ring glow around the black hole
        float finalR = length(p); // distance to origin at the end of tracing
        // This is a rough approximation, we can do it via distance to center
    } else {
        col = accumulatedLight; // Only the disk light in front of it
    }

    // Tone mapping and gamma
    col = col / (1.0 + col);
    col = pow(col, vec3(1.0 / 2.2));

    gl_FragColor = vec4(col, 1.0);
}
`;
