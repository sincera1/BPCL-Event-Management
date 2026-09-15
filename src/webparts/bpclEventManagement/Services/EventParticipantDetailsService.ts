// import { SPFI } from "@pnp/sp";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

export interface ITeamMember {
  id: number;
  name: string;
  email: string;
  isTeamLeader: boolean;
}

export interface IEventParticipantDetails {
  participantItemId: number;

  eventId: number;
  eventTitle: string;

  teamId: number;
  participantType: string;

  teamLeaderName: string;
  teamLeaderEmail: string;

  participantName: string;
  participantEmail: string;

  participantStatus: string;

  registeredDate: Date | null;

  contactNumber: string;

  teamMembers: ITeamMember[];

  stagesCleared: number;
  totalStages: number;

  overallStatus: string;

  // Sub-events
  subEvents: ISubEventDetails[];

  // Event level stages
  eventStages: IEventStage[];

  
}
export interface IStageParticipant {
  id: number;
  name: string;
  email: string;
}

export interface ISubEventStage {
  stageName: string;
  status: string;
  participants: IStageParticipant[];
createDate?: Date | null;
  documentUrl?: string;
  documentName?: string;
}

export interface ISubEventDetails {
  id: number;
  title: string;
  status: string;
  hasStages: boolean;
  participants: IStageParticipant[];
  stages: ISubEventStage[];
}

export interface IEventStage {
  id: number;
  stageName: string;
  status: string;
  participants: IStageParticipant[];
  documentUrl?: string;
  documentName?: string;
  createDate?: Date | null;
}



export default class EventParticipantDetailsService {
 private _sp = sp;

 constructor() {
  }
  

