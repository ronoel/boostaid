import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAppComponent } from './dialog-app.component';

describe('DialogAppComponent', () => {
  let component: DialogAppComponent;
  let fixture: ComponentFixture<DialogAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogAppComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
