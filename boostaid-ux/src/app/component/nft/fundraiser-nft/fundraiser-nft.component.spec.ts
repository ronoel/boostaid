import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FundraiserNftComponent } from './fundraiser-nft.component';

describe('FundraiserNftComponent', () => {
  let component: FundraiserNftComponent;
  let fixture: ComponentFixture<FundraiserNftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FundraiserNftComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FundraiserNftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
