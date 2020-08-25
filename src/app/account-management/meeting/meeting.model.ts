export class Meeting {
    meetingId: number;
    meetingType: string;
    meetingStartTime: string;
    meetingEndTime: string;
    meetingSetupBy: number;
    meetingSetupByName: string;
    meetingTitle: string;
    meetingSetupRemarks: string;
    postMeetingRemarks: string;
    nextActionItemDate: Date;
    nextMeetingId: number;
    meetingStatus: string;
    participantId: number;
    internalParticipantIds: string;
    externalParticipantIds: string;
    customerContactIds: string;
    participantList: string;
    participantListJson: string;
    participantMeetingMode: string;
    participantRole: string;
    participantStatus: string;
    companyId: string;
    meetingLocationId: number;
    internalParticipants: string;
    externalParticipants: string;
    customerContacts: string;

    constructor(meetingId: number, meetingType: string, meetingStartTime: string, meetingEndTime: string, meetingSetupBy: number, meetingSetupByName: string, meetingTitle: string, meetingSetupRemarks: string, postMeetingRemarks: string, nextActionItemDate: Date, nextMeetingId: number,
        meetingStatus: string, internalParticipantIds: string, externalParticipantIds: string, customerContactIds: string, participantList: string,participantListJson: string, ParticipantMeetingMode: string, participantRole: string,
        participantStatus: string, companyId: string, meetingLocationId: number) {
        this.meetingId = meetingId;
        this.meetingType = meetingType;
        this.meetingStartTime = meetingStartTime;
        this.meetingEndTime = meetingEndTime;
        this.meetingSetupBy = meetingSetupBy;
        this.meetingSetupByName = meetingSetupByName;
        this.meetingTitle = meetingTitle;
        this.meetingSetupRemarks = meetingSetupRemarks;
        this.postMeetingRemarks = postMeetingRemarks;
        this.nextActionItemDate = nextActionItemDate;
        this.nextMeetingId = nextMeetingId;
        this.meetingStatus = meetingStatus;
        this.internalParticipantIds = internalParticipantIds;
        this.externalParticipantIds = externalParticipantIds;
        this.customerContactIds = customerContactIds;
        this.participantList = participantList;
        this.participantListJson = participantListJson;
        this.participantMeetingMode = ParticipantMeetingMode;
        this.participantRole = participantRole;
        this.participantStatus = participantStatus;
        this.companyId = companyId;
        this.meetingLocationId = meetingLocationId;
    }
}
