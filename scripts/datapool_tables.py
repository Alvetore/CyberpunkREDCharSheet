"""Read static Data Pool HTML tables without executing page scripts."""
from html.parser import HTMLParser

def clean(value):
    return '\n'.join(' '.join(line.split()) for line in value.splitlines() if line.strip())

class Tables(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.rows, self.headers, self.divs = [], [], []
        self.row = self.cell = self.cell_tag = None

    def handle_starttag(self, tag, attrs):
        if tag == 'div':
            self.divs.append(dict(attrs).get('id', ''))
        elif tag == 'table':
            self.headers = []
        elif tag == 'tr':
            self.row = []
        elif tag in ('th', 'td') and self.row is not None:
            self.cell, self.cell_tag = [], tag
        elif tag in ('br', 'p', 'li') and self.cell is not None:
            self.cell.append('\n')

    def handle_data(self, data):
        if self.cell is not None:
            self.cell.append(data)

    def handle_endtag(self, tag):
        if tag in ('th', 'td') and self.cell is not None:
            self.row.append(clean(''.join(self.cell)))
            self.cell = None
        elif tag == 'tr' and self.row is not None:
            if self.cell_tag == 'th':
                self.headers = self.row
            elif self.row:
                self.rows.append({'cells': self.row, 'headers': self.headers[:], 'tab': next((x for x in reversed(self.divs) if x), '')})
            self.row = self.cell_tag = None
        elif tag == 'div' and self.divs:
            self.divs.pop()
