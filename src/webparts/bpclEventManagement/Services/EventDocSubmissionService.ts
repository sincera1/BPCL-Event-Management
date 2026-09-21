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
   EVENT PARTICIPANT INFORMATION
===================================================== */

export interface IEventParticipantInfo {
  Id: number;
  TeamId: number;
  EventParticipantType: string;
  IsRegistered: boolean;
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
  IsRegisteredForEvent: boolean;
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

  private stageListName = "Corp_SL_EventStages";
  private eventParticipantListName = "Corp_SL_EventParticipants";
  private subEventParticipantListName = "Corp_SL_SubEvent_Participants";
  private documentLibraryName ="Corp_SL_EventParticipantDocument";


  /* ===================================================
     CURRENT USER CACHE
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

    const date = new Date(dateString);

    if (
      isNaN(
        date.getTime()
      )
    ) {
      return "";
    }

    const year =  date.getUTCFullYear();

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

    console.log( "Document Submission Requested Event ID:", eventId);

    /* ===============================================
       TODAY
    =============================================== */

    const todayDate =
      this.formatUTCDate(
        new Date().toISOString()
      );


    /* ===============================================
       FILTER DATE RANGE
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
            todayDate >= stageStartDate &&
            todayDate <= stageEndDate
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

        EventId: item.EventID?.Id || eventId,
        EventTitle: item.EventID?.EventTitle || "",
        SubEventId:  item.SubEventID?.Id || undefined,
        SubEventTitle: item.SubEventID?.SubEventTitle ||  "",
        StageName: item.Stages || "",
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

        IsActive: item.IsActive === true

      })
    );
  }


  /* ===================================================
     GET CURRENT USER
  =================================================== */

  private async getCurrentUser(): Promise<any> {

    if (
      this.currentUserCache
    ) {
      return this.currentUserCache;
    }


    const currentUser =  await sp.web.currentUser();
    this.currentUserCache = currentUser;
    console.log( "Current User:", currentUser);

    return currentUser;
  }


  /* ===================================================
     GET EVENT PARTICIPANT INFORMATION

     USED ONLY FOR:

     Stage WITHOUT SubEvent

     IMPORTANT BUSINESS RULE:

     For a stage WITHOUT SubEvent:

       TeamId = Event Participant item Id

     We DO NOT use TeamID lookup here.

     Example:

       Event Participant item:
       Id = 125

       TeamId used for document =
       125
  =================================================== */

  private async getEventParticipantInfo(

    eventId: number

  ): Promise<IEventParticipantInfo> {


    const currentUser = await this.getCurrentUser();


    if (
      !currentUser ||
      !currentUser.Id
    ) {

      throw new Error(
        "Unable to identify the current logged-in user."
      );
    }

    /*
       IMPORTANT:

       We intentionally DO NOT select TeamID
       or TeamIDId here.

       For a stage without SubEvent,
       Event Participant item Id itself
       becomes TeamId.
    */

    const participantItems: any[] =
      await sp.web.lists

        .getByTitle(
          this.eventParticipantListName
        )
        .items
        .select(
          "Id",
          "EventParticipantType"
        )
        .filter(
          `Event_IDId eq ${eventId} and ParticipantId eq ${currentUser.Id}`
        )
        .top(1)();

    /* ===============================================
       USER NOT REGISTERED FOR EVENT
    =============================================== */

    if (
      !participantItems ||
      participantItems.length === 0
    ) {

      console.log(
        "User is NOT registered for Event."
      );

      return {
        Id: 0,
        TeamId:  0,
        EventParticipantType:"",
        IsRegistered: false
      };
    }


    /* ===============================================
       EVENT PARTICIPANT FOUND
    =============================================== */

    const participantItem =  participantItems[0];
    /*
       IMPORTANT BUSINESS RULE:
       Event Participant item Id
       IS the TeamId for a stage
       without SubEvent.
    */

    const finalTeamId =
      Number(
        participantItem.Id
      );

    return {
      Id:
        Number(
          participantItem.Id
        ),

      TeamId: finalTeamId,
      EventParticipantType:participantItem.EventParticipantType || "",
      IsRegistered: true

    };
  }


  /* ===================================================
     GET SUB EVENT PARTICIPANT INFORMATION

     USED ONLY WHEN STAGE HAS SUB EVENT

     TeamID is a SharePoint Lookup.

     IMPORTANT:

     We retrieve lookup ID using:

       TeamID/Id

     instead of:

       TeamIDId

     This avoids the TeamIDId REST error.

     BUSINESS RULE:

     Team Event:
       TeamID lookup Id is used.

     Individual Event:
       If TeamID lookup is blank,
       SubEvent Participant item Id is used.
  =================================================== */

