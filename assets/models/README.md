# Cosmic Kaksh web models

These GLBs are generated from `portfolio/Cosmic Kaksh/SS + Table.3dm`.

- `cosmic-kaksh.glb`: game table, including its complete pedestal. This loads when a visitor opens the popup.
- `cosmic-kaksh-extended.glb`: extended table with its side tray.
- `cosmic-kaksh-utility.glb`: utility table and its accessories.
- `cosmic-kaksh-wall.glb`: wall-mounted table with laptop platform.
- `cosmic-kaksh-scene.glb`: the complete visible surface geometry, including the four station scenes. This loads only when selected.

The export uses the Rhino file's saved render meshes, resolves block instances, converts centimeters/Z-up to meters/Y-up, and simplifies dense meshes. It converts sRGB material colors into linear glTF factors, uses Rhino PBR metalness and opacity where available, and limits very glossy materials to a roughness of at least 0.3. Rhino render-engine shaders and texture maps are not reproduced. Construction curves are omitted.

All models and the viewer library are served directly by the static website. Each variant loads on selection. No server, account, or external model-hosting service is required. The viewer uses exposure 0.65, soft shadows, and a neutral gray background.

To regenerate, install `rhino3dm`, `numpy`, `trimesh`, and `fast-simplification`, then run:

```sh
python tools/export-cosmic-model.py "portfolio/Cosmic Kaksh/SS + Table.3dm" assets/models/cosmic-kaksh.glb
```

The four furniture bounds in the export script are specific to this source model. They exclude station shells and human-figure layers while retaining table parts and accessories. Adjust them if the source scene is rearranged.

The source Rhino file is kept locally; only the smaller GLBs need to be published.
