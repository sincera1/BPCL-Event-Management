import { sp } from "@pnp/sp";

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/fields";

/* =========================================================
   PERSON
========================================================= */

export interface IQualifierPerson {
    Id: number;
    Title: string;
    EMail?: string;
}

/* =========================================================
   SUB EVENT
========================================================= */

export interface IQualifierSubEvent {
    Id: number;
    Event_IDId: number;
    SubEventTitle: string;
}

/* =========================================================
   STAGE
========================================================= */

export interface IQualifierStage {
    Id: number;
    EventIDId: number;
    SubEventIDId?: number;
    Stage: string;
}

/* =========================================================
   PARTICIPANT
========================================================= */

export interface IQualifierParticipant {
    Id: number;
    Event_IDId: number;
    SubEventIDId?: number;
    TeamIDId?: number;

    TeamLeader: IQualifierPerson | null;

    Participant: IQualifierPerson[];

    EventParticipantType: string;

    ParticipantOrTeamStatus: string;

    Created?: string;
}

/* =========================================================
   STAGE STATUS
========================================================= */

export interface IParticipantStageStatus {
    Id: number;
    Event_IDId: number;
    SubEventIDId?: number;
    TeamIDId?: number;

    TeamLeader: IQualifierPerson | null;

    Participant: IQualifierPerson[];

    Stage: string;

    Status: string;

    EventParticipantType: string;

    Created?: string;
}

/* =========================================================
   EVENT DETAILS
========================================================= */

export interface IQualifierEventDetails {
    Id: number;

    EventParticipantType: string;

    HasSubEvents: boolean;

    HasStages: boolean;
}

/* =========================================================
   SERVICE RESPONSE
========================================================= */

export interface IQualifiersResponse {
    Event: IQualifierEventDetails;

    SubEvents: IQualifierSubEvent[];

    Stages: IQualifierStage[];

    Participants: IQualifierParticipant[];

    StageStatus: IParticipantStageStatus[];
}

/* =========================================================
   SERVICE
========================================================= */

export default class QualifiersService {

    /* =======================================================
       GET EVENT DETAILS
    ======================================================= */

    public async getEventDetails(
        eventId: number
    ): Promise<IQualifierEventDetails> {

        try {

            const eventItem: any =
                await sp.web.lists
                    .getByTitle("Corp_SL_EventManagement")
                    .items
                    .getById(eventId)
                    .select(
                        "Id",
                        "EventParticipantType",
                        "HasSubEvents",
                        "HasStages"
                    )
                    .get();

            return {

                Id: eventItem.Id,

                EventParticipantType:
                    eventItem.EventParticipantType || "",

                HasSubEvents:
                    eventItem.HasSubEvents === true,

                HasStages:
                    eventItem.HasStages === true
            };

        } catch (error) {

            console.error(
                "Error getting event details:",
                error
            );

            throw error;
        }
    }


    /* =======================================================
       GET SUB EVENTS
    ======================================================= */

    public async getSubEvents(
        eventId: number
    ): Promise<IQualifierSubEvent[]> {

        try {

            const subEventItems: any[] =
                await sp.web.lists
                    .getByTitle(
                        "Corp_SL_SubEventManagement"
                    )
                    .items
                    .select(
                        "Id",
                        "Event_IDId",
                        "SubEventTitle"
                    )
                    .filter(
                        `Event_IDId eq ${eventId}`
                    )
                    .orderBy(
                        "Id",
                        true
                    )
                    .get();

            const subEvents:
                IQualifierSubEvent[] =
                subEventItems.map(
                    (item: any) => ({

                        Id: item.Id,

                        Event_IDId:
                            item.Event_IDId,

                        SubEventTitle:
                            item.SubEventTitle || ""
                    })
                );

            return subEvents;

        } catch (error) {

            console.error(
                "Error getting sub events:",
                error
            );

            throw error;
        }
    }


    /* =======================================================
       GET STAGES
    ======================================================= */

