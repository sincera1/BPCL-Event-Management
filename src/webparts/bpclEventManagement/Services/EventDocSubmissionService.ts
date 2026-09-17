
import { sp } from "@pnp/sp";

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/files";
import "@pnp/sp/folders";


/* =====================================================
   ACTIVE EVENT STAGE INTERFACE
===================================================== */

export interface IActiveEventStage {

  Id: number;

  EventId: number;

  EventTitle: string;

  SubEventId?: number;

  SubEventTitle: string;

  StageName: string;

  StageStartDate: string;

  StageEndDate: string;

  MaxFileSize: number;

  UploadLimit: number;

  IsActive: boolean;

}


/* =====================================================
   SUB EVENT PARTICIPANT INFORMATION
===================================================== */

export interface ISubEventParticipantInfo {

  Id: number;

  TeamId: number;

  EventParticipantType: string;

  IsRegistered: boolean;

}


/* =====================================================
   STAGE SUBMISSION STATUS
===================================================== */

export interface IStageSubmissionStatus {

  TeamId: number;

  UploadedCount: number;

  IsAlreadySubmitted: boolean;

  IsRegisteredForSubEvent: boolean;

}


/* =====================================================
   STAGE STATUS MAP
===================================================== */

export interface IStageStatusMap {

  [stageId: number]: IStageSubmissionStatus;

}


/* =====================================================
   STAGE SUBMISSION SERVICE
===================================================== */

export default class StageSubmissionService {


  /* ===================================================
     SHAREPOINT LISTS
  =================================================== */

  private stageListName =
    "Corp_SL_EventStages";


  private eventParticipantListName =
    "Corp_SL_EventParticipants";


  private subEventParticipantListName =
    "Corp_SL_SubEvent_Participants";


  private documentLibraryName =
    "Corp_SL_EventParticipantDocument";


  /* ===================================================
     CURRENT USER CACHE

     IMPORTANT:

     Current user is fetched only once per
     service instance.

     This improves page loading performance.
  =================================================== */

  private currentUserCache: any = null;


  /* ===================================================
     FORMAT UTC DATE
  =================================================== */

  private formatUTCDate(
    dateString: string
  ): string {

    if (!dateString) {

      return "";

    }


    const date =
      new Date(
        dateString
      );


    if (
      isNaN(
        date.getTime()
      )
    ) {

      return "";

    }


    const year =
      date.getUTCFullYear();


    const month =
      String(
        date.getUTCMonth() + 1
      ).padStart(
        2,
        "0"
      );


    const day =
      String(
        date.getUTCDate()
      ).padStart(
        2,
        "0"
      );


    return `${year}-${month}-${day}`;

  }


  /* ===================================================
     GET ACTIVE STAGES BY EVENT ID
  =================================================== */

