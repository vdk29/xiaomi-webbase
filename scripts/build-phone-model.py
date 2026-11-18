"""Build the independently authored Xiaomi showroom meshes from physical dimensions.
Run: blender --background --python scripts/build-phone-model.py
No TurboSquid geometry, textures or previews are used. All dimensions below are mm.
References and the generated glTF assets are recorded in models/README.md.
"""
import bpy, math, json, hashlib
from pathlib import Path
from mathutils import Vector, Matrix
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/preorder/models'
OUT.mkdir(exist_ok=True)
S=.001
G={'width':163,'height':337,'housing':(9,9,145,96),'glass':(16.5,15.5,131,80),'lenses':[(37,35,15.5),(37,74,15.5)]}
# The lofts follow continuous corner arcs and a curved cross-section, rather than boxes.
def contour(w,h,r,n=20,exponent=2.18):
    pts=[]
    for cx,cy,start in [(w/2-r,h/2-r,0),(-w/2+r,h/2-r,90),(-w/2+r,-h/2+r,180),(w/2-r,-h/2+r,270)]:
        for j in range(n+1):
            a=math.radians(start+j*90/n);c=math.cos(a);s=math.sin(a)
            pts.append((cx+r*math.copysign(abs(c)**(2/exponent),c),cy+r*math.copysign(abs(s)**(2/exponent),s)))
    return pts

def xyz(p):return (p[0]*S,-p[2]*S,p[1]*S)

def material(name,color,metal=0,rough=.4):
    m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
    return m

def transform(p,rotation):
    if not rotation:return Vector(p)
    axis,angle=rotation
    return Matrix.Rotation(math.radians(angle),3,axis)@Vector(p)

def loft(name,w,h,r,profiles,mat,center=(0,0,0),caps=True,rotation=None,segments=20):
    profiles=sorted(profiles,key=lambda p:p[0])
    verts=[];faces=[];count=4*(segments+1)
    for z,inset in profiles:
        for x,y in contour(w-2*inset,h-2*inset,max(.02,r-inset),segments):
            p=transform((x,y,z),rotation)+Vector(center);verts.append(xyz(p))
    for k in range(len(profiles)-1):
        for j in range(count):faces.append((k*count+j,k*count+(j+1)%count,(k+1)*count+(j+1)%count,(k+1)*count+j))
    if caps:
        faces.append(tuple(reversed(range(count))));faces.append(tuple((len(profiles)-1)*count+j for j in range(count)))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    ob=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(ob);ob.data.materials.append(mat)
    uv=mesh.uv_layers.new(name='UVMap') if mat.name=='finish_back' else None
    # Planar XY mapping for the back panel; the only sampled material is that panel.
    for poly in mesh.polygons:
        poly.use_smooth=len(poly.vertices)==4
        for li in poly.loop_indices:
            p=mesh.vertices[mesh.loops[li].vertex_index].co

            if uv:uv.data[li].uv=(min(1,max(0,p.x/(w*S)+.5)),min(1,max(0,p.z/(h*S)+.5)))
    return ob

def cylinder(name,r,depth,mat,center,rotation=None,segments=64):
    # A circular loft with a tiny rounded rim, all in phone coordinates.
    verts=[];faces=[]
    bevel=min(.025,depth*.2)
    for z,rr in [(-depth/2,r*.97),(-depth/2+bevel,r),(depth/2-bevel,r),(depth/2,r*.97)]:
        for j in range(segments):
            a=j*math.tau/segments;p=transform((math.cos(a)*rr,math.sin(a)*rr,z),rotation)+Vector(center);verts.append(xyz(p))
    for k in range(3):
        for j in range(segments):faces.append((k*segments+j,k*segments+(j+1)%segments,(k+1)*segments+(j+1)%segments,(k+1)*segments+j))
    faces.extend([tuple(reversed(range(segments))),tuple(3*segments+j for j in range(segments))])
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update();ob=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(ob);ob.data.materials.append(mat)
    for poly in mesh.polygons:poly.use_smooth=len(poly.vertices)==4
    return ob

