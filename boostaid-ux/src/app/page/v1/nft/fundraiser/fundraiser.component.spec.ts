import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FundraiserComponent } from './fundraiser.component';

describe('FundraiserComponent', () => {
  let component: FundraiserComponent;
  let fixture: ComponentFixture<FundraiserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FundraiserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FundraiserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
