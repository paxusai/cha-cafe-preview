"use client";
/**
 * Signature GLSL (Â§3, Â§7): steam, latte swirl and flour-dust particles.
 * Only used in 2â€“3 moments; everything else stays subtle.
 */
import { useFrame, useThree, type ThreeElements } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const NOISE = /* glsl */ `
  vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
  vec2 mod289(vec2 x){return x-floor(x*(1./289.))*289.;}
  vec3 permute(vec3 x){return mod289(((x*34.)+1.)*x);}
  float snoise(vec2 v){
    const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);
    vec2 i=floor(v+dot(v,C.yy)); vec2 x0=v-i+dot(i,C.xx);
    vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
    vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1; i=mod289(i);
    vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
    vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.); m=m*m; m=m*m;
    vec3 x=2.*fract(p*C.www)-1.; vec3 h=abs(x)-.5; vec3 ox=floor(x+.5); vec3 a0=x-ox;
    m*=1.79284291400159-.85373472095314*(a0*a0+h*h);
    vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw;
    return 130.*dot(m,g);
  }
  float fbm(vec2 p){ float f=0., a=.5; for(int i=0;i<5;i++){ f+=a*snoise(p); p*=2.02; a*=.5; } return f; }
`;

/* â”€â”€ Steam â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const steamVert = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }
`;
const steamFrag = /* glsl */ `
  uniform float uTime; uniform vec3 uColor; uniform float uStrength; uniform float uColumns;
  varying vec2 vUv;
  ${NOISE}
  void main(){
    vec2 uv=vUv;
    float t=uTime*.18;
    // wisps rise and sway
    float sway=fbm(vec2(uv.y*1.6-t, t*.5))*.18*uv.y;
    float x=uv.x+sway;
    float cols=0.;
    for(float i=0.;i<4.;i++){
      if(i>=uColumns) break;
      float c=(i+.5)/uColumns;
      cols+=exp(-pow((x-c)*(5.+uColumns*2.),2.));
    }
    float n=fbm(vec2(x*4., uv.y*2.2-t*2.4));
    float wisp=smoothstep(.0,.65,n*.5+.5-uv.y*.35)*cols;
    float fade=smoothstep(0.,.18,uv.y)*smoothstep(1.,.45,uv.y);
    float a=clamp(wisp*fade*uStrength,0.,1.);
    gl_FragColor=vec4(uColor,a);
  }
`;

export function Steam({ color = "#ffffff", strength = 0.9, columns = 3, ...props }: { color?: string; strength?: number; columns?: number } & ThreeElements["mesh"]) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uColor: { value: new THREE.Color(color) }, uStrength: { value: strength }, uColumns: { value: columns } }),
    [color, strength, columns],
  );
  useFrame((_, dt) => {
    if (mat.current) mat.current.uniforms.uTime.value += dt;
  });
  return (
    <mesh {...props}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={steamVert} fragmentShader={steamFrag} transparent depthWrite={false} />
    </mesh>
  );
}

/* â”€â”€ Latte swirl â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const swirlFrag = /* glsl */ `
  uniform float uTime; uniform float uStir; uniform vec2 uPointer;
  uniform vec3 uCrema; uniform vec3 uMilk; uniform vec3 uDark;
  varying vec2 vUv;
  ${NOISE}
  void main(){
    vec2 p=vUv*2.-1.;
    float r=length(p);
    if(r>1.) discard;
    float a=atan(p.y,p.x);
    float twist=(1.6+uStir*3.)*pow(1.-r,1.6)+uTime*.25;
    vec2 q=vec2(cos(a+twist),sin(a+twist))*r;
    q+=uPointer*.25*(1.-r);
    float n=fbm(q*1.6+vec2(uTime*.04,0.));
    // rosette rings pulled into a swirl, a soft heart of foam, faint marbling
    float rings=sin(r*20.-uTime*.5+n*3.5)*.5+.5;
    float art=smoothstep(.62,.9,rings)*smoothstep(.78,.25,r);
    float heart=smoothstep(.32,.18,length(q*vec2(1.,1.2)+vec2(0.,.05)));
    float marble=smoothstep(.2,.7,n*.5+.5)*.18;
    float milk=clamp(max(max(art,heart),marble),0.,1.);
    vec3 col=mix(uCrema,uMilk,milk);
    col=mix(col,uDark,smoothstep(.6,.95,r)*.25);
    col=mix(col,uDark,smoothstep(.82,1.,r)*.85);
    col*=1.-smoothstep(.9,1.,r)*.35;
    gl_FragColor=vec4(col,1.);
  }
`;