  public async getActiveStagesByEventId(
    eventId: number
  ): Promise<IActiveEventStage[]> {


    if (
      !eventId ||
      eventId <= 0
    ) {

      return [];

    }


    /* ===============================================
       GET STAGES
    =============================================== */

    const items: any[] =
      await sp.web.lists
        .getByTitle(
          this.stageListName
        )
        .items
        .select(

          "Id",

          "StageStartDate",

          "StageEndDate",

          "MaxFileSize",

          "UploadLimit",

          "IsActive",

          "Stages",

          "EventID/Id",

          "EventID/EventTitle",

          "SubEventID/Id",

          "SubEventID/SubEventTitle"

        )
        .expand(

          "EventID",

          "SubEventID"

        )
        .filter(
          `EventIDId eq ${eventId} and IsActive eq 1`
        )();

console.log("doc submission Requested Event ID:", eventId);
console.log("doc submission All Stages for Event:", items);
    /* ===============================================
       TODAY DATE

       FORMAT:

       YYYY-MM-DD
    =============================================== */

    const todayDate =
      this.formatUTCDate(
        new Date().toISOString()
      );


    /* ===============================================
       FILTER ACTIVE DATE RANGE
    =============================================== */

    const activeStages =
      items.filter(
        (
          item: any
        ): boolean => {


          if (
            !item.StageStartDate ||
            !item.StageEndDate
          ) {

            return false;

          }


          const stageStartDate =
            this.formatUTCDate(
              item.StageStartDate
            );


          const stageEndDate =
            this.formatUTCDate(
              item.StageEndDate
            );


          return (

            todayDate >=
            stageStartDate &&

            todayDate <=
            stageEndDate

          );

        }
      );


    /* ===============================================
       MAP RESULT
    =============================================== */

    return activeStages.map(

      (
        item: any
      ): IActiveEventStage => ({

        Id:
          Number(
            item.Id
          ),


        EventId:

          item.EventID?.Id ||

          eventId,


        EventTitle:

          item.EventID?.EventTitle ||

          "",


        SubEventId:

          item.SubEventID?.Id ||

          undefined,


        SubEventTitle:

          item.SubEventID?.SubEventTitle ||

          "",


        StageName:

          item.Stages ||

          "",


        StageStartDate:

          this.formatUTCDate(
            item.StageStartDate
          ),


        StageEndDate:

          this.formatUTCDate(
            item.StageEndDate
          ),


        MaxFileSize:

          Number(
            item.MaxFileSize
          ) || 0,


        UploadLimit:

          Number(
            item.UploadLimit
          ) || 0,


        IsActive:

          item.IsActive === true

      })

    );

  }


  /* ===================================================
     GET CURRENT USER

     CACHED FOR PERFORMANCE

     SharePoint API will not be called again
     if user is already available.
  =================================================== */

  private async getCurrentUser(): Promise<any> {


    /* ===============================================
       RETURN CACHE
    =============================================== */

    if (
      this.currentUserCache
    ) {

      return this.currentUserCache;

    }


    /* ===============================================
       GET CURRENT USER
    =============================================== */

    const currentUser =
      await sp.web.currentUser();


    /* ===============================================
       SAVE CACHE
    =============================================== */

    this.currentUserCache =
      currentUser;


    console.log(
      "Current User:",
      currentUser
    );


    return currentUser;

  }


  /* ===================================================
     GET SUB EVENT PARTICIPANT INFORMATION

     CONDITIONS:

     Event_ID = eventId

     SubEventID = subEventId

     Current User must exist in Participant
  =================================================== */

  private async getEventParticipantInfo(
    eventId: number
  ): Promise<ISubEventParticipantInfo> {

    const currentUser = await this.getCurrentUser();

    if (!currentUser || !currentUser.Id) {
      throw new Error(
        "Unable to identify the current logged-in user."
      );
    }

    const participantItems: any[] =
      await sp.web.lists
        .getByTitle(this.eventParticipantListName)
        .items
        .select(
          "Id",
          "EventParticipantType",
          "TeamIDId"
        )
        .filter(
          `Event_IDId eq ${eventId} and ` +
          `ParticipantId eq ${currentUser.Id}`
        )
        .top(1)();

    if (!participantItems || participantItems.length === 0) {
      return {
        Id: 0,
        TeamId: 0,
        EventParticipantType: "",
        IsRegistered: false
      };
    }

    const participantItem = participantItems[0];

    const teamLookupId =
      Number(participantItem.TeamIDId) || 0;

    const finalTeamId =
      teamLookupId > 0
        ? teamLookupId
        : Number(participantItem.Id);

    return {
      Id: Number(participantItem.Id),
      TeamId: finalTeamId,
      EventParticipantType:
        participantItem.EventParticipantType || "",
      IsRegistered: true
    };
  }