    public async getStages(
        eventId: number,
        subEventId?: number
    ): Promise<IQualifierStage[]> {

        try {

            let query =
                sp.web.lists
                    .getByTitle(
                        "Corp_SL_EventStages"
                    )
                    .items
                    .select(
                        "Id",
                        "EventIDId",
                        "SubEventIDId",
                        "Stages"
                    );

            let filter =
                `EventIDId eq ${eventId}`;

            if (subEventId) {

                filter +=
                    ` and SubEventIDId eq ${subEventId}`;
            }

            const stageItems: any[] =
                await query
                    .filter(filter)
                    .orderBy(
                        "Id",
                        true
                    )
                    .get();

            const stages:
                IQualifierStage[] =
                stageItems.map(
                    (item: any) => ({

                        Id: item.Id,

                        EventIDId:
                            item.EventIDId,

                        SubEventIDId:
                            item.SubEventIDId,

                        Stage:
                            item.Stages || ""
                    })
                );

            return stages;

        } catch (error) {

            console.error(
                "Error getting stages:",
                error
            );

            throw error;
        }
    }


    /* =======================================================
       GET EVENT PARTICIPANTS
    ======================================================= */

    public async getEventParticipants(
        eventId: number
    ): Promise<IQualifierParticipant[]> {

        try {

            const items: any[] =
                await sp.web.lists
                    .getByTitle(
                        "Corp_SL_EventParticipants"
                    )
                    .items
                    .select(
                        "Id",
                        "Event_IDId",
                        "EventParticipantType",
                        "ParticipantOrTeamStatus",
                        "Created",

                        "TeamLeader/Id",
                        "TeamLeader/Title",
                        "TeamLeader/EMail",

                        "Participant/Id",
                        "Participant/Title",
                        "Participant/EMail"
                    )
                    .expand(
                        "TeamLeader",
                        "Participant"
                    )
                    .filter(
                        `Event_IDId eq ${eventId}`
                    )
                    .orderBy(
                        "Id",
                        false
                    )
                    .get();

            return items.map(
                (item: any) => ({

                    Id: item.Id,

                    Event_IDId:
                        item.Event_IDId,

                    TeamLeader:
                        item.TeamLeader
                            ? {
                                Id: item.TeamLeader.Id,
                                Title:
                                    item.TeamLeader.Title,
                                EMail:
                                    item.TeamLeader.EMail
                            }
                            : null,

                    Participant:
                        item.Participant || [],

                    EventParticipantType:
                        item.EventParticipantType || "",

                    ParticipantOrTeamStatus:
                        item.ParticipantOrTeamStatus || "",

                    Created:
                        item.Created
                })
            );

        } catch (error) {

            console.error(
                "Error getting event participants:",
                error
            );

            throw error;
        }
    }


    /* =======================================================
       GET SUB EVENT PARTICIPANTS
    ======================================================= */

    public async getSubEventParticipants(
        eventId: number,
        subEventId: number
    ): Promise<IQualifierParticipant[]> {

        try {

            const items: any[] =
                await sp.web.lists
                    .getByTitle(
                        "Corp_SL_SubEvent_Participants"
                    )
                    .items
                    .select(
                        "Id",
                        "Event_IDId",
                        "SubEventIDId",
                        "TeamIDId",
                        "EventParticipantType",
                        "ParticipantOrTeamStatus",
                        "Created",

                        "TeamLeader/Id",
                        "TeamLeader/Title",
                        "TeamLeader/EMail",

                        "Participant/Id",
                        "Participant/Title",
                        "Participant/EMail"
                    )
                    .expand(
                        "TeamLeader",
                        "Participant"
                    )
                    .filter(
                        `Event_IDId eq ${eventId} and SubEventIDId eq ${subEventId}`
                    )
                    .orderBy(
                        "Id",
                        false
                    )
                    .get();

            return items.map(
                (item: any) => ({

                    Id: item.Id,

                    Event_IDId:
                        item.Event_IDId,

                    SubEventIDId:
                        item.SubEventIDId,

                    TeamIDId:
                        item.TeamIDId,

                    TeamLeader:
                        item.TeamLeader
                            ? {
                                Id: item.TeamLeader.Id,
                                Title:
                                    item.TeamLeader.Title,
                                EMail:
                                    item.TeamLeader.EMail
                            }
                            : null,

                    Participant:
                        item.Participant || [],

                    EventParticipantType:
                        item.EventParticipantType || "",

                    ParticipantOrTeamStatus:
                        item.ParticipantOrTeamStatus || "",

                    Created:
                        item.Created
                })
            );

        } catch (error) {

            console.error(
                "Error getting sub event participants:",
                error
            );

            throw error;
        }
    }


