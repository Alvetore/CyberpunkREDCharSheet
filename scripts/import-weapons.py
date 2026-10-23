"""Rebuild the existing weapon catalogue from a saved public Data Pool HTML page.

No JavaScript is executed. Existing IDs and duplicate listings are retained for
saved-character compatibility. Data Pool is a secondary reference, not an RTG
rules authority; the small publisher overrides below are deliberately explicit.
Usage: python scripts/import-weapons.py [--check]
"""

import argparse
from collections import Counter
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import unicodedata


ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "src/data/datapoolCatalog.ts"
SOURCE = ROOT / "audit/source/weapons.html"
SOURCE_URL = "https://alec-leon.github.io/data-pool/equipment/weapons/"
MARKER = "export const DATAPOOL_WEAPONS: CatalogWeaponItem[] = "


def normalize(value):
    return re.sub(r"[^a-zа-яё0-9]", "", unicodedata.normalize("NFKC", value).lower())


def clean(value):
    return "\n".join(" ".join(line.split()) for line in value.splitlines() if line.strip())


class WeaponTables(HTMLParser):
    """Read table cells and headers, retaining paragraph/line boundaries."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.rows = []
        self.headers = []
        self.row = None
        self.cell = None
        self.cell_tag = None
        self.divs = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "div":
            self.divs.append(attrs.get("id", ""))
        elif tag == "table":
            self.headers = []
        elif tag == "tr":
            self.row = []
        elif tag in ("td", "th") and self.row is not None:
            self.cell = []
            self.cell_tag = tag
        elif tag in ("br", "p", "li") and self.cell is not None:
            self.cell.append("\n")

    def handle_data(self, data):
        if self.cell is not None:
            self.cell.append(data)

    def handle_endtag(self, tag):
        if tag in ("td", "th") and self.cell is not None:
            self.row.append(clean("".join(self.cell)))
            self.cell = None
        elif tag == "tr" and self.row is not None:
            if self.cell_tag == "th":
                self.headers = self.row
            else:
                self.rows.append({"headers": self.headers[:], "cells": self.row,
                                  "tab": next((x for x in reversed(self.divs) if x), "")})
            self.row = None
            self.cell_tag = None
        elif tag == "div" and self.divs:
            self.divs.pop()


def first_number(value, default=0):
    match = re.search(r"\d+", value)
    return int(match.group()) if match else default


def get_fields(row):
    fields = dict(zip((normalize(h) for h in row["headers"]), row["cells"]))
    return fields


def get_field(fields, *names):
    return next((fields[normalize(name)] for name in names if normalize(name) in fields), "")


def quality_of(notes):
    # Ignore conditional future quality (1TruLuv) and comparisons to other items.
    if "после подстройки" in notes.lower() or "после настройки" in notes.lower():
        return "Standard"
    if re.search(r"(?:плохого|низкого)\s+качества", notes, re.I):
        return "Poor"
    if re.search(r"(?:отличного|высокого)\s+качества|отл\.\s*качеств", notes, re.I):
        return "Excellent"
    return "Standard"


GENERIC = {
    1: ("Medium Pistol", "handgun"), 2: ("Heavy Pistol", "handgun"),
    3: ("Very Heavy Pistol", "handgun"), 4: ("SMG", "handgun"),
    5: ("Heavy SMG", "handgun"), 6: ("Shotgun", "shoulder_arms"),
    7: ("Assault Rifle", "shoulder_arms"), 8: ("Sniper Rifle", "shoulder_arms"),
    9: ("Grenade Launcher", "heavy_weapons"), 10: ("Rocket Launcher", "heavy_weapons"),
    11: ("Bow", "archery"), 12: ("Light Melee", "melee_weapon"),
    13: ("Medium Melee", "melee_weapon"), 14: ("Heavy Melee", "melee_weapon"),
    15: ("Very Heavy Melee", "melee_weapon"),
}


def category_of(number, row, notes, skill, ammo):
    if number in GENERIC:
        return GENERIC[number][0]
    # The mundane brand rows belong to these contiguous, source-listed classes.
    # Fisher Kitty is the explicit exception: an exotic Heavy Pistol using Archery.
    for start, end, category in ((16, 22, "Medium Pistol"), (23, 28, "Heavy Pistol"),
            (30, 36, "Very Heavy Pistol"), (37, 42, "SMG"), (43, 48, "Heavy SMG"),
            (49, 55, "Shotgun"), (56, 62, "Assault Rifle"), (63, 69, "Sniper Rifle"),
            (70, 75, "Bow"), (76, 81, "Crossbow"), (82, 87, "Grenade Launcher"),
            (88, 93, "Rocket Launcher")):
        if start <= number <= end:
            return category
    # Use an explicit classification, where present, before descriptive prose.
    classification = re.search(r"Классификация:\s*([^\n]+)", notes, re.I)
    text = classification.group(1) if classification else notes
    # Longest/specific classes go first. Multi-class items stay Exotic below.
    patterns = [
        (r"(?:очень|оч\.?|о\.?)\s*тяж[её]л\w*\s+пистолет|\bот\s+пистолет", "Very Heavy Pistol"),
        (r"тяж[её]л\w*\s+(?:пистолет[ -]пулем[её]т|пп)\b|\bтпп\b", "Heavy SMG"),
        (r"тяж[её]л\w*\s+пистолет", "Heavy Pistol"),
        (r"средн\w*\s+пистолет", "Medium Pistol"),
        (r"снайперск\w*\s+винтовк", "Sniper Rifle"),
        (r"штурмов\w*\s+винтовк", "Assault Rifle"),
        (r"дробовик", "Shotgun"),
        (r"гранатом[её]т", "Grenade Launcher"),
        (r"ракетн\w*\s+установк|ракетом[её]т|ракетниц", "Rocket Launcher"),
        (r"арбалет", "Crossbow"),
        (r"\bлук\b", "Bow"),
        (r"пистолет[ -]пулем[её]т|\bпп\b", "SMG"),
    ]
    # The melee Type column is an explicit source classification.
    if len(row["cells"]) == 8 and "obb" in row["tab"]:
        kind = normalize(row["cells"][1])
        return {"легкое": "Light Melee", "лёгкое": "Light Melee",
                "среднее": "Medium Melee", "тяжелое": "Heavy Melee",
                "отяжелое": "Very Heavy Melee", "очтяжелое": "Very Heavy Melee"}.get(kind, "Exotic")
    if len(re.findall(r"\d+d6", row["cells"][2])) > 1 and not classification:
        return "Exotic"
    for pattern, category in patterns:
        if re.search(pattern, text, re.I):
            return category
    # Ordinary brand tables specify ammunition even when description lacks class.
    if 16 <= number <= 93:
        a = normalize(ammo)
        if skill == "handgun":
            if "автоогонь" in row["cells"][1].lower():
                return "Heavy SMG" if "тпистолет" in a and "отпистолет" not in a else "SMG"
            if "отпистолет" in a:
                return "Very Heavy Pistol"
            if "тпистолет" in a:
                return "Heavy Pistol"
            if "спистолет" in a:
                return "Medium Pistol"
        if skill == "shoulder_arms":
            return "Shotgun" if "дробовик" in a else "Assault Rifle"
        if skill == "heavy_weapons":
            return "Grenade Launcher" if "гранат" in a else "Rocket Launcher"
        if skill == "archery":
            return "Crossbow" if number >= 76 else "Bow"
    return "Exotic"


def skill_of(number, row, notes):
    if number in GENERIC:
        return GENERIC[number][1]
    if len(row["cells"]) == 8 and "obb" in row["tab"]:
        return "melee_weapon"
    skill = row["cells"][1].lower()
    if "пилотирование" in skill:
        return "pilot_air"
    if "кр.калибра" in skill or "тяжёлое оружие" in skill or "крупного калибра" in skill:
        return "heavy_weapons"
    if "тактическое" in skill or "длинноствольное" in skill:
        return "shoulder_arms"
    if "лук" in skill:
        return "archery"
    if "пистолет" in skill or "короткоствольное" in skill:
        return "handgun"
    if skill.strip() == "автоогонь":
        return "autofire"
    raise ValueError("Unrecognized skill for " + row["cells"][0])


def profile(name, damage, category, skill, rof=1, capacity=None, ammo=None, quality=None):
    result = {"name": name, "damage": damage, "category": category, "skillId": skill,
              "standardRof": rof}
    if capacity is not None:
        result["magCapacity"] = capacity
    if ammo is not None:
        result["ammoType"] = ammo
    if quality is not None:
        result["quality"] = quality
    return result


def profiles_of(number, formulas, category, skill):
    """Modes are explicit interpretations of the full saved source description."""
    p = profile
    if number in (6, 49, 50, 51, 52, 53, 54, 121, 126, 127, 128, 129, 131, 194, 200):
        return [p("Жакан", "5d6", "Shotgun", "shoulder_arms"),
                p("Дробь", "3d6", "Shotgun", "shoulder_arms")]
    if number == 29:
        return [p("Мини-гарпун (без критической травмы)", "2d6", "Heavy Pistol", "archery", 2),
                p("Разряд: два гарпуна, напрямую по HP", "2d6", "Exotic", "archery"),
                p("Разряд: три и более гарпунов, напрямую по HP", "3d6", "Exotic", "archery")]
    if number == 57:
        return [p("Винтовка", "5d6", "Assault Rifle", "shoulder_arms", capacity=25, ammo="Винтовка"),
                p("Гранатомёт", "6d6", "Grenade Launcher", "heavy_weapons", capacity=1, ammo="Граната")]
    if number == 111:
        return [p("Очень тяжёлый пистолет", "4d6", "Very Heavy Pistol", "handgun"),
                p("Тяжёлый ПП", "3d6", "Heavy SMG", "handgun")]
    if number == 113:
        return [p("Пистолет", "4d6", "Very Heavy Pistol", "handgun", capacity=8, ammo="ОТ Пистолет"),
                p("Дробовик: жакан", "5d6", "Shotgun", "shoulder_arms", capacity=2, ammo="Дробовик"),
                p("Дробовик: дробь", "3d6", "Shotgun", "shoulder_arms", capacity=2, ammo="Дробовик")]
    if number == 115:
        return [p("Обычный режим", "2d6", "Medium Pistol", "handgun", 2),
                p("ГипурррВзрыв (все оставшиеся патроны, минимум 4)", "4d6", "Medium Pistol", "handgun")]
    if number in (117, 132):
        return [p("ПП", "2d6", "SMG", "handgun", capacity=30, ammo="С Пистолет"),
                p("Дробовик: жакан", "5d6", "Shotgun", "shoulder_arms", capacity=3, ammo="Дробовик"),
                p("Дробовик: дробь", "3d6", "Shotgun", "shoulder_arms", capacity=3, ammo="Дробовик")]
    if number in (118, 133):
        return [p("Тяжёлый пистолет", "3d6", "Heavy Pistol", "handgun", 2, 8, "Т Пистолет"),
                p("ПП", "2d6", "SMG", "handgun", capacity=30, ammo="С Пистолет"),
                p("Штурмовая винтовка", "5d6", "Assault Rifle", "shoulder_arms", capacity=25, ammo="Винтовка")]
    if number in (130, 157):
        return [p("Дробовик: жакан", "5d6", "Shotgun", "shoulder_arms", capacity=4, ammo="Дробовик"),
                p("Дробовик: дробь", "3d6", "Shotgun", "shoulder_arms", capacity=4, ammo="Дробовик"),
                p("Ракета", "8d6", "Rocket Launcher", "heavy_weapons", capacity=2, ammo="Ракета")]
    if number == 136:
        return [p("Винтовка", "5d6", "Assault Rifle", "shoulder_arms", capacity=20, ammo="Винтовка"),
                p("Гранатомёт", "6d6", "Grenade Launcher", "heavy_weapons", capacity=2, ammo="Граната")]
    if number == 147:
        return [p("Ракета (ёмкость уточнить по книге)", "8d6", "Rocket Launcher", "heavy_weapons", capacity=0, ammo="Ракета"),
                p("Подствольная граната (ёмкость уточнить по книге)", "6d6", "Grenade Launcher", "heavy_weapons", capacity=0, ammo="Граната")]
    if number == 152:
        return [p("Гарпун: ближний бой", "4d6", "Very Heavy Melee", "melee_weapon"),
                p("Гарпун: выстрел (таблица лука, половина SP)", "4d6", "Bow", "heavy_weapons", capacity=1)]
    if number == 160:
        return [p("Арбалет", "4d6", "Crossbow", "archery", capacity=1, ammo="Стрела"),
                p("Винтовка (Archery)", "5d6", "Assault Rifle", "archery", capacity=10, ammo="Винтовка")]
    if number in (163, 165):
        return [p("Средний клинок", "2d6", "Medium Melee", "melee_weapon", 2),
                p("Очень тяжёлый клинок", "4d6", "Very Heavy Melee", "melee_weapon", quality="Excellent")]
    if number == 166:
        return [p("Шоковая дубинка", "2d6", "Medium Melee", "melee_weapon", 2, 8, "Батарея"),
                p("Микроволновка: без прямого урона, см. описание", "", "Very Heavy Pistol", "handgun", 1, 8, "Батарея")]
    if number in (191, 192, 193):
        full, low = ("5d6", "4d6") if number == 192 else ("3d6", "2d6")
        cls = "Assault Rifle" if number == 192 else "SMG" if number == 191 else "Heavy SMG"
        return [p("Одиночный выстрел: расход 3 патрона", full, cls, skill),
                p("В магазине менее 3 патронов", low, cls, skill)]
    if number == 195:
        return [p("Обычный выстрел", "3d6", "Heavy Pistol", "handgun", 2),
                p("Прицельный выстрел", "4d6", "Heavy Pistol", "handgun")]
    if number == 180:
        return [p("BODY до 8, полная броня", "4d6", "Very Heavy Melee", "melee_weapon"),
                p("BODY 9+, полная броня, особый крит (см. описание)", "5d6", "Very Heavy Melee", "melee_weapon")]
    if len(formulas) > 1:
        # Refuse newly encountered ambiguity rather than silently pick a die pool.
        raise ValueError("Unreviewed multiple damage modes: " + str(number))
    return []


def add_mode_rules(number, profiles):
    """Only exceptions stated in the retained source text are automated here."""
    if number == 29:
        for mode in profiles:
            mode["canCrit"] = False
        for mode in profiles[1:]:
            mode["armorPenetration"] = "ignore"
    if number == 111:
        profiles[0]["autofireLimit"] = 0
        profiles[1]["autofireLimit"] = 3
    if number in (118, 133):
        for mode, limit in zip(profiles, (0, 3, 4)):
            mode["autofireLimit"] = limit
    if number in (117, 132):
        for mode, limit in zip(profiles, (3, 0, 0)):
            mode["autofireLimit"] = limit
    if number == 152:
        for mode in profiles:
            mode["armorPenetration"] = "half"
    if number == 163:
        profiles[0]["quality"] = "Standard"
    if number == 166:
        for mode in profiles:
            mode["canCrit"] = False
    if number == 180:
        for mode in profiles:
            mode["armorPenetration"] = "none"
        profiles[1]["bodyRequirement"] = 9


def rebuild(existing, rows):
    by_name = {normalize(row["cells"][0]): row for row in rows
               if row["cells"] and "урон" in [normalize(h) for h in row["headers"]]}
    rebuilt = []
    for old in existing:
        number = int(old["id"].rsplit("-", 1)[1])
        name = "Балистический Гарпун от СлэмДэнс" if number == 152 else old["name"]
        row = by_name.get(normalize(name))
        if row is None:
            raise ValueError("No source row: " + old["id"] + " " + name)
        fields = get_fields(row)
        raw_damage = get_field(fields, "Урон")
        description = get_field(fields, "Описание", "Примечание")
        features = get_field(fields, "Особенности")
        ammo = get_field(fields, "Магазин")
        raw_rof = get_field(fields, "ROF")
        notes = "\n\n".join(part for part in (features, description) if part)
        notes += ("\n\n" if notes else "") + "Параметры источника: " + "; ".join(
            h + ": " + c.replace("\n", " / ") for h, c in zip(row["headers"], row["cells"])
            if normalize(h) not in ("название", "описание", "примечание", "особенности") and c)
        skill = skill_of(number, row, notes)
        # These source descriptions explicitly override their own Skill columns.
        if number == 29:
            skill = "archery"
        category = category_of(number, row, notes, skill, ammo)
        formulas = list(dict.fromkeys(re.findall(r"\d+d6(?:\s*[+-]\s*\d+)?", raw_damage)))
        profiles = profiles_of(number, formulas, category, skill)
        add_mode_rules(number, profiles)
        quality = quality_of(notes)
        capacity = first_number(ammo) if ammo else 0
        weapon = {"id": old["id"], "name": name, "category": category,
                  "damage": profiles[0]["damage"] if profiles else formulas[0] if formulas else "",
                  "standardRof": first_number(raw_rof, 1), "magCapacity": capacity,
                  "currentAmmo": capacity, "ammoType": ammo or "—",
                  "concealable": get_field(fields, "Можно скрыть").lower() == "да",
                  "costEb": first_number(re.sub(r"(?<=\d)\s+(?=\d)", "", get_field(fields, "Цена"))), "notes": notes,
                  "quality": quality, "skillId": skill, "sourceUrl": SOURCE_URL + "#" + row["tab"]}
        if profiles:
            weapon["damageProfiles"] = profiles
            base = profiles[0]
            for key in ("category", "skillId", "standardRof", "magCapacity", "ammoType", "quality", "armorPenetration", "canCrit"):
                if key in base:
                    weapon[key] = base[key]
            weapon["currentAmmo"] = weapon["magCapacity"]
        limit = re.search(r"автоогонь\s*\([^)]*?(\d+)\)", notes, re.I)
        if limit:
            weapon["autofireLimit"] = int(limit.group(1))
        if number == 97:
            weapon["autofireLimit"] = 4
        if profiles and "autofireLimit" in profiles[0]:
            weapon["autofireLimit"] = profiles[0]["autofireLimit"]
        if number in (96, 150, 162, 169):
            weapon["canCrit"] = False
        # Publisher errata: Weapon Rebalance (July 2026), Black Chrome v1.5.
        if number == 123:
            weapon.update(magCapacity=35, currentAmmo=35)
            weapon["notes"] += "\n\nRTG Weapon Rebalance (июль 2026): ёмкость магазина исправлена на 35 патронов."
        if number in (117, 132):
            weapon["costEb"] = 500
            weapon["notes"] += "\n\nRTG Black Chrome v1.5: цена Militech Mastiff — 500 eb."
        if number == 114:
            weapon["quality"] = "Excellent"
        if number == 147:
            weapon["notes"] += "\n\nВторичный источник противоречив: таблица указывает 2 гранаты / 1 ракету, описание — ракетницу на 2 выстрела. Сверьте ёмкость с Woodchipper's Garage; боеприпасы учитываются вручную."
        # Generic assault rifle retains the Core capacity, independent of brands.
        if number == 7:
            weapon.update(magCapacity=25, currentAmmo=25)
        if not weapon["damage"]:
            weapon["notes"] += "\n\nНет обычного броска урона. Примените особый эффект из описания вручную."
        if "�" in weapon["name"] + weapon["notes"]:
            raise ValueError("Replacement character in source: " + name)
        assert description in weapon["notes"], "Full source description must be retained"
        for damage in [weapon["damage"]] + [p["damage"] for p in profiles]:
            if damage and not re.fullmatch(r"\d+d6(?:[+-]\d+)?", damage):
                raise ValueError("Invalid damage formula: " + damage)
        rebuilt.append(weapon)
    assert len(rebuilt) == 200 and [w["id"] for w in rebuilt] == [w["id"] for w in existing]
    return rebuilt


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Verify deterministic output without writing")
    args = parser.parse_args()
    text = CATALOG.read_text(encoding="utf-8")
    prefix, current = text.split(MARKER, 1)
    existing, end = json.JSONDecoder().raw_decode(current)
    source = WeaponTables()
    source.feed(SOURCE.read_text(encoding="utf-8"))
    rebuilt = rebuild(existing, source.rows)
    comment = ("// Weapon data regenerated 2026-10-23 from saved public Data Pool HTML.\n"
               "// Secondary reference; full descriptions retained. Explicit RTG 2026 WAA and Black Chrome v1.5 overrides below.\n")
    prefix = re.sub(r"// Weapon data regenerated[^\n]*\n// Secondary reference[^\n]*\n$", "", prefix)
    result = prefix + comment + MARKER + json.dumps(rebuilt, ensure_ascii=False, indent=2) + current[end:]
    if args.check:
        if result != text:
            raise SystemExit("Catalogue differs; run python scripts/import-weapons.py")
    else:
        CATALOG.write_text(result, encoding="utf-8")
    print(json.dumps({"weapons": len(rebuilt), "fullDescriptions": len(rebuilt),
                      "profiles": sum(len(w.get("damageProfiles", [])) for w in rebuilt),
                      "categories": dict(Counter(w["category"] for w in rebuilt)),
                      "quality": dict(Counter(w["quality"] for w in rebuilt))}))


if __name__ == "__main__":
    main()
