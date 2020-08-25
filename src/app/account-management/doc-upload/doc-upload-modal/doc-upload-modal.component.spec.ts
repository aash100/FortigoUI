import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocUploadModalComponent } from './doc-upload-modal.component';

describe('DocUploadModalComponent', () => {
  let component: DocUploadModalComponent;
  let fixture: ComponentFixture<DocUploadModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DocUploadModalComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocUploadModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