  private async getSubEventParticipantInfo(

    eventId: number,
    subEventId: number

  ): Promise<ISubEventParticipantInfo> {


    if (
      !subEventId ||
      subEventId <= 0
    ) {

      return {

        Id: 0,
        TeamId: 0,
        EventParticipantType:  "",
        IsRegistered: false

      };
    }

    const currentUser =  await this.getCurrentUser();

    if (
      !currentUser ||
      !currentUser.Id
    ) {
      throw new Error(
        "Unable to identify the current logged-in user."
      );
    }

 


    /*
       IMPORTANT:

       TeamID is a Lookup.

       Use TeamID/Id instead of TeamIDId.
    */

    const participantItems: any[] =
      await sp.web.lists
        .getByTitle(
          this.subEventParticipantListName
        )
        .items
        .select(
          "Id",
          "EventParticipantType",
          "TeamID/Id"
        )
        .expand("TeamID")
        .filter(
          `Event_IDId eq ${eventId} and ` +
          `SubEventIDId eq ${subEventId} and ` +
          `ParticipantId eq ${currentUser.Id}`
        )
        .top(1)();

    console.log(
      "SUB EVENT PARTICIPANT RESULT:",
      participantItems
    );


    /* ===============================================
       USER NOT REGISTERED
    =============================================== */

    if (
      !participantItems ||
      participantItems.length === 0
    ) {

      console.log(
        "User is NOT registered for SubEvent."
      );


      return {

        Id:  0,
        TeamId: 0,
        EventParticipantType: "",
        IsRegistered: false
      };
    }


    const participantItem =  participantItems[0];

    console.log(
      "SUB EVENT PARTICIPANT ITEM:",
      participantItem
    );


    /* ===============================================
       GET LOOKUP TEAM ID
    =============================================== */

    const teamLookupId =
      Number(
        participantItem.TeamID?.Id
      ) || 0;


    /* ===============================================
       DETERMINE FINAL TEAM ID
    =============================================== */

    /*
       If TeamID lookup has a value:
          use TeamID lookup Id.
       Otherwise:
          use SubEvent Participant item Id.
       This supports both Team and Individual
       registrations.
    */

    const finalTeamId =
      teamLookupId > 0
        ? teamLookupId
        : Number(
            participantItem.Id
          );

    return {
      Id:
        Number(
          participantItem.Id
        ),
      TeamId: finalTeamId,
      EventParticipantType:
        participantItem.EventParticipantType ||
        "",
      IsRegistered:  true

    };
  }


  /* ===================================================
     GET EXISTING DOCUMENT COUNT

     CHECKS:

       EventID
       TeamID
       SubEventID
       Stage

     IMPORTANT:
       TeamID is a Lookup.
       We use:
         TeamID/Id
       instead of:
         TeamIDId
  =================================================== */

  private async getExistingDocumentCount(

    eventId: number,
    subEventId: number | undefined,
    teamId: number,
    stageName?: string
  ): Promise<number> {

    if (
      !eventId ||
      eventId <= 0
    ) {
      return 0;
    }

    if (
      !teamId ||
      teamId <= 0
    ) {
      return 0;
    }


    /*
       Start with Event ID and Team lookup.

       IMPORTANT:

       TeamID/Id is used because TeamID
       is a Lookup column.
    */

    let filterText =
      `EventIDId eq ${eventId} and ` +
      `TeamID/Id eq ${teamId}`;


    /* ===============================================
       SUB EVENT
    =============================================== */

    if (
      subEventId &&
      subEventId > 0
    ) {

      filterText +=
        ` and SubEventIDId eq ${subEventId}`;

    }

    else {

      /*
         No SubEvent:
         SubEvent lookup must be NULL.
      */

      filterText += ` and SubEventIDId eq null`;

    }


    /* ===============================================
       STAGE
    =============================================== */

    if (
      stageName &&
      stageName.trim()
    ) {

      const safeStageName =
        stageName.replace(
          /'/g,
          "''"
        );

      filterText += ` and Stages eq '${safeStageName}'`;
    }

    console.log(
      "DOCUMENT CHECK FILTER:",
      filterText
    );


    /*
       IMPORTANT:
       Do not select TeamIDId.
       Retrieve lookup ID using TeamID/Id.
    */

    const documents: any[] =
      await sp.web.lists

        .getByTitle(
          this.documentLibraryName
        )

        .items
        .select(
          "Id",
          "FileLeafRef",
          "Stages",
          "EventID/Id",
          "SubEventID/Id",
          "TeamID/Id"
        )

        .expand(
          "EventID",
          "SubEventID",
          "TeamID"
        )
        .filter( filterText)
        .top(1)();

    return documents.length;
  }


  /* ===================================================
     GET STAGE SUBMISSION STATUS

     CASE 1:
       NO SUB EVENT

       Event Participant is checked.

       TeamId =
       Event Participant item Id.


     CASE 2:
       HAS SUB EVENT

       SubEvent Participant is checked.

       TeamId =
       TeamID lookup Id
       OR
       SubEvent Participant item Id.
  =================================================== */

