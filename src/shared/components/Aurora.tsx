import { Renderer, Program, Mesh, Color, Triangle } from 'ogl'
import { useEffect, useRef } from 'react'
import styles from './Aurora.module.css'

const VERT = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`

const FRAG = `#version 300 es
precision highp float;
uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;
out vec4 fragColor;
vec3 permute(vec3 x){return mod(((x*34.0)+1.0)*x,289.0);}
float snoise(vec2 v){const vec4 C=vec4(0.2113248654,0.3660254038,-0.5773502692,0.0243902439);vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod(i,289.0);vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);m=m*m;m=m*m;vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);vec3 a0=x-ox;m*=1.7928429-0.8537347*(a0*a0+h*h);vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.0*dot(m,g);}
void main(){vec2 uv=gl_FragCoord.xy/uResolution;vec3 ramp=mix(uColorStops[0],uColorStops[1],smoothstep(0.0,0.5,uv.x));ramp=mix(ramp,uColorStops[2],smoothstep(0.5,1.0,uv.x));float height=snoise(vec2(uv.x*2.0+uTime*0.1,uTime*0.25))*0.5*uAmplitude;height=exp(height);height=uv.y*2.0-height+0.2;float intensity=0.6*height;float alpha=smoothstep(0.20-uBlend*0.5,0.20+uBlend*0.5,intensity);fragColor=vec4(intensity*ramp*alpha,alpha);}
`

type AuroraProps = { colorStops?: [string, string, string]; speed?: number; blend?: number; amplitude?: number }

export default function Aurora({ colorStops = ['#2a1416', '#d5575e', '#e6a8a8'], speed = 0.35, blend = 0.28, amplitude = 0.7 }: AuroraProps) {
  const container = useRef<HTMLDivElement>(null)
  const propsRef = useRef({ colorStops, speed, blend, amplitude })
  propsRef.current = { colorStops, speed, blend, amplitude }

  useEffect(() => {
    const element = container.current
    if (!element) return
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: true })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    const geometry = new Triangle(gl)
    const initial = propsRef.current
    const program = new Program(gl, { vertex: VERT, fragment: FRAG, uniforms: { uTime: { value: 0 }, uAmplitude: { value: initial.amplitude }, uColorStops: { value: initial.colorStops.map((hex) => { const c = new Color(hex); return [c.r, c.g, c.b] }) }, uResolution: { value: [1, 1] }, uBlend: { value: initial.blend } } })
    const mesh = new Mesh(gl, { geometry, program })
    element.appendChild(gl.canvas)
    const resize = () => { const width = element.offsetWidth; const height = element.offsetHeight; renderer.setSize(width, height); program.uniforms.uResolution.value = [width, height] }
    const onFrame = (time: number) => { const props = propsRef.current; program.uniforms.uTime.value = time * 0.001 * props.speed; program.uniforms.uAmplitude.value = props.amplitude; program.uniforms.uBlend.value = props.blend; program.uniforms.uColorStops.value = props.colorStops.map((hex) => { const c = new Color(hex); return [c.r, c.g, c.b] }); renderer.render({ scene: mesh }); frame = requestAnimationFrame(onFrame) }
    let frame = requestAnimationFrame(onFrame)
    window.addEventListener('resize', resize)
    resize()
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); if (gl.canvas.parentNode === element) element.removeChild(gl.canvas); gl.getExtension('WEBGL_lose_context')?.loseContext() }
  }, [])

  return <div ref={container} className={styles.container} aria-hidden="true" />
}
