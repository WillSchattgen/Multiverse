import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SphereEditorComponent } from './sphere-editor.component';

describe('SphereEditorComponent', () => {
  let component: SphereEditorComponent;
  let fixture: ComponentFixture<SphereEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SphereEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SphereEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
