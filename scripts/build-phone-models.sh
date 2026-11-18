#!/usr/bin/env bash
# Reproducible original meshes; quantization needs no runtime decoder.
set -euo pipefail
cd "$(dirname "$0")/.."
blender --background --python scripts/build-phone-model.py
phone_build_temp=$(mktemp -d)
trap 'rm -rf "$phone_build_temp"' EXIT
for phone_model_id in xiaomi-18-pro xiaomi-18-pro-max; do
  npx --yes @gltf-transform/cli@4.1.1 quantize "assets/preorder/models/$phone_model_id.glb" "$phone_build_temp/$phone_model_id.glb" --quantize-position 14 --quantize-normal 10 --quantize-texcoord 12
  cp "$phone_build_temp/$phone_model_id.glb" "assets/preorder/models/$phone_model_id.glb"
done
python - <<'PY'
from pathlib import Path
import hashlib,json
root=Path('assets/preorder/models');p=root/'manifest.json';data=json.loads(p.read_text());data['quantization']='KHR_mesh_quantization: positions 14 bit, normals 10 bit, UV 12 bit; @gltf-transform/cli 4.1.1'
for model in data['models']:
 b=Path(model['path']).read_bytes();model['bytes']=len(b);model['sha256']=hashlib.sha256(b).hexdigest()
p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
PY
