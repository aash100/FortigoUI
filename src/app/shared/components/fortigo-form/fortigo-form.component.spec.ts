import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FortigoFormComponent } from './fortigo-form.component';

describe('FortigoFormComponent', () => {
  let component: FortigoFormComponent;
  let fixture: ComponentFixture<FortigoFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FortigoFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FortigoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