  private async getSubEventParticipantInfo(

    eventId: number,

    subEventId: number | undefined

  ): Promise<ISubEventParticipantInfo> {


    /* ===============================================
       VALIDATE SUB EVENT
    =============================================== */

    // if (
    //   !subEventId ||
    //   subEventId <= 0
    // ) {

    //   throw new Error(
    //     "Sub Event information is not available."
    //   );

    // }


    /* ===============================================
       CURRENT USER

       Cached user will be returned.
    =============================================== */

    const currentUser =
      await this.getCurrentUser();


    if (
      !currentUser ||
      !currentUser.Id
    ) {

      throw new Error(
        "Unable to identify the current logged-in user."
      );

    }


    /* ===============================================
       GET PARTICIPANT RECORD

       PERFORMANCE:

       Only required fields are selected.

       top(1) is used because we only need
       one matching record.
    =============================================== */

    const participantItems: any[] =

      await sp.web.lists

        .getByTitle(
          this.subEventParticipantListName
        )

        .items

        .select(

          "Id",

          "EventParticipantType",

          "TeamIDId"

        )

        .filter(

          `Event_IDId eq ${eventId} and ` +

          `SubEventIDId eq ${subEventId} and ` +

          `ParticipantId eq ${currentUser.Id}`

        )

        .top(
          1
        )();


    console.log(
      "SUB EVENT PARTICIPANT RECORDS"
    );


    console.log(
      participantItems
    );


    /* ===============================================
       USER NOT REGISTERED
    =============================================== */

    if (
      !participantItems ||
      participantItems.length === 0
    ) {

      return {

        Id: 0,

        TeamId: 0,

        EventParticipantType: "",

        IsRegistered: false

      };

    }


    /* ===============================================
       GET MATCHING RECORD
    =============================================== */

    const participantItem =
      participantItems[0];


    /* ===============================================
       TEAM ID

       TEAM EVENT:

       Same TeamID is shared by all
       team members.

       INDIVIDUAL EVENT:

       If TeamID is blank,
       Participant Item ID is used.
    =============================================== */

    const teamId =

      participantItem.TeamIDId ||

      0;


    const finalTeamId =

      teamId > 0

        ?

        Number(
          teamId
        )

        :

        Number(
          participantItem.Id
        );



    console.log(
      "Event ID:",
      eventId
    );


    console.log(
      "Sub Event ID:",
      subEventId
    );


    console.log(
      "Current User ID:",
      currentUser.Id
    );


    console.log(
      "Participant Type:",
      participantItem.EventParticipantType
    );


    console.log(
      "Team ID:",
      finalTeamId
    );


    /* ===============================================
       RETURN PARTICIPANT INFO
    =============================================== */

    return {

      Id:

        Number(
          participantItem.Id
        ),


      TeamId:

        finalTeamId,


      EventParticipantType:

        participantItem.EventParticipantType ||

        "",


      IsRegistered:

        true

    };

  }


  /* ===================================================
     GET EXISTING DOCUMENT COUNT

     CONDITIONS:

     EventID

     SubEventID

     TeamID


     PERFORMANCE IMPROVEMENT:

     Only checks whether a document exists.

     top(1) prevents loading all documents.
  =================================================== */

  private async getExistingDocumentCount(

    eventId: number,

    subEventId: number | undefined,

    teamId: number

  ): Promise<number> {


    let filterText =
      `EventIDId eq ${eventId} and ` +
      `TeamIDId eq ${teamId}`;

    if (
      subEventId &&
      subEventId > 0
    ) {
      filterText +=
        ` and SubEventIDId eq ${subEventId}`;
    }
    else {
      filterText +=
        ` and SubEventIDId eq null`;
    }


    console.log(
      "Document Filter:",
      filterText
    );


    /* ===============================================
       GET ONLY ONE DOCUMENT

       We only need to know:

       Document exists or not.
    =============================================== */

    const documents: any[] =

      await sp.web.lists

        .getByTitle(
          this.documentLibraryName
        )

        .items

        .select(
          "Id"
        )

        .filter(
          filterText
        )

        .top(
          1
        )();


    console.log(
      "Existing Documents:",
      documents
    );


    /* ===============================================
       RETURN

       0 = NO DOCUMENT

       1 = DOCUMENT EXISTS
    =============================================== */

    return documents.length;

  }


