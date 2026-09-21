import { sp } from "@pnp/sp";

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/attachments";

// ======================================================
// PEOPLE PICKER
// ======================================================

export interface IEventOrganiser {
  Id: number;
  Title: string;
  EMail: string;
}

// ======================================================
// IMAGE
// ======================================================

export interface IEventImage {
  fileName: string;
  serverRelativeUrl: string;
}

// ======================================================
// EVENT ATTACHMENT
// ======================================================

export interface IEventAttachment {
  FileName: string;
  ServerRelativeUrl: string;
}

// ======================================================
// SUB EVENT
// ======================================================

export interface IExistingSubEvent {
  Id: number;
  SubEventTitle: string;
  SubEventDescription: string;
  MinimumMembersRequired: number;
  Event_ID?: number;
  Event_Title: string;
  SubEventStageStatus: string;
  HasStages: boolean;
}

// ======================================================
// EVENT DETAILS
// ======================================================

export interface IEventDetails {
  Id: number;
  EventTitle: string;
  EventDescription: string;

  // ====================================================
  // EVENT DATE
  // ====================================================

  EventStartDate: string;
  EventEndDate: string;

  // ====================================================
  // PARTICIPANT DETAILS
  // ====================================================

  EventParticipantType: string;
  HasSubEvents: boolean;

  // ====================================================
  // RULES
  // ====================================================

  RulesAndRegualtionType: string;
  RulesAndRegualtionText: string;

  // ====================================================
  // REGISTRATION
  // ====================================================

  RegistrationStartDate: string;
  RegistrationEndDate: string;

  // ====================================================
  // TEAM DETAILS
  // ====================================================

  MaxTeamMembers: number;
  MandatoryMember: number;

  // ====================================================
  // EVENT ORGANISER - PEOPLE PICKER
  // ====================================================

  EventOrganiser?: IEventOrganiser;

  // ====================================================
  // ORGANIZER DETAILS
  // ====================================================

  EventOrganizerDepartment: string;
  EventOrganizerEmail: string;
  EventOrganizerPhoneNumber: string;

  // ====================================================
  // STATUS
  // ====================================================

  OverAllEventStatus: string;

  // ====================================================
  // IMAGES
  // ====================================================

  RulesAndRegualtionImage?: IEventImage;
  EventBannerImage?: IEventImage;

  // ====================================================
  // SUB EVENTS
  // ====================================================

  SubEvents: IExistingSubEvent[];

  // ====================================================
  // ATTACHMENTS
  // ====================================================

  Attachments: IEventAttachment[];
}

// ======================================================
// ABOUT SERVICE
// ======================================================

export default class AboutService {

  // ====================================================
  // LIST NAMES
  // ====================================================

  private eventListName = "Corp_SL_EventManagement";

  private subEventListName ="Corp_SL_SubEventManagement";

  private eventParticipantListName = "Corp_SL_EventParticipants";

  // ====================================================
  // GET RULES AND REGULATION IMAGE
  // ====================================================

  private async getRulesAndRegulationImage(
    imageValue: any,
    itemId: number
  ): Promise<IEventImage | undefined> {

    try {

      if (!imageValue) {
        return undefined;
      }

      /*
       * SharePoint Image Column can return
       * JSON string or object.
       */

      let imageData: any = imageValue;
      if (typeof imageValue === "string") {
        try {
          imageData = JSON.parse(imageValue);
        } catch {
          return undefined;
        }
      }

      const fileName =
        imageData.fileName ||
        imageData.FileName ||
        "";

      const serverRelativeUrl =
        imageData.serverRelativeUrl ||
        imageData.ServerRelativeUrl ||
        "";

      if (!fileName && !serverRelativeUrl) {
        return undefined;
      }

      return {
        fileName,
        serverRelativeUrl
      };

    } catch (error) {

      console.error(
        "Error getting Rules image:",
        error
      );
      return undefined;
    }
  }

  // ====================================================
  // GET EVENT BANNER IMAGE
  // ====================================================

  private async getEventBannerImage(
    imageValue: any,
    itemId: number
  ): Promise<IEventImage | undefined> {

    try {
      if (!imageValue) {
        return undefined;
      }
      let imageData: any = imageValue;
      if (typeof imageValue === "string") {
        try {
          imageData = JSON.parse(imageValue);
        } catch {
          return undefined;
        }
      }
      const fileName =
        imageData.fileName ||
        imageData.FileName ||
        "";
      const serverRelativeUrl =
        imageData.serverRelativeUrl ||
        imageData.ServerRelativeUrl ||
        "";

      if (!fileName && !serverRelativeUrl) {
        return undefined;
      }

      return {
        fileName,
        serverRelativeUrl
      };

    } catch (error) {

      console.error(
        "Error getting Event Banner image:",
        error
      );

      return undefined;
    }
  }

  // ====================================================
  // GET EVENT DETAILS
  // ====================================================

