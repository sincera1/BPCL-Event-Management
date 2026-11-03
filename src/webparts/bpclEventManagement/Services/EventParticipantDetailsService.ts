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

export interface ISubEventDocument {
  id: number;
  name: string;
  url: string;
  createDate?: Date | null;
}

export interface ISubEventStage {
  stageName: string;
  status: string;
  participants: IStageParticipant[];

  documents: ISubEventDocument[];

  createDate?: Date | null;
}

export interface ISubEventDetails {
  id: number;
  title: string;
  status: string;
  hasStages: boolean;
  participants: IStageParticipant[];
  stages: ISubEventStage[];
}

export interface IEventStageDocument {
  id: number;
  name: string;
  url: string;
  createDate?: Date | null;
}

export interface IEventStage {
  id: number;
  stageName: string;
  status: string;
  createDate?: Date | null;
  participants: IStageParticipant[];

  documents: IEventStageDocument[];
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

      // GET CONFIGURED SUB-EVENT STAGES
      const configuredSubEventStages: any[] =
        await this._sp.web.lists
          .getByTitle("Corp_SL_EventStages")
          .items
          .filter(`EventIDId eq ${eventId}`)
          .select(
            "Id",
            "EventID/Id",
            "SubEventID/Id",
            "Stages",
            "IsActive"
          )
          .expand("EventID", "SubEventID")();

      console.log(
        "Configured Sub-Event Stages:",
        configuredSubEventStages
      );

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
            "Created",
            "Stages"
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
        // 1. Get configured stages for this sub-event
        const configuredStages = configuredSubEventStages.filter(
          (stage: any) =>
            Number(stage.EventID?.Id) === Number(eventId) &&
            Number(stage.SubEventID?.Id) === Number(subEvent.id) &&
            stage.IsActive !== false
        );

        // 2. Get status records for this sub-event
        const subEventStageItems = stageStatusItems.filter(
          (item: any) =>
            Number(item.SubEventID?.Id) === Number(subEvent.id)
        );

        // 3. Build the union of configured and status stage names
        const stageNames: string[] = [];

        configuredStages.forEach((item: any) => {
          const name = String(item.Stages || "").trim();

          if (
            name &&
            !stageNames.some(
              existing => existing.toLowerCase() === name.toLowerCase()
            )
          ) {
            stageNames.push(name);
          }
        });

        subEventStageItems.forEach((item: any) => {
          const name = String(item.Stage || "").trim();

          if (
            name &&
            !stageNames.some(
              existing => existing.toLowerCase() === name.toLowerCase()
            )
          ) {
            stageNames.push(name);
          }
        });

        subEvent.hasStages = stageNames.length > 0;
        subEvent.stages = [];

