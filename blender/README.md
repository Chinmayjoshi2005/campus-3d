# Blender — Source of Truth

The campus 3D model originates exclusively from Blender. All campus geometry updates must be made here first.

## Workflow

```
campus.blend  →  Export GLB (Draco)  →  web-platform/public/models/campus.glb
```

## Export Settings

1. **Format:** glTF Binary (.glb)
2. **Compression:** Draco mesh compression (level 6)
3. **Transform:** Apply all transforms before export
4. **Scale:** 1 Blender unit = 1 meter
5. **Origin:** Campus center at world origin

## Mesh Naming Convention

Room meshes must follow the pattern:

```
room_001, room_002, ... room_045
room_111, room_112, room_121, room_122
room_1002, room_1003
```

These names map directly to `data/rooms.json` via the `meshName` field.

## Character Model

Export character separately:

```
character.blend  →  character.glb  →  web-platform/public/models/character.glb
```

Include animation clips: `idle`, `walk`, `run`, `jump`

## Collision Mesh (Optional)

For game mode physics, export a simplified collision mesh:

```
campus_collision.glb  →  web-platform/public/models/campus_collision.glb
```

## Do NOT

- Create duplicate campus models in Unity or elsewhere
- Modify the GLB directly — always re-export from Blender
- Change mesh names without updating `data/rooms.json` and admin records

## Current Model

The existing campus model is sourced from Smartracker (`finalmodel.glb`, 893KB) and placed at:

`web-platform/public/models/campus.glb`

Replace with your latest Blender export when ready.
