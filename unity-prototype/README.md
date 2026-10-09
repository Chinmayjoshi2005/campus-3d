# Unity Prototype — Reference Only

> **This is NOT the deployment target.** The Unity prototype validated gameplay concepts and is preserved as reference.

## Location

The Unity project lives at:

```
~/Documents/Unity project/Campus Guide
```

## Validated Concepts

The Unity prototype confirmed:

- Third-person movement (Invector controller)
- Camera follow systems
- Collision handling
- Stairs traversal
- Character navigation
- Campus scale and proportions

## Assets in Unity

| Asset | Path |
|-------|------|
| Campus model | `Assets/Models/clg_model_v1.glb` |
| Character | `Assets/Invector-3rdPersonController_LITE/3D Models/Characters/` |
| WebGL build | `~/Desktop/CampusGuideWebBuild/` |

## Migration to Web

Unity concepts map to the web stack as follows:

| Unity | Campus Guide 3D |
|-------|-----------------|
| Invector controller | ecctrl + Rapier |
| Unity camera follow | ecctrl built-in camera |
| Unity colliders | @react-three/rapier trimesh |
| Unity scene | Single R3F `<CampusWorld />` |
| Scene reload for mode switch | Zustand mode toggle (no reload) |

## Rules

- Do NOT deploy the Unity build as the production app
- Do NOT maintain a separate campus model in Unity
- Use Unity only for prototyping new gameplay mechanics
- All campus geometry changes go through Blender → GLB pipeline

## WebGL Build

The existing WebGL build at `CampusGuideWebBuild/` is a legacy artifact. It may be referenced for camera positions and spawn points but is not maintained.
