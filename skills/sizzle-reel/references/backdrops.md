# Backdrops — choosing one that fits the product (don't default to the graph)

The particle/knowledge-graph backdrop in `engine-template.html` is **one option**, not the house style.
Shipping it on every reel is the fastest way to make every video look the same and "AI-generated."
The backdrop should feel like it *belongs to this product* — derived from its domain, tone, and brand.

## Step 0: read the product before you pick anything

Before writing a single tween, inspect the actual product and let it drive the aesthetic:

- **README / docs** — what does it *do*? What's the one-line promise? What domain (devtool, fintech,
  health, data, design, security, logistics…)?
- **Screenshots / live app** — pull the real UI. Note the dominant **brand accent color(s)** and the
  base (dark vs light) — your backdrop palette should echo them, not fight them.
- **Tone** — enterprise/serious vs playful/consumer vs premium/minimal. This sets the *motion budget*
  (how much movement is tasteful) and density.
- **The differentiator** — the backdrop's *motif* should gesture at the core idea (a graph product →
  nodes; a streaming/pipeline product → flowing streams; a maps/geo product → contour grid).

State your choice to the user in one line: *"For a {domain} product with a {tone} feel, I'll use a
{backdrop} in {palette} — subtle, behind the content."* Then build it.

## Domain → backdrop starting points

| Product domain / vibe | Suggested backdrop motif | Palette starting point |
| --- | --- | --- |
| Graph / RAG / knowledge / network / security / AI-agents | **Constellation** (nodes + edges) — the template default | cyan + violet on near-black |
| Data platform / analytics / BI / enterprise / infra | **Wave field** (slow undulating point/line surface) | deep blue + teal |
| Streaming / events / pipelines / logistics / throughput | **Flow streams** (directional particle streams along a vector field) | cyan + green |
| Maps / geo / ops / dashboards / devtools | **Topographic grid** (faint perspective grid or contour lines) | faint steel-blue lines |
| Design / creative / consumer / wellness / brand-forward | **Aurora / gradient fog** (soft drifting color blooms) | the product's 2 brand colors |
| Minimal / premium / docs / content / "serious" | **Drifting dust / bokeh** (sparse slow motes, depth blur) | monochrome + 1 accent |

These are *starting points*, not rules — compose or restyle to match the brand. The goal is a backdrop
that a viewer reads as "this product's world," not "the sizzle-skill's stock background."

## The non-negotiable: it must stay subtle (a backdrop, not the show)

Whatever motif you pick, "clean and subtle" comes from these, not from the motif choice:

- **Low luminance & saturation vs the foreground.** The backdrop sits behind text/screenshots; it must
  never out-bright or out-contrast them. When in doubt, darker and dimmer.
- **Slow motion.** Long durations, low frequencies, gentle eases. No fast drift, flashing, or strobing.
  Enterprise/serious → slower and sparser; consumer/creative → a touch more movement, still restrained.
- **Depth, not clutter.** Use `FogExp2`, additive blending, and size-attenuation so far elements fade.
  Sparse + deep reads premium; dense + flat reads noisy.
- **Dim under content.** Drive `fx.dim` down (and a `scrim` up) during panel/screenshot beats so captions
  and UI stay legible; bring it back up only for the graph-forward "mechanism" beats.
- **One backdrop per reel.** Don't switch motifs mid-video. Modulate the *same* backdrop with camera
  moves and `fx` (form/dim/edgeGlow) instead.
- **Palette from the product.** Default base near-black (`#03050c`-ish); pull 1–2 accents from the
  product's logo/UI. Two accents max. Echoing the brand is what makes it feel bespoke.

Validate by rendering one frame *with a caption and a screenshot present*: if your eye goes to the
backdrop first, it's too loud — lower luminance/density/speed.

## Integration contract (so any backdrop slots into the harness)

Whatever you build, keep the deterministic-seek contract intact:

- Add your objects to the `scene` (or the `graph` group for things the camera should orbit).
- Expose the same two hooks the reel modulates: an **intro-reveal** factor (`uForm` 0→1, tweened via
  `fx.form`) and a **dim** factor (`uDim`, driven by `fx.dim`) so panel beats can darken it.
- Update every per-frame uniform inside **`applyState(t)`** only (e.g. `mat.uniforms.uTime.value = t`),
  so a cold `__seek(t)` reproduces the exact frame. No `requestAnimationFrame`-driven state.

## Drop-in recipes (replace the backdrop block in the template)

Each is self-contained: build it where the graph is built, then in `applyState(t)` set its
`uTime/uForm/uDim` uniforms (mirroring how `pointsMat` is updated). Re-color via the fragment shader.

