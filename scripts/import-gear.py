"""Import saved public Data Pool equipment tables (stdlib only).

Save items/, clothes_style/, agents_accessories/, soft/ and acpa/ as
audit/source/gear-{items,clothes,agents,soft,acpa}.html, then run this script.
--check verifies the generated catalogue without writing. Existing item IDs
are retained; new IDs derive from source identities, never table positions.
"""
import argparse
from collections import Counter
from hashlib import sha256
from datapool_tables import Tables
import json
from pathlib import Path
import re
import unicodedata

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'src/data/gearCatalog.ts'
MARKER = 'export const GEAR_CATALOG: CatalogGearItem[] = '
SOURCES = {'items': 'items', 'clothes': 'clothes_style', 'agents': 'agents_accessories', 'soft': 'soft', 'acpa': 'acpa'}
SECTIONS = [
    ('electronics', 'Электроника и связь', 'Electronics & communications'),
    ('tools', 'Инструменты и техника', 'Tools & technical gear'),
    ('medical', 'Медицина', 'Medical equipment'),
    ('survival', 'Выживание и походы', 'Survival & camping'),
    ('security', 'Взлом и безопасность', 'Security & intrusion'),
    ('wearables', 'Носимое снаряжение', 'Wearable equipment'),
    ('music', 'Музыка и развлечения', 'Music & entertainment'),
    ('household', 'Бытовые предметы', 'Everyday essentials'),
    ('food', 'Еда и напитки', 'Food & drinks'),
    ('consumables', 'Расходники', 'Consumables'),
    ('clothing', 'Одежда и стиль', 'Clothing & style'),
    ('agents', 'Агенты и аксессуары', 'Agents & accessories'),
    ('software', 'Софт для агента', 'Agent software'),
    ('acpa', 'Компоненты силовой брони', 'Powered armor components'),
]
# Editorial navigation only; these groups do not grant mechanical effects.
ITEM_GROUPS = {
    'electronics': {1,2,6,7,11,18,19,20,26,33,36,37,38,39,40,41,45,61,62,63,65,76,77,78,92,94,95,96,104,105,106,118},
    'tools': {13,14,15,17,24,29,54,56,82,83,84,88,91,101},
    'medical': {3,34,35,52,87},
    'survival': {4,12,16,25,27,47,58,64,68,81,97,100,102},
    'security': {9,21,28,32,48,53,55,59,60,69,70,75,80,98,99,119},
    'wearables': {10,46,72,73,74,86,93,103},
    'music': {8,30,31,42,43,44,107,108,109,110,111,112,113,114,115,116},
    'food': {5,66,67,89,90,117},
    'household': {22,23,49,50,51,57,71,79,85},
}


def normalize(value):
    return re.sub(r'[^a-zа-яё0-9]', '', unicodedata.normalize('NFKC', value).lower())


def previous_items():
    text = OUTPUT.read_text(encoding='utf-8') if OUTPUT.exists() else (ROOT / 'src/data/datapoolCatalog.ts').read_text(encoding='utf-8')
    marker = MARKER if OUTPUT.exists() else 'export const DATAPOOL_GEAR: GearItem[] = '
    return json.JSONDecoder().raw_decode(text.split(marker, 1)[1])[0]

def price(value):
    match = re.search(r'(\d[\d,\s]*)\s*(?:[eеэ][bб]|эб)', value, re.I)
    if match:
        return int(re.sub(r'\D', '', match[1]))
    if re.search(r'\b0\b.*[Бб]есплат', value):
        return 0
    raise ValueError('Unrecognized price: ' + value)

