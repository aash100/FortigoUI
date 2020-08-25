import { InventoryManagementModule } from './inventory-management.module';

describe('InventoryManagementModule', () => {
  let inventoryManagementModule: InventoryManagementModule;

  beforeEach(() => {
    inventoryManagementModule = new InventoryManagementModule();
  });

  it('should create an instance', () => {
    expect(inventoryManagementModule).toBeTruthy();
  });
});