  /* ===================================================
     GET STAGE SUBMISSION STATUS

     Used for individual stage.
  =================================================== */

  // public async getStageSubmissionStatus(

  //   eventId: number,

  //   stage: IActiveEventStage

  // ): Promise<IStageSubmissionStatus> {


  //   /* ===============================================
  //      VALIDATE EVENT
  //   =============================================== */

  //   if (
  //     !eventId ||
  //     eventId <= 0
  //   ) {

  //     throw new Error(
  //       "Invalid Event ID."
  //     );

  //   }


  //   /* ===============================================
  //      GET PARTICIPANT INFORMATION
  //   =============================================== */

  //   const participantInfo =

  //     await this.getSubEventParticipantInfo(

  //       eventId,

  //       stage.SubEventId

  //     );


  //   /* ===============================================
  //      NOT REGISTERED
  //   =============================================== */

  //   if (
  //     !participantInfo.IsRegistered
  //   ) {

  //     return {

  //       TeamId: 0,

  //       UploadedCount: 0,

  //       IsAlreadySubmitted: false,

  //       IsRegisteredForSubEvent: false

  //     };

  //   }


  //   /* ===============================================
  //      CHECK DOCUMENT
  //   =============================================== */

  //   const uploadedCount =

  //     await this.getExistingDocumentCount(

  //       eventId,

  //       stage.SubEventId!,

  //       participantInfo.TeamId

  //     );


  //   /* ===============================================
  //      RETURN STATUS
  //   =============================================== */

  //   return {

  //     TeamId:

  //       participantInfo.TeamId,


  //     UploadedCount:

  //       uploadedCount,


  //     IsAlreadySubmitted:

  //       uploadedCount > 0,


  //     IsRegisteredForSubEvent:

  //       true

  //   };

  // }
/* ===================================================
   GET STAGE SUBMISSION STATUS

   RULES:
   1. Stage WITHOUT SubEvent:
      - No participant registration check
      - Stage is available directly
      - Uploaded document count is checked using EventId + StageId

   2. Stage WITH SubEvent:
      - Current user must be registered
      - Existing TeamID logic is retained
=================================================== */

public async getStageSubmissionStatus(
  eventId: number,
  stage: IActiveEventStage
): Promise<IStageSubmissionStatus> {

  /* ===============================================
     VALIDATE EVENT
  =============================================== */

  if (
    !eventId ||
    eventId <= 0
  ) {
    throw new Error(
      "Invalid Event ID."
    );
  }


  /* ===============================================
     CASE 1:
     STAGE DOES NOT HAVE A SUB EVENT

     Example:
     Event 93
     Stage 1
     SubEventId = undefined

     This stage should be directly available.
  =============================================== */

  if (
    !stage.SubEventId ||
    stage.SubEventId <= 0
  ) {

    console.log(
      "Stage has NO SubEvent. Treating stage as directly available:",
      {
        EventId: eventId,
        StageId: stage.Id,
        StageName: stage.StageName
      }
    );

    /*
      There is no SubEvent participant to check.

      We therefore return the stage as registered/available.
    */

    const eventParticipantInfo =
      await this.getEventParticipantInfo(eventId);

    if (!eventParticipantInfo.IsRegistered) {
      return {
        TeamId: 0,
        UploadedCount: 0,
        IsAlreadySubmitted: false,
        IsRegisteredForSubEvent: true
      };
    }

    const uploadedCount =
      await this.getExistingDocumentCount(
        eventId,
        undefined,
        eventParticipantInfo.TeamId
      );

    return {
      TeamId: eventParticipantInfo.TeamId,
      UploadedCount: uploadedCount,
      IsAlreadySubmitted: uploadedCount > 0,
      IsRegisteredForSubEvent: true
    };
  }


  /* ===============================================
     CASE 2:
     STAGE HAS A SUB EVENT

     Existing registration logic continues.
  =============================================== */

  const participantInfo =
    await this.getSubEventParticipantInfo(
      eventId,
      stage.SubEventId
    );


  /* ===============================================
     USER NOT REGISTERED
  =============================================== */

  if (
    !participantInfo.IsRegistered
  ) {

    return {
      TeamId: 0,

      UploadedCount: 0,

      IsAlreadySubmitted: false,

      IsRegisteredForSubEvent: false
    };
  }


  /* ===============================================
     CHECK EXISTING DOCUMENT

     Only applicable when SubEvent exists.
  =============================================== */

  const uploadedCount =
    await this.getExistingDocumentCount(
      eventId,
      stage.SubEventId,
      participantInfo.TeamId
    );


  /* ===============================================
     RETURN STATUS
  =============================================== */

  return {

    TeamId:
      participantInfo.TeamId,

    UploadedCount:
      uploadedCount,

    IsAlreadySubmitted:
      uploadedCount > 0,

    IsRegisteredForSubEvent:
      true

  };
}

