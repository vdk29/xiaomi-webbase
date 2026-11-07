import { SELLER_PROFILES, SELLER_REVIEWED_AT } from './seller-help-data.js?v=20261107-23';

const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[character]));
const clean = value => String(value || '').normalize('NFKC').replace(/\s+/g, ' ').trim();
const text = value => Array.isArray(value) ? value.join(', ') : typeof value === 'string' || typeof value === 'number' ? String(value) : '';
const httpUrl = value => { try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } };

export function isSmartphone(product) {
  return clean(product.category).toLowerCase() === 'смартфоны';
}

export function sellerProfile(product) {
  // The full retail identity matters: REDMI, POCO, Note, Pro, Max, Ultra, 4G/5G.
  // Only an exact family before a RAM/storage suffix may inherit researched facts.
  const identity = clean(product.name).replace(/^смартфон\s+/i, '').split(/\s+\d+\s*(?:gb|гб)?\s*[+/]/i)[0].trim().toLowerCase();
  return SELLER_PROFILES.find(profile => profile.match.test(identity)) || null;
}

export function phoneMemory(product) {
  const expression = /(?:^|\s)(\d+)\s*(?:gb|гб)?\s*[+/]\s*(\d+)\s*(tb|тб|gb|гб)?(?=\s|$|[,;)])/i;
  // 1C names are variant-specific even when an old specs object describes another SKU.
  const match = clean(product.name).match(expression) || clean(product.memory).match(expression);
  if (!match) return null;
  const ram = Number(match[1]);
  const storage = Number(match[2]) * (/^(tb|тб)$/i.test(match[3]) ? 1024 : 1);
  return ram > 0 && storage > 0 ? { ram, storage } : null;
}

function batteryFor(product, profile) {
  if (profile.id !== 'redmi-note-17-pro-max-5g') return profile.battery;
  // Both are manufacturer-confirmed regional versions. Do not pick a region from colour or SKU.
  const specs = product.specs || {};
  const value = text(specs['Емкость аккумулятора, мА*ч']) || text(specs['Аккумулятор']);
  const match = value.replace(/\s/g, '').match(/(?:^|\D)(9210|10000)(?:\D|$)/);
  return match ? `${match[1]} мА·ч по карточке; сверьте регион поставки` : '9210 / 10000 мА·ч — зависит от рынка';
}

