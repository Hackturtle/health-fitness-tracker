"use client";
import { useEffect, useRef } from 'react';

// Decorative geometry only: projected 3D points, with rotation driven by page scroll.
export function ScrollWireframe({reduceMotion=false}:{reduceMotion?:boolean}){
 const canvasRef=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const canvas=canvasRef.current; if(!canvas)return;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const vertices:Array<[number,number,number]>=[];
  const rings=9, segments=16;
  for(let r=0;r<=rings;r++)for(let s=0;s<segments;s++){
   const lat=Math.PI*r/rings, lon=2*Math.PI*(s+(r%2)*.5)/segments;
   const radius=1+.12*Math.sin(3*lon+lat*2);
   vertices.push([Math.sin(lat)*Math.cos(lon)*radius,Math.cos(lat)*1.18,Math.sin(lat)*Math.sin(lon)*radius]);
  }
  const edges:Array<[number,number]>=[];
  for(let r=0;r<=rings;r++)for(let s=0;s<segments;s++){
   const n=r*segments+s;
   if(r>0&&r<rings)edges.push([n,r*segments+(s+1)%segments]);
   if(r<rings){edges.push([n,n+segments]);if(r>0)edges.push([n,(r+1)*segments+(s+1)%segments]);}
  }
  let width=0,height=0,frame=0,angle=window.scrollY*.0013,target=angle;
  function draw(){
   if(!canvas||!ctx)return;
   ctx.clearRect(0,0,width,height);
   const mobile=width<600;const radius=Math.min(width*(mobile?.67:.29),height*.43);
   const cx=width*(mobile?.65:.79),cy=height*.53;
   const ry=.5+angle,rx=.28+angle*.35;
   const points=vertices.map(([x,y,z])=>{
    const xx=x*Math.cos(ry)+z*Math.sin(ry),zz=-x*Math.sin(ry)+z*Math.cos(ry);
    const yy=y*Math.cos(rx)-zz*Math.sin(rx),depth=y*Math.sin(rx)+zz*Math.cos(rx);
    const perspective=3.8/(3.8+depth);
    return {x:cx+xx*radius*perspective,y:cy+yy*radius*perspective,z:depth};
   });
   ctx.lineWidth=.7;
   for(const [a,b] of edges){const p=points[a],q=points[b];const opacity=.035+(.5-(p.z+q.z)/5)*.08;ctx.strokeStyle=`rgba(65,115,124,${opacity})`;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}
   for(const p of points){const front=(1.5-p.z)/3;ctx.fillStyle=`rgba(59,112,120,${.08+front*.16})`;ctx.beginPath();ctx.arc(p.x,p.y,1+front*1.3,0,Math.PI*2);ctx.fill();}
  }
  function animate(){frame=0;angle+=(target-angle)*.1;draw();if(Math.abs(target-angle)>.0004)frame=requestAnimationFrame(animate);}
  function onScroll(){if(reduceMotion||reduced.matches||document.hidden)return;target=window.scrollY*.0013;if(!frame)frame=requestAnimationFrame(animate);}
  function resize(){if(!canvas||!ctx)return;width=window.innerWidth;height=window.innerHeight;const dpr=Math.min(window.devicePixelRatio||1,1.5);canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
  function preference(){cancelAnimationFrame(frame);frame=0;angle=target=(reduceMotion||reduced.matches)?0:window.scrollY*.0013;draw();}
  function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;}else onScroll();}
  resize();preference();window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',resize);reduced.addEventListener('change',preference);document.addEventListener('visibilitychange',visibility);
  return ()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',resize);reduced.removeEventListener('change',preference);document.removeEventListener('visibilitychange',visibility);};
 },[reduceMotion]);
 return <canvas ref={canvasRef} className="scroll-wireframe" aria-hidden="true"/>;
}
