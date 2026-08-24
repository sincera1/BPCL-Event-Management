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


export interface IParticipantData {
  Id: number;
  TeamLeader: IParticipantPerson | null;
  Participant: IParticipantPerson[];
  Created: string;
}


export interface IParticipantsResponse {
  EventParticipantType: string;
  Participants: IParticipantData[];
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

      const participantItems: any[] = await sp.web.lists
        .getByTitle("Corp_SL_EventParticipants")
        .items
        .select(
          "Id",
          "Created",
          "Event_IDId",
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

      const participants: IParticipantData[] =
        participantItems.map((item: any) => {

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


          return {

            // SharePoint Item ID
            Id: item.Id,

            // Team Leader
            TeamLeader: teamLeader,

            // Individual participant / Team Members
            Participant: participantPeople,

            // Registration Date
            Created: item.Created
          };

        });


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