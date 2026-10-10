import { TestBed } from '@angular/core/testing';
import { MockCurrentUserService, MOCK_CURRENT_USER } from '../../../core/auth/mock-current-user';
import { BUSINESS_CATEGORIES } from '../../categories/data/category.mock';
import { CreateBusinessRequest } from '../models/business.models';
import { BusinessRepository } from './business.repository';
import { emitted } from '../../../core/testing/emitted';

const request: CreateBusinessRequest = {
  name: 'Demo New Shop',
  categoryId: 2,
  categorySlug: 'shopping',
  subcategoryId: 201,
  subcategorySlug: 'clothing',
  description: 'A fictional shop.',
  services: ['Shirts'],
};

describe('BusinessRepository', () => {
  let repository: BusinessRepository;

  beforeEach(() => {
    repository = TestBed.inject(BusinessRepository);
  });

  it('creates an ACTIVE business owned by the current mock user with a new id', () => {
    const before = repository.getBusinesses().length;
    const created = emitted(repository.createBusiness(request));
    expect(created.status).toBe('ACTIVE');
    expect(created.ownerId).toBe(MOCK_CURRENT_USER.id);
    expect(created.categoryName).toBe('Shopping');
    expect(created.subcategoryName).toBe('Clothing');
    expect(created.createdAt).toBeTruthy();
    expect(repository.getBusinesses().length).toBe(before + 1);
    expect(repository.getBusiness(created.id)).toBe(created);
    expect(new Set(repository.getBusinesses().map((item) => item.id)).size).toBe(before + 1);
  });

  it('never assigns an approval or pending status', () => {
    const created = emitted(repository.createBusiness(request));
    expect(['ACTIVE', 'INACTIVE']).toContain(created.status);
    expect(JSON.stringify(created).toLowerCase()).not.toMatch(/pending|approv|review/);
  });

  it('assigns the owner from the centralized current user', () => {
    TestBed.inject(MockCurrentUserService).user.set({ id: 42, name: 'Other' });
    expect(emitted(repository.createBusiness(request)).ownerId).toBe(42);
  });

  it('returns businesses by owner', () => {
    const mine = repository.getBusinessesByOwner(MOCK_CURRENT_USER.id);
    expect(mine.length).toBeGreaterThan(0);
    expect(mine.every((item) => item.ownerId === MOCK_CURRENT_USER.id)).toBe(true);
    expect(repository.getBusinessesByOwner(9999)).toEqual([]);
  });

  it('rejects unknown categories and subcategories', () => {
    expect(() => emitted(repository.createBusiness({ ...request, categoryId: 999 }))).toThrow();
    expect(() => emitted(repository.createBusiness({ ...request, subcategoryId: 999 }))).toThrow();
    expect(BUSINESS_CATEGORIES.length).toBeGreaterThan(0);
  });
});