        // 4. Create each stage and attach its documents
        for (const stageName of stageNames) {
          const statusItem = subEventStageItems.find(
            (item: any) =>
              String(item.Stage || "").trim().toLowerCase() ===
              stageName.toLowerCase()
          );

          const stageDocuments = documents.filter((doc: any) => {
            const documentStage =
              typeof doc.Stages === "string"
                ? doc.Stages
                : doc.Stages?.Label ||
                doc.Stages?.Title ||
                doc.Stages?.Value ||
                "";

            return (
              Number(doc.EventID?.Id) === Number(eventId) &&
              Number(doc.SubEventID?.Id) === Number(subEvent.id) &&
              Number(doc.TeamID?.Id) === Number(participantItemId) &&
              String(documentStage).trim().toLowerCase() ===
              stageName.toLowerCase()
            );
          });

          const stage: ISubEventStage = {
            stageName,
            status: statusItem?.Status || "Registered",
            participants: [],
            documents: stageDocuments.map((doc: any) => ({
              id: Number(doc.Id),
              name: doc.FileLeafRef || "",
              url: doc.FileRef || "",
              createDate: doc.Created ? new Date(doc.Created) : null
            })),
            createDate: stageDocuments.length
              ? new Date(
                stageDocuments.reduce(
                  (latest: any, doc: any) =>
                    !latest ||
                      new Date(doc.Created).getTime() >
                      new Date(latest.Created).getTime()
                      ? doc
                      : latest,
                  null
                ).Created
              )
              : null
          };

        

          const statusParticipants = statusItem
            ? Array.isArray(statusItem.Participant)
              ? statusItem.Participant
              : statusItem.Participant
                ? [statusItem.Participant]
                : []
            : [];

          if (statusParticipants.length > 0) {
            // Prefer participants specifically associated with this stage.
            statusParticipants.forEach((p: any) => {
              if (!p?.Id) {
                return;
              }

              const exists = stage.participants.some(
                (x: IStageParticipant) => x.id === p.Id
              );

              if (!exists) {
                stage.participants.push({
                  id: p.Id,
                  name: p.Title || "",
                  email: p.EMail || ""
                });
              }
            });
          } else {
            // Fallback: use participants registered for the sub-event.
            subEvent.participants.forEach(
              (p: IStageParticipant) => {
                const exists = stage.participants.some(
                  (x: IStageParticipant) => x.id === p.id
                );

                if (!exists) {
                  stage.participants.push({
                    id: p.id,
                    name: p.name,
                    email: p.email
                  });
                }
              }
            );
          }
          

          subEvent.stages.push(stage);
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

  

      const configuredStages: any[] =
        await this._sp.web.lists
          .getByTitle("Corp_SL_EventStages")
          .items
          .filter(
            `EventIDId eq ${eventId} and SubEventIDId eq null`
          )
          .select(
            "Id",
            "EventID/Id",
            "SubEventID/Id",
            "Stages",
            "StageStartDate",
            "StageEndDate",
            "IsActive"
          )
          .expand(
            "EventID",
            "SubEventID"
          )();



      const statusItems: any[] =
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
      // 3. GET PARTICIPANT / TEAM DOCUMENTS
      // =====================================================

      const documents: any[] =
        await this._sp.web.lists
          .getByTitle(
            "Corp_SL_EventParticipantDocument"
          )
          .items
          .filter(
            `EventIDId eq ${eventId} and TeamIDId eq ${participantItemId}`
          )
          .select(
            "Id",
            "EventID/Id",
            "SubEventID/Id",
            "TeamID/Id",
            "FileLeafRef",
            "FileRef",
            "Created",
            "Stages"
          )
          .expand(
            "EventID",
            "SubEventID",
            "TeamID"
          )();


      


      // =====================================================
      // 4. BUILD FINAL STAGES
      // =====================================================

      const stages: IEventStage[] = [];


      for (const configuredStage of configuredStages) {

        const stageName =
          configuredStage.Stages || "";

        if (!stageName) {
          continue;
        }


        // ===================================================
        // FIND STATUS FOR THIS PARTICIPANT + STAGE
        // ===================================================

        const statusItem =
          statusItems.find(
            (status: any) =>
              String(status.Stage || "")
                .trim()
                .toLowerCase() ===
              String(stageName)
                .trim()
                .toLowerCase()
          );


        

        const stageDocuments =
          documents.filter((doc: any): boolean => {

            const documentStage = doc.Stages;

            const expectedStage =
              String(stageName || "")
                .trim()
                .toLowerCase();

            // SharePoint Choice/Text field
            if (typeof documentStage === "string") {

              return (
                documentStage
                  .trim()
                  .toLowerCase() === expectedStage
              );

            }

            // SharePoint lookup/taxonomy/object
            if (documentStage && typeof documentStage === "object") {

              const value =
                documentStage.Label ||
                documentStage.Title ||
                documentStage.Value ||
                "";

              return (
                String(value)
                  .trim()
                  .toLowerCase() === expectedStage
              );

            }

            // Multi-value field
            if (Array.isArray(documentStage)) {

              return documentStage.some(
                (value: any): boolean => {

                  const stageValue =
                    typeof value === "string"
                      ? value
                      : value?.Label ||
                      value?.Title ||
                      value?.Value ||
                      "";

                  return (
                    String(stageValue)
                      .trim()
                      .toLowerCase() === expectedStage
                  );

                }
              );

            }


            return false;



          });

       

        const stage: IEventStage = {

          id:
            statusItem?.Id ||
            configuredStage.Id,

          stageName:
            stageName,

          status:
            statusItem?.Status ||
            "Registered",

          participants: [],

          documents:
            stageDocuments.map(
              (doc: any) => ({

                id:
                  Number(doc.Id),

                name:
                  doc.FileLeafRef || "",

                url:
                  doc.FileRef || "",

                createDate:
                  doc.Created
                    ? new Date(doc.Created)
                    : null

              })
            ),

          createDate:
            stageDocuments.length > 0
              ? new Date(
                stageDocuments
                  .sort(
                    (a: any, b: any) =>
                      new Date(b.Created).getTime() -
                      new Date(a.Created).getTime()
                  )[0].Created
              )
              : null

        };


        // ===================================================
        // ADD PARTICIPANTS FROM STATUS
        // ===================================================

        if (statusItem) {

          const participants =
            Array.isArray(statusItem.Participant)
              ? statusItem.Participant
              : statusItem.Participant
                ? [statusItem.Participant]
                : [];


          participants.forEach(
            (p: any) => {

              if (!p?.Id) {
                return;
              }


              const exists =
                stage.participants.some(
                  x =>
                    x.id === p.Id
                );


              if (!exists) {

                stage.participants.push({

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




        stages.push(stage);

      }





      return stages;


    } catch (error) {

      console.error(
        "Error loading event stages:",
        error
      );

      return [];

    }

  }

}