  public async getStageSubmissionStatus(

    eventId: number,
    stage: IActiveEventStage
  ): Promise<IStageSubmissionStatus> {


    if (
      !eventId ||
      eventId <= 0
    ) {

      throw new Error(
        "Invalid Event ID."
      );
    }

    if (
      !stage ||
      !stage.Id
    ) {
      throw new Error(
        "Invalid submission stage."
      );
    }

    const subEventId = stage.SubEventId;
    const hasSubEvent =
      !!subEventId &&
      subEventId > 0;

    /* =================================================
       CASE 1
       NO SUB EVENT
    ================================================= */

    if (
      !hasSubEvent
    ) {

      const eventParticipantInfo =
        await this.getEventParticipantInfo(
          eventId
        );
      /*
         User is not registered for EVENT.

         Important:

         This is NOT a SubEvent registration
         failure.
      */

     if (
            !eventParticipantInfo.IsRegistered
          ) {

            console.log(
              "User is NOT registered for Event."
            );

            return {
              TeamId: 0,
              UploadedCount: 0,
              IsAlreadySubmitted: false,
              IsRegisteredForEvent: false,
              IsRegisteredForSubEvent:  false
            };
          }


      const uploadedCount =  await this.getExistingDocumentCount(
          eventId,
          undefined,
          eventParticipantInfo.TeamId,
          stage.StageName
        );

     return {
          TeamId: eventParticipantInfo.TeamId,
          UploadedCount: uploadedCount,
          IsAlreadySubmitted: uploadedCount > 0,
          IsRegisteredForEvent: true,
          IsRegisteredForSubEvent: true
        };
    }

    /* =================================================
       CASE 2
       HAS SUB EVENT
    ================================================= */

    /*
       TypeScript now knows subEventId is
       a number because we returned from the
       no-SubEvent case above.
    */

    const participantInfo = await this.getSubEventParticipantInfo(
        eventId,
        subEventId
      );


    /* ===============================================
       USER NOT REGISTERED FOR SUB EVENT
    =============================================== */

    if (
      !participantInfo.IsRegistered
    ) {

      console.log(
        "User is NOT registered for SubEvent:",
        subEventId
      );
    return {
        TeamId: 0,
        UploadedCount: 0,
        IsAlreadySubmitted: false,
        IsRegisteredForEvent: false,
        IsRegisteredForSubEvent: false
      };
    }

    /* ===============================================
       CHECK EXISTING DOCUMENT
    =============================================== */

    const uploadedCount = await this.getExistingDocumentCount(
       eventId,
       subEventId,
       participantInfo.TeamId,
      stage.StageName
      );

   return {
      TeamId:participantInfo.TeamId,
      UploadedCount: uploadedCount,
      IsAlreadySubmitted: uploadedCount > 0,
      IsRegisteredForEvent: true,
      IsRegisteredForSubEvent: true
    };
  }

  /* ===================================================
     GET ALL STAGE SUBMISSION STATUSES
  =================================================== */

  public async getStageSubmissionStatuses(
    eventId: number,
    stages: IActiveEventStage[]
  ): Promise<IStageStatusMap> {

    const statusMap:
      IStageStatusMap = {};
    if (
      !eventId ||
      eventId <= 0 ||
      !stages ||
      stages.length === 0
    ) {
      return statusMap;
    }

    await this.getCurrentUser();
    const statusResults =
      await Promise.all(
        stages.map(
          async (
            stage:
              IActiveEventStage
          ) => {

            try {
              const status =
                await this.getStageSubmissionStatus(
                  eventId,
                  stage
                );

              return {
                StageId: stage.Id,
                Status: status
              };
            }
            catch (
              error
            ) {
              console.error("Unable to get submission status:", error );
              /*
                 IMPORTANT:

                 If status lookup fails,
                 do NOT say already submitted.

                 We also keep SubEvent registration
                 false only for stages having a
                 SubEvent.
              */

              // const hasSubEvent =
              //   !!stage.SubEventId &&
              //   stage.SubEventId > 0;
              return {
                StageId: stage.Id,
               Status: {
                  TeamId:  0,
                  UploadedCount: 0,
                  IsAlreadySubmitted: false,
                  IsRegisteredForEvent: false,
                  IsRegisteredForSubEvent: false
                } as IStageSubmissionStatus
              };
            }
          }
        )
      );

    statusResults.forEach(
      (
        result
      ) => {
        statusMap[ result.StageId
        ] =
          result.Status;
      }
    );


    console.log(
      "FINAL STAGE STATUS MAP:",
      statusMap
    );

    return statusMap;
  }