  /* ===================================================
     GET ALL STAGE SUBMISSION STATUSES

     IMPORTANT PERFORMANCE IMPROVEMENT

     Instead of loading:

       Stage 1 -> wait
       Stage 2 -> wait
       Stage 3 -> wait

     All stages are loaded in parallel.

     Promise.all() improves page loading speed.
  =================================================== */

  public async getStageSubmissionStatuses(

    eventId: number,

    stages: IActiveEventStage[]

  ): Promise<IStageStatusMap> {


    const statusMap: IStageStatusMap =
      {};


    /* ===============================================
       VALIDATE
    =============================================== */

    if (
      !eventId ||
      eventId <= 0 ||
      !stages ||
      stages.length === 0
    ) {

      return statusMap;

    }


    /* ===============================================
       LOAD CURRENT USER ONCE

       This ensures current user is cached
       before parallel stage requests begin.
    =============================================== */

    await this.getCurrentUser();


    /* ===============================================
       LOAD ALL STAGES IN PARALLEL
    =============================================== */

    const statusResults =

      await Promise.all(

        stages.map(

          async (

            stage: IActiveEventStage

          ) => {


            try {


              const status =

                await this.getStageSubmissionStatus(

                  eventId,

                  stage

                );


              return {

                StageId:

                  stage.Id,


                Status:

                  status

              };


            }
            catch (
            error
            ) {


              console.error(

                "Unable to get submission status:",

                error

              );


              return {

                StageId:

                  stage.Id,


                Status: {

                  TeamId: 0,

                  UploadedCount: 0,

                  IsAlreadySubmitted: false,

                  IsRegisteredForSubEvent: false

                } as IStageSubmissionStatus

              };

            }

          }

        )

      );


    /* ===============================================
       CREATE STATUS MAP
    =============================================== */

    statusResults.forEach(

      (
        result
      ) => {


        statusMap[
          result.StageId
        ] =

          result.Status;

      }

    );


    return statusMap;

  }


  /* ===================================================
     UPLOAD STAGE DOCUMENTS
  =================================================== */

