// Local playable examples of the GenAI templates shown on Xiaomi Global.
export const AI_CARDS = Object.freeze([
 {id:'coin',label:'Монета',icon:'◉'},
 {id:'reaction',label:'Реакция',icon:'ϟ'},
 {id:'fortune',label:'Предсказание',icon:'◒'},
 {id:'compliment',label:'Комплимент',icon:'✿'},
 {id:'fruit',label:'Фруктовая игра',icon:'◕'},
 {id:'maze',label:'Лабиринт',icon:'▦'},
]);
export const MAZE = Object.freeze(['#######','#.....#','###.#.#','#...#.#','#.###.#','#.....#','#######']);
export function mazeStep(position,direction){
 const delta={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[direction];
 if(!delta)return position;
 const [dx,dy]=delta,x=position.x+dx,y=position.y+dy;
 return MAZE[y]?.[x]==='.'?{x,y}:position;
}
export function aiTemplate(prompt){
 const v=String(prompt).toLowerCase();
 if(/монет|ор[её]л|решк|coin/.test(v))return 'coin';
 if(/реакц|reaction|скорост/.test(v))return 'reaction';
 if(/печень|предсказ|fortune/.test(v))return 'fortune';
 if(/фрукт|fruit|разрез/.test(v))return 'fruit';
 if(/лабирин|maze|шарик/.test(v))return 'maze';
 return 'compliment';
}