  /* ===================================================
     UPLOAD STAGE DOCUMENTS

     CASE 1:
       NO SUB EVENT

       TeamId =
       Event Participant item Id.

       SubEventID is NOT SET.


     CASE 2:
       HAS SUB EVENT

       TeamId =
       SubEvent TeamID lookup Id
       OR participant item Id.

       SubEventID IS SET.
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


    const subEventId =
      stage.SubEventId;


    const hasSubEvent =
      !!subEventId &&
      subEventId > 0;


    let teamId =
      0;


    /* =================================================
       CASE 1
       STAGE WITHOUT SUB EVENT
    ================================================= */

    if (
      !hasSubEvent
    ) {


      console.log(
        "UPLOAD: Stage has NO SubEvent."
      );

      const eventParticipantInfo =
        await this.getEventParticipantInfo(

          eventId

        );

      /* =============================================
         EVENT REGISTRATION CHECK
      ============================================= */

      if (
        !eventParticipantInfo.IsRegistered
      ) {

        throw new Error(
          "You are not registered for this Event. Document submission is not allowed."
        );
      }


      /*
         IMPORTANT:

         For NO SubEvent:

         TeamId =
         Event Participant item Id.
      */

      teamId =
        eventParticipantInfo.Id;


      if (
        !teamId ||
        teamId <= 0
      ) {

        throw new Error(
          "Unable to determine Event Participant ID for document submission."
        );
      }


      console.log(
        "NO SUB EVENT UPLOAD INFORMATION:",
        {
          EventId: eventId,
          EventParticipantId: eventParticipantInfo.Id,
          TeamID: teamId,
          SubEventId: null
        }
      );
    }


    /* =================================================
       CASE 2
       STAGE WITH SUB EVENT
    ================================================= */

    else {

      /*
         Because hasSubEvent is true,
         subEventId is a valid number here.
      */

      console.log(
        "UPLOAD: Stage HAS SubEvent."
      );

      const participantInfo = await this.getSubEventParticipantInfo(
          eventId,
          subEventId
        );


      /* =============================================
         STOP IF NOT REGISTERED
      ============================================= */
      if (
        !participantInfo.IsRegistered
      ) {

        /*
           IMPORTANT:
           We throw registration error BEFORE
           checking existing documents.
           Therefore user will NOT receive:
             "You have already submitted"
           when they are not registered.
        */

        throw new Error(
          `You are not registered for ${stage.SubEventTitle || "this Sub Event"}. Document submission is not allowed.`
        );
      }

      teamId = participantInfo.TeamId;

      if (
        !teamId ||
        teamId <= 0
      ) {
        throw new Error(
          "Unable to determine Team ID for document submission."
        );
      }

      console.log(
        "SUB EVENT UPLOAD INFORMATION:",
        {
          EventId: eventId,
          SubEventId: subEventId,
          SubEventParticipantId: participantInfo.Id,
          TeamID: teamId

        }
      );
    }

    /* =================================================
       CHECK ALREADY SUBMITTED

       IMPORTANT:

       This check occurs ONLY AFTER the
       registration check.
    ================================================= */

    const alreadyUploaded = await this.getExistingDocumentCount(
        eventId,
        hasSubEvent
          ? subEventId
          : undefined,
        teamId,
        stage.StageName
      );

    if (
      alreadyUploaded > 0
    ) {

      throw new Error(
        "You have already submitted the document."
      );
    }


    /* =================================================
       VALIDATE UPLOAD LIMIT
    ================================================= */

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


    /* =================================================
       VALIDATE FILE SIZE
    ================================================= */

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


    /* =================================================
       GET DOCUMENT LIBRARY
    ================================================= */

    const library =
      sp.web.lists
        .getByTitle(
          this.documentLibraryName
        );

    /* =================================================
       UPLOAD FILES
    ================================================= */

    for (
      const file of files
    ) {

      console.log(
        "Uploading File:",
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
              Overwrite:
                false
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
         BUILD METADATA
      ============================================= */

      if (
        hasSubEvent
      ) {
        /*
           SUB EVENT DOCUMENT

           EventID
           SubEventID
           TeamID lookup
           Stage
        */

        await uploadedItem.update({
          EventIDId: eventId,
          SubEventIDId: subEventId,
          TeamIDId: teamId,
          Stages: stage.StageName
        });

      }

      else {
        /*
           NO SUB EVENT DOCUMENT

           EventID
           TeamID lookup
           Stage

           IMPORTANT:

           SubEventIDId is NOT sent.

           Therefore the SubEvent lookup
           remains NULL.
        */

        await uploadedItem.update({
          EventIDId: eventId,
          TeamIDId:  teamId,
          Stages: stage.StageName
        });
      }
    }

    console.log(
      "DOCUMENT SUBMISSION COMPLETED"
    );

  }
}