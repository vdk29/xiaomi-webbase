let pending;
export function loadExcelLibrary() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  if (pending) return pending;
  pending = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const fail = () => { clearTimeout(timer); script.remove(); pending = null; reject(new Error('Не удалось загрузить обработчик Excel. Повторите выбор файла.')); };
    const timer = setTimeout(fail, 15000);
    script.src = new URL('../vendor/xlsx-0.18.5.full.min.js', import.meta.url).href;
    script.onload = () => { clearTimeout(timer); if (window.XLSX) resolve(window.XLSX); else fail(); };
    script.onerror = fail;
    document.head.append(script);
  });
  return pending;
}
