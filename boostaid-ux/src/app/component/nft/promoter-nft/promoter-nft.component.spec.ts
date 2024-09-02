import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromoterNftComponent } from './promoter-nft.component';

describe('PromoterNftComponent', () => {
  let component: PromoterNftComponent;
  let fixture: ComponentFixture<PromoterNftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromoterNftComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromoterNftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
