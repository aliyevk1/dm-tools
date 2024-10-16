import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderDialogComponent } from './header-dialog.component';

describe('HeaderDialogComponent', () => {
  let component: HeaderDialogComponent;
  let fixture: ComponentFixture<HeaderDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
