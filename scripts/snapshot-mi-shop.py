"""Read-only mi-shop.com catalog snapshot. Requires beautifulsoup4.
Usage: WEBBASE_MI_SHOP_WORKDIR=/private/snapshot python scripts/snapshot-mi-shop.py list
       WEBBASE_MI_SHOP_WORKDIR=/private/snapshot python scripts/snapshot-mi-shop.py details
No credentials, product writes or stock changes. Downloaded pages are cached.
"""
import urllib.request,urllib.parse,json,re,hashlib,time,os
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor,as_completed
from bs4 import BeautifulSoup
ROOT=Path(os.environ.get('WEBBASE_MI_SHOP_WORKDIR','/tmp/webbase-mi-shop'));BASE='https://mi-shop.com'
(ROOT/'pages').mkdir(parents=True,exist_ok=True)
def fetch(url):
 p=ROOT/'pages'/(hashlib.sha256(url.encode()).hexdigest()+'.html')
 if p.exists():return p.read_text()
 for attempt in range(3):
  try:
   req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (compatible; XiaomiWebBaseCatalogImport/1.0)'})
   with urllib.request.urlopen(req,timeout=40) as r:h=r.read().decode('utf-8')
   p.write_text(h);return h
  except Exception:
   if attempt==2:raise
   time.sleep(1+attempt)
def soup(u):return BeautifulSoup(fetch(u),'html.parser')
def listing(u):
 s=soup(u);cards=[]
 for a in s.select('a.b-product-card[href]'):
  title=a.select_one('.b-product-card__title');kind=a.select_one('.b-product-card__desc')
  name=((kind.get_text(' ',strip=True)+' ') if kind else '')+(title.get_text(' ',strip=True) if title else '')
  cards.append({'url':urllib.parse.urljoin(BASE,a['href']),'name':name,'buy':bool(a.select_one('.js-basket-add:not(.is-disable):not(.is-disabled)')) and not bool(a.select_one('[data-is-disabled="Y"]')),'section':urllib.parse.urlparse(u).path})
 pages=[int(x) for x in re.findall(r'PAGEN_1=(\d+)',str(s))]
 return cards,max(pages or [1])
def listings():
 sections=['/catalog/smartphones/','/catalog/planshety/','/catalog/audio/','/catalog/smart_devices/']
 allcards=[];pending=[];audit=[]
 for sec in sections:
  cards,n=listing(BASE+sec);allcards+=cards;print(sec,'pages',n,flush=True);audit.append({'section':sec,'pages':n})
  pending += [BASE+sec+'?PAGEN_1='+str(i) for i in range(2,n+1)]
 with ThreadPoolExecutor(max_workers=4) as ex:
  futures={ex.submit(listing,u):u for u in pending}
  for i,f in enumerate(as_completed(futures)):
   cards,_=f.result();allcards+=cards
   if i%10==0:print('listing pages',i+1,'/',len(pending),flush=True)
 unique={c['url']:c for c in allcards};(ROOT/'listings.json').write_text(json.dumps(list(unique.values()),ensure_ascii=False,indent=2));(ROOT/'listing-audit.json').write_text(json.dumps(audit))
 print('unique',len(unique),'buy',sum(c['buy'] for c in unique.values()),flush=True)
