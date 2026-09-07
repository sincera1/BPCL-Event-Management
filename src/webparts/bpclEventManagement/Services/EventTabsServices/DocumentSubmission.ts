import { sp } from "@pnp/sp";

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/fields";


/* ============================================
   EVENT DETAILS
============================================ */

export interface IEventDetails {
  Id: number;
  EventTitle: string;
  EventStartDate: string;
  EventEndDate: string;
  HasSubEvents: boolean;
}


/* ============================================
   SUB EVENT DETAILS
============================================ */

export interface ISubEventDetails {
  Id: number;
  SubEventTitle: string;
}


/* ============================================
   EVENT STAGE DETAILS
============================================ */

export interface IEventStage {
  Id: number;
  EventID?: number;
  SubEventID?: number | null;
  Stages: string;
  StageStartDate: string;
  StageEndDate: string;
  MaxFileSize: number;
  UploadLimit: number;
  IsActive: boolean;
}


/* ============================================
   DOCUMENT SUBMISSION RESPONSE
============================================ */

export interface IDocumentSubmissionResponse {
  Event: IEventDetails;
  SubEvents: ISubEventDetails[];
  EventStages: IEventStage[];
}


/* ============================================
   SAVE / UPDATE STAGE DATA
============================================ */

export interface IStageSaveData {
  Id?: number;
  EventID: number;
  SubEventID?: number | null;
  Stages: string;
  StageStartDate: string;
  StageEndDate: string;
  MaxFileSize: number;
  UploadLimit: number;
  IsActive: boolean;
}


/* ============================================
   DOCUMENT SUBMISSION SERVICE
============================================ */

export default class DocumentSubmissionService {


  /* ============================================
     GET COMPLETE DOCUMENT SUBMISSION DATA
  ============================================ */

  public async getDocumentSubmission(
    eventId: number
  ): Promise<IDocumentSubmissionResponse> {

    try {


      /* ============================================
         GET EVENT DETAILS
      ============================================ */

      const eventItem: any = await sp.web.lists
        .getByTitle("Corp_SL_EventManagement")
        .items
        .getById(eventId)
        .select(
          "Id",
          "EventTitle",
          "EventStartDate",
          "EventEndDate",
          "HasSubEvents"
        )
        .get();


      const eventDetails: IEventDetails = {

        Id: eventItem.Id,

        EventTitle:
          eventItem.EventTitle || "",

        EventStartDate:
          eventItem.EventStartDate || "",

        EventEndDate:
          eventItem.EventEndDate || "",

        HasSubEvents:
          eventItem.HasSubEvents || ""

      };


      let subEvents: ISubEventDetails[] = [];


      /* ============================================
         GET SUB EVENTS

         ONLY WHEN HAS SUB EVENTS = YES
      ============================================ */

      if (eventDetails.HasSubEvents === true) {

        const subEventItems: any[] =
          await sp.web.lists
            .getByTitle("Corp_SL_SubEventManagement")
            .items
            .select(
              "Id",
              "SubEventTitle",
              "Event_IDId"
            )
            .filter(
              `Event_IDId eq ${eventId}`
            )
            .get();


        subEvents =
          subEventItems.map(
            (item: any): ISubEventDetails => {

              return {

                Id: item.Id,

                SubEventTitle:
                  item.SubEventTitle || ""

              };

            }
          );

      }


      /* ============================================
         GET EXISTING EVENT STAGES
      ============================================ */

      const stageItems: any[] =
        await sp.web.lists
          .getByTitle("Corp_SL_EventStages")
          .items
          .select(
            "Id",
            "EventIDId",
            "SubEventIDId",
            "Stages",
            "StageStartDate",
            "StageEndDate",
            "MaxFileSize",
            "UploadLimit",
            "IsActive"
          )
          .filter(
            `EventIDId eq ${eventId}`
          )
          .orderBy(
            "Id",
            true
          )
          .get();


      /* ============================================
         FORMAT EVENT STAGES
      ============================================ */

      const eventStages: IEventStage[] =
        stageItems.map(
          (item: any): IEventStage => {

            return {

              Id: item.Id,

              EventID:
                item.EventIDId,

              SubEventID:
                item.SubEventIDId || null,

              Stages:
                item.Stages || "",

              StageStartDate:
                item.StageStartDate || "",

              StageEndDate:
                item.StageEndDate || "",

              MaxFileSize:
                item.MaxFileSize || 0,

              UploadLimit:
                item.UploadLimit || 0,

              IsActive:
                item.IsActive || false

            };

          }
        );


      /* ============================================
         RETURN COMPLETE DATA
      ============================================ */

      return {

        Event: eventDetails,

        SubEvents: subEvents,

        EventStages: eventStages

      };


    } catch (error) {


      console.error(
        "Error getting document submission details:",
        error
      );


      throw error;

    }

  }


  /* ============================================
     SAVE NEW STAGE
  ============================================ */

  public async saveStage(
    stageData: IStageSaveData
  ): Promise<void> {

    try {


      const itemData: any = {

        EventIDId:
          stageData.EventID,

        Stages:
          stageData.Stages,

        StageStartDate:
          stageData.StageStartDate,

        StageEndDate:
          stageData.StageEndDate,

        MaxFileSize:
          stageData.MaxFileSize,

        UploadLimit:
          stageData.UploadLimit,

        IsActive:
          stageData.IsActive

      };


      /* ============================================
         ADD SUB EVENT ONLY WHEN AVAILABLE
      ============================================ */

      if (
        stageData.SubEventID !== undefined &&
        stageData.SubEventID !== null
      ) {

        itemData.SubEventIDId =
          stageData.SubEventID;

      }


      await sp.web.lists
        .getByTitle("Corp_SL_EventStages")
        .items
        .add(itemData);


    } catch (error) {


      console.error(
        "Error saving event stage:",
        error
      );


      throw error;

    }

  }


  /* ============================================
     UPDATE EXISTING STAGE
  ============================================ */

  public async updateStage(
    stageData: IStageSaveData
  ): Promise<void> {

    try {


      if (!stageData.Id) {

        throw new Error(
          "Stage Item ID is required for update."
        );

      }


      const itemData: any = {

        EventIDId:
          stageData.EventID,

        Stages:
          stageData.Stages,

        StageStartDate:
          stageData.StageStartDate,

        StageEndDate:
          stageData.StageEndDate,

        MaxFileSize:
          stageData.MaxFileSize,

        UploadLimit:
          stageData.UploadLimit,

        IsActive:
          stageData.IsActive

      };


      /* ============================================
         UPDATE SUB EVENT LOOKUP
      ============================================ */

      if (
        stageData.SubEventID !== undefined &&
        stageData.SubEventID !== null
      ) {

        itemData.SubEventIDId =
          stageData.SubEventID;

      }


      await sp.web.lists
        .getByTitle("Corp_SL_EventStages")
        .items
        .getById(stageData.Id)
        .update(itemData);


    } catch (error) {


      console.error(
        "Error updating event stage:",
        error
      );


      throw error;

    }

  }


  /* ============================================
     DELETE STAGE
  ============================================ */

  public async deleteStage(
    stageId: number
  ): Promise<void> {

    try {


      await sp.web.lists
        .getByTitle("Corp_SL_EventStages")
        .items
        .getById(stageId)
        .delete();


    } catch (error) {


      console.error(
        "Error deleting event stage:",
        error
      );


      throw error;

    }

  }

}