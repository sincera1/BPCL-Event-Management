
import * as React from "react";
import { useEffect, useState } from "react";

import styles from "../EventTabs/About.module.scss";

import {
  Row,
  Col,
  Button,
  Modal
} from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import AboutService, {
  IEventDetails,
  IExistingSubEvent
} from "../../Services/EventTabsServices/About";

// ======================================================
// PROPS
// ======================================================

interface IAboutProps {
  eventId?: number;
}

// ======================================================
// COMPONENT
// ======================================================

const About: React.FC<IAboutProps> = ({
  eventId
}) => {

  // ====================================================
  // STATE
  // ====================================================

  const [
    eventDetails,
    setEventDetails
  ] = useState<IEventDetails | null>(null);

  const [
    isLoading,
    setIsLoading
  ] = useState<boolean>(true);

  const [
    error,
    setError
  ] = useState<string>("");

  const [
    showShareModal,
    setShowShareModal
  ] = useState(false);

  const [
    linkCopied,
    setLinkCopied
  ] = useState(false);

  // ====================================================
  // REGISTERED MEMBER COUNT
  // ====================================================

  const [
    registeredMemberCount,
    setRegisteredMemberCount
  ] = useState<number>(0);

  // ====================================================
  // REGISTERED TEAM COUNT
  // ====================================================

  const [
    registeredTeamCount,
    setRegisteredTeamCount
  ] = useState<number>(0);

  // ====================================================
  // LOAD EVENT DETAILS
  // ====================================================

  useEffect(() => {

    const loadEventDetails =
      async (): Promise<void> => {

        // ==================================================
        // NO EVENT ID
        // ==================================================

        if (!eventId) {

          setEventDetails(null);
          setRegisteredMemberCount(0);
          setRegisteredTeamCount(0);
          setError(
            "No event ID was provided."
          );

          setIsLoading(false);
          return;
        }

        try {

          setIsLoading(true);
          setError("");
          const service = new AboutService();

          // ==================================================
          // GET EVENT DETAILS + PARTICIPANT COUNTS
          // ==================================================

          const [
            response,
            participantCounts
          ] = await Promise.all([

            service.getEventDetails(eventId),
            service.getEventParticipantCounts(eventId)

          ]);

          // ==================================================
          // SET EVENT DETAILS
          // ==================================================

          setEventDetails(response);

          // ==================================================
          // SET REGISTERED MEMBERS
          // ==================================================

          setRegisteredMemberCount(participantCounts.members);

          // ==================================================
          // SET REGISTERED TEAMS
          // ==================================================

          setRegisteredTeamCount(participantCounts.teams);
        } catch (error) {
          console.error("Error loading event details:", error);

          setEventDetails(null);
          setRegisteredMemberCount(0);
          setRegisteredTeamCount(0);
          setError(
            "Unable to load event details."
          );

        } finally {
          setIsLoading(false);
        }
      };

    loadEventDetails();

  }, [eventId]);

  // ====================================================
  // FORMAT DATE
  // ====================================================

  const formatDate = (
    dateValue?: string
  ): string => {

    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

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

  // ====================================================
  // FORMAT EVENT DATE RANGE
  // ====================================================

  const formatEventDateRange =
    (): string => {

      if (!eventDetails) {
        return "";
      }

      const start =
        formatDate(
          eventDetails.EventStartDate
        );

      const end =
        formatDate(
          eventDetails.EventEndDate
        );

      if (
        start &&
        end
      ) {

        return `${start} to ${end}`;
      }

      return start || end;
    };

  // ====================================================
  // LOADING
  // ====================================================

  if (isLoading) {

    return (
      <div className="text-center p-4">
        Loading event details...
      </div>
    );
  }

  // ====================================================
  // ERROR / NO DATA
  // ====================================================

  if (!eventDetails) {
    return (
      <div className="text-center p-4">
        {
          error ||
          "No event details found."
        }
      </div>
    );
  }

  // ====================================================
  // CHECK INDIVIDUAL EVENT
  // ====================================================

  const isIndividualEvent =
    eventDetails.EventParticipantType
      ?.trim()
      .toLowerCase() === "individual";

  // ====================================================
  // SHARE EVENT BUTTON
  // ====================================================

  const handleShareEvent = (): void => {
    setShowShareModal(true);
  };

  // ====================================================
  // EVENT REGISTRATION URL
  // ====================================================

  const eventRegistrationUrl =
    eventId
      ? `https://bharatpetroleum.sharepoint.com/sites/dev-corporate-publishing-hub/SitePages/EventRegistration.aspx?EventID=${eventId}`
      : "";

  // ====================================================
  // COPY EVENT LINK
  // ====================================================

  const handleCopyEventLink =
    async (): Promise<void> => {

      try {

        if (!eventRegistrationUrl) {
          console.error(
            "Event ID is not available."
          );
          return;
        }
        await navigator.clipboard.writeText(
          eventRegistrationUrl
        );
        setLinkCopied(true);

        // Change back to "Copy link"
        // after 2 seconds
        setTimeout(() => {
          setLinkCopied(false);
        }, 2000);

      } catch (error) {

        console.error(
          "Unable to copy event link:",
          error
        );
      }
    };

  // ====================================================
  // RENDER
  // ====================================================

  return (

    <div>
      {/* =================================================
          MAIN CONTENT
      ================================================= */}
      <Row>
        {/* =================================================
            LEFT SECTION
        ================================================= */}
        <Col xs={12} lg={8}>
          <Row>
            <Col>
              {/* -----------------------------------------
                  ABOUT TITLE
              ----------------------------------------- */}

              <div
                className={
                  styles.sectionTitle
                }
              >

                <h2
                  className={
                    styles.subheading
                  }
                >
                  About
                </h2>

              </div>

              {/* -----------------------------------------
                  ABOUT EVENT
              ----------------------------------------- */}

              <div
                className={
                  styles.sectionContentHeading
                }
              >
                About the Event
              </div>

              <div
                className={
                  `${styles.sectionContent} mt-2`
                }
              >

                {
                  eventDetails.EventDescription ||
                  "No event description available."
                }

              </div>

              {/* -----------------------------------------
                  BANNER IMAGE
              ----------------------------------------- */}

              {
                eventDetails.EventBannerImage
                  ?.serverRelativeUrl && (

                  <>

                    <div
                      className={
                        `${styles.sectionContentHeading} mt-4`
                      }
                    >
                      Banner Image
                    </div>

                    <img
                      src={
                        eventDetails
                          .EventBannerImage
                          ?.serverRelativeUrl
                      }
                      alt={
                        eventDetails.EventTitle ||
                        "Event"
                      }
                      className={
                        `${styles.eventImage} mt-2`
                      }
                    />

                  </>
                )
              }

            </Col>

          </Row>

          {/* =================================================
              SUB EVENT DETAILS
          ================================================= */}

          {
            eventDetails.HasSubEvents &&
            eventDetails.SubEvents &&
            eventDetails.SubEvents.length > 0 && (
              <Row className="mt-4">
                <Col md={12}>
                  <div
                    className={
                      styles.sectionTitle
                    }
                  >

                    <h2
                      className={
                        styles.subheading
                      }
                    >
                      Subevent Details
                    </h2>

                  </div>
                  {
                    eventDetails.SubEvents.map(
                      (
                        subEvent: IExistingSubEvent,
                        index: number
                      ) => (

                        <React.Fragment
                          key={
                            subEvent.Id ||
                            index
                          }
                        >

                          {/* -----------------------------------
                              SUB EVENT HEADER
                          ----------------------------------- */}

                          <div
                            className="
                              d-flex
                              align-items-center
                              justify-content-between
                              gap-2
                              mt-3
                            "
                          >

                            <div
                              className={
                                styles.subEventTitle
                              }
                            >
                              {
                                subEvent.SubEventTitle
                              }
                            </div>

                            <div
                              className={
                                styles.subEventTitleRightside
                              }
                            >

                              <i
                                className="bi bi-people"
                              />

                              <span>
                                {
                                  subEvent.MinimumMembersRequired ||
                                  0
                                }
                              </span>

                              <span>
                                {" "}
                                Mandatory Members
                              </span>
                            </div>
                          </div>

                          {/* -----------------------------------
                              SUB EVENT DESCRIPTION
                          ----------------------------------- */}

                          <div
                            className={
                              `${styles.subEventDescription} mt-2`
                            }
                          >

                            {
                              subEvent.SubEventDescription ||
                              ""
                            }

                          </div>
                        </React.Fragment>
                      )
                    )
                  }
                </Col>
              </Row>
            )
          }

        </Col>

        {/* =================================================
            RIGHT SECTION
        ================================================= */}

        <Col xs={12} lg={4}>
          {/* =================================================
              REGISTRATION CARD
          ================================================= */}
          <div
            className={
              `${styles.card} p-3 mt-4 mt-lg-0`
            }
          >

            <div
              className="
                row
                align-items-center
              "
            >

              <div className="col-auto">

                <div
                  className={
                    styles.iconBox
                  }
                >

                  <i
                    className="
                      bi
                      bi-arrow-right-square
                      fs-3
                    "
                  />

                </div>

              </div>

              <div className="col">

                <h5
                  className={
                    styles.title
                  }
                >

                  {
                    eventDetails.OverAllEventStatus ===
                      "Created"
                      ? "Registration Opened"
                      : "Registration Closed"
                  }

                </h5>

                <div
                  className="
                    d-flex
                    flex-wrap
                    align-items-stretch
                    gap-2
                  "
                >

                  {/* =================================================
                      MEMBERS
                  ================================================= */}

                  <div
                    className="
                      d-flex
                      flex-column
                      justify-content-center
                    "
                  >
                    <div>
                      <span
                        className={
                          styles.count
                        }
                      >
                        {
                          registeredMemberCount
                        }
                      </span>

                      <span
                        className={
                          styles.label
                        }
                      >
                        {" "}
                        Members
                      </span>

                    </div>

                    <small
                      className={
                        styles.subText
                      }
                    >
                      Registered
                    </small>

                  </div>

                  {/* =================================================
                      TEAMS
                      HIDE FOR INDIVIDUAL EVENT
                  ================================================= */}

                  {!isIndividualEvent && (

                    <>

                      <div
                        className="
                          vr
                          opacity-100
                        "
                        style={{
                          minHeight: "40px"
                        }}
                      />

                      <div
                        className="
                          d-flex
                          flex-column
                          justify-content-center
                        "
                      >

                        <div>

                          <span
                            className={
                              styles.count
                            }
                          >
                            {
                              registeredTeamCount
                            }
                          </span>

                          <span
                            className={
                              styles.label
                            }
                          >
                            {" "}
                            Teams
                          </span>

                        </div>

                      </div>

                    </>
                  )}

                </div>

              </div>

            </div>

            {/* ---------------------------------------------
                SHARE EVENT
            --------------------------------------------- */}

            <Button
              className={
                `btn w-100
                 d-flex
                 justify-content-center
                 align-items-center
                 mt-3
                 ${styles.registerBtn}`
              }
              onClick={
                handleShareEvent
              }
            >

              <i
                className="bi bi-share me-2"
              />

              Copy Event Link

            </Button>

          </div>

          {/* =================================================
              EVENT ORGANIZER
          ================================================= */}

          <div
            className={
              `${styles.card} p-3 mt-4`
            }
          >

            <div
              className={
                styles.header
              }
            >

              <div
                className={
                  styles.organizerIconBox
                }
              >

                <i
                  className="
                    bi
                    bi-person
                    fs-3
                  "
                />

              </div>

              <h5
                className={
                  styles.eventTitle
                }
              >
                Event Organizer
              </h5>

            </div>

            <div
              className={
                styles.infoList
              }
            >

              {/* ORGANIZER NAME */}

              <div
                className={
                  styles.infoItem
                }
              >

                <i
                  className={
                    `bi bi-person ${styles.icon}`
                  }
                />

                <span>
                  {
                    eventDetails
                      .EventOrganiser
                      ?.Title ||
                    "-"
                  }
                </span>

              </div>

              {/* DEPARTMENT */}

              <div
                className={
                  styles.infoItem
                }
              >

                <i
                  className={
                    `bi bi-diagram-3 ${styles.icon}`
                  }
                />

                <span>
                  {
                    eventDetails
                      .EventOrganizerDepartment ||
                    "-"
                  }
                </span>

              </div>

              {/* EMAIL */}

              <div
                className={
                  styles.infoItem
                }
              >

                <i
                  className={
                    `bi bi-envelope ${styles.icon}`
                  }
                />

                {
                  eventDetails.EventOrganizerEmail
                    ? (

                      <a
                        href={
                          `mailto:${eventDetails.EventOrganizerEmail}`
                        }
                      >
                        {
                          eventDetails.EventOrganizerEmail
                        }
                      </a>

                    )
                    : (

                      <span>
                        -
                      </span>

                    )
                }

              </div>

              {/* PHONE */}

              <div
                className={
                  styles.infoItem
                }
              >

                <i
                  className={
                    `bi bi-telephone ${styles.icon}`
                  }
                />

                {
                  eventDetails.EventOrganizerPhoneNumber
                    ? (

                      <a
                        href={
                          `tel:${eventDetails.EventOrganizerPhoneNumber}`
                        }
                      >
                        {
                          eventDetails.EventOrganizerPhoneNumber
                        }
                      </a>

                    )
                    : (

                      <span>
                        -
                      </span>

                    )
                }

              </div>

            </div>

            {/* <Button
              className={
                `${styles.profileBtn} w-100`
              }
            >
              View Organizer Profile
            </Button> */}

          </div>

          {/* =================================================
              EVENT DETAILS CARD
          ================================================= */}

          <div
            className={
              `${styles.card} p-3 mt-4`
            }
          >

            <div
              className={
                styles.header
              }
            >

              <div
                className={
                  styles.organizerIconBox
                }
              >

                <i
                  className="
                    bi
                    bi-calendar2-event
                    fs-3
                  "
                />

              </div>

              <h5
                className={
                  styles.eventTitle
                }
              >
                Event Details
              </h5>

            </div>

            <div
              className={
                styles.eventDetailsinfoList
              }
            >

              {/* =================================================
                  EVENT DATE
              ================================================= */}

              <div
                className={
                  styles.eventDetailsinfoItem
                }
              >

                <div
                  className={
                    styles.left
                  }
                >

                  <i
                    className={
                      `bi bi-calendar ${styles.icon}`
                    }
                  />

                  <span>
                    Event Date
                  </span>

                </div>

                <span
                  className={
                    styles.value
                  }
                >
                  {
                    formatEventDateRange()
                  }
                </span>

              </div>

              {/* =================================================
                  REGISTRATION OPEN
              ================================================= */}

              <div
                className={
                  styles.eventDetailsinfoItem
                }
              >

                <div
                  className={
                    styles.left
                  }
                >

                  <i
                    className={
                      `bi bi-clock ${styles.icon}`
                    }
                  />

                  <span>
                    Registration Open
                  </span>

                </div>

                <span
                  className={
                    styles.value
                  }
                >
                  {
                    formatDate(
                      eventDetails.RegistrationStartDate
                    )
                  }
                </span>

              </div>

              {/* =================================================
                  REGISTRATION CLOSE
              ================================================= */}

              <div
                className={
                  styles.eventDetailsinfoItem
                }
              >

                <div
                  className={
                    styles.left
                  }
                >

                  <i
                    className={
                      `bi bi-calendar-x ${styles.icon}`
                    }
                  />

                  <span>
                    Registration Close
                  </span>

                </div>

                <span
                  className={
                    styles.value
                  }
                >
                  {
                    formatDate(
                      eventDetails.RegistrationEndDate
                    )
                  }
                </span>

              </div>

              {/* =================================================
                  PARTICIPANT TYPE
              ================================================= */}

              <div
                className={
                  styles.eventDetailsinfoItem
                }
              >

                <div
                  className={
                    styles.left
                  }
                >

                  <i
                    className={
                      `bi bi-people ${styles.icon}`
                    }
                  />

                  <span>
                    Event Participant Type
                  </span>

                </div>

                <span
                  className={
                    styles.value
                  }
                >
                  {
                    eventDetails.EventParticipantType ||
                    "-"
                  }
                </span>

              </div>

              {/* =================================================
                  MAXIMUM MEMBERS
              ================================================= */}

              {!isIndividualEvent && (
                <div className={styles.eventDetailsinfoItem}>

                  <div className={styles.left}>
                    <i className={`bi bi-people ${styles.icon}`} />

                    <span>
                      Maximum Members In Team
                    </span>
                  </div>

                  <span className={styles.value}>
                    {eventDetails.MaxTeamMembers || 0}
                  </span>

                </div>
              )}

              {/* =================================================
                  MANDATORY MEMBERS
              ================================================= */}

              {!isIndividualEvent && (
                <div className={styles.eventDetailsinfoItem}>

                  <div className={styles.left}>
                    <i className={`bi bi-people ${styles.icon}`} />

                    <span>
                      Mandatory Members In Team
                    </span>
                  </div>

                  <span className={styles.value}>
                    {eventDetails.MandatoryMember || 0}
                  </span>

                </div>
              )}

            </div>

          </div>

        </Col>

      </Row>

      {/* =================================================
          SHARE EVENT MODAL
      ================================================= */}

      <Modal
        show={showShareModal}
        onHide={() =>
          setShowShareModal(false)
        }
        centered
        className={
          styles.shareModal
        }
      >

        <Modal.Header
          closeButton
          className={
            styles.shareModalHeader
          }
        >

          <Modal.Title
            className={
              styles.shareModalTitle
            }
          >

            <i
              className={
                `bi bi-link-45deg ${styles.shareHeaderIcon}`
              }
            />

            Share Event

          </Modal.Title>

        </Modal.Header>

        <Modal.Body
          className={
            styles.shareModalBody
          }
        >

          <div
            className={
              styles.shareHeading
            }
          >
            Copy event link
          </div>

          <div
            className={
              styles.shareDescription
            }
          >
            Anyone with the link can open this event page.
          </div>

          <div
            className={
              styles.shareLinkContainer
            }
          >

            <input
              type="text"
              className={
                styles.shareLinkInput
              }
              value={
                eventRegistrationUrl
              }
              readOnly
              onFocus={
                (e) =>
                  e.target.select()
              }
            />

            <Button
              className={
                styles.copyLinkButton
              }
              onClick={
                handleCopyEventLink
              }
            >

              {
                linkCopied
                  ? (
                    <>
                      <i
                        className="
                          bi
                          bi-check-lg
                          me-2
                        "
                      />

                      Link copied
                    </>
                  )
                  : (
                    <>
                      <i
                        className="
                          bi
                          bi-copy
                          me-2
                        "
                      />

                      Copy link
                    </>
                  )
              }

            </Button>

          </div>

        </Modal.Body>

      </Modal>

    </div>
  );
};

export default About;

