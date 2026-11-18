// Physical Global body dimensions. Geometry is independently authored from Xiaomi references.
export const PHONE_MODELS=Object.freeze({
 'xiaomi-18-pro':{id:'xiaomi-18-pro',name:'Xiaomi 18 Pro',width:72,height:151.8,depth:8.46,cameraRise:2.2,asset:'assets/preorder/models/xiaomi-18-pro.glb?v=20261118-2'},
 'xiaomi-18-pro-max':{id:'xiaomi-18-pro-max',name:'Xiaomi 18 Pro Max',width:77.6,height:163.39,depth:8.39,cameraRise:2.2,asset:'assets/preorder/models/xiaomi-18-pro-max.glb?v=20261118-2'},
});
export const phoneModel=id=>PHONE_MODELS[id]||PHONE_MODELS['xiaomi-18-pro'];
