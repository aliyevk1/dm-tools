import { TestBed } from '@angular/core/testing';

import { GeneratorsService } from './generators.service';

describe('GeneratorsService', () => {
  let service: GeneratorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeneratorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
