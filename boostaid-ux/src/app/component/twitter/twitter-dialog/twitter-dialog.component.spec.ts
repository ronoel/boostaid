import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwitterDialogComponent } from './twitter-dialog.component';

describe('TwitterDialogComponent', () => {
  let component: TwitterDialogComponent;
  let fixture: ComponentFixture<TwitterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TwitterDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TwitterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