### A. Drifting dust / bokeh — minimal, premium (verified)

```js
const DUST = 520, dpos = new Float32Array(DUST*3), dsz = new Float32Array(DUST);
for (let i=0;i<DUST;i++){ dpos.set([(Math.random()-0.5)*42,(Math.random()-0.5)*26,(Math.random()-0.5)*30-8],i*3);
  dsz[i] = (Math.random()<0.10 ? 5.5 : 1.4) + Math.random()*2.4; }
const dgeo = new THREE.BufferGeometry();
dgeo.setAttribute("position", new THREE.BufferAttribute(dpos,3));
dgeo.setAttribute("aSize", new THREE.BufferAttribute(dsz,1));
const dustMat = new THREE.ShaderMaterial({
  uniforms:{ uTime:{value:0}, uForm:{value:0}, uDim:{value:1}, uTex:{value:tex}, uPR:{value:renderer.getPixelRatio()} },
  transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
  vertexShader:`attribute float aSize;uniform float uTime;uniform float uForm;uniform float uPR;varying float vF;
    void main(){vF=uForm;vec3 p=position;p.y+=sin(uTime*0.18+position.x*0.3)*0.5;
    vec4 mv=modelViewMatrix*vec4(p,1.0);gl_PointSize=aSize*uForm*uPR*(60.0/-mv.z);gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`uniform sampler2D uTex;uniform float uDim;varying float vF;
    void main(){float a=texture2D(uTex,gl_PointCoord).a;if(a<0.01)discard;
    gl_FragColor=vec4(0.58,0.72,0.96,a*vF*uDim*0.5);}`,   // <- brand accent here
});
const dust = new THREE.Points(dgeo, dustMat); scene.add(dust);
// applyState(t): dustMat.uniforms.uTime.value=t; dustMat.uniforms.uForm.value=fx.form; dustMat.uniforms.uDim.value=fx.dim;
```

### B. Wave field — data/analytics/enterprise (verified)

```js
const COLS=72, ROWS=42, WP=new Float32Array(COLS*ROWS*3); let wi=0;
for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++){
  WP[wi++]=(c/(COLS-1)-0.5)*48; WP[wi++]=-6; WP[wi++]=(r/(ROWS-1)-0.5)*32-4; }
const wgeo=new THREE.BufferGeometry(); wgeo.setAttribute("position",new THREE.BufferAttribute(WP,3));
const waveMat=new THREE.ShaderMaterial({
  uniforms:{ uTime:{value:0}, uForm:{value:0}, uDim:{value:1}, uPR:{value:renderer.getPixelRatio()} },
  transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
  vertexShader:`uniform float uTime;uniform float uForm;uniform float uPR;varying float vF;
    void main(){vF=uForm;vec3 p=position;
    p.y+=sin(p.x*0.22+uTime*0.6)*1.3+cos(p.z*0.30+uTime*0.4)*1.0;
    vec4 mv=modelViewMatrix*vec4(p,1.0);gl_PointSize=2.4*uForm*uPR*(40.0/-mv.z);gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`uniform float uDim;varying float vF;
    void main(){vec2 d=gl_PointCoord-0.5;if(dot(d,d)>0.25)discard;
    gl_FragColor=vec4(0.30,0.62,0.88,vF*uDim*0.7);}`,      // <- brand accent here
});
const wave=new THREE.Points(wgeo, waveMat); scene.add(wave);
// applyState(t): waveMat.uniforms.uTime.value=t; waveMat.uniforms.uForm.value=fx.form; waveMat.uniforms.uDim.value=fx.dim;
```

### C. Flow streams, topographic grid, aurora fog — recipe-level

- **Flow streams:** like the dust field, but give each point a velocity along a smooth vector field
  (`p += vec3(sin(p.y*k), 0, cos(p.x*k)) * uTime`), wrap positions, and elongate via short additive
  line segments. Reads as directional throughput — good for pipelines/streaming.
- **Topographic grid:** a `THREE.LineSegments` grid on a plane, gently displaced by layered sines (same
  vertex math as the wave field) and faded with distance fog. Pair with a low camera angle for a horizon.
  Good for maps/ops/devtools.
- **Aurora fog:** 2–3 large, very soft additive sprites (big `PointsMaterial` with a wide radial-gradient
  texture) in the brand's two colors, drifting slowly on `sin`/`cos` of `uTime`, heavily blurred by fog.
  The most "brand-forward / calm" option — keep opacity low (~0.15) so it stays a wash, not a focal point.

For all three, keep the integration contract above (form/dim hooks, update only in `applyState`).
