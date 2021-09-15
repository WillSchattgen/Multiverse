import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShardgateComponent } from './shardgate.component';

describe('ShardgateComponent', () => {
  let component: ShardgateComponent;
  let fixture: ComponentFixture<ShardgateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShardgateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShardgateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
