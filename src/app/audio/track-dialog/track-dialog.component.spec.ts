import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackDialogComponent } from './track-dialog.component';

describe('TrackDialogComponent', () => {
  let component: TrackDialogComponent;
  let fixture: ComponentFixture<TrackDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrackDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