def build(tables, previous):
    by_key = {item['sourceKey']: item['id'] for item in previous if 'sourceKey' in item}
    legacy = {(item['sourceKey'].split(':')[1] if item.get('sourceKey', '').startswith('items:') else normalize(item['name'])): item for item in previous if item['id'].startswith('cat-gear-')}
    # Source headings differ from the older truncated import.
    for name, number in [('Чехол для Одежды',103),('Segotari RUSH',110),('Игра Segotari RUSH',116)]:
        old = next((item for item in previous if item['id'] == f'cat-gear-{number}'), None)
        if old:
            legacy[normalize(name)] = old
    items = []
    def add(key, name, section, notes, raw_price, source, old=None, preferred=False):
        identity = f'{source}:{key}'
        item_id = by_key.get(identity) or (old['id'] if old and preferred else 'gear-catalog-' + sha256(identity.encode()).hexdigest()[:16])
        amount = price(raw_price)
        item = dict(id=item_id, catalogId=item_id, sourceKey=identity, name=name, category='Clothing' if section == 'clothing' else 'Consumable' if section == 'consumables' else dict((x[0],x[1]) for x in SECTIONS)[section], section=section, quantity=1, costEb=amount, priceLabel=raw_price, notes=notes + '\n\nЦена в источнике: ' + raw_price, sourceUrl='https://alec-leon.github.io/data-pool/equipment/' + SOURCES[source] + '/')
        if 'ежемесячно' in raw_price.lower():
            item['billingPeriod'] = 'monthly'
        items.append(item)

    for row in tables['items']:
        name, notes, raw_price = row['cells']
        name = name.splitlines()[0]
        old = legacy.get(normalize(name))
        if not old:
            raise ValueError('Missing preserved identity for ' + name)
        number = int(old['id'].rsplit('-',1)[1])
        section = 'consumables' if row['tab'] == 'consumables' else next((group for group, ids in ITEM_GROUPS.items() if number in ids), None)
        if not section:
            raise ValueError('Ungrouped item: ' + name)
        if number in (1,10):
            variants = [('плохого качества',50),('обычного качества',100),('отличного качества',500),('модель за 1 000 eb',1000)] if number == 1 else [('низкая безопасность',50),('средняя безопасность',100),('высокая безопасность',500),('экстремальная безопасность',1000)]
            # Validate the explicit variant prices against the retained source text.
            amounts = {int(re.sub(r'\D','',m)) for m in re.findall(r'(\d[\d,\s]*)\s*(?:[eеэ][bб]|эб)', raw_price + '\n' + notes,re.I)}
            if not {value for _,value in variants}.issubset(amounts):
                raise ValueError('Variant price changed: ' + name)
            for variant, value in variants:
                add(normalize(name)+':'+str(value), name+' ('+variant+')', section, notes, f'{value} eb — {variant}', 'items',old,value==old['costEb'])
        else:
            add(normalize(name),name,section,notes,raw_price,'items',old,True)

    for row in tables['agents']:
        name, notes, raw_price, hl, slots, kind = row['cells']
        extra = '\n'.join(f'{label}: {value}' for label,value in zip(row['headers'][3:],row['cells'][3:]) if value)
        if kind == 'Имплант':
            extra += '\nЭто имплант-агент: запись инвентаря не заменяет установку импланта и учёт HL/слотов.'
        add(normalize(name),name,'agents',notes+'\n'+extra,raw_price,'agents')
    for row in tables['soft']:
        name, vendor, notes, raw_price = row['cells']
        add(normalize(name),name,'software',notes+ ('\nРазработчик: '+vendor if vendor else ''),raw_price,'soft')
    for row in tables['clothes']:
        if row['headers'][:2] != ['Стиль','Штаны']:
            continue
        style = row['cells'][0]
        for garment, raw_price in zip(row['headers'][1:],row['cells'][1:]):
            name = garment+' — '+style
            add(normalize(name),name,'clothing',f'{garment}. Стиль: {style}. Обычная одежда, без автоматически назначаемой защиты.',raw_price,'clothes')
    for row in tables['acpa']:
        if len(row['headers']) != 5 or row['headers'][1] != 'Цена':
            continue
        name, raw_price, *stats = row['cells']
        notes = '\n'.join(f'{label}: {value}' for label,value in zip(row['headers'][2:],stats))
        add(normalize(name),name,'acpa',notes+'\nКомпонент силовой брони: сборка и эффекты учитываются вручную.',raw_price,'acpa')
    if len({item['id'] for item in items}) != len(items) or len({item['sourceKey'] for item in items}) != len(items):
        raise ValueError('Duplicate catalogue identity')
    old_ids = {item['id'] for item in previous if item['id'].startswith('cat-gear-')}
    if not old_ids.issubset({item['id'] for item in items}):
        raise ValueError('Legacy catalogue IDs would be lost')
    return items

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--source-dir', type=Path, default=ROOT / 'audit/source')
    args = parser.parse_args()
    tables, hashes = {}, {}
    for source in SOURCES:
        raw = (args.source_dir / f'gear-{source}.html').read_bytes()
        table = Tables(); table.feed(raw.decode('utf-8'))
        tables[source] = table.rows; hashes[source] = sha256(raw).hexdigest()
    items = build(tables,previous_items())
    sections = [dict(id=key,ru=ru,en=en) for key,ru,en in SECTIONS]
    output = '// Generated by scripts/import-gear.py from saved public Data Pool equipment tables.\n// Source SHA-256: '+json.dumps(hashes,sort_keys=True)+'\nimport type { CatalogGearItem } from "./datapoolCatalog";\n\nexport const GEAR_SECTIONS = '+json.dumps(sections,ensure_ascii=False,indent=2)+';\n\n'+MARKER+json.dumps(items,ensure_ascii=False,indent=2)+';\n'
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding='utf-8') != output:
            raise SystemExit('Gear catalogue differs; regenerate it')
    else:
        OUTPUT.write_text(output,encoding='utf-8')
    print(json.dumps({'items':len(items),'sections':dict(Counter(item['section'] for item in items)),'monthly':sum(item.get('billingPeriod')=='monthly' for item in items)},ensure_ascii=False))

if __name__ == '__main__':
    main()
