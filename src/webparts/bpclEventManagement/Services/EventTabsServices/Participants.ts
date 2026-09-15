import { sp } from "@pnp/sp";

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/fields";


export interface IParticipantPerson {
  Id: number;
  Title: string;
  EMail?: string;
}




export interface IParticipantsResponse {
  EventParticipantType: string;
  Participants: IParticipantData[];
}

export interface IParticipantData {
  Id: number;
  TeamLeader: IParticipantPerson | null;
  Participant: IParticipantPerson[];
  Created: string;
  ParticipantOrTeamStatus: string;
  DocumentCount: number;
  StagesCleared: string;
}


export default class ParticipantsService {


  public async getParticipants(
    eventId: number
  ): Promise<IParticipantsResponse> {

    try {


      const eventItem: any = await sp.web.lists
        .getByTitle("Corp_SL_EventManagement")
        .items
        .getById(eventId)
        .select(
          "Id",
          "EventParticipantType"
        )
        .get();


      const eventParticipantType: string =
        eventItem.EventParticipantType || "";

      /* ============================================
 GET TOTAL STAGES FOR EVENT
 Common for all participants
============================================ */

      const stageItems: any[] =
        await sp.web.lists
          .getByTitle("Corp_SL_EventStages")
          .items
          .select(
            "Id",
            "EventIDId",
            "Stages"
          )
          .filter(
            `EventIDId eq ${eventId}`
          )
          .get();

      const totalStages: number = stageItems.length;


      const participantItems: any[] = await sp.web.lists
        .getByTitle("Corp_SL_EventParticipants")
        .items
        .select(
          "Id",
          "Created",
          "Event_IDId",
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
        .filter(`Event_IDId eq ${eventId}`)
        .orderBy("Created", false)
        .get();


      /* ============================================
         FORMAT PARTICIPANT DATA
      ============================================ */

      const participants: IParticipantData[] = await Promise.all(
        participantItems.map(async (item: any) => {

          // TeamLeader is a single People Picker
          const teamLeader: IParticipantPerson | null =
            item.TeamLeader
              ? {
                Id: item.TeamLeader.Id,
                Title: item.TeamLeader.Title || "",
                EMail: item.TeamLeader.EMail || ""
              }
              : null;

          // Participant can contain multiple people
          const participantPeople: IParticipantPerson[] =
            item.Participant
              ? item.Participant.map(
                (person: any) => ({
                  Id: person.Id,
                  Title: person.Title || "",
                  EMail: person.EMail || ""
                })
              )
              : [];

          /* ============================================
             GET DOCUMENT COUNT
             Corp_SL_EventParticipantDocument
             TeamID is a Lookup field
          ============================================ */

          const documentItems: any[] =
            await sp.web.lists
              .getByTitle("Corp_SL_EventParticipantDocument")
              .items
              .select("Id", "TeamIDId")
              .filter(`TeamIDId eq ${item.Id}`)
              .get();

          const documentCount: number = documentItems.length;


          /* ============================================
   GET CLEARED STAGES
   TeamID == Participant/Team ID
   Status == Qualified
============================================ */

          const qualifiedStageItems: any[] =
            await sp.web.lists
              .getByTitle("Corp_SL_EventParticipantStageStatus")
              .items
              .select(
                "Id",
                "TeamIDId",
                "Status",
                "Stage"
              )
              .filter(
                `TeamIDId eq ${item.Id} and Status eq 'Qualified'`
              )
              .get();

          const clearedStages: number = qualifiedStageItems.length;
            

          return {
            Id: item.Id,

            TeamLeader: teamLeader,

            Participant: participantPeople,

            Created: item.Created,

            ParticipantOrTeamStatus:
              item.ParticipantOrTeamStatus || "",

            DocumentCount: documentCount,
             StagesCleared: `${clearedStages}/${totalStages}`
    
          };

        })
      );


      /* ============================================
         RETURN DATA
      ============================================ */

      return {

        EventParticipantType: eventParticipantType,

        Participants: participants

      };

    } catch (error) {

      console.error(
        "Error getting participant details:",
        error
      );

      throw error;

    }

  }

}