    /* =======================================================
       GET STAGE STATUS
    ======================================================= */

    public async getStageStatus(
        eventId: number,
        stage: string,
        subEventId?: number
    ): Promise<IParticipantStageStatus[]> {

        try {

            let filter =
                `Event_IDId eq ${eventId} and Stage eq '${stage.replace(/'/g, "''")}'`;

            if (subEventId) {

                filter +=
                    ` and SubEventIDId eq ${subEventId}`;
            }

            const items: any[] =
                await sp.web.lists
                    .getByTitle(
                        "Corp_SL_EventParticipantStageStatus"
                    )
                    .items
                    .select(
                        "Id",
                        "Event_IDId",
                        "SubEventIDId",
                        "TeamIDId",
                        "Stage",
                        "Status",
                        "EventParticipantType",
                        "Created",

                        "TeamLeader/Id",
                        "TeamLeader/Title",
                        "TeamLeader/EMail",

                        "Participant/Id",
                        "Participant/Title",
                        "Participant/EMail"
                    )
                    .expand(
                        "TeamLeader",
                        "Participant"
                    )
                    .filter(filter)
                    .orderBy(
                        "Id",
                        false
                    )
                    .get();

            return items.map(
                (item: any) => ({

                    Id: item.Id,

                    Event_IDId:
                        item.Event_IDId,

                    SubEventIDId:
                        item.SubEventIDId,

                    TeamIDId:
                        item.TeamIDId,

                    TeamLeader:
                        item.TeamLeader
                            ? {
                                Id: item.TeamLeader.Id,
                                Title:
                                    item.TeamLeader.Title,
                                EMail:
                                    item.TeamLeader.EMail
                            }
                            : null,

                    Participant:
                        item.Participant || [],

                    Stage:
                        item.Stage || "",

                    Status:
                        item.Status || "",

                    EventParticipantType:
                        item.EventParticipantType || "",

                    Created:
                        item.Created
                })
            );

        } catch (error) {

            console.error(
                "Error getting stage status:",
                error
            );

            throw error;
        }
    }


    /* =======================================================
   GET PARTICIPANT DOCUMENT COUNT

   Filters:
     EventID
     SubEventID
     TeamID
     Stage

   Library:
     Corp_SL_EventParticipantDocument
======================================================= */

    public async getParticipantDocumentCount(
        eventId: number,
        subEventId: number | undefined,
        stage: string,
        teamId: number | undefined
    ): Promise<number> {
        try {
            if (!eventId || !stage || !teamId) {
                return 0;
            }

            // Base filter
            let filter =
                `EventIDId eq ${eventId}` +
                ` and TeamIDId eq ${teamId}` +
                ` and Stages eq '${stage.replace(/'/g, "''")}'`;

            // Add SubEvent filter ONLY when SubEventID actually exists
            if (
                subEventId !== undefined &&
                subEventId !== null &&
                Number(subEventId) > 0
            ) {
                filter += ` and SubEventIDId eq ${Number(subEventId)}`;
            }

            console.log("Document Count Filter:", filter);

            const items: any[] =
                await sp.web.lists
                    .getByTitle("Corp_SL_EventParticipantDocument")
                    .items
                    .select(
                        "Id",
                        "EventIDId",
                        "SubEventIDId",
                        "TeamIDId",
                        "Stages"
                    )
                    .filter(filter)
                    .get();

            console.log("Document Count Result:", items.length, items);

            return items.length;

        } catch (error) {
            console.error(
                "Error getting participant document count:",
                error
            );

            return 0;
        }
    }

