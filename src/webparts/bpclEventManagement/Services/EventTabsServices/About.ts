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


  // EVENT DATE

  EventStartDate: string;

  EventEndDate: string;


  // PARTICIPANT DETAILS

  EventParticipantType: string;

  HasSubEvents: boolean;


  // RULES

  RulesAndRegualtionType: string;

  RulesAndRegualtionText: string;


  // REGISTRATION

  RegistrationStartDate: string;

  RegistrationEndDate: string;


  // TEAM DETAILS

  MaxTeamMembers: number;

  MandatoryMember: number;


  // EVENT ORGANISER - PEOPLE PICKER

  EventOrganiser?: IEventOrganiser;


  // ORGANIZER DETAILS

  EventOrganizerDepartment: string;

  EventOrganizerEmail: string;

  EventOrganizerPhoneNumber: string;


  // STATUS

  OverAllEventStatus: string;


  // IMAGES

  RulesAndRegualtionImage?: IEventImage;

  EventBannerImage?: IEventImage;


  // SUB EVENTS

  SubEvents: IExistingSubEvent[];


  // ATTACHMENTS

  Attachments: IEventAttachment[];
}


// ======================================================
// ABOUT SERVICE
// ======================================================

export default class AboutService {


  // ====================================================
  // LIST NAMES
  // ====================================================

  private eventListName =
    "Corp_SL_EventManagement";

  private subEventListName =
    "Corp_SL_SubEventManagement";


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
        SharePoint Image Column can return
        JSON string or object.
      */

      let imageData: any = imageValue;


      if (typeof imageValue === "string") {

        try {

          imageData =
            JSON.parse(imageValue);

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

          imageData =
            JSON.parse(imageValue);

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

      if (!eventId || eventId <= 0) {

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


            // ==========================================
            // PEOPLE PICKER
            // ==========================================

            "EventOrganiser/Id",

            "EventOrganiser/Title",

            "EventOrganiser/EMail",


            // ==========================================
            // IMAGE COLUMNS
            // ==========================================

            "RulesAndRegualtionImage",

            "EventBannerImage"

          )
          .expand(
            "EventOrganiser"
          )
          ();


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


      // ================================================
      // RULES IMAGE
      // ================================================

      if (rulesImage) {

        if (rulesImage.fileName) {

          excludedFileNames.add(
            rulesImage.fileName.toLowerCase()
          );

        }


        if (rulesImage.serverRelativeUrl) {

          excludedUrls.add(
            rulesImage.serverRelativeUrl.toLowerCase()
          );

        }

      }


      // ================================================
      // EVENT BANNER IMAGE
      // ================================================

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
                attachment.FileName || ""
              ).toLowerCase();


            const fileUrl =
              (
                attachment.ServerRelativeUrl || ""
              ).toLowerCase();


            // ============================================
            // EXCLUDE RULES IMAGE BY FILE NAME
            // ============================================

            if (
              excludedFileNames.has(fileName)
            ) {

              return false;

            }


            // ============================================
            // EXCLUDE RULES/BANNER IMAGE BY URL
            // ============================================

            if (
              excludedUrls.has(fileUrl)
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

            FileName:
              attachment.FileName,

            ServerRelativeUrl:
              attachment.ServerRelativeUrl

          })
        );


      // ==================================================
      // 8. GET SUB EVENTS
      // ==================================================

      let subEvents:
        IExistingSubEvent[] = [];


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

        Id:
          item.Id,


        // ================================================
        // BASIC DETAILS
        // ================================================

        EventTitle:
          item.EventTitle ?? "",

        EventDescription:
          item.EventDescription ?? "",


        // ================================================
        // EVENT DATE
        // ================================================

        EventStartDate:
          item.EventStartDate ?? "",

        EventEndDate:
          item.EventEndDate ?? "",


        // ================================================
        // PARTICIPANT
        // ================================================

        EventParticipantType:
          item.EventParticipantType ?? "",

        HasSubEvents:
          item.HasSubEvents ?? false,


        // ================================================
        // RULES
        // ================================================

        RulesAndRegualtionType:
          item.RulesAndRegualtionType ?? "",

        RulesAndRegualtionText:
          item.RulesAndRegualtionText ?? "",


        // ================================================
        // REGISTRATION
        // ================================================

        RegistrationStartDate:
          item.RegistrationStartDate ?? "",

        RegistrationEndDate:
          item.RegistrationEndDate ?? "",


        // ================================================
        // TEAM
        // ================================================

        MaxTeamMembers:
          item.MaxTeamMembers ?? 0,

        MandatoryMember:
          item.MandatoryMember ?? 0,


        // ================================================
        // EVENT ORGANISER - PEOPLE PICKER
        // ================================================

        EventOrganiser:

          item.EventOrganiser

            ? {

                Id:
                  item.EventOrganiser.Id,

                Title:
                  item.EventOrganiser.Title ?? "",

                EMail:
                  item.EventOrganiser.EMail ?? ""

              }

            : undefined,


        // ================================================
        // ORGANIZER DETAILS
        // ================================================

        EventOrganizerDepartment:
          item.EventOrganizerDepartment ?? "",

        EventOrganizerEmail:
          item.EventOrganizerEmail ??
          item.EventOrganiser?.EMail ??
          "",

        EventOrganizerPhoneNumber:
          item.EventOrganizerPhoneNumber ?? "",


        // ================================================
        // STATUS
        // ================================================

        OverAllEventStatus:
          item.OverAllEventStatus ?? "",


        // ================================================
        // RULES IMAGE
        // ================================================

        RulesAndRegualtionImage:
          rulesImage,


        // ================================================
        // BANNER IMAGE
        // ================================================

        EventBannerImage:
          eventBannerImage,


        // ================================================
        // SUB EVENTS
        // ================================================

        SubEvents:
          subEvents,


        // ================================================
        // ATTACHMENTS
        // ================================================

        Attachments:
          attachments

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
          )
          ();


      console.log(
        "SubEvent items:",
        items
      );


      return items.map(
        (item: any) => ({

          Id:
            item.Id,

          SubEventTitle:
            item.SubEventTitle ?? "",

          SubEventDescription:
            item.SubEventDescription ?? "",

          MinimumMembersRequired:
            item.MinimumMembersRequired ?? 0,

          Event_ID:
            item.Event_ID ?? undefined,

          Event_Title:
            item.Event_Title ?? "",

          SubEventStageStatus:
            item.SubEventStageStatus ?? "",

          HasStages:
            item.HasStages ?? false

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