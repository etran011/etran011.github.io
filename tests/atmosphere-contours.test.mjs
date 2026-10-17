import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createMathematicalDetails} from '../src/lib/atmosphere-contours.mjs';
import {loss,lossGradient} from '../src/lib/loss-landscape.mjs';
test('contours follow actual loss levels and gradient arrow shafts point downhill',()=>{
  let previous=Infinity;
  for(const quality of ['high','medium','low']){
    const {contours,vectors}=createMathematicalDetails(quality);
    assert(contours.length<=previous&&contours.length>100);previous=contours.length;
    for(const {from,to,level} of contours)for(const p of [from,to])assert(Math.abs(loss(...p)-level)<.03);
    for(let i=0;i<vectors.length;i+=3){
      const {from,to}=vectors[i],g=lossGradient(...from),d=to.map((v,i)=>v-from[i]);
      assert(g[0]*d[0]+g[1]*d[1]<0);assert(loss(...to)<loss(...from));
    }
    assert.deepEqual(createMathematicalDetails(quality),{contours,vectors});
  }
});
