import { sp } from "@pnp/sp";

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/fields";


/* =========================================================
   PEOPLE
========================================================= */

export interface IWinnerPerson {
  Id: number;
  Title: string;
  EMail?: string;
}


/* =========================================================
   EVENT PARTICIPANT
========================================================= */

export interface IWinnerParticipant {

  
  Id: number;
  EventParticipantType: string;
  TeamLeader: IWinnerPerson | null;
  Participant: IWinnerPerson[];
  ParticipantOrTeamStatus: string;
  Created: string;
}


/* =========================================================
   SUB EVENT
========================================================= */

export interface IWinnerSubEvent {

  Id: number;

  Event_IDId: number;

  SubEventTitle: string;
}


/* =========================================================
   SUB EVENT STATUS
========================================================= */

export interface IWinnerSubEventStatus {

  Id: number;

  Event_IDId: number;

  SubEventIDId: number;

  // Corp_SL_EventParticipants ID
  TeamIDId: number;

  EventParticipantType: string;

  ParticipantOrTeamStatus: string;

  TeamLeader: IWinnerPerson | null;

  Participant: IWinnerPerson[];

}


/* =========================================================
   EVENT STAGE
========================================================= */

export interface IWinnerStage {

  Id: number;

  EventIDId: number;

  SubEventIDId: number;

  Stages: string;
}


/* =========================================================
   FINAL STAGE STATUS
========================================================= */

export interface IWinnerStageStatus {

  Id: number;
  Event_IDId: number;
  SubEventIDId: number;
  TeamIDId: number;
  TeamLeader: IWinnerPerson | null;
  Participant: IWinnerPerson[];
  Stage: string;
  Status: string;
  EventParticipantType: string;
}


/* =========================================================
   SUB EVENT RESULT
========================================================= */

export interface IWinnerSubEventResult {

  subEventId: number;

  subEventTitle: string;

  status: string;

  displayStatus: "qualified" | "not-qualified" | "pending" | "missing";
}


/* =========================================================
   WINNER ROW
========================================================= */

export interface IWinnerRow {

  Id: number;

  EventParticipantType: string;

  TeamId: number;

  TeamLeader: IWinnerPerson | null;

  Participant: IWinnerPerson[];

  ParticipantOrTeamStatus: string;

  Created: string;

  SubEvents: IWinnerSubEventResult[];

  CanSelect: boolean;
}


/* =========================================================
   WINNERS RESPONSE
========================================================= */

export interface IWinnersResponse {

  EventParticipantType: string;

  Participants: IWinnerRow[];

  SubEvents: IWinnerSubEvent[];

  FinalStage: string | null;

  CanDeclareWinner: boolean;

  IsFinalized: boolean;
}


/* =========================================================
   SERVICE
========================================================= */

export default class WinnersService {


  /* =======================================================
     GET EVENT CONFIGURATION

     SharePoint is the source of truth for:
       - EventParticipantType
       - HasStages
       - HasSubEvents
     ======================================================= */
  private async getEventConfiguration(
    eventId: number
  ): Promise<{
    EventParticipantType: string;
    HasStages: boolean;
    HasSubEvents: boolean;
  }> {

    const eventItem: any =
      await sp.web.lists
        .getByTitle("Corp_SL_EventManagement")
        .items
        .getById(eventId)
        .select(
          "Id",
          "EventParticipantType",
          "HasStages",
          "HasSubEvents"
        )
        .get();

    return {
      EventParticipantType:
        eventItem.EventParticipantType || "",
      HasStages:
        eventItem.HasStages === true,
      HasSubEvents:
        eventItem.HasSubEvents === true
    };
  }


  /* =======================================================
     GET EVENT PARTICIPANT TYPE
     ======================================================= */
  private async getEventParticipantType(
    eventId: number
  ): Promise<string> {
    const configuration =
      await this.getEventConfiguration(eventId);

    return configuration.EventParticipantType;
  }


  /* =======================================================
     GET EVENT PARTICIPANTS
  ======================================================= */

  private async getEventParticipants(
    eventId: number
  ): Promise<IWinnerParticipant[]> {

    const items: any[] =
      await sp.web.lists
        .getByTitle("Corp_SL_EventParticipants")
        .items
        .select(
          "Id",
          "Created",
          "Event_IDId",
          "EventParticipantType",
          "ParticipantOrTeamStatus",

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
          "Created",
          false
        )
        .get();


    return items.map(
      (item: any): IWinnerParticipant => {

        const teamLeader: IWinnerPerson | null =
          item.TeamLeader
            ? {
              Id: item.TeamLeader.Id,
              Title:
                item.TeamLeader.Title || "",
              EMail:
                item.TeamLeader.EMail || ""
            }
            : null;


        const participantPeople:
          IWinnerPerson[] =
          item.Participant
            ? item.Participant.map(
              (person: any) => ({
                Id: person.Id,
                Title:
                  person.Title || "",
                EMail:
                  person.EMail || ""
              })
            )
            : [];


        return {

          Id: item.Id,

          EventParticipantType:
            item.EventParticipantType || "",

          TeamLeader:
            teamLeader,

          Participant:
            participantPeople,

          ParticipantOrTeamStatus:
            item.ParticipantOrTeamStatus || "",

          Created:
            item.Created

        };

      }
    );
  }


