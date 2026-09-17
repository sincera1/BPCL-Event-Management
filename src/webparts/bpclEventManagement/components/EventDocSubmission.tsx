import * as React from "react";

import {
  useState,
  useEffect
} from "react";

import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert
} from "react-bootstrap";

import styles from "./EventDocSubmission.module.scss";
import trophy from "../assets/trophy.png";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";


/* =====================================================
   ABOUT SERVICE
===================================================== */

import AboutService, {
  IEventDetails
} from "../Services/EventTabsServices/About";


/* =====================================================
   STAGE SUBMISSION SERVICE
===================================================== */

import StageSubmissionService, {
  IActiveEventStage,
  IStageSubmissionStatus
} from "../Services/EventDocSubmissionService";


/* =====================================================
   PROPS
===================================================== */

interface IDocumentSubmissionProps {
  eventId?: number;
  context: any;
  onBack: () => void;
}


/* =====================================================
   STAGE STATUS MAP
===================================================== */

interface IStageStatusMap {
  [stageId: number]: IStageSubmissionStatus;
}


/* =====================================================
   FILE ERROR MAP
===================================================== */

interface IFileErrorMap {
  [stageId: number]: string;
}


/* =====================================================
   COMPONENT
===================================================== */

const EventSubmitDocs:
  React.FC<IDocumentSubmissionProps> =
  (props) => {


    /* =================================================
       SELECTED FILES
    ================================================= */

    const [
      selectedFiles,
      setSelectedFiles
    ] =
      useState<{
        [stageId: number]: File[];
      }>({});


    /* =================================================
       EVENT DETAILS
    ================================================= */

    const [
      eventDetails,
      setEventDetails
    ] =
      useState<IEventDetails | null>(
        null
      );


    /* =================================================
       ACTIVE STAGES
    ================================================= */

    const [
      activeStages,
      setActiveStages
    ] =
      useState<IActiveEventStage[]>(
        []
      );


    /* =================================================
       STAGE SUBMISSION STATUS
    ================================================= */

    const [
      stageStatuses,
      setStageStatuses
    ] =
      useState<IStageStatusMap>(
        {}
      );


    /* =================================================
       FILE VALIDATION ERRORS
    ================================================= */

    const [
      fileErrors,
      setFileErrors
    ] =
      useState<IFileErrorMap>(
        {}
      );


    /* =================================================
       PAGE LOADING
    ================================================= */

    const [
      isLoading,
      setIsLoading
    ] =
      useState<boolean>(
        false
      );


    const showPageLoader = false;


    /* =================================================
       DATA CHECK COMPLETED
    ================================================= */

    const [
      isDataLoaded,
      setIsDataLoaded
    ] =
      useState<boolean>(
        false
      );


    /* =================================================
       UPLOAD LOADING
    ================================================= */

    const [
      isSubmitting,
      setIsSubmitting
    ] =
      useState<boolean>(
        false
      );


    /* =================================================
       SUCCESS MESSAGE
    ================================================= */

    const [
      successMessage,
      setSuccessMessage
    ] =
      useState<string>(
        ""
      );


    /* =================================================
       ERROR MESSAGE
    ================================================= */

    const [
      errorMessage,
      setErrorMessage
    ] =
      useState<string>(
        ""
      );


    /* =================================================
       SERVICES
    ================================================= */

    const aboutService =
      new AboutService();


    const stageSubmissionService =
      new StageSubmissionService();


    /* =================================================
       LOAD DATA
    ================================================= */

    const loadData =
      async (): Promise<void> => {

        setIsDataLoaded(false);


        if (
          !props.eventId ||
          props.eventId <= 0
        ) {

          setIsLoading(false);
          setIsDataLoaded(true);

          return;

        }


        try {

          setIsLoading(true);

          setErrorMessage("");


          /* =========================================
             LOAD EVENT
          ========================================= */

          const eventData:
            IEventDetails =
            await aboutService
              .getEventDetails(
                props.eventId
              );


          setEventDetails(
            eventData
          );


          /* =========================================
             LOAD ACTIVE STAGES
          ========================================= */

          const stages:
            IActiveEventStage[] =
            await stageSubmissionService
              .getActiveStagesByEventId(
                props.eventId
              );


          /* =========================================
             LOAD SUBMISSION STATUS
          ========================================= */

          const statusMap:
            IStageStatusMap =
            await stageSubmissionService
              .getStageSubmissionStatuses(
                props.eventId,
                stages
              );


          /* =========================================
             CHECK EVENT TYPE
          ========================================= */

          const eventParticipantType =
            (
              eventData
                ?.EventParticipantType ||
              ""
            )
              .trim()
              .toLowerCase();


          const isTeamEvent =
            eventParticipantType === "team";


          /* =========================================
             FILTER STAGES
          ========================================= */

          // const visibleStages =
          //   isTeamEvent
          //     ?
          //     stages.filter(
          //       (
          //         stage
          //       ) => {

          //         const status =
          //           statusMap[
          //             stage.Id
          //           ];


          //         return (
          //           status
          //             ?.IsRegisteredForSubEvent ===
          //           true
          //         );

          //       }
          //     )
          //     :
          //     stages;
/* =========================================
   FILTER STAGES

   RULES:

   Individual Event:
   - Show all active stages.

   Team Event:
   - Stage WITHOUT SubEvent:
       Show directly.

   - Stage WITH SubEvent:
       Show only when current user is
       registered for that SubEvent.
========================================= */

const visibleStages =
  isTeamEvent
    ?
    stages.filter(
      (
        stage
      ) => {

        /* =====================================
           NO SUB EVENT

           Team event without subevent should
           still allow document submission.
        ===================================== */

        if (
          !stage.SubEventId ||
          stage.SubEventId <= 0
        ) {

          console.log(
            "Team event stage WITHOUT SubEvent. Showing stage:",
            {
              StageId: stage.Id,
              StageName: stage.StageName
            }
          );

          return true;
        }


        /* =====================================
           SUB EVENT EXISTS

           Check current user's registration.
        ===================================== */

        const status =
          statusMap[
            stage.Id
          ];


        return (
          status?.IsRegisteredForSubEvent ===
          true
        );
      }
    )
    :
    stages;

          /* =========================================
             SET DATA
          ========================================= */

          setActiveStages(
            visibleStages
          );


          setStageStatuses(
            statusMap
          );


          /* =========================================
             DEBUG LOGS
          ========================================= */

          console.log(
            "=========================================="
          );

          console.log(
            "Event Details:",
            eventData
          );

          console.log(
            "Event Participant Type:",
            eventData
              ?.EventParticipantType
          );

          console.log(
            "Is Team Event:",
            isTeamEvent
          );

          console.log(
            "All Active Stages:",
            stages
          );

          console.log(
            "Visible Stages:",
            visibleStages
          );

          console.log(
            "Stage Status:",
            statusMap
          );

          console.log(
            "=========================================="
          );


        }
        catch (
          error
        ) {

          console.error(
            "Error loading submission page:",
            error
          );


          setErrorMessage(
            "Unable to load event details. Please try again."
          );

        }
        finally {

          setIsLoading(false);

          setIsDataLoaded(true);

        }

      };


    /* =================================================
       LOAD ON EVENT CHANGE
    ================================================= */

    useEffect(() => {

      loadData();

    }, [
      props.eventId
    ]);


    /* =================================================
       FORMAT DATE
    ================================================= */

    const formatDate =
      (
        dateValue?: string
      ): string => {

        if (!dateValue) {

          return "";

        }


        const date =
          new Date(
            dateValue
          );


        if (
          isNaN(
            date.getTime()
          )
        ) {

          return dateValue;

        }


        return date.toLocaleDateString(
          "en-GB",
          {
            day: "2-digit",
            month: "short",
            year: "numeric"
          }
        );

      };


    /* =================================================
       GET FILES FOR STAGE
    ================================================= */

    const getFilesForStage =
      (
        stageId: number
      ): File[] => {

        return (
          selectedFiles[
            stageId
          ] || []
        );

      };


    /* =================================================
       HANDLE FILE CHANGE
    ================================================= */

    const handleFileChange =
      (
        stage: IActiveEventStage,
        e: React.ChangeEvent<HTMLInputElement>
      ): void => {


        if (
          !e.target.files ||
          e.target.files.length === 0
        ) {

          return;

        }


        setErrorMessage("");

        setSuccessMessage("");


        /* =============================================
           CLEAR ONLY THIS STAGE FILE ERROR
        ============================================= */

        setFileErrors(
          (
            previousErrors
          ) => ({
            ...previousErrors,
            [stage.Id]: ""
          })
        );


        const newFiles =
          Array.from(
            e.target.files
          );


        const existingFiles =
          selectedFiles[
            stage.Id
          ] || [];


        const uploadLimit =
          Number(
            stage.UploadLimit
          ) || 0;


        const totalFiles =
          existingFiles.length +
          newFiles.length;


        /* =============================================
           VALIDATE UPLOAD LIMIT
        ============================================= */

        if (
          uploadLimit > 0 &&
          totalFiles > uploadLimit
        ) {

          const remainingFiles =
            Math.max(
              uploadLimit -
              existingFiles.length,
              0
            );


          setFileErrors(
            (
              previousErrors
            ) => ({
              ...previousErrors,
              [stage.Id]:
                `You can select only ${remainingFiles} file(s). Maximum allowed is ${uploadLimit}.`
            })
          );


          e.target.value = "";

          return;

        }


        /* =============================================
           VALIDATE FILE SIZE
        ============================================= */

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


          const oversizedFile =
            newFiles.find(
              (
                file: File
              ) =>
                file.size >
                maxBytes
            );


          if (
            oversizedFile
          ) {

            setFileErrors(
              (
                previousErrors
              ) => ({
                ...previousErrors,
                [stage.Id]:
                  `"${oversizedFile.name}" exceeds the maximum file size of ${maxFileSizeMB} MB.`
              })
            );


            e.target.value = "";

            return;

          }

        }


        /* =============================================
           DUPLICATE FILE CHECK
        ============================================= */

        const duplicateFile =
          newFiles.find(
            (
              newFile: File
            ) =>
              existingFiles.some(
                (
                  existingFile: File
                ) =>
                  existingFile.name
                    .toLowerCase() ===
                  newFile.name
                    .toLowerCase()
              )
          );


        if (
          duplicateFile
        ) {

          setFileErrors(
            (
              previousErrors
            ) => ({
              ...previousErrors,
              [stage.Id]:
                `"${duplicateFile.name}" is already selected.`
            })
          );


          e.target.value = "";

          return;

        }


        /* =============================================
           ADD FILES
        ============================================= */

        setSelectedFiles(
          (
            previousFiles
          ) => ({

            ...previousFiles,

            [stage.Id]: [

              ...(
                previousFiles[
                  stage.Id
                ] || []
              ),

              ...newFiles

            ]

          })
        );


        e.target.value = "";

      };


    /* =================================================
       REMOVE FILE
    ================================================= */

    const removeFile =
      (
        stageId: number,
        fileIndex: number
      ): void => {


        setSelectedFiles(
          (
            previousFiles
          ) => {


            const currentFiles =
              previousFiles[
                stageId
              ] || [];


            const updatedFiles =
              currentFiles.filter(
                (
                  _,
                  index
                ) =>
                  index !==
                  fileIndex
              );


            return {

              ...previousFiles,

              [stageId]:
                updatedFiles

            };

          }
        );


        setErrorMessage("");


        setFileErrors(
          (
            previousErrors
          ) => ({
            ...previousErrors,
            [stageId]: ""
          })
        );

      };


    /* =================================================
       CHECK IF ANY FILE IS SELECTED
    ================================================= */

    const hasAnySelectedFiles =
      (): boolean => {


        return Object.keys(
          selectedFiles
        ).some(
          (
            stageId
          ) =>
            selectedFiles[
              Number(stageId)
            ]?.length > 0
        );

      };


    /* =================================================
       CHECK IF ALL AVAILABLE STAGES SUBMITTED
    ================================================= */

   const hasAvailableStage =
  (): boolean => {

    return activeStages.some(
      (
        stage
      ) => {

        const status =
          stageStatuses[
            stage.Id
          ];

        const hasSubEvent =
          !!stage.SubEventId &&
          stage.SubEventId > 0;

        const isRegistered =
          !hasSubEvent ||
          status?.IsRegisteredForSubEvent === true;

        return (
          isRegistered &&
          status?.IsAlreadySubmitted !== true
        );
      }
    );
  };


    /* =================================================
       HANDLE SINGLE SUBMIT BUTTON
    ================================================= */

    const handleSubmit =
      async (): Promise<void> => {


        setErrorMessage("");

        setSuccessMessage("");


        if (
          !props.eventId ||
          props.eventId <= 0
        ) {

          setErrorMessage(
            "Invalid Event ID."
          );

          return;

        }


        /* =============================================
           CHECK FILE
        ============================================= */

        if (
          !hasAnySelectedFiles()
        ) {

          setErrorMessage(
            "Please select at least one document."
          );

          return;

        }


        try {

          setIsSubmitting(
            true
          );


          /* ===========================================
             LOOP THROUGH ALL STAGES
          =========================================== */

          for (
            const stage of activeStages
          ) {


            const files =
              getFilesForStage(
                stage.Id
              );


            if (
              files.length === 0
            ) {

              continue;

            }


            const status =
              stageStatuses[
                stage.Id
              ];


            if (
              !status?.IsRegisteredForSubEvent
            ) {

              throw new Error(
                `You are not registered for ${stage.SubEventTitle || "this Sub Event"}.`
              );

            }


            if (
              status?.IsAlreadySubmitted
            ) {

              throw new Error(
                `You have already submitted the document for ${stage.SubEventTitle || "this Sub Event"}.`
              );

            }


            await stageSubmissionService
              .uploadStageDocuments(
                props.eventId,
                stage,
                files
              );

          }


          /* ===========================================
             SUCCESS
          =========================================== */

          setSuccessMessage(
            "Document submitted successfully."
          );


          /* ===========================================
             CLEAR FILES
          =========================================== */

          setSelectedFiles({});


          /* ===========================================
             RELOAD STATUS
          =========================================== */

          await loadData();

        }
        catch (
          error: any
        ) {

          console.error(
            "Document submission failed:",
            error
          );


          setErrorMessage(
            error?.message ||
            "Document submission failed. Please try again."
          );

        }
        finally {

          setIsSubmitting(
            false
          );

        }

      };


    /* =================================================
       PAGE LOADING
    ================================================= */

    if (
      isLoading &&
      showPageLoader
    ) {

      return (

        <div className="text-center p-5">

          <div
            className="spinner-border"
            role="status"
          />

          <p className="mt-3">
            Loading event details...
          </p>

        </div>

      );

    }


    /* =================================================
       MAIN UI
    ================================================= */

    return (

      <Container fluid>

        <Row>


          {/* =========================================
              LEFT SIDE
          ========================================= */}

          <Col md={6}>

            <div
              className={
                `p-4 ${styles.leftContent}`
              }
            >

              <div
                className="
                  d-flex
                  align-items-center
                "
              >

                <button
                  type="button"
                  className={
                    `${styles.backButton} me-3`
                  }
                  onClick={
                    props.onBack
                  }
                >

                  <i
                    className={
                      `bi bi-chevron-left ${styles.backIcon}`
                    }
                  />

                </button>


                <h2
                  className={
                    styles.ModalTitleName
                  }
                >

                  {
                    eventDetails?.EventTitle ||
                    ""
                  }

                </h2>

              </div>


              <div
                className="
                  d-flex
                  align-items-center
                  justify-content-between
                "
              >

                <div
                  className="
                    flex-grow-1
                    pe-4
                  "
                >

                  <p
                    className={
                      `${styles.ModalDescription} mt-2`
                    }
                  >

                    {
                      eventDetails?.EventDescription ||
                      ""
                    }

                  </p>

                </div>


                <div
                  className="flex-shrink-0"
                >

                  <img
                    src={trophy}
                    alt="Trophy"
                    className={
                      styles.modalImage
                    }
                  />

                </div>

              </div>


              {/* =====================================
                  EVENT DETAILS
              ===================================== */}

              <div
                className={
                  styles.customCard
                }
              >

                <h4
                  className={
                    styles.sectionEventTitle
                  }
                >
                  Event Details
                </h4>


                <div className="row g-3">


                  <div
                    className="
                      col-12
                      col-md-5
                    "
                  >

                    <div
                      className={
                        styles.detailItem
                      }
                    >

                      <div
                        className={
                          styles.yellowiconBox
                        }
                      >

                        <i
                          className="
                            bi
                            bi-calendar-event
                          "
                        />

                      </div>


                      <div>

                        <small>
                          Event Date
                        </small>


                        <h6>

                          {formatDate(
                            eventDetails?.EventStartDate || ""
                          )}

                          {" - "}

                          {formatDate(
                            eventDetails?.EventEndDate || ""
                          )}

                        </h6>

                      </div>

                    </div>

                  </div>


                  <div
                    className="
                      col-12
                      col-md-5
                    "
                  >

                    <div
                      className={
                        styles.detailItem
                      }
                    >

                      <div
                        className={
                          styles.yellowiconBox
                        }
                      >

                        <i
                          className="
                            bi
                            bi-calendar-check
                          "
                        />

                      </div>


                      <div>

                        <small>
                          Registration Date
                        </small>


                        <h6>

                          {formatDate(
                            eventDetails?.RegistrationStartDate || ""
                          )}

                          {" - "}

                          {formatDate(
                            eventDetails?.RegistrationEndDate || ""
                          )}

                        </h6>

                      </div>

                    </div>

                  </div>


                  <div
                    className="
                      col-12
                      col-md-5
                    "
                  >

                    <div
                      className={
                        styles.detailItem
                      }
                    >

                      <div
                        className={
                          styles.yellowiconBox
                        }
                      >

                        <i
                          className="
                            bi
                            bi-people
                          "
                        />

                      </div>


                      <div>

                        <small>
                          Event Type
                        </small>


                        <h6>

                          {
                            eventDetails?.EventParticipantType ||
                            "-"
                          }

                        </h6>

                      </div>

                    </div>

                  </div>

                </div>

              </div>


              {/* =====================================
                  RULES & REGULATIONS
              ===================================== */}

              <div
                className={
                  `${styles.customCard} mt-4`
                }
              >

                <h4
                  className="
                    section-title
                    mb-4
                  "
                >
                  Rules & Regulations
                </h4>


                {
                  eventDetails?.RulesAndRegualtionType
                    ?.trim()
                    .toLowerCase() === "image"

                    ?

                    (
                      eventDetails
                        ?.RulesAndRegualtionImage
                        ?.serverRelativeUrl

                        ?

                        <img
                          src={
                            eventDetails
                              .RulesAndRegualtionImage
                              .serverRelativeUrl
                          }
                          alt="Rules and Regulations"
                          className={
                            `img-fluid ${styles.eventRulesImage}`
                          }
                        />

                        :

                        <p>
                          No rules available.
                        </p>
                    )

                    :

                    eventDetails
                      ?.RulesAndRegualtionText
                      ?.trim()

                      ?

                      eventDetails
                        .RulesAndRegualtionText
                        .split("\n")
                        .filter(
                          (
                            rule: string
                          ) =>
                            rule.trim() !== ""
                        )
                        .map(
                          (
                            item: string,
                            index: number
                          ) => (

                            <div
                              className={
                                styles.ruleItem
                              }
                              key={index}
                            >

                              <div
                                className={
                                  styles.checkIcon
                                }
                              >

                                <i
                                  className="
                                    bi
                                    bi-check-lg
                                  "
                                />

                              </div>


                              <p>
                                {item}
                              </p>

                            </div>

                          )
                        )

                      :

                      (
                        <p>
                          No rules available.
                        </p>
                      )
                }

              </div>

            </div>

          </Col>


          {/* =========================================
              RIGHT SIDE
          ========================================= */}

          <Col md={6}>

            <div
              className={
                `align-items-center p-3 ${styles.rightContent}`
              }
            >


              {/* =====================================
                  HEADING
              ===================================== */}

              <div
                className={
                  styles.headingWrapper
                }
              >

                <div
                  className={
                    styles.line
                  }
                />


                <h2
                  className={
                    styles.heading
                  }
                >
                  Submit Documents
                </h2>


                <div
                  className={
                    styles.line
                  }
                />

              </div>


              {/* =====================================
                  ERROR
              ===================================== */}

              {
                errorMessage && (

                  <Alert
                    variant="danger"
                    className="mt-3"
                    dismissible
                    onClose={() =>
                      setErrorMessage("")
                    }
                  >

                    <i
                      className="
                        bi
                        bi-exclamation-triangle-fill
                        me-2
                      "
                    />

                    {errorMessage}

                  </Alert>

                )
              }


              {/* =====================================
                  NO ACTIVE STAGE
              ===================================== */}

              {
                isDataLoaded &&
                activeStages.length === 0 && (

                  <div
                    className="
                      text-center
                      mt-4
                    "
                  >

                    <i
                      className="
                        bi
                        bi-info-circle
                        fs-2
                        text-muted
                      "
                    />


                    <p
                      className="
                        text-muted
                        mt-2
                      "
                    >

                      No active document submission
                      stage is currently available.

                    </p>

                  </div>

                )
              }


              {/* =====================================
                  ACTIVE STAGES
              ===================================== */}

              {
                isDataLoaded &&
                activeStages.map(

                  (
                    stage: IActiveEventStage,
                    stageIndex: number
                  ) => {

                    const stageFiles =
                      getFilesForStage(
                        stage.Id
                      );


                    const status =
                      stageStatuses[
                        stage.Id
                      ];


                    const hasSubEvent =
                      !!stage.SubEventId &&
                      stage.SubEventId > 0;

                    const isRegistered =
                      !hasSubEvent ||
                      status?.IsRegisteredForSubEvent === true;


                    const isAlreadySubmitted =
                      status
                        ?.IsAlreadySubmitted ===
                      true;


                    const uploadLimit =
                      Number(
                        stage.UploadLimit
                      ) || 0;


                    const isDisabled =
                      isSubmitting ||
                      !isRegistered ||
                      isAlreadySubmitted;


                    return (

                      <div
                        key={
                          stage.Id
                        }
                        className="mt-4"
                      >


                        {/* =============================
                            EVENT → SUB EVENT → STAGE
                        ============================= */}

                        <p
                          className={
                            styles.modalRightDescription
                          }
                        >

                          <strong>

                            {
                              eventDetails
                                ?.EventTitle ||
                              "Event"
                            }

                          </strong>


                          {
                            stage.SubEventTitle && (

                              <>

                                {" → "}

                                <strong>

                                  {
                                    stage.SubEventTitle
                                  }

                                </strong>

                              </>

                            )
                          }


                          {
                            stage.StageName && (

                              <>

                                {" → "}

                                <strong>

                                  {
                                    stage.StageName
                                  }

                                </strong>

                              </>

                            )
                          }

                        </p>


                        {/* =============================
                            NOT REGISTERED
                        ============================= */}

                        {
                          hasSubEvent &&
                          !isRegistered && (
                            <Alert
                              variant="warning"
                              className="mt-3"
                            >
                              <i
                                className="
                                  bi
                                  bi-info-circle-fill
                                  me-2
                                "
                              />

                              You are not registered for this Sub Event.
                              Document submission is not allowed.

                            </Alert>
                          )
                        }


                        {/* =============================
                            UPLOAD SECTION
                        ============================= */}

                        {
                          isRegistered &&
                          !isAlreadySubmitted && (

                            <>

                              {/* =========================
                                  STAGE INFORMATION
                              ========================= */}

                              <div
                                className="mb-3"
                              >

                                <small
                                  className="text-muted"
                                >

                                  Submission Period:
                                  {" "}

                                  <strong>

                                    {
                                      formatDate(
                                        stage.StageStartDate
                                      )
                                    }

                                    {" - "}

                                    {
                                      formatDate(
                                        stage.StageEndDate
                                      )
                                    }

                                  </strong>

                                </small>


                                <br />


                                <small
                                  className="text-muted"
                                >

                                  Upload Limit:
                                  {" "}

                                  <strong>

                                    {
                                      stage.UploadLimit
                                    }

                                  </strong>


                                  {" | "}


                                  Max File Size:
                                  {" "}


                                  <strong>

                                    {
                                      stage.MaxFileSize
                                    }

                                    {" MB"}

                                  </strong>

                                </small>

                              </div>


                              {/* =========================
                                  FILE UPLOAD
                              ========================= */}

                              <Row>

                                <Col
                                  xs={12}
                                  md={12}
                                >

                                  <Form.Group>


                                    <Form.Label>

                                      Upload Document

                                      {" "}

                                      {
                                        activeStages.length > 1

                                          ?

                                          `(${stage.StageName || `Stage ${stageIndex + 1}`})`

                                          :

                                          ""
                                      }

                                    </Form.Label>


                                    <Form.Control

                                      multiple

                                      id={
                                        `eventDocUpload_${stage.Id}`
                                      }

                                      type="file"

                                      disabled={
                                        isDisabled
                                      }

                                      onChange={

                                        (
                                          e:
                                            React.ChangeEvent<HTMLInputElement>
                                        ): void =>

                                          handleFileChange(
                                            stage,
                                            e
                                          )

                                      }

                                    />


                                    {/* =====================
                                        FILE ERROR
                                    ===================== */}

                                    {
                                      fileErrors[stage.Id] && (

                                        <Alert
                                          variant="danger"
                                          className="mt-2 mb-2"
                                        >

                                          <i
                                            className="
                                              bi
                                              bi-exclamation-triangle-fill
                                              me-2
                                            "
                                          />

                                          {
                                            fileErrors[
                                              stage.Id
                                            ]
                                          }

                                        </Alert>

                                      )
                                    }


                                    {/* =====================
                                        FILE LIMIT
                                    ===================== */}

                                    {
                                      uploadLimit > 0 && (

                                        <Form.Text
                                          className="text-muted"
                                        >

                                          Maximum
                                          {" "}

                                          {
                                            uploadLimit
                                          }

                                          {" file(s) allowed."}

                                        </Form.Text>

                                      )
                                    }


                                    {/* =====================
                                        SELECTED FILES
                                    ===================== */}

                                    {
                                      stageFiles.map(

                                        (
                                          file:
                                            File,

                                          fileIndex:
                                            number

                                        ) => (

                                          <div
                                            className={
                                              styles.filePreview
                                            }
                                            key={
                                              `${file.name}_${fileIndex}`
                                            }
                                          >


                                            <div
                                              className={
                                                styles.fileIcon
                                              }
                                            >

                                              <i
                                                className="
                                                  bi
                                                  bi-file-earmark
                                                "
                                              />

                                            </div>


                                            <span
                                              className={
                                                styles.fileName
                                              }
                                            >

                                              {
                                                file.name
                                              }

                                            </span>


                                            <button

                                              type="button"

                                              className={
                                                styles.removeFileBtn
                                              }

                                              disabled={
                                                isSubmitting
                                              }

                                              onClick={() =>
                                                removeFile(
                                                  stage.Id,
                                                  fileIndex
                                                )
                                              }

                                            >

                                              <i
                                                className="
                                                  bi
                                                  bi-x-circle-fill
                                                "
                                              />

                                            </button>


                                          </div>

                                        )

                                      )
                                    }


                                  </Form.Group>

                                </Col>

                              </Row>


                            </>

                          )
                        }


                        {/* =============================
                            SEPARATOR
                        ============================= */}

                        {
                          stageIndex <
                          activeStages.length - 1
                          && (

                            <hr
                              className="my-4"
                            />

                          )
                        }


                      </div>

                    );

                  }

                )
              }


              {/* =====================================
                  SINGLE SUBMIT BUTTON
              ===================================== */}

              {
                isDataLoaded &&
                activeStages.length > 0 &&

                hasAvailableStage() && (

                  <Button

                    className={

                      `
                        btn
                        d-block
                        mx-auto
                        px-5
                        d-flex
                        justify-content-center
                        align-items-center
                        mt-4
                        ${styles.registerBtn}
                      `

                    }

                    disabled={

                      isSubmitting ||

                      !hasAnySelectedFiles()

                    }

                    onClick={
                      handleSubmit
                    }

                  >

                    {
                      isSubmitting

                        ?

                        <>

                          <span
                            className="
                              spinner-border
                              spinner-border-sm
                              me-2
                            "
                            role="status"
                          />

                          Submitting...

                        </>

                        :

                        <>

                          <span>
                            Submit
                          </span>

                          <i
                            className="
                              bi
                              bi-check-circle
                              ms-2
                            "
                          />

                        </>

                    }

                  </Button>

                )
              }


              {/* =====================================
                  ALL SUBMITTED MESSAGE
              ===================================== */}

              {
                isDataLoaded &&
                activeStages.length > 0 &&
                (
                  successMessage ||
                  !hasAvailableStage()
                ) && (

                  <div
                    className="
                      text-center
                      mt-4
                    "
                  >

                    <Alert
                      variant="success"
                      dismissible={
                        !!successMessage
                      }

                      onClose={() =>
                        setSuccessMessage("")
                      }
                    >

                      <i
                        className="
                          bi
                          bi-check-circle-fill
                          me-2
                        "
                      />

                      {
                        successMessage ||
                        "You have already submitted the document."
                      }

                    </Alert>

                  </div>

                )
              }


            </div>

          </Col>

        </Row>

      </Container>

    );

  };


export default EventSubmitDocs;