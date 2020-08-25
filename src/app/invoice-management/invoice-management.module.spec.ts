import { InvoiceManagementModule } from './invoice-management.module';

describe('InvoiceManagementModule', () => {
  let invoiceManagementModule: InvoiceManagementModule;

  beforeEach(() => {
    invoiceManagementModule = new InvoiceManagementModule();
  });

  it('should create an instance', () => {
    expect(invoiceManagementModule).toBeTruthy();
  });
});
