"""Import the saved public Data Pool implant tables without executing scripts.

python scripts/import-cyberware.py [--check] [--source PATH]
The source snapshot is not distributed as application code. Download it from
SOURCE_URL to audit/source/implants.html before regenerating. The original 173
catalogue IDs are matched by name, never reassigned by the HTML table order.
Explicit metadata below interprets the retained secondary-source descriptions;
unknown or contradictory rules remain visible rather than invented.
"""

import argparse
from collections import Counter
from hashlib import sha256
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
import unicodedata


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "src/data/cyberwareCatalog.ts"
OLD = ROOT / "src/data/datapoolCatalog.ts"
SOURCE_URL = "https://alec-leon.github.io/data-pool/chrome/implants/"
MARKER = "export const CYBERWARE_CATALOG: CatalogCyberwareItem[] = "


def normalize(value):
    return re.sub(r"[^a-zа-яё0-9]", "", unicodedata.normalize("NFKC", value).lower())


def clean(value):
    return "\n".join(" ".join(line.split()) for line in value.splitlines() if line.strip())


class Tables(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.rows, self.headers, self.divs = [], [], []
        self.row = self.cell = self.cell_tag = None

    def handle_starttag(self, tag, attrs):
        if tag == "div":
            self.divs.append(dict(attrs).get("id", ""))
        elif tag == "table":
            self.headers = []
        elif tag == "tr":
            self.row = []
        elif tag in ("th", "td") and self.row is not None:
            self.cell, self.cell_tag = [], tag
        elif tag in ("br", "p", "li") and self.cell is not None:
            self.cell.append("\n")

    def handle_data(self, data):
        if self.cell is not None:
            self.cell.append(data)

    def handle_endtag(self, tag):
        if tag in ("th", "td") and self.cell is not None:
            self.row.append(clean("".join(self.cell)))
            self.cell = None
        elif tag == "tr" and self.row is not None:
            if self.cell_tag == "th":
                self.headers = self.row
            elif self.row:
                self.rows.append({"cells": self.row, "headers": self.headers[:],
                                  "tab": next((x for x in reversed(self.divs) if x), "")})
            self.row = self.cell_tag = None
        elif tag == "div" and self.divs:
            self.divs.pop()


def rule(hosts, slots=1, **kwargs):
    return {"allowedHosts": hosts.split(), "slots": slots, **kwargs}


def provides(kind, capacity, key=None):
    result = {"type": kind, "capacity": capacity}
    if key:
        result["key"] = key
    return result


def cid(number):
    return "cat-cyber-" + str(number)


def append_note(target, note):
    target["notes"] = (target.get("notes", "") + "\n" + note).strip()


def installation(number, tab):
    # One slot is the Core default for an option; explicit exceptions below.
    if tab == "style":
        result = rule("fashion")
    elif tab == "neuron":
        result = rule("chip" if 22 <= number <= 30 else "neural")
    elif tab == "optic":
        result = rule("eye")
    elif tab == "audio":
        result = rule("audio")
    elif tab in ("internal", "external"):
        result = rule(tab)
    elif tab in ("arm", "leg"):
        result = rule(tab)
    elif tab in ("coat", "universal"):
        result = rule("arm leg")
    elif tab == "2077":
        result = rule("neural")
    elif tab == "2077-mods":
        host = "gorilla" if number <= 167 else "mantis" if number <= 170 else "monowire"
        # Upgrade table specifies no consumption of another cyberarm slot and
        # no numeric upgrade-bank capacity. A zero-slot host marks compatibility;
        # permitted combinations remain a source-book/manual check.
        result = rule(host, 0)
        result["requires"] = [cid({"gorilla": 161, "mantis": 157, "monowire": 159}[host])]
        append_note(result, "Модуль улучшения, не самостоятельный имплант. В источнике не указаны отдельные ПЧ и предел числа модулей; сверяйте допустимую комбинацию с EMK.")
    else:
        raise ValueError("Unknown source table: " + tab)

    specific = {
        11: rule("fashion", requires=[cid(12)], notes="Глаза Настроения требуют Нейролинк; Нейропорт включает его функциональность."),
        12: rule("neural-site", provides=[provides("neural", 5)], maxInstances=1),
        20: rule("neural", provides=[provides("chip", 1)]),
        21: rule("neural", provides=[provides("chip", 1)]),
        31: rule("eye-site", provides=[provides("eye", 3)]),
        35: rule("eye", 3),
        37: rule("eye", 2, paired=True),
        39: rule("eye", 2),
        45: rule("eye-site", provides=[provides("eye", 2)],
                 notes="Спонсируемый глаз включает Хирон. Из трёх стандартных слотов один уже занят встроенным Хироном; доступны два. Вторичный источник не уточняет возможность удаления Хирона."),
        46: rule("eye", 3),
        47: rule("eye", 2, notes="Одна установка работает фонариком; эффект ослепления требует двух сопряжённых установок."),
        48: rule("audio-site", provides=[provides("audio", 3)], maxInstances=1),
        60: rule("audio-site", provides=[provides("audio", 1)], maxInstances=1),
        70: rule("internal", 3),
        75: rule("internal", 2),
        84: rule("internal", 3),
        85: rule("internal", 3, maxInstances=1, notes="Только для Полной Конверсии Тела; наличие ПКТ нужно подтвердить вручную."),
        86: rule("external", 2, requires=[cid(12)]),
        87: rule("external", 2),
        95: rule("external", bodyRequirement=10,
                 notes="ПКТ отменяет требование BODY 10 и штраф брони; при BODY 14+ штраф -2 также не применяется."),
        96: rule("arm-site", provides=[provides("arm", 4)], repeatHumanityFree=True),
        97: rule("arm-site", provides=[provides("arm", 3)], repeatHumanityFree=True,
                 notes="При BODY ниже 8 рука допустима, но даёт -1 к действиям с ней; встроенные опции видны при раскрытии даже если обычно скрываемы."),
        98: rule("arm-site", provides=[provides("arm", 0)], repeatHumanityFree=True),
        99: rule("arm arm-site", 0,
                 notes="Стандартная кисть не занимает слот. В обычной киберруке уже включена без дополнительной ПЧ; отдельная покупка и установка в мясную руку имеют ПЧ из таблицы."),
        100: rule("arm arm-site", provides=[provides("finger", 5)]),
        101: rule("arm", 2, provides=[provides("finger", 8)],
                  notes="Киберпальцы в этой кисти вызывают установочную ПЧ, но не уменьшают максимальную Человечность. Учтите это отдельно при установке пальцев."),
        104: rule("arm", 3),
        105: rule("arm", requires=[cid(104)], requiresSameHost=[cid(104)], notes="Улучшает только интегрированную кибердеку в той же руке; установка в другую руку недопустима."),
        107: rule("arm", 2),
        108: rule("arm", 2),
        109: rule("arm", 2, notes="Встраивается выбранное отдельно купленное одноручное лёгкое, среднее или тяжёлое оружие ближнего боя; сам модуль не выдаёт бесплатное оружие."),
        110: rule("arm", 3),
        111: rule("arm", 2, notes="Встраивается выбранное отдельно купленное одноручное дальнобойное оружие; сам модуль не выдаёт бесплатное оружие."),
        112: rule("arm", notes="Быстросъёмная повторная установка ранее использованной руки не вызывает повторную ПЧ; первая установка новой руки всегда вызывает ПЧ."),
        115: rule("arm", 2),
        117: rule("arm arm-site", additionalMounts=[{"allowedHosts": ["neural"], "slots": 1}],
                  notes="Смартлинк также занимает слот Нейролинка; отдельный Нейролинк не обязателен, если нейрошину предоставляет Нейропорт."),
        118: rule("arm", 2),
        121: rule("arm", 2),
        122: rule("arm", 3),
        123: rule("arm", 3),
        124: rule("arm", 4),
        127: rule("arm", additionalMounts=[{"allowedHosts": ["neural"], "slots": 1}],
                  notes="В источнике одновременно указаны опция Киберруки и опция Нейролинка: резервируется по одному слоту в обеих системах."),
        132: rule("arm", 2),
        133: rule("arm", 2),
        136: rule("leg-site", provides=[provides("leg", 3)]),
        137: rule("leg-site", hostCount=2,
                  provides=[provides("leg", 3, "left"), provides("leg", 3, "right")],
                  notes="Одна покупка и одна ПЧ заменяют обе ноги; у каждой три собственных слота. Встроенные Когти бесплатны по слотам и ПЧ, неотделимы от ног."),
        138: rule("leg-site", hostCount=2,
                  provides=[provides("leg", 2, "left"), provides("leg", 2, "right")],
                  notes="Одна покупка и одна ПЧ заменяют обе ноги; у каждой два собственных слота. Встроенные прыжковые усилители бесплатны по слотам и ПЧ, неотделимы от ног."),
        139: rule("leg leg-site", 0,
                  notes="Стандартная стопа не занимает слот; базовая кибернога уже включает её без отдельной ПЧ."),
        141: rule("leg", 2, paired=True),
        143: rule("leg leg-site"),
        145: rule("leg leg-site", notes="Одна установка допустима; бонус против неудобной обуви требует пары."),
        146: rule("leg", 2, paired=True),
        149: rule("arm leg", 0),
        150: rule("arm leg", 0),
        151: rule("arm leg", 0),
        152: rule("arm leg", 0),
        154: rule("arm leg", notes="Не более одного экстра-сочленения на конечность. Бонус применяется максимум от четырёх конечностей; это предел эффекта, а не общий предел установки."),
        156: rule("neuroport", 0, requires=[cid(160)], maxInstances=3,
                  notes="Источник не задаёт отдельную вместимость опций Нейропорта или расход слота Нейролинка. Учитывается лимит трёх IntraICE, нейрослот не списывается."),
        157: rule("arm", 2, provides=[provides("mantis", 0)],
                  notes="Пара в разных руках даёт бонус лазания, одиночная установка остаётся полноценным оружием. Предел модулей улучшения EMK источник не указывает; сверяйте вручную."),
        158: rule("neural", requires=[cid(163)]),
        159: rule("arm", provides=[provides("monowire", 0)],
                  notes="Предел модулей улучшения EMK источник не указывает; сверяйте допустимую комбинацию вручную."),
        160: rule("neural-site", provides=[provides("neural", 5), provides("chip", 2), provides("neuroport", 0)], maxInstances=1,
                  notes="Включает функциональность Нейролинка, Голофона, Биомонитора, Виртуальности, Хирона, двух разъёмов для щепок и Личного порта. Встроенные функции не занимают дополнительных слотов или отдельной ПЧ."),
        161: rule("arm", 2, provides=[provides("gorilla", 0)],
                  notes="Пара в разных руках даёт дополнительные эффекты BODY 11; одиночная установка остаётся оружием. Предел модулей улучшения EMK источник не указывает; сверяйте вручную."),
        162: rule("arm", 2),
        163: rule("neuroport", 0, requires=[cid(160)], maxInstances=1,
                  notes="Источник не задаёт расход нейрослота для опции Нейропорта. Кибердека приобретается отдельно."),
        164: rule("neural", 2, exclusiveGroup="speedware"),
    }
    result.update(specific.get(number, {}))
    if number in (17, 18):
        result["exclusiveGroup"] = "speedware"
    if number in (32, 36, 43, 140, 142, 144):
        result["paired"] = True
    if 22 <= number <= 30:
        result["repeatHumanityFree"] = True
    if number in (102, 103, 113, 114, 116, 119, 120, 125, 129, 134):
        result["allowedHosts"] = ["arm", "arm-site"]
    if number == 30:
        result["requires"] = [cid(33)]
        append_note(result, "Требуется Хирон, в том числе встроенный в Нейропорт.")
    return result


def weapon(name, category, damage, skill, description, rof=1, capacity=0,
           quality="Standard", ammo="—", **kwargs):
    return {"name": name, "category": category, "damage": damage, "standardRof": rof,
            "magCapacity": capacity, "ammoType": ammo, "concealable": True,
            "notes": description, "skillId": skill, "quality": quality, **kwargs}


def implant_weapon(number, name, description):
    if number in (47, 121):
        return weapon(name, "Exotic", "", "", description,
                      attackRequiresRoll=False, canCrit=False)
    melee = {
        63: ("Light Melee", "1d6", 2, "Excellent"),
        68: ("Very Heavy Melee", "4d6", 1, "Standard"),
        86: ("Heavy Melee", "3d6", 2, "Standard"),
        87: ("Very Heavy Melee", "4d6", 1, "Standard"),
        103: ("Medium Melee", "2d6", 2, "Standard"),
        113: ("Light Melee", "1d6", 2, "Standard"),
        114: ("Medium Melee", "2d6", 2, "Standard"),
        116: ("Medium Melee", "2d6", 2, "Standard"),
        120: ("Heavy Melee", "3d6", 2, "Standard"),
        124: ("Very Heavy Melee", "4d6", 1, "Excellent"),
        135: ("Medium Melee", "1d6", 2, "Excellent"),
        137: ("Light Melee", "1d6", 2, "Standard"),
        143: ("Light Melee", "1d6", 2, "Standard"),
        157: ("Heavy Melee", "3d6", 2, "Excellent"),
        159: ("Heavy Melee", "3d6", 2, "Standard"),
        161: ("Heavy Melee", "3d6", 2, "Excellent"),
    }
    if number in melee:
        category, damage, rof, quality = melee[number]
        result = weapon(name, category, damage, "melee_weapon", description,
                        rof, quality=quality, armorPenetration="half")
        if number in (86, 87):
            result["concealable"] = False
        if number == 137:
            result["name"] = name + " — встроенные Когти"
        if number == 135:
            result["notes"] += "\nВторичный источник прямо указывает 1d6 при классе Medium Melee. Не заменяйте автоматически на 2d6; правило игнорирования SP ниже 11 применяется вручную."
        return result
    if number == 35:
        return weapon(name, "Very Heavy Pistol", "4d6", "handgun", description,
                      capacity=1, ammo="Нестандартная стрела")
    if number in (75, 123):
        profiles = [{"name": "Жакан", "damage": "5d6"}, {"name": "Дробь", "damage": "3d6"}]
        if number == 75:
            # Firebreather only accepts an incendiary shell, not arbitrary ammo.
            return weapon(name, "Shotgun", "5d6", "shoulder_arms", description,
                          capacity=1, ammo="Зажигательный снаряд", damageProfiles=profiles)
        return weapon(name, "Shotgun", "5d6", "shoulder_arms", description,
                      capacity=2, ammo="Дробовик", damageProfiles=profiles)
    if number == 98:
        return weapon(name, "Shotgun", "4d6", "heavy_weapons", description,
                      capacity=32, ammo="Радлайн МагнаСлот", quality="Poor", canCrit=False)
    if number == 108:
        return weapon(name, "Grenade Launcher", "6d6", "heavy_weapons", description,
                      capacity=1, ammo="Граната")
    if number == 122:
        return weapon(name, "Shotgun", "", "shoulder_arms", description,
                      capacity=1, ammo="Сеть", canCrit=False)
    if number == 125:
        return weapon(name, "Exotic", "", "", description,
                      capacity=1, ammo="Батарея", canCrit=False, attackRequiresRoll=False)
    if number == 132:
        return weapon(name, "Shotgun", "", "shoulder_arms", description,
                      capacity=1, ammo="3 дозы вещества", canCrit=False)
    if number == 162:
        profiles = [
            {"name": "Ракета", "damage": "8d6", "category": "Rocket Launcher",
             "skillId": "heavy_weapons", "magCapacity": 1, "ammoType": "Ракета"},
            {"name": "Граната", "damage": "6d6", "category": "Grenade Launcher",
             "skillId": "heavy_weapons", "magCapacity": 1, "ammoType": "Граната"},
        ]
        return weapon(name, "Rocket Launcher", "8d6", "heavy_weapons", description,
                      capacity=1, ammo="Ракета", damageProfiles=profiles)
    if number == 167:
        profiles = [
            {"name": "Тяжёлый удар", "damage": "3d6", "category": "Heavy Melee",
             "skillId": "melee_weapon", "standardRof": 2, "quality": "Excellent", "armorPenetration": "half"},
            {"name": "Очень тяжёлый удар", "damage": "4d6", "category": "Very Heavy Melee",
             "skillId": "melee_weapon", "standardRof": 1, "quality": "Excellent", "armorPenetration": "half"},
        ]
        return weapon(name, "Heavy Melee", "3d6", "melee_weapon", description,
                      rof=2, quality="Excellent", armorPenetration="half", damageProfiles=profiles)
    return None


def old_items():
    candidates = [(OUTPUT, MARKER), (OLD, "export const DATAPOOL_CYBERWARE: CatalogCyberwareItem[] = ")]
    for path, marker in candidates:
        if path.exists():
            text = path.read_text(encoding="utf-8")
            if marker in text:
                return json.JSONDecoder().raw_decode(text.split(marker, 1)[1])[0]
    raise ValueError("Need the existing catalogue to preserve IDs by name")


def build(rows, previous):
    by_name = {normalize(item["name"]): item for item in previous}
    result = []
    categories = {"style": "Fashionware", "neuron": "Neuralware", "optic": "Cyberoptics",
                  "audio": "Cyberaudio", "internal": "Internal", "external": "External",
                  "arm": "Cyberlimb", "leg": "Cyberlimb", "coat": "Cyberlimb",
                  "universal": "Cyberlimb", "2077": "Neuralware", "2077-mods": "Cyberlimb"}
    for row in rows:
        cells, tab = row["cells"], row["tab"]
        if len(cells) not in (4, 6):
            raise ValueError("Unexpected columns: " + str(cells))
        source_name = cells[0]
        old = by_name.get(normalize(source_name))
        if old is None:
            raise ValueError("New or unmatched source implant: " + source_name)
        number = int(old["id"].rsplit("-", 1)[1])
        upgrade = len(cells) == 4
        name = old["name"]
        facility, description, price, hl, book = ("", cells[1], cells[2], "", cells[3]) if upgrade else cells[1:]
        amount = re.search(r"\d[\d,\s]*", price)
        cost = int(re.sub(r"\D", "", amount.group())) if amount else 0
        if number == 149:
            cost = 100  # Source OCR has literal lowercase L in "l00eb".
        humanity = 0 if not hl or hl.lower() == "нет" else int(re.match(r"\d+", hl).group())
        match_formula = re.search(r"\(([^)]+)\)", hl)
        formula = match_formula.group(1) if match_formula else "0" if hl.lower() == "нет" else "Не указано"
        install_rule = installation(number, tab)
        category = categories[tab]
        if tab == "2077":
            category = "Cyberlimb" if number in (157, 159, 161, 162) else "Neuralware"
        item = {"id": old["id"], "catalogId": old["id"], "name": name,
                "category": category, "kind": "upgrade" if upgrade else "chip" if 22 <= number <= 30 else "implant",
                "installLocation": ", ".join(install_rule["allowedHosts"]),
                "installationFacility": facility, "humanityCost": humanity,
                "humanityCostKnown": not upgrade, "humanityCostFormula": formula,
                "costEb": cost, "description": description,
                "sourceBook": book or "Не указан в источнике", "sourceUrl": SOURCE_URL + "#" + tab,
                "installRule": install_rule}
        if re.search(r"боргирован", description, re.I):
            item["borgware"] = True
        if price:
            item["description"] += "\n\nЦена в источнике: " + price
        if hl:
            item["description"] += "\nПЧ в источнике: " + hl
        if number in (26, 28):
            item["description"] += "\nВ таблице есть несколько цен; показана первая. Перед покупкой уточните вариант (навык x1/x2 или публичная/частная личность)."
        if upgrade:
            item["description"] += "\nПЧ и отдельный расход слотов в таблице улучшений не указаны. Это не подтверждение нулевой ПЧ; уточните правила установки по EMK."
        generated_weapon = implant_weapon(number, name, description)
        if generated_weapon:
            generated_weapon["sourceUrl"] = item["sourceUrl"]
            item["weapon"] = generated_weapon
        if number in (109, 111):
            item["weaponMount"] = "melee" if number == 109 else "ranged"
        if description not in item["description"] or "�" in name + item["description"]:
            raise ValueError("Description loss/encoding: " + name)
        result.append(item)
    assert len(result) == 173
    assert {x["id"] for x in result} == {x["id"] for x in previous}
    result.sort(key=lambda item: int(item["id"].rsplit("-", 1)[1]))
    return result


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=ROOT / "audit/source/implants.html")
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    source = args.source.read_bytes()
    tables = Tables()
    tables.feed(source.decode("utf-8"))
    items = build(tables.rows, old_items())
    text = ("// Generated 2026-10-24 from the saved public Data Pool implant tables.\n"
            "// Secondary reference: full source descriptions retained, uncertain rules explicitly annotated.\n"
            "// Source SHA-256: " + sha256(source).hexdigest() + "\n"
            "import type { CatalogCyberwareItem } from './datapoolCatalog';\n\n" +
            MARKER + json.dumps(items, ensure_ascii=False, indent=2) + ";\n")
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != text:
            raise SystemExit("Cyberware catalogue differs; regenerate it")
    else:
        OUTPUT.write_text(text, encoding="utf-8")
    print(json.dumps({"items": len(items), "kind": dict(Counter(x["kind"] for x in items)),
                      "metadata": sum("installRule" in x for x in items),
                      "weapons": sum("weapon" in x for x in items),
                      "weaponMounts": sum("weaponMount" in x for x in items),
                      "borgware": sum(x.get("borgware", False) for x in items)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
