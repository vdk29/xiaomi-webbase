import {matchSourceProduct,productCore,extractShopSpecs} from '../supabase/functions/webbase-network-enrich/source.ts';
function check(value:unknown,message:string){if(!value)throw Error(message)}
Deno.test('source matching shares a photo across memory sizes only for the exact model and colour',()=>{
 check(matchSourceProduct('Смартфон Xiaomi 17 Ultra 16GB+512GB Black',{name:'Xiaomi 17 Ultra 16/1024GB черный'}),'Same device/colour must match');
 for(const name of ['Xiaomi 17 Ultra 16/512GB White','Xiaomi 17T Pro 12/512GB Black','Xiaomi 17 16/512GB Black'])check(!matchSourceProduct('Смартфон Xiaomi 17 Ultra 16GB+512GB Black',{name}),'Wrong model/colour accepted');
 check(productCore('(LDU) Смартфон Xiaomi 17T 12GB+256GB Blue')===productCore('Xiaomi 17T 12/512GB Blue'),'Demo photography may reuse its exact device colour');
});
Deno.test('exact factory code cannot confuse a vacuum with its brush or different colours',()=>{
 check(!matchSourceProduct('Робот-пылесос Xiaomi Robot Vacuum S10+ (BHR6368EU)',{name:'Щетки боковые Xiaomi Robot Vacuum S10+ (BHR6368EU)'}),'Device/accessory mixed');
 check(!matchSourceProduct('Щетки боковые Xiaomi S10+ (BHR6368EU)',{name:'Щетка основная Xiaomi S10+ (BHR6368EU)'}),'Different accessories mixed');
 check(matchSourceProduct('Триммер для носовых волос Xiaomi Nose Hair Trimmer GL (BHR8997GL)',{name:'Триммер Xiaomi для носовых волос Nose Hair Trimmer GL (BHR8997GL) серый'}),'Factory code must bridge truthful name differences');
});
Deno.test('technical source rows preserve units and strip scripts without fabricated specifications',()=>{
 const specs=extractShopSpecs('<div class="b-product-features__row"><div class="b-product-features__column"><span>Емкость аккумулятора, мА*ч</span></div><div class="b-product-features__column">6000&nbsp;<script>bad()</script></div></div>');check(specs['Емкость аккумулятора, мА*ч']==='6000','Source unit/value changed');check(Object.keys(specs).length===1,'Invented fields');
});
