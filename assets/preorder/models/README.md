# Independently authored Xiaomi showroom bodies

These GLB models were built for Xiaomi WebBase on 18 November 2026 from manufacturer dimensions and product photographs. No TurboSquid model, mesh, texture or preview image was downloaded or copied. This is an independent visual reconstruction, not factory CAD.

The bodies use continuous rounded contours and curved cross-sections: aluminium frame, back cover, raised camera surround, rear glass, layered optical assemblies, ultrawide/focus window, flash diffuser, rounded hardware buttons, antenna breaks, SIM tray, USB-C and speaker openings. Named material groups allow four Global finishes. Front and rear display anchors remain attached to the same coordinate system as the interactive HTML screens.

- Xiaomi 18 Pro: 72 × 151.8 × 8.46 mm (base finish).
- Xiaomi 18 Pro Max: 77.6 × 163.39 × 8.39 mm (base finish).
- Camera rise and small part outlines are estimated from photographs; they are not manufacturer engineering drawings.
- One selected body loads at a time; the other body loads on selection and is cached.
- Quantization preserves ordinary glTF 2.0 compatibility through `KHR_mesh_quantization`; no Draco or Meshopt runtime decoder is needed.
- The exact payload sizes, triangle counts and SHA-256 hashes are in `manifest.json`.

## Build

```sh
bash scripts/build-phone-models.sh
```

Requires Blender (tested 4.3.2), Node/npm, Python 3. The script builds the original meshes, runs pinned `@gltf-transform/cli@4.1.1` quantization and refreshes the manifest. Editable modelling parameters are in `scripts/build-phone-model.py`; no paid source file is required. `.blend` and temporary unoptimized exports are not downloaded by the website.

## Reference / texture provenance

- Physical dimensions and device design: https://www.mi.com/global/product/xiaomi-18-pro/specs/ and https://www.mi.com/global/product/xiaomi-18-pro-max/specs/
- Design photographs: https://www.mi.com/global/product/xiaomi-18-pro/ and https://www.mi.com/global/product/xiaomi-18-pro-max/
- Existing manufacturer close-up: `assets/preorder/20261107/pro-max-rear-detail.webp`, original https://cdn.cnbj1.fds.api.mi-img.com/product-images/new-product-images/xiaomi-18-pro-max_93116/images/12559_a.jpg
- `camera-main.png`: crop (1109,701,1199,791) of that close-up; `camera-tele.png`: (1109,813,1199,903); `flash.png`: (1200,951,1232,983). Only optical surface detail is used, with newly authored 3D housings/glass.
- `leica-engraving.png`: alpha extraction from crop (1339,956,1460,980) of the same photograph.
- `xiaomi-wordmark.png`: alpha extraction around the wordmark within crop (640,730,770,785) of https://i02.appmifile.com/mi-com-product/fly-birds/xiaomi-18-pro-max/pc/icon-screen06-s6-phones.png
- The original manufacturer sample and derived seamless Cosmic Blue material remain documented in `assets/preorder/manifest.json`.

The tiny PNG inputs are embedded in each GLB. Manufacturer imagery and branding retain their respective owners' rights. The mesh construction is original project work.

## Studio lighting

`studio-small-09-512.hdr` is a linear 512×256 resize of [Studio Small 09](https://polyhaven.com/a/studio_small_09), Sergej Majboroda / Poly Haven, [CC0](https://polyhaven.com/license). It supplies photographed softbox reflections. The runtime uses a small local RGBELoader, then prefilters the HDR once. A single contact-shadow map (512px on constrained devices, 1024px elsewhere) helps separate the camera deck from the back; it only updates when the model renders. A bundled procedural environment remains available if the HDR file cannot load. The source URL, transformation, file size and hash are in `assets/preorder/manifest.json`.
