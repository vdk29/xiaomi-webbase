// Feature evidence is separate from the authored simulator. Checked 2026-11-14.
export const REAR_VERIFIED_AT='2026-11-14';
export const REAR_SOURCES={
 china:{label:'Xiaomi · Pro Max (Китай)',url:'https://www.mi.com/prod/xiaomi-18-pro-max'},
 global:{label:'Xiaomi · анонс Global',url:'https://www.mi.com/global/launch/xiaomi-launch-november-2026/'},
 community:{label:'Xiaomi Community · карточки',url:'https://new.c.mi.com/global/post/2366059'},
 maps:{label:'Xiaomi · анонс Google Maps',url:'https://x.com/Xiaomi/status/2120154511151133051'},
 ai:{label:'Xu Fei, Xiaomi · GenAI',url:'https://x.com/XuFei_Xiaomi/status/2120837028195836392'},
 apps:{label:'Анонс приложений · Android Authority',url:'https://www.androidauthority.com/xiaomi-18-pro-rear-display-features-3735180/'},
};
export const REAR_DISPLAY_SCENARIOS=[

 {id:'personal',label:'Твой стиль',icon:'◉',title:'Экран с твоим характером.',text:'Меняй циферблаты, обои и персонажей. Подбери оформление к цвету чехла.',status:'Персонализация · пример интерфейса',note:'AI-обои для Global анонсированы через OTA с декабря 2026. Доступность и лимиты зависят от региона.',source:'global'},
 {id:'camera',label:'Камера',icon:'◎',title:'Основные камеры. Твоё селфи.',text:'Видишь кадр на заднем экране: один портрет, вся компания или видеоблог.',status:'Предпросмотр камеры',note:'Фотопримеры Xiaomi. Здесь меняется макет видоискателя, а не запускается камера устройства.',source:'global'},
 {id:'notifications',label:'На связи',icon:'↗︎',title:'Важное — с этой стороны.',text:'Ответь на демонстрационный звонок, открой сообщение или отметь напоминание.',status:'Звонки и уведомления',note:'Поддерживаемые уведомления зависят от приложений, разрешений и версии HyperOS.',source:'global'},
 {id:'music',label:'Музыка',icon:'♫',title:'Твой ритм. Одним касанием.',text:'Переключи трек или поставь его на паузу, не переворачивая телефон.',status:'Spotify / YouTube Music · анонс Global',note:'Пример анонсированных интеграций, не подключение к приложениям. Авторские демо-обложки и названия; звук не воспроизводится.',source:'apps'},
 {id:'navigation',label:'Маршрут',icon:'↱',title:'Следующий поворот — на виду.',text:'Проверь направление и расстояние на небольшом экране. Пройди маршрут по шагам.',status:'Google Maps · анонс Global',note:'Схематичный маршрут без GPS. Работа на конкретной прошивке и в регионе поставки требует проверки.',source:'maps'},
 {id:'cards',label:'Полезное',icon:'▦',title:'Маленькие карточки большого дня.',text:'Погода, список покупок, заметка и статус рейса — выбери то, что нужно сейчас.',status:'Карточки и закреплённая информация',note:'Данные условные. Trip.com — демонстрация анонсированного сценария Global, не отслеживание настоящего рейса.',source:'global'},
 {id:'timer',label:'Таймер',icon:'◷',title:'Сосредоточься на своём.',text:'Запусти короткий таймер и следи за отсчётом. Телефон можно оставить экраном вниз.',status:'Фокус и таймер',note:'Демонстрационный таймер работает только пока открыт этот раздел. При уходе он приостанавливается.',source:'community'},
 {id:'ai',label:'AI-карточки',icon:'✦',title:'Идея. Запрос. Своя карточка.',text:'Попробуй воду, слова, дыхание или мини-игру. А затем выбери карточку текстовым запросом.',status:'Авторский пример GenAI-карточек',note:'Это подбор готового шаблона без подключения к AI. Дыхание и игра — авторские примеры; не обещание штатных приложений. Реальные AI-возможности и языки зависят от региона.',source:'community'},
 {id:'privacy',label:'Антишпион',icon:'◈',title:'Твой экран. Только для тебя.',text:'Поверни основной экран и сравни видимость с защитой и без неё.',status:'Xiaomi Privacy Display · основной экран',note:'Схема принципа работы, не измерение панели. Реальная видимость зависит от угла, освещения, настроек и прошивки. Выборочная защита показана по материалам китайской версии; Global требует проверки.',source:'china'},
];
export const REAR_TRACKS=[{title:'Город после дождя',artist:'WebBase · демо без звука',color:'#5b72c7',duration:180},{title:'Мягкий свет',artist:'WebBase · демо без звука',color:'#ca7249',duration:164},{title:'Тихая орбита',artist:'WebBase · демо без звука',color:'#348c7d',duration:196}];
export const REAR_ROUTE=[{arrow:'↱',distance:'180 м',instruction:'Направо на Садовую'},{arrow:'↑',distance:'90 м',instruction:'Продолжайте прямо'},{arrow:'↰',distance:'40 м',instruction:'Поворот налево'},{arrow:'✓',distance:'Вы на месте',instruction:'Маршрут завершён'}];
export function aiTemplate(prompt){const value=String(prompt).toLowerCase();if(/вод|пить/.test(value))return 'water';if(/дыш|дых|споко/.test(value))return 'breath';if(/слов|язык|англ/.test(value))return 'words';if(/игр|звезд|звёзд/.test(value))return 'game';if(/тайм|фокус/.test(value))return 'focus';return 'note';}
export const REAR_MEDIA=[
 {id:'teaser',kind:'local',title:'С другой стороны',label:'Официальный тизер · 4 с',text:'Корпус и задний дисплей серии. Сохранённый ролик Xiaomi.',poster:'assets/preorder/20261114/teaser-poster.webp',src:'assets/preorder/20261106/rear-display-film.mp4',source:REAR_SOURCES.china.url},
 {id:'review-screen',kind:'youtube',title:'Экран на реальном устройстве',label:'Обзор Unbox Therapy · с 8:52',text:'Реальное устройство и сценарии второго дисплея. Внешний плеер.',poster:'assets/preorder/20261114/screen-poster.webp',videoId:'LiQGoDnv2EQ',start:532,source:'https://www.youtube.com/watch?v=LiQGoDnv2EQ&t=532s',scenario:'personal'},
 {id:'review-camera',kind:'youtube',title:'Селфи и видеоблог',label:'Обзор Unbox Therapy · с 9:31',text:'Задний видоискатель для съёмки основными камерами. Внешний плеер.',poster:'assets/preorder/20261114/camera-poster.webp',videoId:'LiQGoDnv2EQ',start:571,source:'https://www.youtube.com/watch?v=LiQGoDnv2EQ&t=571s',scenario:'camera'},
 ...['notifications','music','navigation','ai'].map(id=>({id:'demo-'+id,kind:'demo',scenario:id,title:{notifications:'Звонок и ответ',music:'Ритм на ладони',navigation:'Поворот за поворотом',ai:'Идея становится карточкой'}[id],label:'Интерактивная веб-демонстрация',text:'Авторская анимация по подтверждённым или анонсированным сценариям. Не съёмка устройства.'})),
];
