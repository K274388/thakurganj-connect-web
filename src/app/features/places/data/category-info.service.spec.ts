import { CATEGORY_INFO } from './category-info.data';
import { CategoryInfoService } from './category-info.service';

describe('CategoryInfoService', () => {
  const service = new CategoryInfoService();

  it('resolves known category slugs', () => {
    expect(service.getBySlug('transportation')?.title).toContain('Thakurganj');
  });

  it('returns null for empty or unknown slugs', () => {
    expect(service.getBySlug('')).toBeNull();
    expect(service.getBySlug('nope')).toBeNull();
  });

  it('has unique slugs', () => {
    const slugs = CATEGORY_INFO.map((info) => info.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
