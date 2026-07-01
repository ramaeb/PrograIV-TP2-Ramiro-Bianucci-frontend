import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaCarga } from './pagina-carga';

describe('PaginaCarga', () => {
  let component: PaginaCarga;
  let fixture: ComponentFixture<PaginaCarga>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaCarga],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginaCarga);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