export function buildSellerHelp(product) {
  if (!isSmartphone(product)) return null;
  const profile = sellerProfile(product);
  const memory = phoneMemory(product);
  const cards = [];
  if (profile) {
    cards.push({id:'battery', label:'Батарея и зарядка', icon:'↯', fact:`${batteryFor(product, profile)} · ${profile.charge}`,
      benefit:'Запас энергии полезен в дороге, на работе и при навигации. Быстрая зарядка помогает восполнить заряд во время перерыва.',
      say:'«Часто бываете без розетки? Здесь ёмкая батарея и быстрая зарядка. Время работы зависит от ваших приложений, связи и яркости».',
      demo:'Покажите режим энергосбережения. Уточните совместимость адаптера и кабеля перед обещанием максимальной скорости.'});
    cards.push({id:'screen', label:'Экран', icon:'◉', fact:profile.screen,
      benefit:/AMOLED|OLED/.test(profile.screen) ? 'Глубокий чёрный и контрастное изображение удобны для просмотра фото и видео. Высокая частота делает прокрутку визуально плавнее.' : 'На большом экране удобнее читать сообщения, пользоваться картами и смотреть видео. Высокая частота делает прокрутку визуально плавнее.',
      say:'«Откройте привычную страницу и попробуйте почитать. Давайте подберём размер шрифта и оценим, удобно ли вам».',
      demo:'Дайте телефон клиенту: прокрутите страницу, откройте фото, измените шрифт. Проверьте, удобно ли держать аппарат одной рукой.'});
    cards.push({id:'camera', label:'Камеры', icon:'◎', fact:profile.camera,
      benefit:profile.cameraBenefit, say:`«Что снимаете чаще: людей, поездки или документы? ${profile.cameraBenefit} Давайте попробуем на вашем сюжете».`, demo:profile.demo});
    cards.push({id:'performance', label:'Скорость и приложения', icon:'✦', fact:profile.processor,
      benefit:profile.id === 'redmi-17' || profile.id === 'redmi-note-17' ? 'Разумный выбор для связи, карт, видео и обычных приложений. Не нужно переплачивать за игровые возможности, которыми клиент не пользуется.' : 'Платформа для работы с приложениями и съёмки. Скорость нужного клиенту сценария лучше проверить прямо на устройстве.',
      say:'«Какие три приложения у вас открыты чаще всего? Проверим именно их — так понятнее, чем сравнивать баллы тестов».',
      demo:'С разрешения клиента откройте доступные приложения и переключитесь между ними. Для игр оцените конкретную игру и настройки; не обещайте отсутствие нагрева.'});
  }
  cards.push({id:'memory', label:'Память этой комплектации', icon:'▤',
    fact: memory ? `${memory.ram} ГБ оперативной · ${memory.storage} ГБ встроенной` : 'Объём не распознан — сверьте маркировку коробки',
    benefit: memory ? 'Встроенная память нужна для приложений, фотографий и видео; оперативная — для работы запущенных приложений. Это разные объёмы.' : 'Сначала уточните физическую оперативную память и хранилище именно у этой поставки.',
    say: memory ? `«Здесь ${memory.storage} ГБ для системы и ваших файлов. Сколько сейчас занято на вашем телефоне? Сравним и оставим запас под новые фото и видео».` : '«Давайте сверим комплектацию и посмотрим, сколько памяти вам нужно по текущему телефону».',
    demo:'Откройте хранилище текущего телефона клиента с его согласия. Учтите место системы; расширение ОЗУ не называйте физической оперативной памятью.'});
  if (profile) cards.push({id:'practical', label:'Защита и ежедневное удобство', icon:'◇', fact:profile.protection,
    benefit:'Заявленная защита от пыли и воды полезна при бытовых случайностях. Это дополнительная мера, а не разрешение купаться с телефоном.',
    say:'«Защита добавляет спокойствия в обычных ситуациях. Для падений всё равно стоит подобрать чехол и стекло».',
    demo:'Покажите удобство разблокировки и хват. NFC, eSIM, диапазоны связи, комплект и язык интерфейса проверяйте у конкретной версии. Не демонстрируйте погружение в воду.'});
  return {profile, memory, cards};
}

const paragraph = (label, value, className = '') => `<p class="seller-line ${className}"><strong>${label}</strong>${escape(value)}</p>`;