  public async getParticipantDetails(
    participantItemId: number
  ): Promise<IEventParticipantDetails> {

    try {

      const item: any = await this._sp.web.lists
        .getByTitle("Corp_SL_EventParticipants")
        .items
        .getById(participantItemId)
        .select(
          "Id",
          "EventParticipantType",
          "ParticipantOrTeamStatus",
          "Created",

          "Event_ID/Id",
          "Event_ID/EventTitle",

          "Participant/Id",
          "Participant/Title",
          "Participant/EMail",

          "ContactNumber",

          "TeamLeader/Id",
          "TeamLeader/Title",
          "TeamLeader/EMail"
        )
        .expand(
          "Event_ID",
          "Participant",
          "TeamLeader"
        )();

      // --------------------------------
      // Event
      // --------------------------------

      const eventId: number =
        item.Event_ID?.Id || 0;
        
        const eventTitle: string =
  item.Event_ID?.EventTitle || "";

const subEvents =
  await this.getSubEvents(
    eventId,
    participantItemId
  );

const eventStages =
  await this.getEventStages(
    eventId,
    participantItemId
  );
 // ============================================
// STAGES COUNT
// Includes:
// 1. Direct Event Stages
// 2. Sub-Event Stages
// ============================================

const directEventStages: IEventStage[] =
  eventStages || [];


// --------------------------------------------
// Collect all Sub-Event stages
// Without using flatMap()
// --------------------------------------------

const subEventStages: ISubEventStage[] = [];

subEvents.forEach(
  (subEvent: ISubEventDetails) => {

    if (
      subEvent.stages &&
      subEvent.stages.length > 0
    ) {

      subEvent.stages.forEach(
        (stage: ISubEventStage) => {
          subEventStages.push(stage);
        }
      );

    }

  }
);


// --------------------------------------------
// TOTAL STAGES
// --------------------------------------------

const totalStages =
  directEventStages.length +
  subEventStages.length;


// --------------------------------------------
// CLEARED STAGES
// --------------------------------------------

const directCleared =
  directEventStages.filter(
    (stage: IEventStage) =>
      stage.status &&
      stage.status.trim().toLowerCase() === "qualified"
  ).length;


const subEventCleared =
  subEventStages.filter(
    (stage: ISubEventStage) =>
      stage.status &&
      stage.status.trim().toLowerCase() === "qualified"
  ).length;


const stagesCleared =
  directCleared +
  subEventCleared;

      // --------------------------------
      // Participant Type
      // --------------------------------

      const participantType: string =
        item.EventParticipantType || "";

      const isTeam =
        participantType.toLowerCase() === "team";

      // --------------------------------
      // Contact Number
      // --------------------------------

      const contactNumber: string =
        item.ContactNumber?.toString() || "-";

      // --------------------------------
      // Participants
      // --------------------------------

      const participants = Array.isArray(item.Participant)
        ? item.Participant
        : item.Participant
          ? [item.Participant]
          : [];

      // --------------------------------
      // Team Members
      // --------------------------------

      const teamMembers: ITeamMember[] =
        isTeam
          ? participants.map((participant: any) => ({
              id: participant.Id,

              name:
                participant.Title || "",

              email:
                participant.EMail || "",

              isTeamLeader:
                item.TeamLeader?.Id === participant.Id
            }))
          : [];

      // --------------------------------
      // Individual Participant
      // --------------------------------

      const participantName =
        !isTeam && participants.length > 0
          ? participants[0].Title || ""
          : "";

      const participantEmail =
        !isTeam && participants.length > 0
          ? participants[0].EMail || ""
          : "";

      // --------------------------------
      // Participant ID / Team ID
      // --------------------------------

      const teamId: number =
        isTeam ? item.Id : 0;

      // --------------------------------
      // Return
      // --------------------------------

      return {
  participantItemId: item.Id,

  eventId: eventId,

  eventTitle: eventTitle,

  teamId: teamId,

  participantType: participantType,

  teamLeaderName:
    item.TeamLeader?.Title || "",

  teamLeaderEmail:
    item.TeamLeader?.EMail || "",

  participantName:
    participantName,

  participantEmail:
    participantEmail,

  participantStatus:
    item.ParticipantOrTeamStatus || "",

  registeredDate:
    item.Created
      ? new Date(item.Created)
      : null,

  contactNumber:
    contactNumber,

  teamMembers:
    teamMembers,

  stagesCleared: stagesCleared,

totalStages: totalStages,

  overallStatus:
    item.ParticipantOrTeamStatus ||
    "Registered",

  subEvents:
    subEvents,

  eventStages:
    eventStages
};

    } catch (error) {

      console.error(
        "Error loading participant details",
        error
      );

      throw error;
    }
  }

private async getSubEvents(
  eventId: number,
  participantItemId: number
): Promise<ISubEventDetails[]> {

  try {

    // =====================================================
    // 1. GET SUB-EVENT PARTICIPANTS
    // =====================================================

    const subEventParticipants: any[] =
      await this._sp.web.lists
        .getByTitle("Corp_SL_SubEvent_Participants")
        .items
        .filter(
  `Event_IDId eq ${eventId} and TeamIDId eq ${participantItemId}`
)
        .select(
          "Id",
          "Event_ID/Id",
          "SubEventID/Id",
          "ParticipantOrTeamStatus",
          "Participant/Id",
          "Participant/Title",
          "Participant/EMail",
          "Stage"
        )
        .expand(
          "Event_ID",
          "SubEventID",
          "Participant"
        )();


    // =====================================================
    // 2. IF NO SUB-EVENT PARTICIPANT RECORDS
    // =====================================================

    if (subEventParticipants.length === 0) {
      return [];
    }


    // =====================================================
    // 3. GET UNIQUE SUB-EVENT IDS
    // =====================================================

    const subEventIds: number[] =
      Array.from(
        new Set(
          subEventParticipants
            .map(
              item =>
                item.SubEventID?.Id
            )
            .filter(
              (id: number | undefined): id is number =>
                !!id
            )
        )
      );


    if (subEventIds.length === 0) {
      return [];
    }


    // =====================================================
    // 4. GET SUB-EVENT MANAGEMENT
    // =====================================================

    const subEventManagement: any[] =
      await this._sp.web.lists
        .getByTitle("Corp_SL_SubEventManagement")
        .items
        .select(
          "Id",
          "SubEventTitle",
          "HasStages"
        )();


    // =====================================================
    // 5. GET STAGE STATUS
    //    FROM Corp_SL_EventParticipantStageStatus
    // =====================================================

    const stageStatusItems: any[] =
      await this._sp.web.lists
        .getByTitle(
          "Corp_SL_EventParticipantStageStatus"
        )
        .items
        .filter(
          `Event_IDId eq ${eventId} and TeamIDId eq ${participantItemId}`
        )
        .select(
          "Id",
          "Event_ID/Id",
          "SubEventID/Id",
          "TeamID/Id",
          "Participant/Id",
          "Participant/Title",
          "Participant/EMail",
          "Stage",
          "Status"
        )
        .expand(
          "Event_ID",
          "SubEventID",
          "TeamID",
          "Participant"
        )();


    // =====================================================
    // 6. GET DOCUMENTS
    // =====================================================

    const documents: any[] =
  await this._sp.web.lists
    .getByTitle(
      "Corp_SL_EventParticipantDocument"
    )
    .items
    .select(
      "Id",
      "EventID/Id",
      "SubEventID/Id",
      "TeamID/Id",
      "FileLeafRef",
      "FileRef",
      "Created"
    )
    .expand(
      "EventID",
      "SubEventID",
      "TeamID"
    )();


    // =====================================================
    // 7. BUILD SUB EVENTS
    // =====================================================

    const subEvents: ISubEventDetails[] = [];


    for (const participantItem of subEventParticipants) {

      const subEventId =
        participantItem.SubEventID?.Id;

      if (!subEventId) {
        continue;
      }


      const managementItem =
        subEventManagement.find(
          x =>
            x.Id === subEventId
        );

      if (!managementItem) {
        continue;
      }


      // ===================================================
      // FIND / CREATE SUB EVENT
      // ===================================================

      let subEvent =
        subEvents.find(
          x =>
            x.id === subEventId
        );


      if (!subEvent) {

        subEvent = {

          id: subEventId,

          title:
            managementItem.SubEventTitle || "",

          status:
            participantItem.ParticipantOrTeamStatus ||
            "Registered",

          hasStages:
            managementItem.HasStages === true,

          participants: [],

          stages: []

        };

        subEvents.push(subEvent);
      }


      // ===================================================
      // ADD DIRECT SUB-EVENT PARTICIPANT
      // ===================================================

      const participants =
        Array.isArray(
          participantItem.Participant
        )
          ? participantItem.Participant
          : participantItem.Participant
            ? [participantItem.Participant]
            : [];


      participants.forEach(
        (p: any) => {

          if (!p?.Id) {
            return;
          }

          const exists =
            subEvent!.participants.some(
              x =>
                x.id === p.Id
            );

          if (!exists) {

            subEvent!.participants.push({

              id: p.Id,

              name:
                p.Title || "",

              email:
                p.EMail || ""

            });

          }

        }
      );
    }



    // =====================================================
// 8. ADD STAGES TO EACH SUB EVENT
//    SOURCE: Corp_SL_EventParticipantStageStatus
// =====================================================

for (const subEvent of subEvents) {

  // ---------------------------------------------------
  // Get all stage status records for this sub-event
  // ---------------------------------------------------

  const subEventStageItems =
    stageStatusItems.filter(
      (item: any) =>
        item.SubEventID?.Id === subEvent.id
    );

  // ---------------------------------------------------
  // If stage records exist, this sub-event HAS STAGES
  // ---------------------------------------------------

  if (subEventStageItems.length > 0) {

    subEvent.hasStages = true;

    // -------------------------------------------------
    // GROUP BY STAGE
    // -------------------------------------------------

    for (const item of subEventStageItems) {

      const stageName =
        item.Stage || "";

      if (!stageName) {
        continue;
      }

      // -----------------------------------------------
      // Find existing stage
      // -----------------------------------------------

      let stage =
        subEvent.stages.find(
          x =>
            x.stageName.toLowerCase() ===
            stageName.toLowerCase()
        );

      // -----------------------------------------------
      // DOCUMENT
      // Event + SubEvent + Team
      // -----------------------------------------------

      const document =
        documents.find(
          (doc: any) =>
            Number(doc.EventID?.Id) === eventId &&
            Number(doc.SubEventID?.Id) === subEvent.id &&
            Number(doc.TeamID?.Id) === participantItemId
        );

      // -----------------------------------------------
      // CREATE STAGE
      // -----------------------------------------------

      if (!stage) {

        stage = {

          stageName:
            stageName,

          status:
            item.Status ||
            "Registered",

          participants: [],

          documentUrl:
            document?.FileRef || "",

          documentName:
            document?.FileLeafRef || "",

createDate: document?.Created
    ? new Date(document.Created)
    : null
        };

        subEvent.stages.push(stage);
      }

      // -----------------------------------------------
      // ADD STAGE PARTICIPANT
      // -----------------------------------------------

      const participants =
        Array.isArray(item.Participant)
          ? item.Participant
          : item.Participant
            ? [item.Participant]
            : [];

      participants.forEach(
        (p: any) => {

          if (!p?.Id) {
            return;
          }

          const exists =
            stage!.participants.some(
              x =>
                x.id === p.Id
            );

          if (!exists) {

            stage!.participants.push({

              id:
                p.Id,

              name:
                p.Title || "",

              email:
                p.EMail || ""

            });

          }

        }
      );

    }

  }

}


    return subEvents;

  } catch (error) {

    console.error(
      "Error loading sub events",
      error
    );

    return [];
  }
}
private async getEventStages(
  eventId: number,
  participantItemId: number
): Promise<IEventStage[]> {

  try {

    // =====================================================
    // 1. GET DIRECT EVENT STAGE PARTICIPANTS
    //    SubEventID must be EMPTY
    // =====================================================

    const items: any[] =
      await this._sp.web.lists
        .getByTitle(
          "Corp_SL_EventParticipantStageStatus"
        )
        .items
        .filter(
          `Event_IDId eq ${eventId} and TeamIDId eq ${participantItemId} and SubEventIDId eq null`
        )
        .select(
          "Id",
          "Event_ID/Id",
          "SubEventID/Id",
          "TeamID/Id",
          "Stage",
          "Status",
          "Participant/Id",
          "Participant/Title",
          "Participant/EMail"
        )
        .expand(
          "Event_ID",
          "SubEventID",
          "TeamID",
          "Participant"
        )();


    // =====================================================
    // 2. GET DIRECT EVENT DOCUMENTS
    //    EventID = event
    //    SubEventID = EMPTY
    //    TeamID = participant/team
    // =====================================================

    const documents: any[] =
      await this._sp.web.lists
        .getByTitle(
          "Corp_SL_EventParticipantDocument"
        )
        .items
        .filter(
          `EventIDId eq ${eventId} and TeamIDId eq ${participantItemId} and SubEventIDId eq null`
        )
        .select(
          "Id",
          "EventID/Id",
          "SubEventID/Id",
          "TeamID/Id",
          "FileLeafRef",
          "FileRef",
          "Created"
        )
        .expand(
          "EventID",
          "SubEventID",
          "TeamID"
        )();


    console.log(
      "Direct Event Stage Items:",
      items
    );

    console.log(
      "Direct Event Documents:",
      documents
    );


    // =====================================================
    // 3. BUILD STAGES
    // =====================================================

    const stages: IEventStage[] = [];


    for (const item of items) {

      const stageName =
        item.Stage || "";

      if (!stageName) {
        continue;
      }


      // ===================================================
      // FIND DOCUMENT FOR DIRECT EVENT
      // ===================================================

      const document =
        documents.find(
          (doc: any) =>
            Number(doc.EventID?.Id) === Number(eventId) &&
            !doc.SubEventID?.Id &&
            Number(doc.TeamID?.Id) === Number(participantItemId)
        );


      // ===================================================
      // FIND EXISTING STAGE
      // ===================================================

      let stage =
        stages.find(
          x =>
            x.stageName.toLowerCase() ===
            stageName.toLowerCase()
        );


      // ===================================================
      // CREATE STAGE
      // ===================================================

      if (!stage) {

        stage = {

          id: item.Id,

          stageName:
            stageName,

          status:
            item.Status ||
            "Registered",

          participants: [],

          // -----------------------------------------------
          // DOCUMENT
          // -----------------------------------------------

          documentUrl:
            document?.FileRef || "",

          documentName:
            document?.FileLeafRef || "",

          createDate:
            document?.Created
              ? new Date(document.Created)
              : null

        };

        stages.push(stage);
      }


      // ===================================================
      // ADD PARTICIPANTS
      // ===================================================

      const participants =
        Array.isArray(item.Participant)
          ? item.Participant
          : item.Participant
            ? [item.Participant]
            : [];


      participants.forEach((p: any) => {

        if (!p?.Id) {
          return;
        }


        const exists =
          stage!.participants.some(
            x => x.id === p.Id
          );


        if (!exists) {

          stage!.participants.push({

            id:
              p.Id,

            name:
              p.Title || "",

            email:
              p.EMail || ""

          });

        }

      });

    }


    return stages;


  } catch (error) {

    console.error(
      "Error loading event stages",
      error
    );

    return [];
  }
}
}