  /* =======================================================
     GET SUB EVENTS
  ======================================================= */

  private async getSubEvents(
    eventId: number
  ): Promise<IWinnerSubEvent[]> {

    const items: any[] =
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


    return items.map(
      (item: any): IWinnerSubEvent => ({

        Id: item.Id,

        Event_IDId:
          item.Event_IDId,

        SubEventTitle:
          item.SubEventTitle || ""

      })
    );
  }


  /* =======================================================
     GET EVENT STAGES
  ======================================================= */

  private async getEventStages(
    eventId: number
  ): Promise<IWinnerStage[]> {

    const items: any[] =
      await sp.web.lists
        .getByTitle(
          "Corp_SL_EventStages"
        )
        .items
        .select(
          "Id",
          "EventIDId",
          "SubEventIDId",
          "Stages"
        )
        .filter(
          `EventIDId eq ${eventId}`
        )
        .orderBy(
          "Id",
          true
        )
        .get();


    return items.map(
      (item: any): IWinnerStage => ({

        Id: item.Id,

        EventIDId:
          item.EventIDId,

        SubEventIDId:
          item.SubEventIDId,

        Stages:
          item.Stages || ""

      })
    );
  }


  /* =======================================================
     GET FINAL STAGE
     
     Example:
     
     Stage1
     Stage2
     Stage3
     
     Final Stage = Stage3
  ======================================================= */

  private getFinalStage(
    stages: IWinnerStage[]
  ): string | null {

    if (
      !stages ||
      stages.length === 0
    ) {
      return null;
    }


    /*
     * Try to determine numeric stage
     *
     * Stage1
     * Stage2
     * Stage3
     */

    const sortedStages =
      [...stages].sort(
        (
          a: IWinnerStage,
          b: IWinnerStage
        ): number => {

          const aNumber =
            this.getStageNumber(a.Stages);

          const bNumber =
            this.getStageNumber(b.Stages);

          return aNumber - bNumber;
        }
      );


    return sortedStages[
      sortedStages.length - 1
    ].Stages;
  }


  private getFinalStageForSubEvent(
    stages: IWinnerStage[],
    subEventId: number
  ): string | null {

    const subEventStages =
      stages.filter(
        (stage: IWinnerStage) =>
          stage.SubEventIDId === subEventId
      );

    if (
      !subEventStages ||
      subEventStages.length === 0
    ) {
      return null;
    }

    const sortedStages =
      [...subEventStages].sort(
        (
          a: IWinnerStage,
          b: IWinnerStage
        ): number => {

          const aNumber =
            this.getStageNumber(a.Stages);

          const bNumber =
            this.getStageNumber(b.Stages);

          return aNumber - bNumber;
        }
      );

    return sortedStages[
      sortedStages.length - 1
    ].Stages;
  }

  /* =======================================================
     GET STAGE NUMBER
  ======================================================= */

  private getStageNumber(
    stage: string
  ): number {

    const match =
      stage.match(/\d+/);

    if (match) {
      return Number(match[0]);
    }

    return 0;
  }


  /* =======================================================
     GET FINAL STAGE STATUS
  ======================================================= */

  private async getFinalStageStatuses(
    eventId: number,
    finalStage: string
  ): Promise<IWinnerStageStatus[]> {

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
          `Event_IDId eq ${eventId} and Stage eq '${finalStage}'`
        )
        .get();


