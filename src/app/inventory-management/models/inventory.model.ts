export class Inventory {
  extDeviceId: string;
  deviceType: string;
  provider: string;
  vehicleNum: string;

  constructor(
    extDeviceId: string,
    deviceType: string,
    provider: string,
    vehicleNum: string,
  ) {
      this.extDeviceId = extDeviceId;
      this.deviceType = deviceType;
      this.provider = provider;
      this.vehicleNum = vehicleNum;
  }
}