export function LatteSwirl({ ...props }: ThreeElements["mesh"]) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { pointer } = useThree();
  const last = useRef(new THREE.Vector2());
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uStir: { value: 0 },
      uPointer: { value: new THREE.Vector2() },
      uCrema: { value: new THREE.Color("#a8693a") },
      uMilk: { value: new THREE.Color("#f6ead8") },
      uDark: { value: new THREE.Color("#5a3519") },
    }),
    [],
  );
  useFrame((_, dt) => {
    const m = mat.current;
    if (!m) return;
    const moved = pointer.distanceTo(last.current);
    last.current.copy(pointer);
    m.uniforms.uStir.value = THREE.MathUtils.lerp(m.uniforms.uStir.value, Math.min(moved * 30, 1.5), 0.04);
    m.uniforms.uTime.value += dt * (1 + m.uniforms.uStir.value);
    (m.uniforms.uPointer.value as THREE.Vector2).lerp(pointer, 0.05);
  });
  return (
    <mesh {...props}>
      <circleGeometry args={[1, 96]} />
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={steamVert} fragmentShader={swirlFrag} />
    </mesh>
  );
}

/* â”€â”€ Flour dust / powdered sugar particles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const dustVert = /* glsl */ `
  uniform float uTime; uniform float uSize; uniform float uFall; uniform float uHeight;
  attribute float aSeed;
  varying float vAlpha;
  void main(){
    vec3 p=position;
    float t=uTime*(.15+aSeed*.25);
    p.x+=sin(t*1.7+aSeed*40.)*.25;
    p.z+=cos(t*1.3+aSeed*20.)*.2;
    p.y=mod(p.y-uTime*uFall*(.4+aSeed),uHeight)-uHeight*.5;
    vec4 mv=modelViewMatrix*vec4(p,1.);
    gl_PointSize=uSize*(.5+aSeed)/-mv.z;
    vAlpha=.35+.65*fract(aSeed*91.7);
    gl_Position=projectionMatrix*mv;
  }
`;
const dustFrag = /* glsl */ `
  uniform vec3 uColor; uniform float uOpacity;
  varying float vAlpha;
  void main(){
    float d=length(gl_PointCoord-.5);
    float a=smoothstep(.5,.0,d)*vAlpha*uOpacity;
    if(a<.01) discard;
    gl_FragColor=vec4(uColor,a);
  }
`;

export function Dust({
  count = 400,
  spread = [6, 5, 3],
  color = "#ffffff",
  size = 0.06,
  fall = 0.08,
  opacity = 0.8,
  opacityRef,
  ...props
}: {
  count?: number;
  spread?: [number, number, number];
  color?: string;
  size?: number;
  fall?: number;
  opacity?: number;
  opacityRef?: React.MutableRefObject<number>;
} & ThreeElements["points"]) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread[0];
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread[1];
      pos[i * 3 + 2] = (Math.random() - 0.5) * spread[2];
      seed[i] = Math.random();
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return g;
  }, [count, spread]);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: size * 1200 },
      uFall: { value: fall },
      uHeight: { value: spread[1] },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
    }),
    [size, fall, spread, color, opacity],
  );
  useFrame((_, dt) => {
    if (!mat.current) return;
    mat.current.uniforms.uTime.value += dt;
    if (opacityRef) mat.current.uniforms.uOpacity.value = opacity * opacityRef.current;
  });
  return (
    <points geometry={geo} {...props}>
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={dustVert} fragmentShader={dustFrag} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/* â”€â”€ Light beam (hero "single bean in a light beam") â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const beamVert = /* glsl */ `
  varying vec2 vUv; varying vec3 vN;
  void main(){ vUv=uv; vN=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }
`;
const beamFrag = /* glsl */ `
  uniform float uOpacity; uniform vec3 uColor; uniform float uTime;
  varying vec2 vUv; varying vec3 vN;
  ${NOISE}
  void main(){
    float facing=pow(abs(vN.z),1.8);
    float a=facing*mix(.15,1.,vUv.y)*smoothstep(0.,.25,vUv.y);
    a*=.8+.2*snoise(vec2(vUv.x*8.,vUv.y*2.-uTime*.15));
    gl_FragColor=vec4(uColor,a*uOpacity);
  }
`;

export function Beam({ opacityRef, ...props }: { opacityRef?: React.MutableRefObject<number> } & ThreeElements["mesh"]) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uOpacity: { value: 0.5 }, uColor: { value: new THREE.Color("#ffe9c4") }, uTime: { value: 0 } }), []);
  useFrame((_, dt) => {
    if (!mat.current) return;
    mat.current.uniforms.uTime.value += dt;
    if (opacityRef) mat.current.uniforms.uOpacity.value = 0.5 * opacityRef.current;
  });
  return (
    <mesh {...props}>
      <cylinderGeometry args={[0.35, 2.2, 9, 48, 1, true]} />
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={beamVert} fragmentShader={beamFrag} transparent depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}