    return items.map(
      (item: any): IWinnerStageStatus => {

        const teamLeader:
          IWinnerPerson | null =
          item.TeamLeader
            ? {
              Id: item.TeamLeader.Id,
              Title:
                item.TeamLeader.Title || "",
              EMail:
                item.TeamLeader.EMail || ""
            }
            : null;


        const participants:
          IWinnerPerson[] =
          item.Participant
            ? item.Participant.map(
              (person: any) => ({
                Id: person.Id,
                Title:
                  person.Title || "",
                EMail:
                  person.EMail || ""
              })
            )
            : [];


        return {

          Id: item.Id,

          Event_IDId:
            item.Event_IDId,

          SubEventIDId:
            item.SubEventIDId,

          TeamIDId:
            item.TeamIDId,

          TeamLeader:
            teamLeader,

          Participant:
            participants,

          Stage:
            item.Stage || "",

          Status:
            item.Status || "",

          EventParticipantType:
            item.EventParticipantType || ""

        };
      }
    );
  }


  /* =======================================================
     GET SUB EVENT PARTICIPANTS
  ======================================================= */

  private async getSubEventParticipants(
    eventId: number
  ): Promise<IWinnerSubEventStatus[]> {

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
        .get();


    return items.map(
      (item: any): IWinnerSubEventStatus => {

        const teamLeader:
          IWinnerPerson | null =
          item.TeamLeader
            ? {
              Id: item.TeamLeader.Id,
              Title:
                item.TeamLeader.Title || "",
              EMail:
                item.TeamLeader.EMail || ""
            }
            : null;


        const participants:
          IWinnerPerson[] =
          item.Participant
            ? item.Participant.map(
              (person: any) => ({
                Id: person.Id,
                Title:
                  person.Title || "",
                EMail:
                  person.EMail || ""
              })
            )
            : [];


        return {

          Id: item.Id,

          Event_IDId:
            item.Event_IDId,

          SubEventIDId:
            item.SubEventIDId,

          TeamIDId:
            item.TeamIDId,

          EventParticipantType:
            item.EventParticipantType || "",

          ParticipantOrTeamStatus:
            item.ParticipantOrTeamStatus || "",

          TeamLeader:
            teamLeader,

          Participant:
            participants

        };
      }
    );
  }


  /* =======================================================
     SCENARIO 1
     
     NO STAGES
     NO SUB EVENTS
  ======================================================= */

  public async getWinnersWithoutStagesOrSubEvents(
    eventId: number
  ): Promise<IWinnersResponse> {

    const eventParticipantType:
      string =
      await this.getEventParticipantType(
        eventId
      );


    const participants:
      IWinnerParticipant[] =
      await this.getEventParticipants(
        eventId
      );


    const finalized: boolean =
      participants.some(
        (participant: IWinnerParticipant) =>
          participant.ParticipantOrTeamStatus ===
          "Winner"
      );


    return {

      EventParticipantType:
        eventParticipantType,

      Participants:
        participants.map(
          (
            participant: IWinnerParticipant
          ): IWinnerRow => ({

            Id: participant.Id,

            EventParticipantType:
              participant.EventParticipantType,

            /*
             * Team ID is Item ID in this scenario.
             */

            TeamId:
              participant.Id,

            TeamLeader:
              participant.TeamLeader,

            Participant:
              participant.Participant,

            ParticipantOrTeamStatus:
              participant.ParticipantOrTeamStatus,

            Created:
              participant.Created,

            SubEvents: [],

            CanSelect:
              !finalized &&
              participant.ParticipantOrTeamStatus !==
              "Winner" &&
              participant.ParticipantOrTeamStatus !==
              "Not Qualified"

          })
        ),

      SubEvents: [],

      FinalStage: null,

      CanDeclareWinner:
        !finalized &&
        participants.length > 0,

      IsFinalized:
        finalized
    };
  }


  /* =======================================================
     SCENARIO 2
     
     WITH STAGES
     WITHOUT SUB EVENTS
  ======================================================= */

  public async getWinnersWithStages(
    eventId: number
  ): Promise<IWinnersResponse> {

    const eventParticipantType:
      string =
      await this.getEventParticipantType(
        eventId
      );


    const participants:
      IWinnerParticipant[] =
      await this.getEventParticipants(
        eventId
      );


    const stages:
      IWinnerStage[] =
      await this.getEventStages(
        eventId
      );


    const finalStage:
      string | null =
      this.getFinalStage(
        stages
      );


    if (!finalStage) {

      return {

        EventParticipantType:
          eventParticipantType,

        Participants: [],

        SubEvents: [],

        FinalStage: null,

        CanDeclareWinner: false,

        IsFinalized: false
      };
    }


    const finalStageStatuses:
      IWinnerStageStatus[] =
      await this.getFinalStageStatuses(
        eventId,
        finalStage
      );


    /*
     * Check whether all final-stage
     * qualification data is available.
     */

    const hasFinalStageData:
      boolean =
      finalStageStatuses.length > 0;


    /*
     * Check final result.
     */

    const finalized:
      boolean =
      participants.some(
        (
          participant: IWinnerParticipant
        ) =>
          participant.ParticipantOrTeamStatus ===
          "Winner"
      );


    /*
     * Only Qualified final-stage
     * participants should be selectable.
     */

    const winnerRows:
      IWinnerRow[] =
      participants
        .map(
          (
            participant: IWinnerParticipant
          ): IWinnerRow => {

            const finalStatus:
              IWinnerStageStatus | undefined =
              finalStageStatuses.find(
                (
                  status: IWinnerStageStatus
                ) =>
                  status.TeamIDId ===
                  participant.Id
              );


            const isQualified:
              boolean =
              finalStatus !== undefined &&
              finalStatus.Status ===
              "Qualified";


            return {

              Id:
                participant.Id,

              EventParticipantType:
                participant.EventParticipantType,

              TeamId:
                participant.Id,

              TeamLeader:
                participant.TeamLeader,

              Participant:
                participant.Participant,

              ParticipantOrTeamStatus:
                participant.ParticipantOrTeamStatus,

              Created:
                participant.Created,

              SubEvents: [],

              CanSelect:
                hasFinalStageData &&
                isQualified &&
                !finalized
            };
          }
        )
        .filter(
          (
            row: IWinnerRow
          ) =>
            row.CanSelect ||
            row.ParticipantOrTeamStatus ===
            "Winner" ||
            row.ParticipantOrTeamStatus ===
            "Not Qualified"
        );


    return {

      EventParticipantType:
        eventParticipantType,

      Participants:
        winnerRows,

      SubEvents: [],

      FinalStage:
        finalStage,

      /*
       * If no final stage data exists,
       * Declare button must be disabled.
       */

      CanDeclareWinner:
        hasFinalStageData &&
        !finalized &&
        winnerRows.some(
          (
            row: IWinnerRow
          ) => row.CanSelect
        ),

      IsFinalized:
        finalized
    };
  }


  /* =======================================================
     SCENARIO 3
     
     SUB EVENTS
     WITHOUT STAGES
  ======================================================= */

  public async getWinnersWithSubEvents(
    eventId: number
  ): Promise<IWinnersResponse> {

    const eventParticipantType:
      string =
      await this.getEventParticipantType(
        eventId
      );


    const participants:
      IWinnerParticipant[] =
      await this.getEventParticipants(
        eventId
      );


    const subEvents:
      IWinnerSubEvent[] =
      await this.getSubEvents(
        eventId
      );


    const subEventParticipants:
      IWinnerSubEventStatus[] =
      await this.getSubEventParticipants(
        eventId
      );


    const finalized:
      boolean =
      participants.some(
        (
          participant: IWinnerParticipant
        ) =>
          participant.ParticipantOrTeamStatus ===
          "Winner"
      );


    const rows:
      IWinnerRow[] =
      participants.map(
        (
          participant: IWinnerParticipant
        ): IWinnerRow => {

          const results:
            IWinnerSubEventResult[] =
            subEvents.map(
              (
                subEvent: IWinnerSubEvent
              ): IWinnerSubEventResult => {

                const statusRecord:
                  IWinnerSubEventStatus | undefined =
                  subEventParticipants.find(
                    (
                      record:
                        IWinnerSubEventStatus
                    ) =>
                      record.TeamIDId ===
                      participant.Id &&
                      record.SubEventIDId ===
                      subEvent.Id
                  );


                if (!statusRecord) {

                  return {

                    subEventId:
                      subEvent.Id,

                    subEventTitle:
                      subEvent.SubEventTitle,

                    status: "",

                    displayStatus:
                      "pending"

                  };
                }


                if (
                  statusRecord
                    .ParticipantOrTeamStatus ===
                  "Qualified"
                ) {

                  return {

                    subEventId:
                      subEvent.Id,

                    subEventTitle:
                      subEvent.SubEventTitle,

                    status:
                      "Qualified",

                    displayStatus:
                      "qualified"

                  };
                }


                if (
                  statusRecord
                    .ParticipantOrTeamStatus ===
                  "Not Qualified"
                ) {

                  return {

                    subEventId:
                      subEvent.Id,

                    subEventTitle:
                      subEvent.SubEventTitle,

                    status:
                      "Not Qualified",

                    displayStatus:
                      "not-qualified"

                  };
                }


                return {

                  subEventId:
                    subEvent.Id,

                  subEventTitle:
                    subEvent.SubEventTitle,

                  status:
                    statusRecord
                      .ParticipantOrTeamStatus,

                  displayStatus:
                    "pending"

                };
              }
            );


          /*
           * Winner selection is not enabled
           * unless all sub-events have a
           * Qualified / Not Qualified result.
           */

          const allResultsAvailable:
            boolean =
            results.length > 0 &&
            results.every(
              (
                result:
                  IWinnerSubEventResult
              ) =>
                result.displayStatus ===
                "qualified" ||
                result.displayStatus ===
                "not-qualified"
            );


          return {

            Id:
              participant.Id,

            EventParticipantType:
              participant.EventParticipantType,

            TeamId:
              participant.Id,

            TeamLeader:
              participant.TeamLeader,

            Participant:
              participant.Participant,

            ParticipantOrTeamStatus:
              participant.ParticipantOrTeamStatus,

            Created:
              participant.Created,

            SubEvents:
              results,

            CanSelect:
              allResultsAvailable &&
              !finalized
          };
        }
      );


    const canDeclare:
      boolean =
      !finalized &&
      rows.some(
        (
          row: IWinnerRow
        ) =>
          row.CanSelect
      );


    return {

      EventParticipantType:
        eventParticipantType,

      Participants:
        rows,

      SubEvents:
        subEvents,

      FinalStage: null,

      CanDeclareWinner:
        canDeclare,

      IsFinalized:
        finalized
    };
  }


  /* =======================================================
     SCENARIO 4
     
     SUB EVENTS
     WITH STAGES
  ======================================================= */

  // public async getWinnersWithSubEventsAndStages(
  //   eventId: number
  // ): Promise<IWinnersResponse> {

  //   const eventParticipantType:
  //     string =
  //     await this.getEventParticipantType(
  //       eventId
  //     );


  //   const participants:
  //     IWinnerParticipant[] =
  //     await this.getEventParticipants(
  //       eventId
  //     );


  //   const subEvents:
  //     IWinnerSubEvent[] =
  //     await this.getSubEvents(
  //       eventId
  //     );


  //   const stages:
  //     IWinnerStage[] =
  //     await this.getEventStages(
  //       eventId
  //     );


  //   /*
  //    * Keep FinalStage for the response.
  //    * Actual final stage checking is now
  //    * done separately for each SubEvent.
  //    */
  //   const finalStage:
  //     string | null =
  //     this.getFinalStage(
  //       stages
  //     );


  //   if (
  //     !finalStage ||
  //     subEvents.length === 0
  //   ) {

  //     return {

  //       EventParticipantType:
  //         eventParticipantType,

  //       Participants: [],

  //       SubEvents:
  //         subEvents,

  //       FinalStage:
  //         null,

  //       CanDeclareWinner:
  //         false,

  //       IsFinalized:
  //         false
  //     };
  //   }


  //   /*
  //    * Check whether the event has already
  //    * been finalized.
  //    */
  //   const finalized:
  //     boolean =
  //     participants.some(
  //       (
  //         participant:
  //           IWinnerParticipant
  //       ) =>
  //         participant.ParticipantOrTeamStatus ===
  //         "Winner"
  //     );


  //   /*
  //    * Build Winner rows.
  //    *
  //    * IMPORTANT:
  //    * Final stage is calculated separately
  //    * for every SubEvent.
  //    */
  //   const rows:
  //     IWinnerRow[] =
  //     await Promise.all(

  //       participants.map(
  //         async (
  //           participant:
  //             IWinnerParticipant
  //         ): Promise<IWinnerRow> => {

  //           const subEventResults:
  //             IWinnerSubEventResult[] =
  //             await Promise.all(

  //               subEvents.map(
  //                 async (
  //                   subEvent:
  //                     IWinnerSubEvent
  //                 ): Promise<IWinnerSubEventResult> => {

  //                   /*
  //                    * Find stages belonging ONLY
  //                    * to this SubEvent.
  //                    */


  //                   const finalStageForSubEvent:
  //                     string | null =
  //                     this.getFinalStageForSubEvent(
  //                       stages,
  //                       subEvent.Id
  //                     );


  //                   /*
  //                    * If no stage is configured
  //                    * for this SubEvent, show X.
  //                    */
  //                   if (!finalStageForSubEvent) {

  //                     return {

  //                       subEventId:
  //                         subEvent.Id,

  //                       subEventTitle:
  //                         subEvent.SubEventTitle,

  //                       status:
  //                         "",

  //                       displayStatus:
  //                         "missing"
  //                     };
  //                   }


  //                   /*
  //                    * Get status only for:
  //                    *
  //                    * Event
  //                    * + SubEvent
  //                    * + Final Stage
  //                    */
  //                   const stageStatuses:
  //                     IWinnerStageStatus[] =
  //                     await this.getFinalStageStatuses(
  //                       eventId,
  //                       finalStageForSubEvent
  //                     );


  //                   /*
  //                    * Find participant/team status
  //                    * for this particular SubEvent.
  //                    */
  //                   const statusRecord:
  //                     IWinnerStageStatus | undefined =
  //                     stageStatuses.find(
  //                       (
  //                         record:
  //                           IWinnerStageStatus
  //                       ) =>
  //                         record.TeamIDId ===
  //                         participant.Id &&
  //                         record.SubEventIDId ===
  //                         subEvent.Id
  //                     );


  //                   /*
  //                    * Participant/team did not reach
  //                    * final stage.
  //                    *
  //                    * Display X.
  //                    */
  //                   if (!statusRecord) {

  //                     return {

  //                       subEventId:
  //                         subEvent.Id,

  //                       subEventTitle:
  //                         subEvent.SubEventTitle,

  //                       status:
  //                         "Not Qualified",

  //                       displayStatus:
  //                         "not-qualified"
  //                     };
  //                   }


  //                   /*
  //                    * Final stage Qualified
  //                    */
  //                   if (
  //                     statusRecord.Status ===
  //                     "Qualified"
  //                   ) {

  //                     return {

  //                       subEventId:
  //                         subEvent.Id,

  //                       subEventTitle:
  //                         subEvent.SubEventTitle,

  //                       status:
  //                         "Qualified",

  //                       displayStatus:
  //                         "qualified"
  //                     };
  //                   }


  //                   /*
  //                    * Final stage Not Qualified
  //                    */
  //                   if (
  //                     statusRecord.Status ===
  //                     "Not Qualified"
  //                   ) {

  //                     return {

  //                       subEventId:
  //                         subEvent.Id,

  //                       subEventTitle:
  //                         subEvent.SubEventTitle,

  //                       status:
  //                         "Not Qualified",

  //                       displayStatus:
  //                         "not-qualified"
  //                     };
  //                   }


  //                   /*
  //                    * Any other status
  //                    * should be treated as missing.
  //                    */
  //                   return {

  //                     subEventId:
  //                       subEvent.Id,

  //                     subEventTitle:
  //                       subEvent.SubEventTitle,

  //                     status:
  //                       statusRecord.Status || "",

  //                     displayStatus:
  //                       "missing"
  //                   };

  //                 }
  //               )
  //             );


  //           /*
  //            * Every SubEvent must have either
  //            * Qualified or Not Qualified.
  //            */
  //           const allSubEventsAvailable:
  //             boolean =
  //             subEventResults.length > 0 &&
  //             subEventResults.every(
  //               (
  //                 result:
  //                   IWinnerSubEventResult
  //               ) =>
  //                 result.displayStatus ===
  //                 "qualified" ||
  //                 result.displayStatus ===
  //                 "not-qualified"
  //             );


  //           return {

  //             Id:
  //               participant.Id,

  //             EventParticipantType:
  //               participant.EventParticipantType,

  //             /*
  //              * Team ID is the EventParticipants
  //              * Item ID in this scenario.
  //              */
  //             TeamId:
  //               participant.Id,

  //             TeamLeader:
  //               participant.TeamLeader,

  //             Participant:
  //               participant.Participant,

  //             ParticipantOrTeamStatus:
  //               participant.ParticipantOrTeamStatus,

  //             Created:
  //               participant.Created,

  //             SubEvents:
  //               subEventResults,

  //             /*
  //              * Selection is allowed only when
  //              * every SubEvent has final-stage
  //              * information.
  //              */
  //             CanSelect:
  //               allSubEventsAvailable &&
  //               !finalized
  //           };

  //         }
  //       )
  //     );


  //   /*
  //    * Check whether any participant/team has
  //    * missing final-stage information.
  //    */
  //   const hasMissingFinalStageData:
  //     boolean =
  //     rows.some(
  //       (
  //         row:
  //           IWinnerRow
  //       ) =>
  //         row.SubEvents.some(
  //           (
  //             result:
  //               IWinnerSubEventResult
  //           ) =>
  //             result.displayStatus ===
  //             "missing"
  //         )
  //     );


  //   /*
  //    * There must be at least one actual
  //    * final-stage result.
  //    */
  //   const hasFinalStageData:
  //     boolean =
  //     rows.some(
  //       (
  //         row:
  //           IWinnerRow
  //       ) =>
  //         row.SubEvents.some(
  //           (
  //             result:
  //               IWinnerSubEventResult
  //           ) =>
  //             result.displayStatus ===
  //             "qualified" ||
  //             result.displayStatus ===
  //             "not-qualified"
  //         )
  //     );


  //   /*
  //    * Declare Winner is enabled only when:
  //    *
  //    * 1. Final-stage data exists
  //    * 2. No participant/team has missing data
  //    * 3. Event is not already finalized
  //    * 4. At least one row can be selected
  //    */
  //   const canDeclare:
  //     boolean =
  //     hasFinalStageData &&
  //     !hasMissingFinalStageData &&
  //     !finalized &&
  //     rows.some(
  //       (
  //         row:
  //           IWinnerRow
  //       ) =>
  //         row.CanSelect
  //     );


  //   return {

  //     EventParticipantType:
  //       eventParticipantType,

  //     Participants:
  //       rows,

  //     SubEvents:
  //       subEvents,

  //     /*
  //      * This value is retained for compatibility
  //      * with the existing interface/UI.
  //      *
  //      * Actual final stage is determined per
  //      * SubEvent above.
  //      */
  //     FinalStage:
  //       finalStage,

  //     CanDeclareWinner:
  //       canDeclare,

  //     IsFinalized:
  //       finalized
  //   };
  // }


  public async getWinnersWithSubEventsAndStages(
    eventId: number
  ): Promise<IWinnersResponse> {

    const eventParticipantType:
      string =
      await this.getEventParticipantType(
        eventId
      );


    const participants:
      IWinnerParticipant[] =
      await this.getEventParticipants(
        eventId
      );


    const subEvents:
      IWinnerSubEvent[] =
      await this.getSubEvents(
        eventId
      );


    const stages:
      IWinnerStage[] =
      await this.getEventStages(
        eventId
      );


    /*
     * Keep FinalStage for compatibility.
     *
     * Actual final stage is calculated separately
     * for every SubEvent.
     */
    const finalStage:
      string | null =
      this.getFinalStage(
        stages
      );


    if (
      !finalStage ||
      subEvents.length === 0
    ) {

      return {

        EventParticipantType:
          eventParticipantType,

        Participants: [],

        SubEvents:
          subEvents,

        FinalStage:
          null,

        CanDeclareWinner:
          false,

        IsFinalized:
          false
      };
    }


    /*
     * ============================================================
     * GET FINAL STAGE STATUS FOR EACH SUB EVENT
     * ============================================================
     *
     * IMPORTANT:
     *
     * We need to know whether there is ANY final-stage
     * data for the event.
     *
     * If ALL SubEvents have zero final-stage records,
     * Winners page must show "No Data to display".
     *
     * If at least one SubEvent has final-stage records,
     * we continue building the rows.
     */
    const subEventStageStatuses:
      {
        subEventId: number;
        finalStage: string | null;
        statuses: IWinnerStageStatus[];
      }[] =
      await Promise.all(

        subEvents.map(
          async (
            subEvent:
              IWinnerSubEvent
          ) => {

            const finalStageForSubEvent:
              string | null =
              this.getFinalStageForSubEvent(
                stages,
                subEvent.Id
              );


            if (!finalStageForSubEvent) {

              return {

                subEventId:
                  subEvent.Id,

                finalStage:
                  null,

                statuses:
                  []
              };
            }


            const statuses:
              IWinnerStageStatus[] =
              await this.getFinalStageStatuses(
                eventId,
                finalStageForSubEvent
              );


            return {

              subEventId:
                subEvent.Id,

              finalStage:
                finalStageForSubEvent,

              statuses:
                statuses
            };
          }
        )
      );


    /*
     * ============================================================
     * CHECK WHETHER ANY FINAL STAGE DATA EXISTS
     * ============================================================
     *
     * If there are ZERO records for ALL SubEvents,
     * don't display registered EventParticipants.
     */
    const hasAnyFinalStageData:
      boolean =
      subEventStageStatuses.some(
        (
          subEventStatus
        ) =>
          subEventStatus.statuses.length > 0
      );


    /*
     * NO FINAL STAGE DATA AT ALL
     *
     * This is the Admin-missed-update scenario.
     */
    if (!hasAnyFinalStageData) {

      return {

        EventParticipantType:
          eventParticipantType,

        Participants: [],

        SubEvents:
          subEvents,

        FinalStage:
          finalStage,

        CanDeclareWinner:
          false,

        IsFinalized:
          false
      };
    }


    /*
     * ============================================================
     * CHECK WHETHER EVENT IS ALREADY FINALIZED
     * ============================================================
     */
    const finalized:
      boolean =
      participants.some(
        (
          participant:
            IWinnerParticipant
        ) =>
          participant.ParticipantOrTeamStatus ===
          "Winner"
      );


    /*
     * ============================================================
     * BUILD WINNER ROWS
     * ============================================================
     */
    const rows:
      IWinnerRow[] =
      await Promise.all(

        participants.map(
          async (
            participant:
              IWinnerParticipant
          ): Promise<IWinnerRow> => {

            const subEventResults:
              IWinnerSubEventResult[] =
              subEvents.map(
                (
                  subEvent:
                    IWinnerSubEvent
                ): IWinnerSubEventResult => {

                  /*
                   * Find the final-stage data that was
                   * already loaded for this SubEvent.
                   */
                  const subEventStatusData =
                    subEventStageStatuses.find(
                      (
                        item
                      ) =>
                        item.subEventId ===
                        subEvent.Id
                    );


                  /*
                   * No stage configured for this
                   * SubEvent.
                   *
                   * Treat as Not Qualified so that
                   * it displays X.
                   */
                  if (
                    !subEventStatusData ||
                    !subEventStatusData.finalStage
                  ) {

                    return {

                      subEventId:
                        subEvent.Id,

                      subEventTitle:
                        subEvent.SubEventTitle,

                      status:
                        "Not Qualified",

                      displayStatus:
                        "not-qualified"
                    };
                  }


                  const stageStatuses:
                    IWinnerStageStatus[] =
                    subEventStatusData.statuses;


                  /*
                   * Find participant/team in the
                   * final stage for this SubEvent.
                   */
                  const statusRecord:
                    IWinnerStageStatus | undefined =
                    stageStatuses.find(
                      (
                        record:
                          IWinnerStageStatus
                      ) =>
                        record.TeamIDId ===
                        participant.Id &&
                        record.SubEventIDId ===
                        subEvent.Id
                    );


                  /*
                   * Participant/team did not reach
                   * the final stage.
                   *
                   * Display X.
                   */
                  if (!statusRecord) {

                    return {

                      subEventId:
                        subEvent.Id,

                      subEventTitle:
                        subEvent.SubEventTitle,

                      status:
                        "Not Qualified",

                      displayStatus:
                        "not-qualified"
                    };
                  }


                  /*
                   * Final stage Qualified
                   */
                  if (
                    statusRecord.Status ===
                    "Qualified"
                  ) {

                    return {

                      subEventId:
                        subEvent.Id,

                      subEventTitle:
                        subEvent.SubEventTitle,

                      status:
                        "Qualified",

                      displayStatus:
                        "qualified"
                    };
                  }


                  /*
                   * Final stage Not Qualified
                   */
                  if (
                    statusRecord.Status ===
                    "Not Qualified"
                  ) {

                    return {

                      subEventId:
                        subEvent.Id,

                      subEventTitle:
                        subEvent.SubEventTitle,

                      status:
                        "Not Qualified",

                      displayStatus:
                        "not-qualified"
                    };
                  }


                  /*
                   * Any other status
                   *
                   * Treat as Not Qualified.
                   */
                  return {

                    subEventId:
                      subEvent.Id,

                    subEventTitle:
                      subEvent.SubEventTitle,

                    status:
                      "Not Qualified",

                    displayStatus:
                      "not-qualified"
                  };

                }
              );


            /*
             * Every SubEvent must have either
             * Qualified or Not Qualified.
             */
            const allSubEventsAvailable:
              boolean =
              subEventResults.length > 0 &&
              subEventResults.every(
                (
                  result:
                    IWinnerSubEventResult
                ) =>
                  result.displayStatus ===
                  "qualified" ||
                  result.displayStatus ===
                  "not-qualified"
              );


            return {

              Id:
                participant.Id,

              EventParticipantType:
                participant.EventParticipantType,

              /*
               * Team ID is the EventParticipants
               * Item ID in this scenario.
               */
              TeamId:
                participant.Id,

              TeamLeader:
                participant.TeamLeader,

              Participant:
                participant.Participant,

              ParticipantOrTeamStatus:
                participant.ParticipantOrTeamStatus,

              Created:
                participant.Created,

              SubEvents:
                subEventResults,

              /*
               * Selection is allowed when every
               * SubEvent has a usable status.
               */
              CanSelect:
                allSubEventsAvailable &&
                !finalized
            };

          }
        )
      );


    /*
     * ============================================================
     * CHECK WHETHER ANY PARTICIPANT CAN BE SELECTED
     * ============================================================
     */
    const canDeclare:
      boolean =
      hasAnyFinalStageData &&
      !finalized &&
      rows.some(
        (
          row:
            IWinnerRow
        ) =>
          row.CanSelect
      );


    /*
     * ============================================================
     * RETURN
     * ============================================================
     */
    return {

      EventParticipantType:
        eventParticipantType,

      Participants:
        rows,

      SubEvents:
        subEvents,

      FinalStage:
        finalStage,

      CanDeclareWinner:
        canDeclare,

      IsFinalized:
        finalized
    };
  }


  /* =======================================================
     GET WINNERS
     
     MAIN ENTRY POINT
  ======================================================= */

  public async getWinners(
    eventId: number,
    _hasSubEvents?: boolean,
    _hasStages?: boolean
  ): Promise<IWinnersResponse> {

    /*
     * IMPORTANT:
     * Always read HasStages and HasSubEvents from
     * Corp_SL_EventManagement. React props are not used
     * to decide which winner scenario should run.
     */
    const configuration =
      await this.getEventConfiguration(eventId);

    const {
      HasStages,
      HasSubEvents
    } = configuration;

    console.log(
      "Winner event configuration:",
      configuration
    );

    // Scenario 1: no stages + no sub-events
    if (!HasStages && !HasSubEvents) {
      return this.getWinnersWithoutStagesOrSubEvents(
        eventId
      );
    }

    // Scenario 2: stages + no sub-events
    if (HasStages && !HasSubEvents) {
      return this.getWinnersWithStages(
        eventId
      );
    }

    // Scenario 3: no stages + sub-events
    if (!HasStages && HasSubEvents) {
      return this.getWinnersWithSubEvents(
        eventId
      );
    }

    // Scenario 4: stages + sub-events
    return this.getWinnersWithSubEventsAndStages(
      eventId
    );
  }


  /* =======================================================
     DECLARE WINNERS
     
     Selected IDs:
       Winner
     
     All other EventParticipants:
       Not Qualified
  ======================================================= */

  public async declareWinners(
    eventId: number,
    selectedParticipantIds: number[]
  ): Promise<void> {

    /*
     * Get ALL participants for this event.
     */

    const participants:
      IWinnerParticipant[] =
      await this.getEventParticipants(
        eventId
      );


    if (
      selectedParticipantIds.length === 0
    ) {

      throw new Error(
        "Please select at least one participant or team."
      );
    }


    /*
     * Update every participant/team.
     */

    for (
      const participant of participants
    ) {

      const isWinner:
        boolean =
        selectedParticipantIds.indexOf(
          participant.Id
        ) !== -1;


      await sp.web.lists
        .getByTitle(
          "Corp_SL_EventParticipants"
        )
        .items
        .getById(
          participant.Id
        )
        .update({

          ParticipantOrTeamStatus:
            isWinner
              ? "Winner"
              : "Not Qualified"

        });
    }
  }


  /* =======================================================
     CHECK FINALIZED
  ======================================================= */

  public async isWinnerDeclarationCompleted(
    eventId: number
  ): Promise<boolean> {

    const participants:
      IWinnerParticipant[] =
      await this.getEventParticipants(
        eventId
      );


    if (
      participants.length === 0
    ) {
      return false;
    }


    /*
     * If at least one Winner exists,
     * treat winner declaration as completed.
     */

    return participants.some(
      (
        participant:
          IWinnerParticipant
      ) =>
        participant.ParticipantOrTeamStatus ===
        "Winner"
    );
  }

}