  public async uploadStageDocuments(

    eventId: number,

    stage: IActiveEventStage,

    files: File[]

  ): Promise<void> {


    /* ===============================================
       VALIDATE EVENT
    =============================================== */

    if (
      !eventId ||
      eventId <= 0
    ) {

      throw new Error(
        "Invalid Event ID."
      );

    }


    /* ===============================================
       VALIDATE STAGE
    =============================================== */

    if (
      !stage ||
      !stage.Id
    ) {

      throw new Error(
        "Invalid submission stage."
      );

    }


    /* ===============================================
       VALIDATE SUB EVENT
    =============================================== */

    // if (
    //   !stage.SubEventId ||
    //   stage.SubEventId <= 0
    // ) {

    //   throw new Error(
    //     "Sub Event information is not available."
    //   );

    // }


    /* ===============================================
       VALIDATE FILES
    =============================================== */

    if (
      !files ||
      files.length === 0
    ) {

      throw new Error(
        "Please select at least one document."
      );

    }


    /* ===============================================
       GET SUB EVENT PARTICIPANT
    =============================================== */

    let teamId = 0;

    if (
      stage.SubEventId &&
      stage.SubEventId > 0
    ) {
      const participantInfo =
        await this.getSubEventParticipantInfo(
          eventId,
          stage.SubEventId
        );

      if (!participantInfo.IsRegistered) {
        throw new Error(
          "You are not registered for this Sub Event. Document submission is not allowed."
        );
      }

      teamId = participantInfo.TeamId;
    } else {
      const eventParticipantInfo =
        await this.getEventParticipantInfo(eventId);

      if (!eventParticipantInfo.IsRegistered) {
        throw new Error(
          "You are not registered for this Event. Document submission is not allowed."
        );
      }

      teamId = eventParticipantInfo.TeamId;
    }


    /* ===============================================
       CHECK ALREADY SUBMITTED
    =============================================== */

    const alreadyUploaded =

      await this.getExistingDocumentCount(

        eventId,

        stage.SubEventId,

        teamId

      );


    if (
      alreadyUploaded > 0
    ) {

      throw new Error(
        "You have already submitted the document."
      );

    }


    /* ===============================================
       VALIDATE UPLOAD LIMIT
    =============================================== */

    const uploadLimit =

      Number(
        stage.UploadLimit
      ) || 0;


    if (
      uploadLimit > 0 &&
      files.length > uploadLimit
    ) {

      throw new Error(
        `Maximum ${uploadLimit} file(s) are allowed.`
      );

    }


    /* ===============================================
       VALIDATE MAX FILE SIZE
    =============================================== */

    const maxFileSizeMB =

      Number(
        stage.MaxFileSize
      ) || 0;


    if (
      maxFileSizeMB > 0
    ) {


      const maxBytes =

        maxFileSizeMB *

        1024 *

        1024;


      for (
        const file of files
      ) {


        if (
          file.size >
          maxBytes
        ) {

          throw new Error(

            `"${file.name}" exceeds the maximum file size of ${maxFileSizeMB} MB.`

          );

        }

      }

    }


    /* ===============================================
       GET DOCUMENT LIBRARY
    =============================================== */

    const library =

      sp.web.lists

        .getByTitle(

          this.documentLibraryName

        );


    /* ===============================================
       UPLOAD FILES

       Functionality remains same.

       Files are uploaded one by one
       to preserve existing behavior.
    =============================================== */

    for (
      const file of files
    ) {


      console.log(
        "Uploading:",
        file.name
      );


      /* =============================================
         UPLOAD FILE
      ============================================= */

      const uploadResult =

        await library

          .rootFolder

          .files

          .addUsingPath(

            file.name,

            file,

            {

              Overwrite: false

            }

          );


      /* =============================================
         GET UPLOADED ITEM
      ============================================= */

      const uploadedItem =

        await uploadResult

          .file

          .getItem();


      /* =============================================
         UPDATE METADATA
      ============================================= */

      await uploadedItem.update({


        EventIDId:

          eventId,


        SubEventIDId:

          stage.SubEventId,


        TeamIDId:

          teamId,
        Stages: stage.StageName

      });


      console.log(
        "Document Uploaded:",
        {


          FileName:

            file.name,


          EventID:

            eventId,


          SubEventID:

            stage.SubEventId,


          TeamID:

            teamId

        }
      );

    }

    console.log(
      "DOCUMENT SUBMISSION COMPLETED"
    );


  }


}

