import * as React from "react";

import styles from "./BpclEventParticipantDetails.module.scss";

import type {
  IBpclEventParticipantDetailsProps
} from "./IBpclEventParticipantDetailsProps";

import {
  Row,
  Col,
  Container,
  Accordion,
} from "react-bootstrap";


import EventParticipantDetailsService, {
  IEventParticipantDetails
} from "../Services/EventParticipantDetailsService";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import "@fontsource/inter";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

import eventbg1 from "../assets/eventbg1.png";
const BpclEventParticipantDetails: React.FC<
  IBpclEventParticipantDetailsProps
> = (props) => {

  const [details, setDetails] =
    React.useState<IEventParticipantDetails | null>(
      null
    );

  const [loading, setLoading] =
    React.useState<boolean>(true);

  const [error, setError] =
    React.useState<string>("");





  /*
   * Service instance
   */
  const eventService = React.useMemo(() => {
    return new EventParticipantDetailsService();
  }, []);

  /*
   * Load details
   */
  React.useEffect(() => {

    const loadDetails = async (): Promise<void> => {

      try {

        setLoading(true);
        setError("");

        const participantItemId =
          props.participantItemId;

        if (!participantItemId) {
          setError(
            "Participant / Team ID is missing."
          );
          return;
        }

        const response =
          await eventService.getParticipantDetails(
            participantItemId
          );

        setDetails(response);

      } catch (error) {

        console.error(
          "Error loading participant details:",
          error
        );

        setError(
          "Unable to load participant details."
        );

      } finally {

        setLoading(false);

      }
    };

    loadDetails();

  }, [
    eventService,
    props.participantItemId
  ]);

  /*
   * Back button
   */
  const handleBack = (): void => {

    props.onBack();

  };


  /*
   * Send Mail
   *
   * We will implement actual mail functionality later.
   */
  const handleSendMail = (): void => {

    if (!details) {
      return;
    }

    const recipients =
      details.teamMembers
        .map((member) => member.email)
        .filter(Boolean)
        .join(";");

    window.location.href =
      `mailto:${recipients}`;

  };


  /*
   * Date formatting
   */
  const formatDate = (
    date: Date | null
  ): string => {

    if (!date) {
      return "-";
    }

    return date.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  if (loading) {
    return (
      <div className="p-5 text-center">
        Loading...
      </div>
    );
  }


  if (error) {
    return (
      <div className="p-5 text-danger">
        {error}
      </div>
    );
  }


  if (!details) {
    return null;
  }

  const isTeam =
    details.participantType
      .toLowerCase() === "team";

  const isIndividual =
    details.participantType
      .toLowerCase() === "individual";

  return (
    <section className={styles.commonSectionstyle}>

      <Row>
        <Col xs={12}>

          <div className={styles.bannerContainer}>

            <img
              src={eventbg1}
              alt={details.eventTitle}
              className={styles.bannerImage}
            />

            <div className={styles.bannerOverlay}>

              {/* LEFT */}
              <div className={styles.bannerLeft}>

                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={handleBack}
                  aria-label="Go Back"
                >
                  <i className="bi bi-chevron-left" />
                </button>

                <div className={styles.bannerContent}>

                  <h1>
                    Participant / Team Detail
                  </h1>

                  <p>

                    {details.participantType === "Team"
                      ? `Team ID #${details.teamId}`
                      : `Participant ID #${details.participantItemId}`
                    }

                    <span className={styles.divider}>
                      |
                    </span>

                    {details.eventTitle}

                  </p>

                </div>

              </div>


              {/* RIGHT */}
              <div className={styles.statsWrapper}>

                {/* Stages Cleared */}
                <div className={styles.stageCard}>

                  <div className={styles.stageLabel}>
                    Stages Cleared
                  </div>

                  <div className={styles.stageValue}>

                    <span>
                      {details.stagesCleared}
                    </span>

                    <span>
                      / {details.totalStages}
                    </span>

                  </div>

                </div>


                {/* Overall Status */}
                <div className={styles.stageCard}>

                  <div className={styles.stageLabel}>
                    Overall Status
                  </div>

                  <div className={styles.stageValue}>

                    <i className="bi bi-check-circle-fill" />

                    <strong>
                      {details.overallStatus || "Registered"}
                    </strong>

                  </div>

                </div>


                {/* Send Mail */}
                <button
                  type="button"
                  className={styles.mailButton}
                  onClick={handleSendMail}
                >

                  <span className={styles.mailIcon}>
                    <i className="bi bi-envelope" />
                  </span>

                  <span>
                    Send Mail
                  </span>

                </button>

              </div>

            </div>

          </div>

        </Col>
      </Row>
      <Container fluid>
        <Row className="mb-4">
          {/* <Col md={4}> */}
          <Col xs={12} lg={4}>

            {/* TEAM INFORMATION - ONLY FOR TEAM */}
            {isTeam && (

              <div className={`${styles.card} p-3 mt-4`}>

                {/* Header */}
                <div className={styles.header}>

                  <div className={styles.teamInfoIconBox}>
                    <i className="bi bi-card-checklist fs-3" />
                  </div>

                  <h5 className={styles.eventTitle}>
                    Team Information
                  </h5>

                </div>


                {/* Information */}
                <div className={styles.infoList}>

                  {/* Team ID */}
                  <div className={styles.infoItem}>

                    <i
                      className={`bi bi-card-list ${styles.icon}`}
                    />

                    <div>

                      <div className={styles.infoLabel}>
                        Team ID
                      </div>

                      <div className={styles.infoValue}>
                        {details.teamId || "-"}
                      </div>

                    </div>

                  </div>


                  {/* Team Leader */}
                  <div className={styles.infoItem}>

                    <i
                      className={`bi bi-person ${styles.icon}`}
                    />

                    <div>

                      <div className={styles.infoLabel}>
                        Team Leader
                      </div>

                      <div className={styles.infoValue}>
                        {details.teamLeaderName || "-"}
                      </div>

                    </div>

                  </div>


                  {/* Team Members */}
                  <div className={styles.infoItem}>

                    <i
                      className={`bi bi-people ${styles.icon}`}
                    />

                    <div>

                      <div className={styles.infoLabel}>
                        Team Members
                      </div>

                      <div className={styles.infoValue}>

                        {details.teamMembers.length} Member
                        {details.teamMembers.length !== 1
                          ? "s"
                          : ""
                        }

                      </div>

                    </div>

                  </div>


                  {/* Event Name */}
                  <div className={styles.infoItem}>

                    <i
                      className={`bi bi-calendar-event ${styles.icon}`}
                    />

                    <div>

                      <div className={styles.infoLabel}>
                        Event Name
                      </div>

                      <div className={styles.infoValue}>
                        {details.eventTitle || "-"}
                      </div>

                    </div>

                  </div>


                  {/* Registered Date */}
                  <div className={styles.infoItem}>

                    <i
                      className={`bi bi-calendar-check ${styles.icon}`}
                    />

                    <div>

                      <div className={styles.infoLabel}>
                        Registered Date
                      </div>

                      <div className={styles.infoValue}>
                        {formatDate(details.registeredDate)}
                      </div>

                    </div>

                  </div>

                </div>

              </div>

            )}


            {/* TEAM MEMBERS - ONLY FOR TEAM */}
            {isTeam && (

              <div className={`${styles.card} p-3 ${isTeam ? "mt-3" : "mt-4"}`}>

                <div className={styles.header}>

                  <div className={styles.teamInfoIconBox}>
                    <i className="bi bi-people fs-3" />
                  </div>

                  <h5 className={styles.eventTitle}>
                    Team Members
                  </h5>

                </div>

                <div className={styles.teamMembersList}>

                  {details.teamMembers.length > 0 ? (

                    details.teamMembers.map((member, index) => (

                      <div
                        key={member.id}
                        className={styles.teamMemberItem}
                      >

                        <div className={styles.memberLeft}>

                          <div className={styles.memberNumber}>
                            {index + 1}
                          </div>

                          <div>

                            <div className={styles.memberName}>
                              {member.name}
                            </div>

                            {member.email && (
                              <div className={styles.memberEmail}>
                                {member.email}
                              </div>
                            )}

                          </div>

                        </div>

                        {member.isTeamLeader && (

                          <span className={styles.teamLeadBadge}>
                            Team Lead
                          </span>

                        )}

                      </div>

                    ))

                  ) : (

                    <div className={styles.noData}>
                      No team members found.
                    </div>

                  )}

                </div>

              </div>

            )}


            {/* PARTICIPANT INFORMATION - ONLY FOR INDIVIDUAL */}
            {isIndividual && (

              <div className={`${styles.card} p-3 mt-4`}>
                {/* Header */}
                <div className={styles.header}>
                  <div className={styles.teamInfoIconBox}>
                    <i className="bi bi-person fs-3" />
                  </div>

                  <h5 className={styles.eventTitle}>
                    Participant Information
                  </h5>
                </div>

                {/* Information */}
                <div className={styles.infoList}>

                  {/* Participant ID */}
                  <div className={styles.infoItem}>
                    <div>
                      <div className={styles.infoLabel}>
                        Participant ID
                      </div>

                      <div className={styles.infoValue}>
                        {details.participantItemId || "-"}
                      </div>
                    </div>
                  </div>

                  {/* Participant Name */}
                  <div className={styles.infoItem}>
                    <div>
                      <div className={styles.infoLabel}>
                        Participant Name
                      </div>

                      <div className={styles.infoValue}>
                        {details.participantName || "-"}
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className={styles.infoItem}>
                    <div>
                      <div className={styles.infoLabel}>
                        Email ID
                      </div>

                      <div className={styles.infoValue}>
                        {details.participantEmail || "-"}
                      </div>
                    </div>
                  </div>

                  {/* Contact Number */}
                  <div className={styles.infoItem}>
                    <div>
                      <div className={styles.infoLabel}>
                        Contact Number
                      </div>

                      <div className={styles.infoValue}>
                        {details.contactNumber || "-"}
                      </div>
                    </div>
                  </div>

                  {/* Registered Date */}
                  <div className={styles.infoItem}>
                    <div>
                      <div className={styles.infoLabel}>
                        Registered Date
                      </div>

                      <div className={styles.infoValue}>
                        {formatDate(details.registeredDate)}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </Col>
          {/* =====================================================
    RIGHT SIDE - SUB EVENTS & STAGES
====================================================== */}

          <Col xs={12} lg={8}>

            <div className={`${styles.card} p-3 mt-4`}>

              {/* HEADER */}
              <div className={styles.header}>

                <div className={styles.teamInfoIconBox}>
                  <i className="bi bi-calendar4-event fs-3" />
                </div>

                <h5 className={styles.eventTitle}>
                  Sub-Events & Stages
                </h5>

              </div>


              {/* =====================================================
        CASE 1:
        SUB EVENTS EXIST
    ====================================================== */}

              {details.subEvents &&
                details.subEvents.length > 0 ? (

                <Accordion
                  defaultActiveKey="0"
                  className={styles.accordion}
                >

                  {details.subEvents.map(
                    (subEvent, subEventIndex) => (

                      <Accordion.Item
                        key={subEvent.id}
                        eventKey={String(subEventIndex)}
                        className={styles.accordionItem}
                      >

                        {/* SUB EVENT HEADER */}

                        <Accordion.Header>

                          <div className={styles.accordionTitle}>

                            <span>
                              {subEvent.title}
                            </span>

                            {subEvent.status && (

                              <span
                                className={`${styles.statusBadge} ${subEvent.status.toLowerCase() ===
                                  "qualified"
                                  ? styles.qualified
                                  : subEvent.status.toLowerCase() ===
                                    "not qualified"
                                    ? styles.notQualified
                                    : subEvent.status.toLowerCase() ===
                                      "results pending"
                                      ? styles.resultsPending
                                      : subEvent.status.toLowerCase() ===
                                        "winner"
                                        ? styles.winner
                                        : subEvent.status.toLowerCase() ===
                                          "stage in progress"
                                          ? styles.stageInProgress
                                          : styles.registered
                                  }`}
                              >
                                {subEvent.status}
                              </span>

                            )}

                          </div>

                        </Accordion.Header>


                        <Accordion.Body
                          className={styles.accordionBody}
                        >

                          {/* ==========================================
                    SUB EVENT WITHOUT STAGES
                =========================================== */}

                          {!subEvent.hasStages && (

                            <div className={styles.stage}>

                              <div className={styles.stageDetails}>

                                <div className={styles.detailItem}>

                                  <i
                                    className={`bi bi-people ${styles.detailIcon}`}
                                  />

                                  <div
                                    className={styles.detailContent}
                                  >

                                    <div
                                      className={styles.detailLabel}
                                    >
                                      Participants
                                    </div>

                                    <div
                                      className={styles.detailValue}
                                    >

                                      {subEvent.participants &&
                                        subEvent.participants.length > 0 ? (

                                        subEvent.participants.map(
                                          (participant, index) => (

                                            <React.Fragment
                                              key={participant.id}
                                            >

                                              {index + 1}.{" "}
                                              {participant.name}

                                              {index <
                                                subEvent.participants.length -
                                                1 && (
                                                  <br />
                                                )}

                                            </React.Fragment>

                                          )
                                        )

                                      ) : (

                                        <span
                                          className={styles.noData}
                                        >
                                          No participants found.
                                        </span>

                                      )}

                                    </div>

                                  </div>

                                </div>

                              </div>

                            </div>

                          )}


                          {/* ==========================================
                    SUB EVENT WITH STAGES
                =========================================== */}

                          {subEvent.hasStages &&
                            subEvent.stages &&
                            subEvent.stages.length > 0 && (

                              <>

                                {subEvent.stages.map(
                                  (stage, stageIndex) => (

                                    <div
                                      key={`${subEvent.id}-${stage.stageName}`}
                                      className={styles.stage}
                                    >

                                      {/* STAGE HEADER */}

                                      <div
                                        className={styles.stageTitle}
                                      >

                                        <span
                                          className={styles.stageCircle}
                                        >
                                          <span />
                                        </span>

                                        <span>
                                          {stage.stageName}
                                        </span>

                                        <span
                                          className={`${styles.statusBadge} ${stage.status?.toLowerCase() ===
                                            "qualified"
                                            ? styles.qualified
                                            : stage.status?.toLowerCase() ===
                                              "not qualified"
                                              ? styles.notQualified
                                              : stage.status?.toLowerCase() ===
                                                "results pending"
                                                ? styles.resultsPending
                                                : stage.status?.toLowerCase() ===
                                                  "winner"
                                                  ? styles.winner
                                                  : styles.registered
                                            }`}
                                        >
                                          {stage.status ||
                                            "Registered"}
                                        </span>

                                      </div>


                                      {/* STAGE DETAILS */}

                                      <div
                                        className={styles.stageDetails}
                                      >

                                        {/* PARTICIPANTS */}

                                        <div
                                          className={styles.detailItem}
                                        >

                                          <i
                                            className={`bi bi-people ${styles.detailIcon}`}
                                          />

                                          <div
                                            className={
                                              styles.detailContent
                                            }
                                          >

                                            <div
                                              className={
                                                styles.detailLabel
                                              }
                                            >
                                              Participants
                                            </div>

                                            <div
                                              className={
                                                styles.detailValue
                                              }
                                            >

                                              {stage.participants &&
                                                stage.participants.length >
                                                0 ? (

                                                stage.participants.map(
                                                  (
                                                    participant,
                                                    index
                                                  ) => (

                                                    <React.Fragment
                                                      key={
                                                        participant.id
                                                      }
                                                    >

                                                      {index + 1}.{" "}
                                                      {
                                                        participant.name
                                                      }

                                                      {index <
                                                        stage.participants
                                                          .length -
                                                        1 && (
                                                          <br />
                                                        )}

                                                    </React.Fragment>

                                                  )
                                                )

                                              ) : (

                                                <span
                                                  className={
                                                    styles.noData
                                                  }
                                                >
                                                  No participants
                                                  found.
                                                </span>

                                              )}

                                            </div>

                                          </div>

                                        </div>


                                        {/* DOCUMENT */}

                                        <div
                                          className={styles.detailItem}
                                        >

                                          <i
                                            className={`bi bi-file-earmark-text ${styles.detailIcon}`}
                                          />

                                          <div
                                            className={
                                              styles.detailContent
                                            }
                                          >

                                            <div
                                              className={
                                                styles.detailLabel
                                              }
                                            >
                                              Submitted Documents
                                            </div>

                                            {stage.documents && stage.documents.length > 0 ? (

                                              <div>
                                                {stage.documents.map((document) => (

                                                  <div
                                                    key={document.id}
                                                    className={styles.document}
                                                  >

                                                    <a
                                                      href={document.url}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                    >

                                                      <i className="bi bi-file-earmark-pdf" />

                                                      {" "}

                                                      {document.name || "View Document"}

                                                    </a>

                                                  </div>

                                                ))}
                                              </div>

                                            ) : (

                                              <div
                                                className={styles.detailValue}
                                              >
                                                No document submitted.
                                              </div>

                                            )}

                                          </div>

                                        </div>

                                        {/* Date */}
                                        <div className={styles.detailItem}>
                                          <i
                                            className={`bi bi-calendar3 ${styles.detailIcon}`}
                                          />

                                          <div className={styles.detailContent}>
                                            <div className={styles.detailLabel}>
                                              Document Submitted on
                                            </div>

                                            <div className={styles.detailValue}>
                                              {stage.createDate
                                                ? formatDate(stage.createDate)
                                                : "-"}
                                            </div>
                                          </div>
                                        </div>


                                        {/* STATUS */}

                                        <div
                                          className={styles.detailItem}
                                        >

                                          <i
                                            className={`bi bi-check-circle-fill ${styles.statusIcon}`}
                                          />

                                          <div
                                            className={
                                              styles.detailContent
                                            }
                                          >

                                            <div
                                              className={
                                                styles.detailLabel
                                              }
                                            >
                                              Status
                                            </div>

                                            <div
                                              className={
                                                styles.detailValue
                                              }
                                            >
                                              {stage.status ||
                                                "Registered"}
                                            </div>

                                          </div>

                                        </div>

                                      </div>

                                    </div>

                                  )
                                )}

                              </>

                            )}


                          {subEvent.hasStages &&
                            (!subEvent.stages ||
                              subEvent.stages.length === 0) && (

                              <div className={styles.noData}>
                                No stages found.
                              </div>

                            )}

                        </Accordion.Body>

                      </Accordion.Item>

                    )
                  )}

                </Accordion>


              ) : details.eventStages &&
                details.eventStages.length > 0 ? (

                /* =====================================================
                   CASE 2:
                   NO SUB EVENTS
                   BUT DIRECT EVENT STAGES EXIST
                ====================================================== */

                <>

                  {details.eventStages.map(
                    (stage, stageIndex) => (

                      <div
                        key={stage.id}
                        className={styles.stage}
                      >

                        {/* STAGE HEADER */}

                        <div className={styles.stageTitle}>

                          <span
                            className={styles.stageCircle}
                          >
                            <span />
                          </span>

                          <span>
                            {stage.stageName}
                          </span>

                          <span
                            className={`${styles.statusBadge} ${stage.status?.toLowerCase() ===
                              "qualified"
                              ? styles.qualified
                              : stage.status?.toLowerCase() ===
                                "not qualified"
                                ? styles.notQualified
                                : stage.status?.toLowerCase() ===
                                  "results pending"
                                  ? styles.resultsPending
                                  : stage.status?.toLowerCase() ===
                                    "winner"
                                    ? styles.winner
                                    : styles.registered
                              }`}
                          >
                            {stage.status ||
                              "Registered"}
                          </span>

                        </div>


                        {/* STAGE DETAILS */}

                        <div
                          className={styles.stageDetails}
                        >

                          {/* PARTICIPANTS */}

                          <div
                            className={styles.detailItem}
                          >

                            <i
                              className={`bi bi-people ${styles.detailIcon}`}
                            />

                            <div
                              className={
                                styles.detailContent
                              }
                            >

                              <div
                                className={
                                  styles.detailLabel
                                }
                              >
                                Participants
                              </div>

                              <div
                                className={
                                  styles.detailValue
                                }
                              >

                                {stage.participants &&
                                  stage.participants.length > 0 ? (

                                  stage.participants.map(
                                    (
                                      participant,
                                      index
                                    ) => (

                                      <React.Fragment
                                        key={
                                          participant.id
                                        }
                                      >

                                        {index + 1}.{" "}
                                        {participant.name}

                                        {index <
                                          stage.participants
                                            .length -
                                          1 && (
                                            <br />
                                          )}

                                      </React.Fragment>

                                    )
                                  )

                                ) : (

                                  <span
                                    className={
                                      styles.noData
                                    }
                                  >
                                    No participants found.
                                  </span>

                                )}

                              </div>

                            </div>

                          </div>


                          {/* DOCUMENT */}

                          <div
                            className={styles.detailItem}
                          >

                            <i
                              className={`bi bi-file-earmark-text ${styles.detailIcon}`}
                            />

                            <div
                              className={styles.detailContent}
                            >

                              <div
                                className={styles.detailLabel}
                              >
                                Submitted Documents
                              </div>

                              {stage.documents &&
                                stage.documents.length > 0 ? (

                                <div className={styles.documentList}>

                                  {stage.documents.map(
                                    (document) => (

                                      <div
                                        key={document.id}
                                        className={styles.documentItem}
                                      >

                                        <i
                                          className="bi bi-file-earmark-pdf"
                                        />

                                        <a
                                          href={document.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={styles.document}
                                        >
                                          {document.name ||
                                            "View Document"}
                                        </a>

                                      </div>

                                    )
                                  )}

                                </div>

                              ) : (

                                <div
                                  className={styles.detailValue}
                                >
                                  No document submitted.
                                </div>

                              )}

                            </div>

                          </div>

                          {/* Date */}
                          <div className={styles.detailItem}>
                            <i
                              className={`bi bi-calendar3 ${styles.detailIcon}`}
                            />

                            <div className={styles.detailContent}>
                              <div className={styles.detailLabel}>
                                Document Submitted on
                              </div>

                              <div className={styles.detailValue}>
                                {stage.createDate
                                  ? formatDate(stage.createDate)
                                  : "-"}
                              </div>
                            </div>
                          </div>


                          {/* STATUS */}

                          <div
                            className={styles.detailItem}
                          >

                            <i
                              className={`bi bi-check-circle-fill ${styles.statusIcon}`}
                            />

                            <div
                              className={
                                styles.detailContent
                              }
                            >

                              <div
                                className={
                                  styles.detailLabel
                                }
                              >
                                Status
                              </div>

                              <div
                                className={
                                  styles.detailValue
                                }
                              >
                                {stage.status ||
                                  "Registered"}
                              </div>

                            </div>

                          </div>

                        </div>

                      </div>

                    )
                  )}

                </>


              ) : (

                /* =====================================================
                   CASE 3:
                   NO SUB EVENTS AND NO DIRECT STAGES
                ====================================================== */

                <div className={styles.noData}>
                  No sub-events and stages are available for this event.
                </div>

              )}

            </div>

          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default BpclEventParticipantDetails;
