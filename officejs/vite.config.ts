import {defineConfig} from 'vite';
import {resolve} from 'node:path';
export default defineConfig({root:resolve('officejs'),base:'./',build:{outDir:resolve('dist/officejs'),emptyOutDir:true},server:{host:'127.0.0.1',port:3000,strictPort:true}});
