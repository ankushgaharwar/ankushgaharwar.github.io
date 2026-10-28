"""Export visible Rhino render meshes as a compact, Y-up GLB.

Requires rhino3dm, numpy, trimesh, fast-simplification.
Usage: python convert_model.py source.3dm destination.glb
"""
import sys, pathlib, collections
import rhino3dm as r
import numpy as np
import trimesh

doc = r.File3dm.Read(sys.argv[1])
objects = {str(o.Attributes.Id): o for o in doc.Objects}
definitions = {str(d.Id): d for d in doc.InstanceDefinitions}
groups = collections.defaultdict(list)
stats = collections.Counter()
# Source-space bounds isolate each complete table and its accessories from
# the station walls. Layer 17–53 contains the surrounding human figures.
variants = [
    ('cosmic-kaksh.glb', [-2900,-105,0], [-2740,105,235]),
    ('cosmic-kaksh-extended.glb', [-1460,-105,0], [-1210,105,270]),
    ('cosmic-kaksh-utility.glb', [-2180,-105,0], [-2000,105,275]),
    ('cosmic-kaksh-wall.glb', [-990,-105,125], [-710,105,280]),
]

def visit(obj, transform=np.eye(4), parent_material=-1):
    a, g = obj.Attributes, obj.Geometry
    layer = doc.Layers.FindIndex(a.LayerIndex)
    if not a.Visible or not layer.Visible:
        return
    mi = a.MaterialIndex
    if a.MaterialSource == r.ObjectMaterialSource.MaterialFromLayer:
        mi = layer.RenderMaterialIndex
    elif a.MaterialSource == r.ObjectMaterialSource.MaterialFromParent:
        mi = parent_material
    if isinstance(g, r.InstanceReference):
        t = np.array([[getattr(g.Xform, f'M{i}{j}') for j in range(4)] for i in range(4)])
        for oid in definitions[str(g.ParentIdefId)].GetObjectIds():
            visit(objects[str(oid)], transform @ t, mi)
        return
    if isinstance(g, r.Mesh): meshes = [g]
    elif isinstance(g, r.Brep): meshes = [f.GetMesh(r.MeshType.Render) for f in g.Faces]
    elif isinstance(g, r.Extrusion): meshes = [g.GetMesh(r.MeshType.Render)]
    else:
        stats['non_surface_objects'] += 1
        return
    parts=[]
    for mesh in meshes:
        if mesh is None:
            raise RuntimeError(f'Missing render mesh for {a.Id}')
        vertices=np.array([(p.X,p.Y,p.Z) for p in mesh.Vertices],dtype=np.float64)
        if not len(vertices): continue
        quads=np.array(list(mesh.Faces),dtype=np.int64)
        faces=np.concatenate((quads[:,:3],quads[quads[:,2]!=quads[:,3]][:,[0,2,3]]))
        parts.append(trimesh.Trimesh(vertices=vertices,faces=faces,process=False))
    if not parts: return
    mesh=trimesh.util.concatenate(parts)
    stats['source_triangles']+=len(mesh.faces)
    if len(mesh.faces)>2500:
        mesh=mesh.simplify_quadric_decimation(face_count=max(1000,int(len(mesh.faces)*0.035)))
    mesh.apply_transform(transform)
    stats['web_triangles']+=len(mesh.faces)
    variant = None
    if a.LayerIndex != 4 and not 17 <= a.LayerIndex <= 53:
        for filename, lower, upper in variants:
            if np.all(mesh.bounds[0] >= lower) and np.all(mesh.bounds[1] <= upper):
                variant = filename
                stats[filename] += 1
                break
    groups[(mi,variant)].append(mesh)
    stats['surface_objects']+=1
    if stats['surface_objects'] % 100 == 0: print(dict(stats),flush=True)

for obj in doc.Objects:
    if not obj.Attributes.IsInstanceDefinitionObject: visit(obj)
scene=trimesh.Scene()
details={name:trimesh.Scene() for name,_,_ in variants}
for (mi,variant), parts in groups.items():
    mesh=trimesh.util.concatenate(parts)
    material=doc.Materials.FindIndex(mi) if mi>=0 else None
    color=np.array(material.DiffuseColor[:3] if material else [180,185,190])/255.0
    alpha=1-material.Transparency if material else 1
    name=material.Name if material else 'Default'
    metal=0.7 if 'metal' in name.lower() else 0.05
    roughness=0.5
    if material and material.PhysicallyBased.Supported:
        pbr=material.PhysicallyBased
        color=np.array(pbr.BaseColor[:3])
        metal=pbr.Metallic
        roughness=max(0.3,pbr.Roughness)
        alpha=pbr.Opacity
    # Rhino display colors are sRGB; glTF material factors are linear RGB.
    linear=np.where(color<=0.04045,color/12.92,((color+0.055)/1.055)**2.4)
    rgba=np.round(np.append(linear,alpha)*255).astype(np.uint8)
    mesh.visual=trimesh.visual.TextureVisuals(material=trimesh.visual.material.PBRMaterial(name=name,baseColorFactor=rgba,metallicFactor=metal,roughnessFactor=roughness,doubleSided=True,alphaMode='BLEND' if alpha<1 else 'OPAQUE'))
    # Rhino centimeters/Z-up -> glTF meters/Y-up.
    mesh.apply_transform(np.array([[.01,0,0,0],[0,0,.01,0],[0,-.01,0,0],[0,0,0,1]]))
    scene.add_geometry(mesh,geom_name=f'material-{mi}-{variant}')
    if variant: details[variant].add_geometry(mesh.copy(),geom_name=f'material-{mi}')
scene.apply_translation(-scene.bounds.mean(axis=0))
destination=pathlib.Path(sys.argv[2]); destination.parent.mkdir(parents=True,exist_ok=True)
destination.with_name(destination.stem+'-scene.glb').write_bytes(scene.export(file_type='glb'))
for filename,detail in details.items():
    if not detail.geometry: raise RuntimeError(f'Empty table variant: {filename}')
    detail.apply_translation(-detail.bounds.mean(axis=0))
    output=destination.with_name(filename)
    output.write_bytes(detail.export(file_type='glb'))
    print('VARIANT',filename,'bytes',output.stat().st_size,'bounds',detail.bounds.tolist(),flush=True)
print('DONE',dict(stats),flush=True)
