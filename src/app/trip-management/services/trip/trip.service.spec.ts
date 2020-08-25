/*
 * Created on Fri Jul 05 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */

import { async, TestBed } from '@angular/core/testing';
import { TripService } from './trip.service';

describe('TripService', () => {
  let service;

  const http: any = {
    // mock properties here
  };

  beforeEach(() => {
    service = new TripService(http);
  });

  it('should run #listTripDetails()', async () => {
    // const result = listTripDetails(data);
  });

  it('should run #requestForTripValidation()', async () => {
    // const result = requestForTripValidation(data);
  });

  it('should run #downloadInvoiceData()', async () => {
    // const result = downloadInvoiceData(tripId, source, invoicingStatus);
  });

  it('should run #viewReserveInvoice()', async () => {
    // const result = viewReserveInvoice(data);
  });

  it('should run #reserveInvoice()', async () => {
    // const result = reserveInvoice(data);
  });

  it('should run #submitSentTripValidation()', async () => {
    // const result = submitSentTripValidation(data);
  });

  it('should run #approveSentTripValidation()', async () => {
    // const result = approveSentTripValidation(data);
  });

  it('should run #rejectSentTripValidation()', async () => {
    // const result = rejectSentTripValidation(data);
  });

  it('should run #generateInvoice()', async () => {
    // const result = generateInvoice(data);
  });

  it('should be created', () => {
    const tempService: TripService = TestBed.get(TripService);
    expect(tempService).toBeTruthy();
  });

});
