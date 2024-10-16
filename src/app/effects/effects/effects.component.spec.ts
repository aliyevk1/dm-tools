import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EffectsComponent } from './effects.component';

describe('EffectsComponent', () => {
  let component: EffectsComponent;
  let fixture: ComponentFixture<EffectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EffectsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EffectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
