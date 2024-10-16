import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresetDialogComponent } from './preset-dialog.component';

describe('PresetDialogComponent', () => {
  let component: PresetDialogComponent;
  let fixture: ComponentFixture<PresetDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresetDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresetDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