    /* =======================================================
       SUBMIT STAGE QUALIFICATION
       
       Creates records in:
       Corp_SL_EventParticipantStageStatus
  
       Selected:
         Qualified
  
       Non-selected:
         Not Qualified
    ======================================================= */

    public async submitStageQualification(
        eventId: number,
        stage: string,
        participants: IQualifierParticipant[],
        selectedIds: number[],
        subEventId?: number
    ): Promise<void> {

        try {

            /*
             * Check whether this stage is already submitted.
             * This prevents duplicate submissions.
             */

            const existingStatus =
                await this.getStageStatus(
                    eventId,
                    stage,
                    subEventId
                );

            if (
                existingStatus &&
                existingStatus.length > 0
            ) {

                throw new Error(
                    `${stage} qualification has already been submitted.`
                );
            }


            /*
             * Create status record for every participant.
             */

            for (
                const participant of participants
            ) {

                const isSelected =
                    selectedIds.indexOf(
                        participant.Id
                    ) !== -1;

                const status =
                    isSelected
                        ? "Qualified"
                        : "Not Qualified";


                const item: any = {

                    Event_IDId:
                        eventId,

                    Stage:
                        stage,

                    Status:
                        status,

                    EventParticipantType:
                        participant.EventParticipantType
                };


                /*
                 * Sub Event
                 */

                if (
                    subEventId !== undefined &&
                    subEventId !== null
                ) {

                    item.SubEventIDId =
                        subEventId;
                }


                /*
                 * Team ID
                 *
                 * Stage 1 without sub-event:
                 * Corp_SL_EventParticipants.ID -> TeamID
                 *
                 * Stage 2:
                 * Previous stage TeamID -> TeamID
                 *
                 * With sub-event:
                 * Corp_SL_SubEvent_Participants.TeamID -> TeamID
                 */

                if (
                    participant.TeamIDId !== undefined &&
                    participant.TeamIDId !== null
                ) {

                    item.TeamIDId =
                        participant.TeamIDId;

                } else if (
                    subEventId === undefined ||
                    subEventId === null
                ) {

                    item.TeamIDId =
                        participant.Id;
                }


                /*
                 * Team Leader
                 */

                if (
                    participant.TeamLeader &&
                    participant.TeamLeader.Id
                ) {

                    item.TeamLeaderId =
                        participant.TeamLeader.Id;
                }


                /*
                 * Participants
                 *
                 * Person/Group multi-value field.
                 */

                if (
                    participant.Participant &&
                    participant.Participant.length > 0
                ) {

                    item.ParticipantId = {

                        results:
                            participant.Participant
                                .map(
                                    (person) =>
                                        person.Id
                                )
                    };
                }


                /*
                 * Create stage status record
                 */

                await sp.web.lists
                    .getByTitle(
                        "Corp_SL_EventParticipantStageStatus"
                    )
                    .items
                    .add(item);
            }

        } catch (error) {

            console.error(
                "Error submitting stage qualification:",
                error
            );

            throw error;
        }
    }


    /* =======================================================
       SUBMIT SUB EVENT QUALIFICATION
       
       Used when:
  
       HasSubEvents = true
       HasStages = false
  
       Updates:
       Corp_SL_SubEvent_Participants
  
       Selected:
         Qualified
  
       Non-selected:
         Not Qualified
    ======================================================= */