def annulus(name,inner,outer,z,mat,center,depth=.1,segments=64):
    verts=[];faces=[]
    for zz,rr in [(z-depth/2,inner),(z-depth/2,outer),(z+depth/2,outer),(z+depth/2,inner)]:
        for j in range(segments):
            a=j*math.tau/segments;verts.append(xyz((center[0]+math.cos(a)*rr,center[1]+math.sin(a)*rr,zz)))
    for k in range(4):
        for j in range(segments):faces.append((k*segments+j,k*segments+(j+1)%segments,((k+1)%4)*segments+(j+1)%segments,((k+1)%4)*segments+j))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update();ob=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(ob);ob.data.materials.append(mat)
    for p in mesh.polygons:p.use_smooth=True
    return ob

def glass_lens(name,r,z,mat,center):
    # Shallow curved optical surface with a smooth normal field.
    seg=64;bands=8;verts=[xyz((center[0],center[1],z+.12))];faces=[]
    for k in range(1,bands+1):
        rr=r*k/bands;zz=z+.12*(1-(rr/r)**2)
        for j in range(seg):
            a=j*math.tau/seg;verts.append(xyz((center[0]+math.cos(a)*rr,center[1]+math.sin(a)*rr,zz)))
    for j in range(seg):faces.append((0,1+j,1+(j+1)%seg))
    for k in range(bands-1):
        for j in range(seg):faces.append((1+k*seg+j,1+(k+1)*seg+j,1+(k+1)*seg+(j+1)%seg,1+k*seg+(j+1)%seg))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update();ob=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(ob);ob.data.materials.append(mat)
    for p in mesh.polygons:p.use_smooth=True
    assert all(p.normal.y<-.9 for p in mesh.polygons), 'Optical glass normals must face the viewer'
    uv=mesh.uv_layers.new(name='UVMap')
    for poly in mesh.polygons:
        for li in poly.loop_indices:
            v=mesh.vertices[mesh.loops[li].vertex_index].co
            uv.data[li].uv=(min(1,max(0,(v.x/S-center[0])/(2*r)+.5)),min(1,max(0,(v.z/S-center[1])/(2*r)+.5)))
    return ob

def decal(name,path,width,height,center,mat_name):
    m=material(mat_name,(.65,.67,.68),0,.45)
    if path.exists():
        nodes=m.node_tree.nodes;p=nodes.get('Principled BSDF');im=nodes.new('ShaderNodeTexImage');im.image=bpy.data.images.load(str(path),check_existing=True);m.node_tree.links.new(im.outputs['Alpha'],p.inputs['Alpha']);m.surface_render_method='DITHERED'
    else:return
    points=[(-width/2,-height/2,0),(width/2,-height/2,0),(width/2,height/2,0),(-width/2,height/2,0)]
    mesh=bpy.data.meshes.new(name);mesh.from_pydata([xyz(Vector(v)+Vector(center)) for v in points],[],[(0,1,2,3)]);mesh.update();uv=mesh.uv_layers.new()
    for i,c in enumerate([(0,0),(1,0),(1,1),(0,1)]):uv.data[i].uv=c
    ob=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(ob);ob.data.materials.append(m)

def photo_material(name,path):
    m=material(name,(1,1,1),.1,.14);nodes=m.node_tree.nodes;p=nodes.get('Principled BSDF');tex=nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(path),check_existing=True);m.node_tree.links.new(tex.outputs['Color'],p.inputs['Base Color']);return m

