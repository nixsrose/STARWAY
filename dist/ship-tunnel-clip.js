// Constrain the visual hull to the tunnel opening while the player is inside.
// Cosmetic wings may be wider than the collision capsule; they cannot show through a wall.
function playerTunnelAperture(){
 if(tunnelGrounded||['dead','exploding','falling'].includes(state))return null;
 let best=null;for(const mesh of collectTunnelMeshes()){
  if(z<mesh.start-.35||z>mesh.end+.35)continue;
  for(const center of mesh.centers){const local=Math.abs(x-center);if(local>=mesh.radius)continue;const roof=mesh.height*Math.sqrt(Math.max(0,1-(local/mesh.radius)**2));if(y>=roof+.08)continue;
   const distance=local/mesh.radius;if(!best||distance<best.distance)best={...mesh,center,distance,depth:Math.max(mesh.start+.001,Math.min(mesh.end-.001,z))};
  }
 }
 if(!best)return null;const points=[],segments=32;for(let i=0;i<=segments;i++){const a=i*Math.PI/segments;points.push(proj(best.center+best.radius*Math.cos(a),best.depth,best.height*Math.sin(a)))}return points;
}
function clipPlayerToTunnel(){const points=playerTunnelAperture();if(!points)return false;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.clip();return true}

globalThis.starwayTunnelClipReady=true;
