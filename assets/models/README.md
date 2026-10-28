# Cosmic Kaksh web models

These GLBs are generated from `portfolio/Cosmic Kaksh/SS + Table.3dm`.

- `cosmic-kaksh.glb`: a close view of the first complete furniture configuration, including its pedestal. This is loaded when a visitor opens the popup.
- `cosmic-kaksh-scene.glb`: the complete visible surface geometry, including the four station scenes. This loads only when selected.

The export uses the Rhino file's saved render meshes, resolves block instances, converts centimeters/Z-up to meters/Y-up, and simplifies dense meshes. Rhino diffuse colors and transparency are mapped to glTF materials; Rhino render-engine shaders and texture maps are not reproduced. Construction curves are omitted.

Both files and the viewer library are served directly by the static website. No server, account, or external model-hosting service is required.

To regenerate, install `rhino3dm`, `numpy`, `trimesh`, and `fast-simplification`, then run:

```sh
python tools/export-cosmic-model.py "portfolio/Cosmic Kaksh/SS + Table.3dm" assets/models/cosmic-kaksh.glb
```

The furniture crop in the export script is specific to the first configuration's coordinates in this source model. Adjust it if the source scene is rearranged.

The source Rhino file is kept locally; only the smaller GLBs need to be published.
