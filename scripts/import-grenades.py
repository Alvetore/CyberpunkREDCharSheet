"""Import grenade variants from a saved public Data Pool weapons page.

python scripts/import-grenades.py [--source PATH] [--check]
The stdlib-only parser never executes source scripts. IDs derive from names,
not table positions. Conditional damage and exotic effects remain descriptive.
"""
import argparse
from hashlib import sha256
import json
from pathlib import Path
import re
import unicodedata

from datapool_tables import Tables


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'audit/source/weapons-current.html'
OUTPUT = ROOT / 'src/data/grenadeCatalog.ts'
SOURCE_URL = 'https://alec-leon.github.io/data-pool/equipment/weapons/'
MARKER = 'export const GRENADE_CATALOG: CatalogWeaponItem[] = '

# Exact identities also detect source drift rather than silently omitting items.
EXPLOSIVES = {
    'Бронебойные': 'Бронебойная граната',
    'С Биотоксином': 'Граната с биотоксином',
    'С ядом': 'Граната с ядом',
    'Свето-шумовые': 'Светошумовая граната',
    'ЭМИ': 'ЭМИ-граната',
    'Дымовые': 'Дымовая граната',
    'Зажигательные': 'Зажигательная граната',
    'Усыпляющие': 'Усыпляющая граната',
    'Слезоточивые': 'Слезоточивая граната',
    'Граната Арахнид': 'Граната Арахнид',
    'КТех Охранная граната': 'КТех Охранная граната',
    'Граната с CO2': 'Граната с CO2',
    'Молотов': 'Молотов',
    'Граната Торнадо Сюрикенов': 'Граната Торнадо Сюрикенов',
    'Водородный Микро-Компрессор': 'Водородный Микро-Компрессор',
    'Хроматическая Рейв-Граната Hello Cutie': 'Хроматическая Рейв-Граната Hello Cutie',
}
MICRO = 'Водородный Микро-Компрессор'
AEROSOL = 'Аэрозольные Боеприпасы'
SMART = 'Улучшенный умный боеприпас'
DIRECT_DAMAGE = {
    'Бронебойные': '6d6',
    'Зажигательные': '6d6',
    'КТех Охранная граната': '5d6',
    'Молотов': '5d6',
    'Граната Торнадо Сюрикенов': '6d6',
    MICRO: '6d6',
}
THROW_NOTES = (
    'Метание: ЛВК (DEX) + Атлетика + 1d10; максимум 25 м. '
    'Используйте СЛ гранатомёта: 0–6 м — 16, 7–12 м — 15, 13–25 м — 15. '
    'Бросок расходует одну гранату независимо от попадания. '
    'Область взрыва — 10×10 м; рассеивание, уклонение, укрытия и особые '
    'эффекты определяются вручную по правилам и описанию.'
)


def identity(name):
    normalized = unicodedata.normalize('NFKC', name).casefold()
    return 'grenade-' + sha256(normalized.encode('utf-8')).hexdigest()[:16]


def price(raw, smart=False):
    # The 2070s row lists 50 eb per ten rounds and 500 eb per one grenade.
    if smart:
        match = re.search(r'(\d+)\s*eb[^\n]*?за\s*1\s*Гранату', raw, re.I)
    else:
        # The source also spells the currency "ed" for two grenade rows.
        match = re.match(r'\s*(\d+)\s*(?:eb|ed|еb|еЬ)\b', raw, re.I)
    if not match:
        raise ValueError('Unrecognized grenade unit price: ' + raw)
    return int(match[1])


