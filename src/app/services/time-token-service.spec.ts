import { TestBed } from '@angular/core/testing';

import { TimeTokenService } from './time-token-service';

describe('TimeTokenService', () => {
  let service: TimeTokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimeTokenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