    public async submitSubEventQualification(
        eventId: number,
        subEventId: number,
        participants: IQualifierParticipant[],
        selectedIds: number[]
    ): Promise<void> {

        try {

            /*
             * Validate that the participants belong
             * to the selected event/sub-event.
             */

            const currentParticipants =
                await this.getSubEventParticipants(
                    eventId,
                    subEventId
                );

            if (
                currentParticipants.length === 0
            ) {

                throw new Error(
                    "No participants found for the selected sub event."
                );
            }


            /*
             * Update every participant.
             */

            for (
                const participant of participants
            ) {

                /*
                 * Make sure the participant still exists
                 * in SharePoint.
                 */

                const sourceParticipant =
                    currentParticipants.find(
                        (item) =>
                            item.Id === participant.Id
                    );

                if (!sourceParticipant) {
                    continue;
                }


                const isSelected =
                    selectedIds.indexOf(
                        participant.Id
                    ) !== -1;

                const status =
                    isSelected
                        ? "Qualified"
                        : "Not Qualified";


                await sp.web.lists
                    .getByTitle(
                        "Corp_SL_SubEvent_Participants"
                    )
                    .items
                    .getById(
                        participant.Id
                    )
                    .update({

                        ParticipantOrTeamStatus:
                            status
                    });
            }

        } catch (error) {

            console.error(
                "Error submitting sub event qualification:",
                error
            );

            throw error;
        }
    }


    /* =======================================================
       GET COMPLETE QUALIFIER DATA
    ======================================================= */

    public async getQualifiersData(
        eventId: number,
        hasSubEvents: boolean,
        hasStages: boolean,
        subEventId?: number,
        stage?: string
    ): Promise<IQualifiersResponse> {

        try {

            /*
             * Get actual event configuration
             * from Corp_SL_EventManagement.
             *
             * SharePoint is the source of truth.
             */
            const event =
                await this.getEventDetails(
                    eventId
                );

            const actualHasSubEvents =
                event.HasSubEvents;

            const actualHasStages =
                event.HasStages;


            let subEvents:
                IQualifierSubEvent[] = [];

            let stages:
                IQualifierStage[] = [];

            let participants:
                IQualifierParticipant[] = [];

            let stageStatus:
                IParticipantStageStatus[] = [];


            /* =================================================
               SUB EVENTS
            ================================================= */

            if (actualHasSubEvents) {

                subEvents =
                    await this.getSubEvents(
                        eventId
                    );
            }


            /* =================================================
               STAGES
            ================================================= */

            if (actualHasStages) {

                stages =
                    await this.getStages(
                        eventId,
                        subEventId
                    );
            }


            /* =================================================
               PARTICIPANTS / STAGE STATUS
            ================================================= */

            /*
             * Scenario 1:
             * HasStages = false
             * HasSubEvents = false
             */
            if (
                actualHasStages === false &&
                actualHasSubEvents === false
            ) {

                participants = [];

            }


            /*
             * Scenario 2:
             * HasStages = true
             * HasSubEvents = false
             */
            else if (
                actualHasStages === true &&
                actualHasSubEvents === false &&
                stage
            ) {

                stageStatus =
                    await this.getStageStatus(
                        eventId,
                        stage,
                        subEventId
                    );

            }


            /*
             * Scenario 3:
             * HasStages = false
             * HasSubEvents = true
             */
            else if (
                actualHasStages === false &&
                actualHasSubEvents === true &&
                subEventId
            ) {

                participants =
                    await this.getSubEventParticipants(
                        eventId,
                        subEventId
                    );

            }


            /*
             * Scenario 4:
             * HasStages = true
             * HasSubEvents = true
             */
            else if (
                actualHasStages === true &&
                actualHasSubEvents === true &&
                stage
            ) {

                stageStatus =
                    await this.getStageStatus(
                        eventId,
                        stage,
                        subEventId
                    );

            }


            /*
             * No stage specified for a staged event.
             * Return event participants.
             */
            else if (
                actualHasStages === true &&
                actualHasSubEvents === false
            ) {

                participants =
                    await this.getEventParticipants(
                        eventId
                    );
            }


            return {

                Event:
                    event,

                SubEvents:
                    subEvents,

                Stages:
                    stages,

                Participants:
                    participants,

                StageStatus:
                    stageStatus
            };

        } catch (error) {

            console.error(
                "Error getting qualifier data:",
                error
            );

            throw error;
        }
    }
}