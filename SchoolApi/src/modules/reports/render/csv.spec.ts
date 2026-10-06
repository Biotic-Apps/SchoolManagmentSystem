import { minorToMajor } from './cell-format';
import { csvField, renderCsv } from './csv';

const BOM = String.fromCharCode(0xfeff);

describe('csv rendering', () => {
  it('quotes fields with commas, quotes and line breaks', () => {
    expect(csvField('plain')).toBe('plain');
    expect(csvField('a,b')).toBe('"a,b"');
    expect(csvField('say "hi"')).toBe('"say ""hi"""');
    expect(csvField('line\nbreak')).toBe('"line\nbreak"');
    expect(csvField('cr\rhere')).toBe('"cr\rhere"');
  });

  it('writes a BOM, header, CRLF rows and money in major units', () => {
    const csv = renderCsv({
      title: 'T',
      columns: [
        { key: 'name', header: 'Name' },
        { key: 'amount', header: 'Amount', kind: 'money' },
        { key: 'rate', header: 'Rate %', kind: 'percent' },
      ],
      rows: [
        { name: 'Khan, Ali', amount: 123456n, rate: 87.5 },
        { name: 'Sara', amount: -5n, rate: null },
      ],
    }).toString('utf8');
    expect(csv).toBe(
      BOM + 'Name,Amount,Rate %\r\n"Khan, Ali",1234.56,87.5\r\nSara,-0.05,\r\n',
    );
  });

  it('converts minor units exactly', () => {
    expect(minorToMajor(0n)).toBe('0.00');
    expect(minorToMajor(9007199254740993n)).toBe('90071992547409.93');
  });
});
