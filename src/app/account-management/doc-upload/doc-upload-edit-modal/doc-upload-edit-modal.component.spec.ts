import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocUploadEditModalComponent } from './doc-upload-edit-modal.component';

describe('DocUploadEditModalComponent', () => {
  let component: DocUploadEditModalComponent;
  let fixture: ComponentFixture<DocUploadEditModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DocUploadEditModalComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocUploadEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
