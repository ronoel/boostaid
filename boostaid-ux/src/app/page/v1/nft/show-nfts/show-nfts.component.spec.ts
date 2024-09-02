import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowNftsComponent } from './show-nfts.component';

describe('ShowNftsComponent', () => {
  let component: ShowNftsComponent;
  let fixture: ComponentFixture<ShowNftsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowNftsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowNftsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