export function sellerHelpMarkup(product) {
  const help = buildSellerHelp(product);
  if (!help) return '';
  const {profile, cards, memory} = help;
  const sourceLinks = profile ? [{label:`${profile.name}: характеристики производителя`, url:profile.source}, ...(profile.extraSources || [])] : [];
  const cardSource = httpUrl(product.specs?._source_url);
  if (cardSource && !sourceLinks.some(item => item.url === cardSource)) sourceLinks.push({label:'Источник характеристик этой карточки', url:cardSource});
  return `<div class="seller-help">
    <div class="seller-intro"><span class="seller-kicker">Подсказка для консультации</span><h3>${escape(profile?.name || product.name)}</h3>
      <p>${escape(profile?.fit || 'Выясните задачи клиента и сверьте характеристики конкретной версии перед рекомендацией.')}</p>
      ${profile ? `<blockquote>${escape(profile.pitch)}</blockquote>` : '<p>Для этой модели ещё нет проверенного сценария. Не переносите характеристики с похожего названия; используйте параметры ниже и источник карточки.</p>'}
      <span class="seller-variant">${escape(memory ? `${memory.ram} / ${memory.storage} ГБ` : 'Уточните комплектацию')}${product.color ? ` · ${escape(product.color)}` : ''}</span>
    </div>
    <div class="seller-questions"><h3>Сначала спросите</h3><ol><li>Что не устраивает в нынешнем телефоне?</li><li>Что важнее: заряд, фото, игры или удобный экран?</li><li>Какой бюджет и сколько памяти занято сейчас?</li></ol><p>Выберите два преимущества под ответы клиента — перечислять все характеристики подряд не нужно.</p></div>
    <nav class="seller-jumps" aria-label="Темы консультации">${cards.map(card => `<a href="#seller-${card.id}">${escape(card.label.replace(' этой комплектации', ''))}</a>`).join('')}</nav>
    <div class="seller-grid">${cards.map(card => `<article id="seller-${card.id}" class="seller-card"><div class="seller-card-title"><span aria-hidden="true">${card.icon}</span><h3>${escape(card.label)}</h3></div><p class="seller-fact">${escape(card.fact)}</p>${paragraph('Выгода', card.benefit)}${paragraph('Скажите клиенту', card.say, 'seller-say')}${paragraph('Покажите', card.demo, 'seller-demo')}</article>`).join('')}</div>
    <details class="seller-details"><summary>Если клиент сомневается</summary><div class="seller-answers">
      ${paragraph('«Дорого. Зачем мне эта модель?»', '«Какое улучшение для вас действительно важно?» Вернитесь к его задаче, покажите нужную функцию. Если разница не нужна, предложите более доступный вариант из каталога.')}
      ${paragraph('«Сколько дней держит заряд?»', '«Зависит от яркости, игр, навигации и качества связи». Не переводите мА·ч в дни работы; не обещайте полную зарядку за конкретное время без подтверждённого теста для этой версии.')}
      ${paragraph('«Хватит ли памяти?»', 'Сравните занятое место на старом телефоне с объёмом выбранного товара и оставьте запас. Не обещайте точное количество фото: размер файлов различается.')}
      ${paragraph('«Камера точно лучше?»', 'Снимите одинаковый сюжет при одном освещении и сравните результат. Качество фото не определяется только мегапикселями.')}
    </div></details>
    <details class="seller-details seller-check"><summary>Что проверить перед обещанием клиенту</summary><div>
      ${paragraph('Особенности модели', profile?.limit || 'Проверьте точную модель, регион, характеристики и комплектацию по маркировке и источнику. Для новой модели подробная подсказка появится после проверки.')}
      ${paragraph('Конкретная поставка', 'Сведения производителя относятся к указанному рынку. Связь, NFC, eSIM, зарядный адаптер, доступность сервисов и функций зависят от версии. Если данные ниже расходятся с источником, сначала сверьте коробку.')}
    </div></details>
    <div class="seller-close"><h3>Завершите рекомендацией</h3><p>«Вы говорили, что главное — <em>ваша задача</em>. Мы посмотрели, как телефон с ней справляется. Удобны ли размер и результат? Подберём цвет и память под вас?»</p><p>Перед продажей проверьте «Могу продать» и актуальную цену. ОВ в доступный для продажи остаток не входит.</p></div>
    <details class="seller-details seller-sources"><summary>Источники и дата проверки</summary><p>Сведения по моделям проверены ${SELLER_REVIEWED_AT.split('-').reverse().join('.')}. Объём памяти берётся из названия выбранного товара, при его отсутствии — из поля памяти. Подсказки помогают объяснить пользу; они не заменяют проверку поставки.</p>
      ${sourceLinks.map(item => `<a href="${escape(item.url)}" target="_blank" rel="noopener noreferrer">${escape(item.label)} ↗</a>`).join('')}
      <a href="https://www.salesforce.com/blog/sales/consultative-sales-approach/" target="_blank" rel="noopener noreferrer">Методика: вопросы, слушание, рекомендация под задачу — Salesforce ↗</a>
    </details>
  </div>`;
}
