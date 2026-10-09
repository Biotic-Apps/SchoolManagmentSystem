import { renderEmailHtml } from './email-html';

describe('renderEmailHtml', () => {
  it('brands the mail and shows the code in large digits', () => {
    const html = renderEmailHtml({
      schoolName: 'Bright Future School',
      title: 'Your sign-in code',
      body: 'Line one.\n\nLine two.',
      extras: { code: '482913', codeNote: 'Valid for 5 minutes' },
    });
    expect(html).toContain('Bright Future School');
    expect(html).toContain('482913');
    expect(html).toContain('Valid for 5 minutes');
    expect(html.match(/<p /g)).toHaveLength(2);
  });

  it('escapes text and only links http(s) buttons', () => {
    const html = renderEmailHtml({
      schoolName: '<b>X</b>',
      title: 'T',
      body: '<script>alert(1)</script>',
      extras: { action: { label: 'Open', url: 'javascript:alert(1)' } },
    });
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<b>X</b>');
    expect(html).not.toContain('javascript:');
    const linked = renderEmailHtml({
      schoolName: 'S',
      title: 'T',
      body: 'B',
      extras: { action: { label: 'Open', url: 'https://school.pk/login' } },
    });
    expect(linked).toContain('href="https://school.pk/login"');
  });
});