def build(model,w,h,d):
    bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
    for m in list(bpy.data.materials):bpy.data.materials.remove(m)
    back=material('finish_back',(.035,.042,.048),.08,.34);frame=material('finish_frame',(.13,.16,.18),1,.23)
    dark=material('optical_housing',(.007,.009,.012),.2,.3);rim=material('optical_rim',(.06,.075,.085),1,.18)
    glass=material('camera_glass',(.004,.009,.015),.08,.075);lens=material('optical_glass',(.006,.017,.038),.32,.045)
    ar=material('optical_coating',(.025,.035,.12),.7,.09);aperture=material('optical_aperture',(.001,.003,.006),.1,.22)
    led=material('flash_diffuser',(.88,.87,.77),.08,.36);seam=material('antenna_inserts',(.10,.115,.12),.1,.64);screen=material('front_glass',(.004,.005,.007),.1,.13)
    flash_photo=photo_material('flash_photo',OUT/'flash.png')
    photo_lenses=[photo_material('optical_photo_main',OUT/'camera-main.png'),photo_material('optical_photo_tele',OUT/'camera-tele.png')]
    radius=w*.135;half=d/2
    loft('Micro_curved_aluminium_frame',w,h,radius,[(-half+.12,.58),(-half+.24,.31),(-half+.48,.1),(-half+.85,0),(half-1.03,0),(half-.63,.08),(half-.34,.28),(half-.18,.52)],frame,caps=True,segments=24)
    loft('Satin_back_cover',w,h,radius,[(half-.38,.52),(half-.20,.37),(half-.08,.45),(half-.015,.64),(half,.90),(half,1.35)],back,segments=24)
    loft('Polished_front_glass',w,h,radius,[(-half-.02,.9),(-half-.09,1.0),(-half-.12,1.25)],screen,segments=24)
    px=lambda v:(v/G['width']-.5)*w
    py=lambda v:(.5-v/G['height'])*h
    hx,hy,hw,hh=G['housing'];gx,gy,gw,gh=G['glass'];rise=2.2
    center=(px(hx+hw/2),py(hy+hh/2),half)
    loft('Golden_arc_camera_deco',hw/G['width']*w,hh/G['height']*h,8.4,[(0,0),(.12,.02),(.38,.10),(.85,.30),(1.30,.60),(1.65,.93),(1.92,1.18),(2.05,1.34)],frame,center=center,segments=24)
    # Black gasket and camera glass align with the live U-shaped rear display mask.
    gc=(px(gx+gw/2),py(gy+gh/2),half+rise)
    loft('Glass_edge_gasket',gw/G['width']*w+.65,gh/G['height']*h+.65,5.65,[(-.24,0),(-.12,0),(0,.13)],dark,center=(gc[0],gc[1],gc[2]-.15))
    loft('Under_glass_deco',gw/G['width']*w,gh/G['height']*h,5.35,[(-.15,.03),(-.06,0),(-.035,.12)],glass,center=gc)
    for i,(lx,ly,lr) in enumerate(G['lenses']):
        c=(px(lx),py(ly));r=lr/G['width']*w;z=half+rise
        cylinder(f'Camera_{i}_barrel',r,.32,dark,(c[0],c[1],z-.035))
        annulus(f'Camera_{i}_polished_rim',r*.92,r,z+.10,rim,c,.17)
        cylinder(f'Camera_{i}_inner_well',r*.91,.09,aperture,(c[0],c[1],z+.08))
        annulus(f'Camera_{i}_retaining_ring',r*.55,r*.70,z+.135,dark,c,.10)
        annulus(f'Camera_{i}_coating_ring',r*.40,r*.445,z+.16,ar,c,.06)
        if i==1:
            loft('Periscope_optical_window',r*.97,r*.76,r*.20,[(-.03,0),(.03,0)],lens,center=(c[0],c[1],z+.17),segments=12)
        else:cylinder('Main_optical_stack',r*.44,.08,lens,(c[0],c[1],z+.16))
        glass_lens(f'Camera_{i}_curved_glass',r*.89,z+.21,photo_lenses[i],c)
        annulus(f'Camera_{i}_fine_rim',r*.87,r*.895,z+.22,rim,c,.025)
    # Ultrawide / focus window, diffuser and printing match the manufacturer close-up.
    cc=(-w*.278,h*.155,half+.12)
    loft('Ultrawide_focus_capsule',12.4,4.9,2.35,[(-.12,.1),(0,0),(.13,.15)],dark,center=cc,segments=16)
    cylinder('Ultrawide_retaining_ring',1.55,.12,rim,(cc[0]-3.9,cc[1],half+.26))
    glass_lens('Ultrawide_optics',1.36,half+.33,lens,(cc[0]-3.9,cc[1]))
    cylinder('Flash_metal_rim',2.47,.16,rim,(-w*.127,h*.155,half+.12))
    cylinder('Flash_diffuser',2.28,.14,led,(-w*.127,h*.155,half+.23))
    for j in range(6):
        a=j*math.tau/6;c=(-w*.127+math.cos(a)*.95,h*.155+math.sin(a)*.95)
        cylinder('Flash_diffuser_cells',.57,.04,led,(c[0],c[1],half+.32),segments=20)
    glass_lens('Flash_microprism_surface',2.28,half+.35,flash_photo,(-w*.127,h*.155))
    decal('Xiaomi_wordmark',OUT/'xiaomi-wordmark.png',18.8,5.7,(0,-h*.332,half+.025),'wordmark')
    decal('Leica_engraving',OUT/'leica-engraving.png',21.5,4.3,(w*.245,h*.155,half+.025),'engraving')
    # Fully rounded buttons and real-sized openings rather than rectangular protrusions.
    for name,y,length,side in [('Volume_rocker',h*.215,12.2,1),('Power_button',h*.105,7.6,1),('AI_button',h*.13,8.2,-1)]:
        loft(name,2.8,length,1.3,[(-.25,.22),(-.12,.05),(.08,0),(.26,.20)],frame,center=(side*(w/2+.08),y,0),rotation=('Y',side*90),segments=16)
    for side in [-1,1]:
        for y in [-h*.35,h*.35]:
            loft('Antenna_side_insert',d-.7,.7,.32,[(-.025,0),(.025,0)],seam,center=(side*(w/2+.015),y,0),rotation=('Y',side*90),segments=8)
    bottom=('X',90)
    loft('USB_C_port_recess',9.1,2.95,1.35,[(-.08,.08),(.08,0)],dark,center=(0,-h/2-.015,0),rotation=bottom,segments=16)
    loft('USB_C_internal_tongue',6.2,.62,.28,[(-.03,0),(.03,0)],rim,center=(0,-h/2-.11,0),rotation=bottom,segments=8)
    for j in range(6):
        x=w*.25+(j-2.5)*1.33
        loft('Speaker_perforation',.66,1.62,.32,[(-.025,0),(.025,0)],dark,center=(x,-h/2-.025,0),rotation=bottom,segments=8)
    cylinder('Microphone_port',.41,.08,dark,(-w*.22,-h/2-.03,0),rotation=bottom,segments=24)
    loft('SIM_tray_seam',11.3,2.28,.9,[(-.02,0),(.02,0)],seam,center=(-w*.285,-h/2-.025,.1),rotation=bottom,segments=10)
    loft('SIM_tray',10.8,1.89,.8,[(-.02,0),(.02,0)],frame,center=(-w*.285,-h/2-.055,.1),rotation=bottom,segments=10)
    cylinder('SIM_eject_hole',.32,.04,dark,(-w*.345,-h/2-.09,.1),rotation=bottom,segments=20)
    # One draw per material; retain editable, named parts in the reproducible build source.
    for m in list(bpy.data.materials):
        obs=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.data.materials and o.data.materials[0]==m]
        if not obs:continue
        bpy.ops.object.select_all(action='DESELECT')
        for o in obs:o.select_set(True)
        bpy.context.view_layer.objects.active=obs[0]
        if len(obs)>1:bpy.ops.object.join()
        ob=bpy.context.view_layer.objects.active;ob.name=m.name;ob['materialRole']=m.name
    bpy.context.scene['model']=model;bpy.context.scene['independentlyAuthored']=True;bpy.context.scene['width_mm']=w;bpy.context.scene['height_mm']=h;bpy.context.scene['depth_mm']=d
    for name,pos in [('rear_display_anchor',(gc[0],gc[1],half+rise)),('front_display_anchor',(0,0,-half-.13))]:
        ob=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(ob);ob.location=xyz(pos)
    path=OUT/(model+'.glb')
    bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',export_yup=True,export_extras=True,export_cameras=False,export_lights=False,export_animations=False,export_apply=True,export_image_format='AUTO',export_materials='EXPORT')
    triangles=sum(len(o.data.loop_triangles) for o in bpy.context.scene.objects if o.type=='MESH')
    return {'id':model,'path':str(path.relative_to(ROOT)),'width':w,'height':h,'depth':d,'cameraRise':rise,'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'triangles':triangles}

models=[build('xiaomi-18-pro',72,151.8,8.46),build('xiaomi-18-pro-max',77.6,163.39,8.39)]
(OUT/'manifest.json').write_text(json.dumps({'generator':'scripts/build-phone-model.py','basis':'Manufacturer dimensions and product photographs; original geometry, no third-party stock model','models':models},ensure_ascii=False,indent=2)+'\n')
print('SHOWROOM_MODELS',json.dumps(models))
