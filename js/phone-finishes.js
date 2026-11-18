// Global finishes shared by the configurator, simulator and GPU materials.
// Colour/material references are manufacturer samples; this is a reconstruction, not factory CAD.
const A = 'assets/preorder/20261118/';
export const PHONE_FINISHES = Object.freeze([
  {id:'black',label:'Чёрный',name:'Black',hex:'#303438',frame:'#44494c',roughness:.4,metalness:.24,clearcoat:.32,texture:A+'finish-black.webp'},
  {id:'white',label:'Белый',name:'White',hex:'#e4e5e3',frame:'#bfc3c4',roughness:.36,metalness:.18,clearcoat:.3,texture:A+'finish-white.webp'},
  {id:'blue',label:'Синий глянцевый',name:'Cosmic Blue',hex:'#20206d',frame:'#383983',roughness:.16,metalness:.38,clearcoat:1,texture:A+'finish-blue.webp',mapTexture:A+'finish-blue-material.webp'},
  {id:'red',label:'Красный (Global)',name:'Velvet Red',hex:'#861d35',frame:'#a9334c',roughness:.43,metalness:.17,clearcoat:.3,texture:A+'finish-red.webp'},
]);
export const phoneFinish = id => PHONE_FINISHES.find(c=>c.id===id)||PHONE_FINISHES[0];
