import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SphereMapComponent } from './sphere-map.component';

describe('SphereMapComponent', () => {
  let component: SphereMapComponent;
  let fixture: ComponentFixture<SphereMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SphereMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SphereMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
