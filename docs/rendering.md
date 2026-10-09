# Rendering Architecture

## Stack

| Layer | Technology |
|-------|------------|
| Framework | React Three Fiber (R3F) |
| Primitives | @react-three/drei |
| Physics | @react-three/rapier |
| Character | ecctrl |
| Post-processing | @react-three/postprocessing (optional bloom) |

## Scene Graph

```
<Canvas>                          ← dynamic import, ssr: false
  <Suspense fallback={<Loader />}>
    <CampusWorld>
      <LightingRig />             ← shared
      <CampusModel />             ← single GLB instance
      <CollisionMesh />           ← Rapier trimesh (game mode)
      
      {mode === 'explore' && (
        <ExploreLayer>
          <CinematicCamera />
          <HotspotManager />
          <HighlightManager />
        </ExploreLayer>
      )}
      
      {mode === 'game' && (
        <GameLayer>
          <Physics world>
            <EcctrlPlayer />
            <FollowCamera />
          </Physics>
          <RouteVisualizer />
        </GameLayer>
      )}
    </CampusWorld>
  </Suspense>
</Canvas>
```

## Asset Loading

### Campus GLB

```typescript
const CAMPUS_MODEL_URL = "/models/campus.glb";

// Preload on app init
useGLTF.preload(CAMPUS_MODEL_URL);

// Draco decoder
<GLTFLoader setDRACOLoader={dracoLoader} />
```

**Optimization targets:**
- Draco compression (level 6)
- Texture max 2048px
- Mesh merge by material in Blender
- File size target: < 5MB

### Character GLB

```typescript
const CHARACTER_MODEL_URL = "/models/character.glb";
```

Export from Blender/Invector FBX → optimized GLB with animation clips:
- `idle`, `walk`, `run`, `jump`

## Lighting

### Explore Mode — Cinematic

```typescript
<Environment preset="city" />
<directionalLight position={[50, 80, 30]} intensity={1.2} castShadow />
<ambientLight intensity={0.4} />
<ContactShadows opacity={0.5} blur={2} />
```

### Game Mode — Functional

Slightly brighter ambient for navigation readability. Shadows enabled for depth perception.

## Camera Systems

### Cinematic Camera (Explore)

- **Spline-based** transitions between hotspots
- GSAP or `@react-spring/three` for smooth interpolation
- Scroll-triggered waypoint progression
- Click-to-focus on search results

```typescript
interface CameraCommand {
  type: 'focus' | 'orbit' | 'path' | 'reset';
  target?: Vector3;
  lookAt?: Vector3;
  duration?: number;
  easing?: string;
}
```

### Follow Camera (Game)

ecctrl built-in camera with:
- Shoulder offset
- Collision avoidance (camera raycast)
- Smooth damping

## Highlighting System

Room/faculty/department search highlights:

```typescript
// Traverse campus scene, match mesh.name
scene.traverse((child) => {
  if (child.isMesh && highlightSet.has(child.name)) {
    child.material = highlightMaterial; // emissive pulse
  }
});
```

Emissive color from department `color` field.

## Hotspots (Explore Mode)

Invisible click targets at room entrances:

```typescript
<mesh
  name={`hotspot_${roomNumber}`}
  onClick={() => openInfoCard(room)}
  visible={false} // raycast only
>
  <boxGeometry args={[2, 3, 2]} />
</mesh>
```

## Physics (Game Mode)

### Colliders

- Campus mesh → `RapierCollider` trimesh (simplified collision mesh recommended)
- Stairs → ramp colliders or stepped boxes
- Invisible boundary walls

### Player Controller

```typescript
<Ecctrl
  capsuleHalfHeight={0.35}
  capsuleRadius={0.3}
  maxVelLimit={mode === 'sprint' ? 7 : 4}
  jumpVel={4}
  slopeMaxAngle={45}
  autoBalance={true}
/>
```

## Performance Budget

| Metric | Target |
|--------|--------|
| Draw calls | < 200 |
| Triangles | < 500K |
| Frame rate | 60fps desktop, 30fps mobile |
| Initial 3D bundle | < 300KB gzipped (excl. GLB) |
| GLB load | < 3s on 4G |

## Optimization Techniques

1. **Code splitting** — `dynamic(() => import('./CampusCanvas'), { ssr: false })`
2. **LOD** — future: separate LOD GLBs per distance
3. **Frustum culling** — Three.js default
4. **Instancing** — repeated furniture elements
5. **Texture compression** — KTX2/Basis (future)
6. **DPR clamping** — `dpr={[1, 1.5]}` on mobile
7. **Demand frameloop** — explore mode when idle: `frameloop="demand"`

## Responsive Design

```typescript
const isMobile = useMediaQuery('(max-width: 768px)');

<Canvas
  dpr={isMobile ? 1 : [1, 2]}
  shadows={!isMobile}
  gl={{ antialias: !isMobile, powerPreference: 'high-performance' }}
/>
```

Mobile game mode: virtual joystick overlay (future).

## Error Boundaries

```typescript
<ErrorBoundary fallback={<SceneErrorFallback />}>
  <CampusCanvas />
</ErrorBoundary>
```

WebGL unsupported → graceful 2D fallback with search-only mode.

## Blender Export Checklist

- [ ] Apply all transforms
- [ ] Origin at campus center
- [ ] Room meshes named `room_XXX`
- [ ] Collision mesh separate (optional `campus_collision.glb`)
- [ ] Draco export enabled
- [ ] No duplicate geometry
- [ ] Scale: 1 unit = 1 meter
