import {parsePackage} from './file';
self.onmessage=e=>{try{self.postMessage({result:parsePackage(e.data.buffer,e.data.name,s=>self.postMessage({progress:s}))});}catch(error){self.postMessage({error:String(error)});}};