def build(rows):
    result, seen = [], set()
    for row in rows:
        tab, cells = row['tab'], row['cells']
        if tab == 'explosives' and len(cells) == 5 and 'граната' in cells[4].lower():
            name, source_damage, description, raw_price, source_type = cells
            if name not in EXPLOSIVES:
                raise ValueError('New grenade needs mechanical review: ' + name)
            display_name = EXPLOSIVES[name]
        elif tab == 'ammo' and cells[0] == AEROSOL:
            name, source_type, description, raw_price = cells
            source_damage, display_name = '', 'Аэрозольная граната'
        elif tab == 'ammo-77' and cells[0] == SMART:
            name, description, source_type, raw_price = cells
            source_damage, display_name = '', 'Улучшенная умная граната (2070-е)'
        else:
            continue

        if name in seen:
            raise ValueError('Duplicate grenade identity: ' + name)
        seen.add(name)
        damage = DIRECT_DAMAGE.get(name, '')
        if damage and source_damage != damage:
            raise ValueError('Damage changed; review required: ' + name)
        notes = description + '\n\n'
        notes += f'Название в источнике: {name}.\n'
        notes += f'Тип / совместимость в источнике: {source_type}.\n'
        notes += f'Цена в источнике: {raw_price}.\n'
        if source_damage:
            notes += f'Урон в таблице источника: {source_damage}.\n'
        if name == MICRO:
            notes += (
                'Не является обычной гранатой мгновенного действия: активация '
                'требует полного погружения в жидкость, затем ожидания 30 секунд '
                '(10 раундов). Активация, расход и детонация отмечаются вручную; '
                'бросок урона 6d6 применяется только при детонации.\n'
            )
        else:
            notes += THROW_NOTES + '\n'
        if name in ('С Биотоксином', 'С ядом'):
            notes += (
                'Указанный урон наносится только после проваленной проверки '
                'сопротивления цели, игнорирует броню и не является обычным '
                'взрывным уроном. Применяйте его вручную.\n'
            )
        elif not damage:
            notes += 'Обычный взрывной урон не задан; применяйте особый эффект вручную.\n'
        if name == SMART:
            notes += (
                'Вариант из раздела 2070-х: совместимость, повторная атака '
                'и итоговый урон определяются вручную по правилам этого раздела.\n'
            )
        result.append({
            'id': identity(name),
            'name': display_name,
            'category': 'Thrown Grenade',
            'damage': damage,
            'standardRof': 1,
            'magCapacity': 1,
            'currentAmmo': 1,
            'ammoType': 'Grenade',
            'concealable': True,
            'notes': notes.rstrip(),
            'quality': 'Standard',
            'skillId': 'athletics',
            'sourceUrl': SOURCE_URL + '#' + tab,
            'armorPenetration': 'none',
            'canCrit': bool(damage),
            'attackRequiresRoll': name != MICRO,
            'consumable': True,
            'costEb': price(raw_price, smart=name == SMART),
        })
    expected = set(EXPLOSIVES) | {AEROSOL, SMART}
    if seen != expected or len(result) != 18:
        raise ValueError(f'Unexpected grenade set; missing={expected - seen}, extra={seen - expected}')
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, default=SOURCE, help='Saved Data Pool weapons HTML')
    parser.add_argument('--check', action='store_true', help='Verify output without writing')
    args = parser.parse_args()
    html = args.source.read_bytes()
    tables = Tables()
    tables.feed(html.decode('utf-8'))
    grenades = build(tables.rows)
    generated = (
        '// Generated by scripts/import-grenades.py from saved public Data Pool weapons tables.\n'
        '// Secondary reference; conditional and exotic effects require manual resolution.\n'
        f'// Source SHA-256: {sha256(html).hexdigest()}\n'
        'import type { CatalogWeaponItem } from "./datapoolCatalog";\n\n'
        + MARKER + json.dumps(grenades, ensure_ascii=False, indent=2) + ';\n'
    )
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding='utf-8') != generated:
            raise SystemExit('Grenade catalogue differs; run python scripts/import-grenades.py')
    else:
        OUTPUT.write_text(generated, encoding='utf-8')
    print(json.dumps({
        'grenades': len(grenades),
        'damageEntries': sum(bool(item['damage']) for item in grenades),
        'utilityOrConditional': sum(not item['damage'] for item in grenades),
        'delayedActivation': sum(not item['attackRequiresRoll'] for item in grenades),
    }))


if __name__ == '__main__':
    main()