  public async getEventDetails(
    eventId: number
  ): Promise<IEventDetails> {

    try {

      if (
        !eventId ||
        eventId <= 0
      ) {

        throw new Error(
          "Invalid Event ID."
        );
      }

      // ==================================================
      // 1. GET EVENT DETAILS
      // ==================================================

      const item: any =
        await sp.web.lists
          .getByTitle(
            this.eventListName
          )
          .items
          .getById(eventId)
          .select(
            "Id",
            "EventTitle",
            "EventDescription",
            "EventStartDate",
            "EventEndDate",
            "EventParticipantType",
            "HasSubEvents",
            "RulesAndRegualtionType",
            "RulesAndRegualtionText",
            "RegistrationStartDate",
            "RegistrationEndDate",
            "MaxTeamMembers",
            "MandatoryMember",
            "EventOrganizerDepartment",
            "EventOrganizerEmail",
            "EventOrganizerPhoneNumber",
            "OverAllEventStatus",
            "EventOrganiser/Id",
            "EventOrganiser/Title",
            "EventOrganiser/EMail",
            "RulesAndRegualtionImage",
            "EventBannerImage"
          )
          .expand(
            "EventOrganiser"
          )();

      // ==================================================
      // 2. GET RULES IMAGE
      // ==================================================

      const rulesImage =
        await this.getRulesAndRegulationImage(
          item.RulesAndRegualtionImage,
          item.Id
        );

      // ==================================================
      // 3. GET EVENT BANNER IMAGE
      // ==================================================

      const eventBannerImage =
        await this.getEventBannerImage(
          item.EventBannerImage,
          item.Id
        );

      // ==================================================
      // 4. GET SHAREPOINT ITEM ATTACHMENTS
      // ==================================================

      const attachmentItems: any[] =
        await sp.web.lists
          .getByTitle(
            this.eventListName
          )
          .items
          .getById(eventId)
          .attachmentFiles();

      console.log(
        "ALL SHAREPOINT ITEM ATTACHMENTS:",
        attachmentItems
      );

      // ==================================================
      // 5. CREATE SET OF IMAGE FILES TO EXCLUDE
      // ==================================================

      const excludedFileNames =
        new Set<string>();

      const excludedUrls =
        new Set<string>();

      // ==================================================
      // RULES IMAGE
      // ==================================================

      if (rulesImage) {
        if (rulesImage.fileName) {
          excludedFileNames.add(
            rulesImage.fileName.toLowerCase()
          );
        }

        if (
          rulesImage.serverRelativeUrl
        ) {

          excludedUrls.add(
            rulesImage.serverRelativeUrl.toLowerCase()
          );
        }
      }

      // ==================================================
      // EVENT BANNER IMAGE
      // ==================================================

      if (eventBannerImage) {
        if (eventBannerImage.fileName) {
          excludedFileNames.add(
            eventBannerImage.fileName.toLowerCase()
          );
        }

        if (
          eventBannerImage.serverRelativeUrl
        ) {
          excludedUrls.add(
            eventBannerImage.serverRelativeUrl.toLowerCase()
          );
        }
      }

      // ==================================================
      // 6. FILTER REAL USER ATTACHMENTS
      // ==================================================

      const filteredAttachments =
        attachmentItems.filter(
          (attachment: any) => {
            const fileName =
              (
                attachment.FileName ||
                ""
              ).toLowerCase();

            const fileUrl =
              (
                attachment.ServerRelativeUrl ||
                ""
              ).toLowerCase();

            // ============================================
            // EXCLUDE RULES IMAGE BY FILE NAME
            // ============================================

            if (
              excludedFileNames.has(
                fileName
              )
            ) {

              return false;
            }

            // ============================================
            // EXCLUDE RULES/BANNER IMAGE BY URL
            // ============================================

            if (
              excludedUrls.has(
                fileUrl
              )
            ) {
              return false;
            }

            // ============================================
            // EXCLUDE SHAREPOINT GENERATED IMAGE
            // ============================================

            if (
              fileName.startsWith(
                "reserved_imageattachment"
              )
            ) {

              return false;
            }

            // ============================================
            // REAL USER ATTACHMENT
            // ============================================
            return true;
          }
        );

      // ==================================================
      // 7. MAP ATTACHMENTS
      // ==================================================

      const attachments:
        IEventAttachment[] =
        filteredAttachments.map(
          (attachment: any) => ({
            FileName: attachment.FileName,
            ServerRelativeUrl: attachment.ServerRelativeUrl
          })
        );

      // ==================================================
      // 8. GET SUB EVENTS
      // ==================================================

      let subEvents:IExistingSubEvent[] = [];

      if (item.HasSubEvents) {
        subEvents =
          await this.getSubEventsByEventId(
            eventId
          );
      }

      // ==================================================
      // 9. RETURN EVENT DETAILS
      // ==================================================

      return {
        Id: item.Id,
        EventTitle:  item.EventTitle ?? "",
        EventDescription: item.EventDescription ?? "",
        EventStartDate: item.EventStartDate ?? "",
        EventEndDate: item.EventEndDate ?? "",
        EventParticipantType: item.EventParticipantType ?? "",
        HasSubEvents:  item.HasSubEvents ?? false,
        RulesAndRegualtionType: item.RulesAndRegualtionType ?? "",
        RulesAndRegualtionText: item.RulesAndRegualtionText ?? "",
        RegistrationStartDate: item.RegistrationStartDate ?? "",
        RegistrationEndDate: item.RegistrationEndDate ?? "",
        MaxTeamMembers:  item.MaxTeamMembers ?? 0,
        MandatoryMember: item.MandatoryMember ?? 0,
        EventOrganiser: item.EventOrganiser
            ? {

                Id:  item.EventOrganiser.Id,
                Title:  item.EventOrganiser.Title ?? "",
                EMail:  item.EventOrganiser.EMail ?? ""
              }

            : undefined,

        // ================================================
        // ORGANIZER DETAILS
        // ================================================

        EventOrganizerDepartment: item.EventOrganizerDepartment ?? "",
        EventOrganizerEmail:
          item.EventOrganizerEmail ??
          item.EventOrganiser?.EMail ??
          "",
        EventOrganizerPhoneNumber: item.EventOrganizerPhoneNumber ?? "",
        OverAllEventStatus:  item.OverAllEventStatus ?? "",
        RulesAndRegualtionImage: rulesImage,
        EventBannerImage:  eventBannerImage,
        SubEvents: subEvents,
        Attachments:  attachments
      };

    } catch (error) {

      console.error(
        "Error fetching event details:",
        error
      );

      throw error;
    }
  }

