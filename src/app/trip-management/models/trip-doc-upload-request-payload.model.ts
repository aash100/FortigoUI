/*
 * Created on Fri Oct 04 2019
 * Created by - 1149: Aashish Kumar
 *
 * Copyright (c) 2019 Fortigo Network Logistics Pvt Ltd (4TiGO)
 */
export class TripDocUploadRequestPayload {
    service_ref_id: string;
    document_id: string;
    document_number: string;
    document_path?: string;
    constructor(service_ref_id: string, document_id: string, document_number: string, document_path?: string) {
        this.service_ref_id = service_ref_id;
        this.document_id = document_id;
        this.document_number = document_number;
        this.document_path = document_path;
    }
}
