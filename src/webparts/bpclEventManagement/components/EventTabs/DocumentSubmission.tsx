import * as React from "react";
import { useEffect, useState } from "react";
import styles from "./DocumentSubmission.module.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Button, Form } from "react-bootstrap";
import DocumentSubmissionService, { IEventDetails, ISubEventDetails, IEventStage, IStageSaveData } from "../../Services/EventTabsServices/DocumentSubmission";


interface IDocumentSubmissionProps {
  eventId?: number;
  context: any;
}

interface IStageFormData {
  Id?: number;
  EventID: number;
  SubEventID?: number | null;
  Stages: string;
  StageStartDate: string;
  StageEndDate: string;
  MaxFileSize: number | "";
  UploadLimit: number | "";
  IsActive: boolean;
}


interface ISubEventStageSection {
  SubEventID?: number | null;
  SubEventTitle: string;
  Stages: IStageFormData[];
}


const DocumentSubmission: React.FC<IDocumentSubmissionProps> = ({ eventId, context }) => {


  const documentSubmissionService = new DocumentSubmissionService();

  const [eventDetails, setEventDetails] = useState<IEventDetails | null>(null);
  const [stageSections, setStageSections] = useState<ISubEventStageSection[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const createDefaultStage = (currentEventId: number, subEventId?: number | null): IStageFormData => {

    return {

      EventID: currentEventId,
      SubEventID: subEventId || null,
      Stages: "Stage1",
      StageStartDate: "",
      StageEndDate: "",
      MaxFileSize: "",
      UploadLimit: "",
      IsActive: false

    };

  };


  const sortStages = (stages: IStageFormData[]): IStageFormData[] => {

    return [...stages].sort((firstStage: IStageFormData, secondStage: IStageFormData): number => {

      const firstNumber = Number(firstStage.Stages.replace("Stage", ""));
      const secondNumber = Number(secondStage.Stages.replace("Stage", ""));
      return firstNumber - secondNumber;

    });

  };


  useEffect(() => {

    if (!eventId) {
      setIsLoading(false);
      return;
    }


    const loadDocumentSubmission = async (): Promise<void> => {
      try {

        setIsLoading(true);
        setErrorMessage("");
        const response = await documentSubmissionService.getDocumentSubmission(eventId);
        setEventDetails(response.Event);
        const hasSubEvents = response.Event.HasSubEvents === true;

        /* ============================================
           EVENT HAS NO SUB EVENTS
        ============================================ */

        if (!hasSubEvents) {


          const existingStages =
            response.EventStages
              .filter(
                (
                  stage: IEventStage
                ): boolean =>
                  !stage.SubEventID
              )
              .map(
                (
                  stage: IEventStage
                ): IStageFormData => ({

                  Id: stage.Id,

                  EventID:
                    stage.EventID ||
                    eventId,

                  SubEventID: null,

                  Stages:
                    stage.Stages,

                  StageStartDate:
                    formatDateTimeForInput(
                      stage.StageStartDate
                    ),

                  StageEndDate:
                    formatDateTimeForInput(
                      stage.StageEndDate
                    ),

                  MaxFileSize:
                    stage.MaxFileSize,

                  UploadLimit:
                    stage.UploadLimit,

                  IsActive:
                    stage.IsActive

                })
              );


          setStageSections([
            {

              SubEventID: null,

              SubEventTitle:
                response.Event.EventTitle ||
                "Document Submission",

              Stages:
                existingStages.length > 0
                  ? sortStages(
                    existingStages
                  )
                  : [
                    createDefaultStage(
                      eventId,
                      null
                    )
                  ]

            }
          ]);


        } else {


          /* ============================================
             EVENT HAS SUB EVENTS
          ============================================ */

          const sections:
            ISubEventStageSection[] =
            response.SubEvents.map(
              (
                subEvent: ISubEventDetails
              ): ISubEventStageSection => {


                const existingStages =
                  response.EventStages
                    .filter(
                      (
                        stage: IEventStage
                      ): boolean =>
                        stage.SubEventID ===
                        subEvent.Id
                    )
                    .map(
                      (
                        stage: IEventStage
                      ): IStageFormData => ({

                        Id: stage.Id,

                        EventID:
                          stage.EventID ||
                          eventId,

                        SubEventID:
                          subEvent.Id,

                        Stages:
                          stage.Stages,

                        StageStartDate:
                          formatDateTimeForInput(
                            stage.StageStartDate
                          ),

                        StageEndDate:
                          formatDateTimeForInput(
                            stage.StageEndDate
                          ),

                        MaxFileSize:
                          stage.MaxFileSize,

                        UploadLimit:
                          stage.UploadLimit,

                        IsActive:
                          stage.IsActive

                      })
                    );


                return {

                  SubEventID:
                    subEvent.Id,

                  SubEventTitle:
                    subEvent.SubEventTitle,

                  Stages:
                    existingStages.length > 0
                      ? sortStages(
                        existingStages
                      )
                      : [
                        createDefaultStage(
                          eventId,
                          subEvent.Id
                        )
                      ]

                };

              }
            );


          setStageSections(
            sections
          );

        }


      } catch (error) {

        console.error(
          "Error loading document submission:",
          error
        );


        setErrorMessage(
          "Unable to load document submission details."
        );

      } finally {

        setIsLoading(false);

      }

    };


    loadDocumentSubmission();


  }, [eventId]);


  function formatDateTimeForInput(dateValue?: string | null): string {
    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
      return "";
    }

    return `${date.getUTCFullYear()}-${String(
      date.getUTCMonth() + 1
    ).padStart(2, "0")}-${String(
      date.getUTCDate()
    ).padStart(2, "0")}`;
  }

  function formatSharePointDate(
    dateValue?: string | null
  ): string | null {

    if (!dateValue) {
      return null;
    }

    const [year, month, day] = dateValue.split("-");

    if (!year || !month || !day) {
      return null;
    }

    return `${year}-${month}-${day}`;
  }


  const getDateBefore = (dateValue: string): string => {
    if (!dateValue) {
      return "";
    }

    const [year, month, day] = dateValue.split("-").map(Number);

    if (!year || !month || !day) {
      return "";
    }

    const date = new Date(Date.UTC(year, month - 1, day - 1));

    return `${date.getUTCFullYear()}-${String(
      date.getUTCMonth() + 1
    ).padStart(2, "0")}-${String(
      date.getUTCDate()
    ).padStart(2, "0")}`;
  };

  const getDateAfter = (dateValue: string): string => {
    if (!dateValue) {
      return "";
    }

    const [year, month, day] = dateValue.split("-").map(Number);

    if (!year || !month || !day) {
      return "";
    }

    const date = new Date(Date.UTC(year, month - 1, day + 1));

    return `${date.getUTCFullYear()}-${String(
      date.getUTCMonth() + 1
    ).padStart(2, "0")}-${String(
      date.getUTCDate()
    ).padStart(2, "0")}`;
  };

  /* ============================================
     UPDATE STAGE FIELD
  ============================================ */

  const updateStageField = (
    sectionIndex: number,
    stageIndex: number,
    field: keyof IStageFormData,
    value: any
  ): void => {


    setStageSections(
      (
        previousSections:
          ISubEventStageSection[]
      ) => {


        return previousSections.map(
          (
            section:
              ISubEventStageSection,
            currentSectionIndex: number
          ): ISubEventStageSection => {


            if (
              currentSectionIndex !==
              sectionIndex
            ) {

              return section;

            }


            const updatedStages =
              section.Stages.map(
                (
                  stage:
                    IStageFormData,
                  currentStageIndex: number
                ): IStageFormData => {


                  if (
                    currentStageIndex !==
                    stageIndex
                  ) {

                    return stage;

                  }


                  /* ============================================
                     ONLY ONE ACTIVE STAGE
                  ============================================ */

                  if (
                    field === "IsActive" &&
                    value === true
                  ) {

                    return {

                      ...stage,

                      IsActive: true

                    };

                  }


                  return {

                    ...stage,

                    [field]: value

                  };

                }
              );


            /* ============================================
               IF ONE STAGE IS ACTIVE,
               MAKE OTHER STAGES IN SAME SECTION INACTIVE
            ============================================ */

            if (
              field === "IsActive" &&
              value === true
            ) {

              return {

                ...section,

                Stages:
                  updatedStages.map(
                    (
                      stage:
                        IStageFormData,
                      currentStageIndex: number
                    ): IStageFormData => ({

                      ...stage,

                      IsActive:
                        currentStageIndex ===
                        stageIndex

                    })
                  )

              };

            }


            return {

              ...section,

              Stages:
                updatedStages

            };

          }
        );

      }
    );

  };


  /* ============================================
     ADD STAGE
  ============================================ */

  const handleAddStage = (
    sectionIndex: number
  ): void => {


    setStageSections(
      (
        previousSections:
          ISubEventStageSection[]
      ) => {


        return previousSections.map(
          (
            section:
              ISubEventStageSection,
            currentSectionIndex: number
          ): ISubEventStageSection => {


            if (
              currentSectionIndex !==
              sectionIndex
            ) {

              return section;

            }


            if (
              section.Stages.length >= 3
            ) {

              return section;

            }


            const nextStageNumber =
              section.Stages.length + 1;


            const newStage =
              createDefaultStage(
                eventId as number,
                section.SubEventID
              );


            newStage.Stages =
              `Stage${nextStageNumber}`;


            return {

              ...section,

              Stages: [
                ...section.Stages,
                newStage
              ]

            };

          }
        );

      }
    );

  };


  /* ============================================
     DELETE STAGE
  ============================================ */

  const handleDeleteStage = async (
    sectionIndex: number,
    stageIndex: number
  ): Promise<void> => {


    const section =
      stageSections[sectionIndex];


    const stage =
      section.Stages[stageIndex];


    /* Stage1 cannot be deleted */

    if (
      stage.Stages === "Stage1"
    ) {

      return;

    }


    try {


      /* ============================================
         DELETE FROM SHAREPOINT
         ONLY IF ALREADY SAVED
      ============================================ */

      if (stage.Id) {

        await documentSubmissionService
          .deleteStage(
            stage.Id
          );

      }


      setStageSections(
        (
          previousSections:
            ISubEventStageSection[]
        ) => {


          return previousSections.map(
            (
              currentSection:
                ISubEventStageSection,
              currentSectionIndex: number
            ): ISubEventStageSection => {


              if (
                currentSectionIndex !==
                sectionIndex
              ) {

                return currentSection;

              }


              const remainingStages =
                currentSection.Stages
                  .filter(
                    (
                      _stage:
                        IStageFormData,
                      currentStageIndex: number
                    ): boolean =>
                      currentStageIndex !==
                      stageIndex
                  )
                  .map(
                    (
                      remainingStage:
                        IStageFormData,
                      index: number
                    ): IStageFormData => ({

                      ...remainingStage,

                      Stages:
                        `Stage${index + 1}`

                    })
                  );


              return {

                ...currentSection,

                Stages:
                  remainingStages

              };

            }
          );

        }
      );


    } catch (error) {


      console.error(
        "Error deleting stage:",
        error
      );


      setErrorMessage(
        "Unable to delete the stage."
      );

    }

  };


  /* ============================================
   VALIDATE STAGE
============================================ */

  const validateStage = (
    stage: IStageFormData
  ): string => {


    /* ============================================
       MANDATORY FIELDS
    ============================================ */

    if (
      !stage.StageStartDate ||
      !stage.StageEndDate ||
      stage.MaxFileSize === "" ||
      stage.UploadLimit === ""
    ) {

      return (
        `${stage.Stages}: ` +
        "Please fill all mandatory fields."
      );

    }


    /* ============================================
       STAGE DATE VALIDATION
    ============================================ */

    const stageStartDate =
      new Date(
        stage.StageStartDate
      );


    const stageEndDate =
      new Date(
        stage.StageEndDate
      );


    if (
      isNaN(
        stageStartDate.getTime()
      ) ||
      isNaN(
        stageEndDate.getTime()
      )
    ) {

      return (
        `${stage.Stages}: ` +
        "Invalid stage date."
      );

    }


    /* ============================================
       STAGE END MUST BE AFTER STAGE START
    ============================================ */

    if (
      stageEndDate <=
      stageStartDate
    ) {

      return (
        `${stage.Stages}: ` +
        "End Date must be greater than Start Date."
      );

    }


    /* ============================================
       EVENT DETAILS
    ============================================ */

    if (!eventDetails) {

      return "Event details are not available.";

    }


    const eventStartDate =
      new Date(
        eventDetails.EventStartDate
      );


    if (
      isNaN(
        eventStartDate.getTime()
      )
    ) {

      return (
        `${stage.Stages}: ` +
        "Invalid Event Start Date."
      );

    }


    /* ============================================
       DOCUMENT SUBMISSION MUST BE COMPLETED
       BEFORE EVENT START DATE
    ============================================ */

    if (
      stageStartDate >=
      eventStartDate
    ) {

      return (
        `${stage.Stages}: ` +
        "Stage Start Date must be before Event Start Date."
      );

    }


    if (
      stageEndDate >=
      eventStartDate
    ) {

      return (
        `${stage.Stages}: ` +
        "Stage End Date must be before Event Start Date."
      );

    }





    /* ============================================
       NUMBER VALIDATION
    ============================================ */

    if (
      Number(stage.MaxFileSize) <= 0
    ) {

      return (
        `${stage.Stages}: ` +
        "Maximum File Size must be greater than zero."
      );

    }


    if (
      Number(stage.UploadLimit) <= 0
    ) {

      return (
        `${stage.Stages}: ` +
        "Upload Limit must be greater than zero."
      );

    }


    return "";

  };


  /* ============================================
     VALIDATE ACTIVE STAGES
  ============================================ */

  const validateActiveStages = (
    stages: IStageFormData[]
  ): string => {


    const activeStages =
      stages.filter(
        (
          stage: IStageFormData
        ): boolean =>
          stage.IsActive === true
      );


    if (
      activeStages.length > 1
    ) {

      return (
        "Only one stage can be active at a time."
      );

    }


    return "";

  };


  /* ============================================
     VALIDATE STAGE DATE SEQUENCE
  ============================================ */

  const validateStageDateSequence = (
    stages: IStageFormData[]
  ): string => {

    const stagesWithDates =
      stages.filter(
        (stage: IStageFormData) =>
          !!stage.StageStartDate &&
          !!stage.StageEndDate
      );


    for (
      let i = 0;
      i < stagesWithDates.length - 1;
      i++
    ) {

      const currentStage =
        stagesWithDates[i];

      const nextStage =
        stagesWithDates[i + 1];


      const currentEnd =
        new Date(
          currentStage.StageEndDate
        );

      const nextStart =
        new Date(
          nextStage.StageStartDate
        );


      /* ============================================
         NEXT STAGE MUST START AFTER
         PREVIOUS STAGE END DATE
  
         Stage 1: 01-Sep → 05-Sep
         Stage 2: 06-Sep → 10-Sep   ✅
  
         Stage 1: 01-Sep → 05-Sep
         Stage 2: 05-Sep → 10-Sep   ❌
  
         Stage 1: 01-Sep → 05-Sep
         Stage 2: 04-Sep → 10-Sep   ❌
      ============================================ */

      if (
        nextStart <= currentEnd
      ) {

        return (
          `${nextStage.Stages}: ` +
          "Start Date must be after " +
          `${currentStage.Stages} End Date.`
        );

      }

    }


    return "";

  };



  /* ============================================
     SAVE / UPDATE SECTION
  ============================================ */

  const handleSaveUpdate = async (
    sectionIndex: number
  ): Promise<void> => {

    if (!eventId) {

      setErrorMessage(
        "Event ID is not available."
      );

      return;

    }


    const section =
      stageSections[sectionIndex];


    setErrorMessage("");
    setSuccessMessage("");


    /* ============================================
       VALIDATE ACTIVE STAGES
    ============================================ */

    const activeValidation =
      validateActiveStages(
        section.Stages
      );

    if (activeValidation) {

      setErrorMessage(
        activeValidation
      );

      return;

    }


    /* ============================================
       VALIDATE STAGE DATE SEQUENCE
    ============================================ */

    const stageSequenceValidation =
      validateStageDateSequence(
        section.Stages
      );

    if (stageSequenceValidation) {

      setErrorMessage(
        stageSequenceValidation
      );

      return;

    }


    /* ============================================
       VALIDATE ALL STAGES
    ============================================ */

    for (
      const stage of section.Stages
    ) {

      const validationMessage =
        validateStage(stage);

      if (validationMessage) {

        setErrorMessage(
          validationMessage
        );

        return;

      }

    }


    try {

      setIsSaving(true);


      /* ============================================
         CHECK IF NEW STAGE1 IS BEING SAVED
      ============================================ */

      const isNewStage1 =
        section.Stages.some(
          (
            stage: IStageFormData
          ): boolean =>
            stage.Stages === "Stage1" &&
            !stage.Id
        );


      /* ============================================
         SAVE OR UPDATE EVERY STAGE
      ============================================ */

      for (
        const stage of section.Stages
      ) {

        const stageData:
          IStageSaveData = {

          Id:
            stage.Id,

          EventID:
            eventId,

          SubEventID:
            section.SubEventID || null,

          Stages:
            stage.Stages,

          StageStartDate:
            formatSharePointDate(
              stage.StageStartDate
            ) || "",

          StageEndDate:
            formatSharePointDate(
              stage.StageEndDate
            ) || "",

          MaxFileSize:
            Number(
              stage.MaxFileSize
            ),

          UploadLimit:
            Number(
              stage.UploadLimit
            ),

          IsActive:
            stage.IsActive

        };


        /* ============================================
           UPDATE EXISTING STAGE
        ============================================ */

        if (stage.Id) {

          await documentSubmissionService
            .updateStage(
              stageData
            );

        }


        /* ============================================
           SAVE NEW STAGE
        ============================================ */

        else {

          await documentSubmissionService
            .saveStage(
              stageData
            );

        }

      }


      /* ============================================
         UPDATE EVENT HAS STAGES
         
         ONLY WHEN NEW STAGE1 WAS SAVED
      ============================================ */

      if (isNewStage1) {

        await documentSubmissionService
          .updateEventHasStages(
            eventId
          );

      }


      /* ============================================
         SUCCESS MESSAGE
      ============================================ */

      setSuccessMessage(
        "Document submission stages saved successfully."
      );


      /* ============================================
         RELOAD DATA
      ============================================ */

      const response =
        await documentSubmissionService
          .getDocumentSubmission(
            eventId
          );


      const updatedSections =
        buildStageSections(
          response.Event,
          response.SubEvents,
          response.EventStages,
          eventId
        );


      setEventDetails(
        response.Event
      );


      /* ============================================
         UPDATE ONLY THE CURRENT SECTION
  
         Keep other sections as they are in the UI.
      ============================================ */

      setStageSections(
        (previousSections) => {

          return previousSections.map(
            (
              existingSection,
              index
            ) => {

              if (
                index === sectionIndex &&
                updatedSections[index]
              ) {

                return updatedSections[index];

              }

              return existingSection;

            }
          );

        }
      );


    } catch (error) {

      console.error(
        "Error saving document stages:",
        error
      );

      setErrorMessage(
        "Unable to save document submission stages."
      );


    } finally {

      setIsSaving(false);

    }

  };


  /* ============================================
     BUILD SECTIONS AFTER RELOAD
  ============================================ */

  const buildStageSections = (
    event: IEventDetails,
    subEvents: ISubEventDetails[],
    eventStages: IEventStage[],
    currentEventId: number
  ): ISubEventStageSection[] => {


    const hasSubEvents = event.HasSubEvents === true;



    /* ============================================
       NO SUB EVENTS
    ============================================ */

    if (!hasSubEvents) {


      const stages =
        eventStages
          .filter(
            (
              stage: IEventStage
            ): boolean =>
              !stage.SubEventID
          )
          .map(
            (
              stage: IEventStage
            ): IStageFormData => ({

              Id:
                stage.Id,

              EventID:
                currentEventId,

              SubEventID:
                null,

              Stages:
                stage.Stages,

              StageStartDate:
                formatDateTimeForInput(
                  stage.StageStartDate
                ),

              StageEndDate:
                formatDateTimeForInput(
                  stage.StageEndDate
                ),

              MaxFileSize:
                stage.MaxFileSize,

              UploadLimit:
                stage.UploadLimit,

              IsActive:
                stage.IsActive

            })
          );


      return [
        {

          SubEventID:
            null,

          SubEventTitle:
            event.EventTitle,

          Stages:
            stages.length > 0
              ? sortStages(stages)
              : [
                createDefaultStage(
                  currentEventId,
                  null
                )
              ]

        }
      ];

    }


    /* ============================================
       WITH SUB EVENTS
    ============================================ */

    return subEvents.map(
      (
        subEvent: ISubEventDetails
      ): ISubEventStageSection => {


        const stages =
          eventStages
            .filter(
              (
                stage: IEventStage
              ): boolean =>
                stage.SubEventID ===
                subEvent.Id
            )
            .map(
              (
                stage: IEventStage
              ): IStageFormData => ({

                Id:
                  stage.Id,

                EventID:
                  currentEventId,

                SubEventID:
                  subEvent.Id,

                Stages:
                  stage.Stages,

                StageStartDate:
                  formatDateTimeForInput(
                    stage.StageStartDate
                  ),

                StageEndDate:
                  formatDateTimeForInput(
                    stage.StageEndDate
                  ),

                MaxFileSize:
                  stage.MaxFileSize,

                UploadLimit:
                  stage.UploadLimit,

                IsActive:
                  stage.IsActive

              })
            );


        return {

          SubEventID:
            subEvent.Id,

          SubEventTitle:
            subEvent.SubEventTitle,

          Stages:
            stages.length > 0
              ? sortStages(stages)
              : [
                createDefaultStage(
                  currentEventId,
                  subEvent.Id
                )
              ]

        };

      }
    );

  };


  /* ============================================
     LOADING
  ============================================ */

  if (isLoading) {

    return (

      <div className="text-center p-4">

        <div
          className="spinner-border"
          role="status"
        />

        <div className="mt-2">
          Loading document submission details...
        </div>

      </div>

    );

  }


  /* ============================================
     RENDER
  ============================================ */

  return (

    <div>


      {/* ============================================
         ERROR MESSAGE
      ============================================ */}

      {errorMessage && (

        <div className="alert alert-danger">

          {errorMessage}

        </div>

      )}


      {/* ============================================
         SUCCESS MESSAGE
      ============================================ */}

      {successMessage && (

        <div className="alert alert-success">

          {successMessage}

        </div>

      )}


      {/* ============================================
         EVENT / SUB EVENT SECTIONS
      ============================================ */}

      {stageSections.map(
        (
          section: ISubEventStageSection,
          sectionIndex: number
        ) => (

          <div
            key={
              section.SubEventID ||
              "event-stage"
            }
            className="mb-4"
          >


            {/* ============================================
               SECTION HEADER
            ============================================ */}

            <div className="d-flex align-items-center mb-2">


              <div
                className={
                  `${styles.sectionTitle} flex-grow-1`
                }
              >

                <h2
                  className={
                    styles.subheading
                  }
                >

                  {eventDetails &&
                    eventDetails.HasSubEvents === true
                    ? `${section.SubEventTitle} Document Submission`
                    : "Event Document Submission"}

                </h2>

              </div>


              {/* SAVE & UPDATE */}

              <Button
                className={
                  `${styles.eventOutlineBtn} ms-3`
                }
                onClick={
                  (): void => {

                    handleSaveUpdate(
                      sectionIndex
                    ).catch(
                      (
                        error
                      ) => {

                        console.error(
                          error
                        );

                      }
                    );

                  }
                }
                disabled={
                  isSaving
                }
              >

                <i className="bi bi-save me-2" />

                {isSaving
                  ? "Saving..."
                  : "Save & Update"}

              </Button>


              {/* ADD STAGE */}

              <Button
                className={
                  `${styles.eventOutlineBtn} ms-3`
                }
                onClick={
                  (): void =>
                    handleAddStage(
                      sectionIndex
                    )
                }
                disabled={
                  section.Stages.length >= 3
                }
              >

                <i className="bi bi-plus-circle me-2" />

                Add Stage

              </Button>

            </div>


            {/* ============================================
               STAGES
            ============================================ */}

            {section.Stages.map(
              (
                stage: IStageFormData,
                stageIndex: number
              ) => (

                <div
                  key={
                    stage.Id ||
                    `${sectionIndex}-${stageIndex}`
                  }

                  className={`${styles.stageRow} p-2`}
                >


                  {/* STAGE NAME */}

                  <div
                    className={
                      styles.stageNameCol
                    }
                  >

                    <div
                      className={
                        styles.stageName
                      }
                    >

                      {/* {stage.Stages} */}
                      {stage.Stages
                        ? stage.Stages.replace("Stage", "Stage ")
                        : `Stage ${stageIndex + 1}`}

                    </div>

                  </div>


                  {/* START DATE */}



                  <Form.Group
                    className={
                      styles.inputGroup
                    }
                  >

                    <Form.Label
                      className={
                        styles.inputLabel
                      }
                    >

                      Start Date

                      <span
                        className={
                          styles.required
                        }
                      >
                        *
                      </span>

                    </Form.Label>


                    <Form.Control
                      type="date"
                      value={
                        stage.StageStartDate
                      }
                      max={
                        eventDetails
                          ? getDateBefore(
                            formatDateTimeForInput(
                              eventDetails.EventStartDate
                            )
                          )
                          : ""
                      }
                      onChange={
                        (
                          e: React.ChangeEvent<
                            HTMLInputElement
                          >
                        ): void =>

                          updateStageField(
                            sectionIndex,
                            stageIndex,
                            "StageStartDate",
                            e.target.value
                          )
                      }
                      className={
                        styles.inputField
                      }
                    />

                  </Form.Group>




                  {/* END DATE */}



                  <Form.Group
                    className={
                      styles.inputGroup
                    }
                  >

                    <Form.Label
                      className={
                        styles.inputLabel
                      }
                    >

                      End Date

                      <span
                        className={
                          styles.required
                        }
                      >
                        *
                      </span>

                    </Form.Label>


                    <Form.Control
                      type="date"
                      value={
                        stage.StageEndDate
                      }
                      min={
                        stage.StageStartDate
                          ? getDateAfter(
                            stage.StageStartDate
                          )
                          : ""
                      }

                      max={
                        eventDetails
                          ? getDateBefore(
                            formatDateTimeForInput(
                              eventDetails.EventStartDate
                            )
                          )
                          : ""
                      }
                      onChange={
                        (
                          e: React.ChangeEvent<
                            HTMLInputElement
                          >
                        ): void =>

                          updateStageField(
                            sectionIndex,
                            stageIndex,
                            "StageEndDate",
                            e.target.value
                          )
                      }
                      className={
                        styles.inputField
                      }
                    />

                  </Form.Group>




                  {/* MAX FILE SIZE */}



                  <Form.Group
                    className={
                      styles.inputGroup
                    }
                  >

                    <Form.Label
                      className={
                        styles.inputLabel
                      }
                    >

                      Maximum File Size (MB)

                      <span
                        className={
                          styles.required
                        }
                      >
                        *
                      </span>

                    </Form.Label>


                    <Form.Control
                      type="number"
                      min="1"
                      value={
                        stage.MaxFileSize
                      }
                      placeholder="Enter File Size"
                      onChange={
                        (
                          e: React.ChangeEvent<
                            HTMLInputElement
                          >
                        ): void =>

                          updateStageField(
                            sectionIndex,
                            stageIndex,
                            "MaxFileSize",
                            e.target.value === ""
                              ? ""
                              : Number(
                                e.target.value
                              )
                          )
                      }
                      className={
                        styles.inputField
                      }
                    />

                  </Form.Group>




                  {/* UPLOAD LIMIT */}



                  <Form.Group
                    className={
                      styles.inputGroup
                    }
                  >

                    <Form.Label
                      className={
                        styles.inputLabel
                      }
                    >

                      Upload Limit

                      <span
                        className={
                          styles.required
                        }
                      >
                        *
                      </span>

                    </Form.Label>


                    <Form.Control
                      type="number"
                      min="1"
                      value={
                        stage.UploadLimit
                      }
                      placeholder="Enter Upload Limit"
                      onChange={
                        (
                          e: React.ChangeEvent<
                            HTMLInputElement
                          >
                        ): void =>

                          updateStageField(
                            sectionIndex,
                            stageIndex,
                            "UploadLimit",
                            e.target.value === ""
                              ? ""
                              : Number(
                                e.target.value
                              )
                          )
                      }
                      className={
                        styles.inputField
                      }
                    />

                  </Form.Group>




                  {/* IS ACTIVE */}



                  <Form.Group
                    className={
                      styles.inputGroup
                    }
                  >

                    <Form.Label
                      className={
                        styles.inputLabel
                      }
                    >

                      Is Active?

                      <span
                        className={
                          styles.required
                        }
                      >
                        *
                      </span>

                    </Form.Label>


                    <div
                      className={
                        styles.checkboxWrapper
                      }
                    >

                      <Form.Check
                        type="checkbox"
                        checked={
                          stage.IsActive
                        }
                        onChange={
                          (
                            e: React.ChangeEvent<
                              HTMLInputElement
                            >
                          ): void => {

                            if (
                              e.target.checked &&
                              stage.StageEndDate
                            ) {

                              const endDate =
                                new Date(
                                  stage.StageEndDate
                                );


                              if (
                                endDate <
                                new Date()
                              ) {

                                setErrorMessage(
                                  "You cannot activate a stage whose End Date has already passed."
                                );

                                return;

                              }

                            }


                            updateStageField(
                              sectionIndex,
                              stageIndex,
                              "IsActive",
                              e.target.checked
                            );

                          }
                        }
                        className={
                          styles.activeCheckbox
                        }
                      />

                    </div>

                  </Form.Group>



                  {/* DELETE STAGE */}



                  {stage.Stages !== "Stage1" && !stage.Id && (
                    <Button
                      variant="link"
                      className={`${styles.deleteStageBtn} `}
                      title="Delete Stage"
                      onClick={() => {
                        handleDeleteStage(
                          sectionIndex,
                          stageIndex
                        ).catch((error) => {
                          console.error(error);
                        });
                      }}
                    >
                      <i className="bi bi-trash-fill me-1" />
                      <span className={styles.deleteText}>Delete</span>
                    </Button>

                  )}
                </div>

              )
            )}

          </div>

        )
      )}

    </div>

  );

};


export default DocumentSubmission;