  // ====================================================
  // GET EVENT PARTICIPANT COUNTS
  //
  // SOURCE:
  // Corp_SL_EventParticipants
  //
  // FILTER:
  // Event_ID = eventId
  //
  // TEAM EVENT:
  // Teams = number of participant list items
  // Members = total users in Participant column
  //
  // INDIVIDUAL EVENT:
  // Members = number of participant list items
  // Teams = 0
  // ====================================================

  public async getEventParticipantCounts(
    eventId: number
  ): Promise<{
    teams: number;
    members: number;
  }> {

    try {

      if (
        !eventId ||
        eventId <= 0
      ) {

        return {
          teams: 0,
          members: 0
        };
      }

      // ==================================================
      // GET PARTICIPANTS FOR THIS EVENT
      //
      // Participant is a MULTI-PERSON field.
      // ==================================================

      const participants: any[] =
        await sp.web.lists
          .getByTitle(
            this.eventParticipantListName
          )
          .items
          .select(
            "Id",
            "Participant/Id"
          )
          .expand(
            "Participant"
          )
          .filter(
            `Event_IDId eq ${eventId}`
          )();

      console.log(
        "EVENT PARTICIPANT ITEMS:",
        participants
      );

      // ==================================================
      // TEAM COUNT
      //
      // Every item in Corp_SL_EventParticipants
      // represents one registered team.
      // ==================================================

      const teams = participants.length;

      // ==================================================
      // MEMBER COUNT
      //
      // Count all users inside Participant column.
      // ==================================================

      let members = 0;

      participants.forEach(
        (participantItem: any) => {

          const participantUsers =
            participantItem.Participant;

          // =================================================
          // MULTI-PERSON FIELD
          // =================================================

          if (
            Array.isArray(
              participantUsers
            )
          ) {

            members +=
              participantUsers.length;
          }

          // =================================================
          // SAFETY HANDLING
          //
          // If SharePoint returns one person object.
          // =================================================

          else if (
            participantUsers
          ) {

            members += 1;
          }
        }
      );

      console.log(
        "REGISTERED TEAMS:",
        teams
      );

      console.log(
        "REGISTERED MEMBERS:",
        members
      );

      return {
        teams,
        members
      };

    } catch (error) {

      console.error(
        "Error fetching event participant counts:",
        error
      );

      return {
        teams: 0,
        members: 0
      };
    }
  }

  // ====================================================
  // GET ALL SUB EVENTS FOR EVENT
  // ====================================================

  public async getSubEventsByEventId(
    eventId: number
  ): Promise<IExistingSubEvent[]> {

    try {

      if (
        !eventId ||
        eventId <= 0
      ) {

        throw new Error(
          "Invalid Event ID."
        );
      }

      const items: any[] =
        await sp.web.lists
          .getByTitle(
            this.subEventListName
          )
          .items
          .filter(
            `Event_IDId eq ${eventId}`
          )();

      console.log(
        "SubEvent items:",
        items
      );

      return items.map(
        (item: any) => ({
          Id: item.Id,
          SubEventTitle: item.SubEventTitle ?? "",
          SubEventDescription:item.SubEventDescription ?? "",
          MinimumMembersRequired: item.MinimumMembersRequired ?? 0,
          Event_ID:  item.Event_ID ?? undefined,
          Event_Title: item.Event_Title ?? "",
          SubEventStageStatus: item.SubEventStageStatus ?? "",
          HasStages: item.HasStages ?? false
        })
      );

    } catch (error) {
      console.error(
        "Error fetching sub events:",
        error
      );
      throw error;
    }
  }
}