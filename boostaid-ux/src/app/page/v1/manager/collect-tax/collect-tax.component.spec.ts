import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectTaxComponent } from './collect-tax.component';

describe('CollectTaxComponent', () => {
  let component: CollectTaxComponent;
  let fixture: ComponentFixture<CollectTaxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectTaxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollectTaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