def product(c):
 s=soup(c['url']);h1=s.select_one('h1');article=s.select_one('.b-article');schema=None
 for e in s.select('script[type="application/ld+json"]'):
  try:
   j=json.loads(e.string or e.get_text())
   if j.get('@type')=='Product':schema=j
  except (ValueError,AttributeError):pass
 if not schema:
  # Some source JSON-LD names contain unescaped quotes; extract independent fields.
  raw=next((e.get_text() for e in s.select('script[type="application/ld+json"]') if '"@type": "Product"' in e.get_text()),'')
  def field(key):
   m=re.search(r'"'+key+r'"\s*:\s*"([^"\n]*)"',raw)
   return m.group(1) if m else ''
  if raw:
   schema={'sku':field('sku'),'image':field('image'),'brand':{'name':''},'offers':{'availability':field('availability')}}
  else:
   # Bitrix strips the JSON-LD block on TV pages; use the main purchase button,
   # never recommendation cards elsewhere on the page.
   button=s.select_one('.b-product-info__price-buy.js-basket-add')
   if not button or not article or not h1:raise ValueError('No detail purchase evidence '+c['url'])
   available=not any(k in button.get('class',[]) for k in ['is-disable','is-disabled'])
   schema={'sku':button.get('data-product-id',''),'name':h1.get_text(' ',strip=True),'brand':{'name':''},'offers':{'availability':'https://schema.org/InStock' if available else 'https://schema.org/OutOfStock'}}
 specs={}
 for row in s.select('.b-product-features__row'):
  cols=row.select('.b-product-features__column')
  if len(cols)==2:
   k=cols[0].get_text(' ',strip=True);v=cols[1].get_text(' ',strip=True)
   if k and v:specs[k]=v
 gallery=[]
 for img in s.select('[data-type="product-slider-top"] img.b-slider-top__image'):
  src=img.get('src','')
  if src and src not in gallery:gallery.append(src)
 if not gallery and schema.get('image'):gallery=[schema['image']]
 # Extract only the overview tab, excluding specs, delivery, reviews and scripts.
 description=[]
 features=s.select_one('.b-product-features')
 # Rich overview texts have repeated mobile/desktop content; keep unique paragraphs.
 for e in s.select('.xm-layout .xm-text, .xm-layout h1, .xm-layout h2, .xm-layout h3, .xm-layout p'):
  t=e.get_text(' ',strip=True)
  if len(t)>20 and t not in description and not re.match(r'^\d+[.\)]',t):description.append(t)
 if not description:
  for e in s.select('.b-product-description p, .product-description p, .b-product-about p, .b-text p'):
   t=e.get_text(' ',strip=True)
   if len(t)>30 and t not in description:description.append(t)
 # Prefer the actual overview, including plain text outside paragraph tags.
 about=s.select_one('.b-product-about')
 if about:
  for tag in about.select('script,style,noscript,iframe'):tag.decompose()
  lines=[]
  for text in about.get_text('\n',strip=True).splitlines():
   text=re.sub(r'\s+',' ',text).strip()
   if len(text)>10 and text not in lines:lines.append(text)
  if lines:description=lines
 # Compact factual description from actual technical fields when the source only has image banners.
 name=h1.get_text(' ',strip=True) if h1 else schema['name']
 if not description:description=[name+'.']+[k+': '+v+'.' for k,v in list(specs.items())[:8]]
 sku=re.sub(r'^Артикул\s*:\s*','',article.get_text(' ',strip=True)) if article else ''
 offers=schema.get('offers',{});availability=offers.get('availability','') if isinstance(offers,dict) else ''
 bread=[]
 for a in s.select('.b-breadcrumbs a[href]'):bread.append({'url':a['href'],'name':a.get_text(' ',strip=True)})
 return {**c,'name':name,'sku':sku,'site_id':str(schema.get('sku','')),'availability':availability,'brand':schema.get('brand',{}).get('name',''),'specs':specs,'description':'\n\n'.join(description)[:4900],'images':[urllib.parse.urljoin(BASE,u) for u in gallery],'breadcrumbs':bread}
def details():
 cards=json.loads((ROOT/'listings.json').read_text());selected=[c for c in cards if c['buy'] or re.search(r'холодильник|стиральн',c['name'],re.I)];out=[];errors=[]
 with ThreadPoolExecutor(max_workers=4) as ex:
  fs={ex.submit(product,c):c for c in selected}
  for i,f in enumerate(as_completed(fs)):
   try:out.append(f.result())
   except Exception as e:errors.append({'url':fs[f]['url'],'error':str(e)})
   if i%25==0:print('details',i+1,'/',len(selected),'errors',len(errors),flush=True)
 (ROOT/'products.json').write_text(json.dumps(sorted(out,key=lambda x:x['url']),ensure_ascii=False,indent=2));(ROOT/'errors.json').write_text(json.dumps(errors,ensure_ascii=False,indent=2));print('DONE',len(out),'errors',len(errors),flush=True)
if __name__=='__main__':
 import sys
 if sys.argv[1]=='list':listings()
 else:details()
