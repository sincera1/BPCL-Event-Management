import * as React from "react";
import { useEffect, useState } from "react";

import styles from "../EventTabs/About.module.scss";

import {
  Row,
  Col,
  Button,Modal
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

  const [eventDetails, setEventDetails] = useState<IEventDetails | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [error, setError] = useState<string>("");

  const [showShareModal, setShowShareModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  // ====================================================
  // LOAD EVENT DETAILS
  // ====================================================

  useEffect(() => {
    const loadEventDetails = async (): Promise<void> => {

      // NO EVENT ID
      if (!eventId) {
        setEventDetails(null);
        setError("No event ID was provided.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");
        const service = new AboutService();
        const response = await service.getEventDetails(eventId);
        setEventDetails(response);
      } catch (error) {
        console.error( "Error loading event details:", error );
        setEventDetails(null);
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
    if (isNaN(date.getTime())) {
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

  const formatEventDateRange = (): string => {
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
    if (start && end) {
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
        {error || "No event details found."}
      </div>
    );
  }
  const isIndividualEvent =
  eventDetails.EventParticipantType
    ?.trim()
    .toLowerCase() === "individual";

  // ============ share event button click code ===============//
  const handleShareEvent = (): void => {
  setShowShareModal(true);
};

const handleCopyEventLink = async (): Promise<void> => {
  try {
    
    const eventLink = `https://bharatpetroleum.sharepoint.com/sites/dev-corporate-publishing-hub/SitePages/EventRegistration.aspx?EventID=${eventId}`;

    await navigator.clipboard.writeText(eventLink);

    setLinkCopied(true);

    // Change back to "Copy link" after 2 seconds
    setTimeout(() => {
      setLinkCopied(false);
    }, 2000);

  } catch (error) {
    console.error("Unable to copy event link:", error);
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
              <div className={styles.sectionTitle}>
                <h2 className={styles.subheading}>
                  About
                </h2>
              </div>

              {/* -----------------------------------------
                  ABOUT EVENT
              ----------------------------------------- */}
              <div className={styles.sectionContentHeading}>
                About the Event
              </div>
              <div className={`${styles.sectionContent} mt-2`}>
                {eventDetails.EventDescription || "No event description available."}
              </div>

              {/* -----------------------------------------
                  BANNER IMAGE
              ----------------------------------------- */}
              {eventDetails.EventBannerImage?.serverRelativeUrl && (
                <>
                  <div className={`${styles.sectionContentHeading} mt-4`}>
                    Banner Image
                  </div>
                  <img
                    src={eventDetails.EventBannerImage?.serverRelativeUrl}
                    alt={eventDetails.EventTitle || "Event"}
                    className={`${styles.eventImage} mt-2`}
                  />
                </>
              )}
            </Col>
          </Row>


          {/* =================================================
              SUB EVENT DETAILS
          ================================================= */}

          {eventDetails.HasSubEvents &&
            eventDetails.SubEvents &&
            eventDetails.SubEvents.length > 0 && (
            <Row className="mt-4">
              <Col md={12}>
                <div className={styles.sectionTitle}>
                  <h2 className={styles.subheading}>
                    Subevent Details
                  </h2>
                </div>

                {eventDetails.SubEvents.map(
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
                    <div className="d-flex align-items-center justify-content-between gap-2 mt-3">
                      <div className={styles.subEventTitle} >
                        {subEvent.SubEventTitle}
                      </div>

                      <div className={styles.subEventTitleRightside } >
                        <i className="bi bi-people" />
                        <span>
                          {subEvent.MinimumMembersRequired || 0}
                        </span>
                        <text> Mandatory Members </text>
                      </div>
                    </div>

                    {/* -----------------------------------
                        SUB EVENT DESCRIPTION
                    ----------------------------------- */}
                    <div className={`${styles.subEventDescription} mt-2`} >
                      {subEvent.SubEventDescription || ""}
                    </div>
                  </React.Fragment>
                ))}
              </Col>
            </Row>
          )}
        </Col>

        {/* =================================================
            RIGHT SECTION
        ================================================= */}

        <Col xs={12} lg={4}>
          {/* =================================================
              REGISTRATION CARD
          ================================================= */}

          <div className={`${styles.card} p-3 mt-4 mt-lg-0`} >
            <div className="row align-items-center">
              <div className="col-auto">
                <div className={styles.iconBox}>
                  <i className="bi bi-arrow-right-square fs-3" />
                </div>
              </div>


              <div className="col">
                <h5 className={styles.title}>
                  {eventDetails.OverAllEventStatus ===
                  "Created"
                    ? "Registration Opened"
                    : "Registration Closed"}
                </h5>

              <div className="d-flex flex-wrap align-items-stretch gap-2">

            {/* MEMBERS */}
            <div className="d-flex flex-column justify-content-center">
              <div>
                <span className={styles.count}>
                  {eventDetails.MandatoryMember || 0}
                </span>
                <span className={styles.label}>
                  {" "}Members
                </span>
              </div>
              <small className={styles.subText}>
                Registered
              </small>
            </div>

          {/* TEAMS - HIDE FOR INDIVIDUAL EVENT */}
          {!isIndividualEvent && (
            <>
              <div
                className="vr opacity-100"
                style={{
                  minHeight: "40px"
                }}
              />

              <div className="d-flex flex-column justify-content-center">
                <div>
                  <span className={styles.count}>
                    {eventDetails.HasSubEvents
                      ? eventDetails.SubEvents.length
                      : 0}
                  </span>
                  <span className={styles.label}>
                    {" "}Teams
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
            {/* <Button
              className={`btn w-100 d-flex justify-content-center align-items-center mt-3 ${styles.registerBtn}`}
            >
              <i className="bi bi-share me-2" />
              <span>
                Share Event
              </span>
            </Button> */}
             <Button className={`btn w-100 d-flex justify-content-center align-items-center mt-3 ${styles.registerBtn}`}
                onClick={handleShareEvent}>
                <i className="bi bi-share me-2"></i>
                Copy Event Link
              </Button>
     </div>


          {/* =================================================
              EVENT ORGANIZER
          ================================================= */}

          <div className={`${styles.card} p-3 mt-4`} >
            <div className={styles.header}>
              <div className={styles.organizerIconBox}>
                <i className="bi bi-person fs-3" />
              </div>

              <h5 className={styles.eventTitle}>
                Event Organizer
              </h5>
            </div>


            <div className={styles.infoList}>
              {/* ORGANIZER NAME */}
              <div className={styles.infoItem}>
                <i className={`bi bi-person ${styles.icon}`} />
                <span>
                  {eventDetails.EventOrganiser?.Title || "-"}
                </span>
              </div>

              {/* DEPARTMENT */}
              <div className={styles.infoItem}>
                <i className={`bi bi-diagram-3 ${styles.icon}`}/>
                <span>
                  {eventDetails.EventOrganizerDepartment || "-"}
                </span>
              </div>


              {/* EMAIL */}
              <div className={styles.infoItem}>
                <i className={`bi bi-envelope ${styles.icon}`} />
                {eventDetails.EventOrganizerEmail ? (
                  <a
                    href={`mailto:${eventDetails.EventOrganizerEmail}`}
                  >
                    {eventDetails.EventOrganizerEmail}
                  </a>
                ) : (
                  <span>-</span>
                )}
              </div>


              {/* PHONE */}

              <div className={styles.infoItem}>
                <i className={`bi bi-telephone ${styles.icon}`}/>
                {eventDetails.EventOrganizerPhoneNumber ? (
                  <a  href={`tel:${eventDetails.EventOrganizerPhoneNumber}`} >
                    {eventDetails.EventOrganizerPhoneNumber}
                  </a>
                ) : (
                  <span>-</span>
                )}
              </div>
            </div>


            <Button className={`${styles.profileBtn} w-100`}>
              View Organizer Profile
            </Button>
          </div>

          {/* =================================================
              EVENT DETAILS CARD
          ================================================= */}

          <div className={`${styles.card} p-3 mt-4`}>
            <div className={styles.header}>
              <div className={styles.organizerIconBox}>
                <i className="bi bi-calendar2-event fs-3" />
              </div>

              <h5 className={styles.eventTitle}>
                Event Details
              </h5>
            </div>


            <div  className={styles.eventDetailsinfoList} >

              {/* EVENT DATE */}
              <div  className={styles.eventDetailsinfoItem}>
                <div className={styles.left}>
                  <i className={`bi bi-calendar ${styles.icon}`}/>
                  <span>
                    Event Date
                  </span>
                </div>

                <span className={styles.value}>
                  {formatEventDateRange()}
                </span>
              </div>

              {/* REGISTRATION OPEN */}

              <div
                className={styles.eventDetailsinfoItem}
              >

                <div className={styles.left}>

                  <i
                    className={`bi bi-clock ${styles.icon}`}
                  />

                  <span>
                    Registration Open
                  </span>

                </div>


                <span className={styles.value}>

                  {formatDate(
                    eventDetails.RegistrationStartDate
                  )}

                </span>

              </div>


              {/* REGISTRATION CLOSE */}

              <div
                className={styles.eventDetailsinfoItem}
              >

                <div className={styles.left}>

                  <i
                    className={`bi bi-calendar-x ${styles.icon}`}
                  />

                  <span>
                    Registration Close
                  </span>

                </div>


                <span className={styles.value}>

                  {formatDate(
                    eventDetails.RegistrationEndDate
                  )}

                </span>

              </div>


              {/* PARTICIPANT TYPE */}

              <div
                className={styles.eventDetailsinfoItem}
              >

                <div className={styles.left}>

                  <i
                    className={`bi bi-people ${styles.icon}`}
                  />

                  <span>
                    Event Participant Type
                  </span>

                </div>


                <span className={styles.value}>

                  {eventDetails.EventParticipantType || "-"}

                </span>

              </div>


              {/* MAXIMUM MEMBERS */}

              <div
                className={styles.eventDetailsinfoItem}
              >

                <div className={styles.left}>

                  <i
                    className={`bi bi-people ${styles.icon}`}
                  />

                  <span>
                    Maximum Members In Team
                  </span>

                </div>


                <span className={styles.value}>

                  {eventDetails.MaxTeamMembers || 0}

                </span>

              </div>


              {/* MANDATORY MEMBERS */}

              <div
                className={styles.eventDetailsinfoItem}
              >

                <div className={styles.left}>

                  <i
                    className={`bi bi-people ${styles.icon}`}
                  />

                  <span>
                    Mandatory Members In Team
                  </span>

                </div>


                <span className={styles.value}>

                  {eventDetails.MandatoryMember || 0}

                </span>

              </div>

            </div>

          </div>

        </Col>

      </Row>
<Modal
  show={showShareModal}
  onHide={() => setShowShareModal(false)}
  centered
  className={styles.shareModal}
>
  <Modal.Header closeButton className={styles.shareModalHeader}>
    <Modal.Title className={styles.shareModalTitle}>
         <i className={`bi bi-link-45deg ${styles.shareHeaderIcon}`}></i>
      Share Event
    </Modal.Title>
  </Modal.Header>

  <Modal.Body className={styles.shareModalBody}>

    {/* <div className={styles.shareIcon}>
      <i className="bi bi-link-45deg"></i>
    </div> */}

    <div className={styles.shareHeading}>
      Copy event link
    </div>

    <div className={styles.shareDescription}>
      Anyone with the link can open this event page.
    </div>

    <div className={styles.shareLinkContainer}>

     <input
  type="text"
  className={styles.shareLinkInput}
  value={
    eventId
      ? `https://bharatpetroleum.sharepoint.com/sites/dev-corporate-publishing-hub/SitePages/EventRegistration.aspx?EventID=${eventId}`
      : ""
  }
  readOnly
  onFocus={(e) => e.target.select()}
/>

     <Button
          className={styles.copyLinkButton}
          onClick={handleCopyEventLink}
        >
          {linkCopied ? (
            <>
              <i className="bi bi-check-lg me-2"></i>
              Link copied
            </>
          ) : (
            <>
              <i className="bi bi-copy me-2"></i>
              Copy link
            </>
          )}
        </Button>

    </div>

  </Modal.Body>
</Modal>  
    </div>
    

  );

};


export default About;

// import * as React from "react";
// import styles from "../EventTabs/About.module.scss";
// import { Row,Col,Button, } from "react-bootstrap";

// import eventRules from "../../assets/bpcleventimg.jpg";

// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap-icons/font/bootstrap-icons.css";

// const About: React.FC = () => {
//   return (
//     <div>
//        {/* <Row> */}
//       <Row>
//         <Col xs={12} lg={8}>
//           <Row>
//             <Col>

//                <div className={styles.sectionTitle}>
//                 <h2 className={styles.subheading}>About</h2>
//               </div>

//               <div className={styles.sectionContentHeading}>
//                 About the Event
//               </div>

//               <div className={`${styles.sectionContent} mt-2`}>
//                 Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
//                 eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
//                 enim ad minim veniam, quis nostrud exercitation ullamco laboris
//                 nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
//                 in reprehenderit in voluptate velit esse cillum dolore eu fugiat
//                 nulla pariatur. Excepteur sint occaecat cupidatat non proident,
//                 sunt in culpa qui officia deserunt mollit anim id est laborum.
//               </div>

//               <div className={`${styles.sectionContentHeading} mt-4`}>
//                 Banner Image
//               </div>

//               <img src={eventRules} alt="Event" className={`${styles.eventImage} mt-2`} />

//             </Col>
//           </Row>

//           <Row className="mt-4">
//             <Col md={12}>
//             <div className={styles.sectionTitle}>
//                 <h2 className={styles.subheading}>Subevent Details</h2>
//               </div>
//               <div className="d-flex align-items-center justify-content-between gap-2 mt-3">
//               <div className={`${styles.subEventTitle}`}>
//                 Sub-Event Name1
//               </div>
//               <div className={styles.subEventTitleRightside}>
//                 <i className="bi bi-people"/>
//                 <span>2</span>
//                 <text>Mandatory Members</text>
//               </div>
//               </div>

//               <div className={`${styles.subEventDescription} mt-2`}>
//                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do 
//                eiusmod tempor incididunt ut labore et dolore magna aliqua. 
//                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
//                nisi ut aliquip ex ea commodo consequat.
//               </div>

//               <div className="d-flex align-items-center justify-content-between gap-2 mt-3">
//               <div className={`${styles.subEventTitle}`}>
//                 Sub-Event Name2
//               </div>
//               <div className={styles.subEventTitleRightside}>
//                 <i className="bi bi-people"/>
//                 <span>2</span>
//                 <text>Mandatory Members</text>
//               </div>
//               </div>

//               <div className={`${styles.subEventDescription} mt-2`}>
//                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do 
//                eiusmod tempor incididunt ut labore et dolore magna aliqua. 
//                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
//                nisi ut aliquip ex ea commodo consequat.
//               </div>

//               <div className="d-flex align-items-center justify-content-between gap-2 mt-3">
//               <div className={`${styles.subEventTitle}`}>
//                 Sub-Event Name3
//               </div>
//               <div className={styles.subEventTitleRightside}>
//                 <i className="bi bi-people"/>
//                 <span>2</span>
//                 <text>Mandatory Members</text>
//               </div>
//               </div>

//               <div className={`${styles.subEventDescription} mt-2`}>
//                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do 
//                eiusmod tempor incididunt ut labore et dolore magna aliqua. 
//                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
//                nisi ut aliquip ex ea commodo consequat.
//               </div>
//             </Col>
//           </Row>
//         </Col>

//         <Col xs={12} lg={4}>
//           <div className={`${styles.card} p-3 mt-4 mt-lg-0`}>
//             <div className="row align-items-center">
//               <div className="col-auto">
//                 <div className={styles.iconBox}>
//                   <i className="bi bi-arrow-right-square fs-3"/>
//                 </div>
//               </div>

//               <div className="col">
//                 <h5 className={styles.title}>Registration Opened</h5>
//                 {/* <h5 className={styles.closedTitle}>Registration Closed</h5> */}

//                 <div className="d-flex flex-wrap align-items-stretch gap-2">
//                   <div className="d-flex flex-column justify-content-center">
//                     <div>
//                       <span className={styles.count}>80</span>
//                       <span className={styles.label}> Members</span>
//                     </div>
//                     <small className={styles.subText}>Registered</small>
//                   </div>

//                   <div className="vr opacity-100" style={{ minHeight: "40px" }}></div>

//                   <div className="d-flex flex-column justify-content-center">
//                     <div>
//                       <span className={styles.count}>20</span>
//                       <span className={styles.label}> Teams</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* <p className={`${styles.notice} mt-3 mb-3`}>
//               Hurry! Registration closes on 20 Jul 2026. Register now.
//             </p> */}

//             <Button
//               className={`btn w-100 d-flex justify-content-center align-items-center mt-3 ${styles.registerBtn}`}
//             >
//               <i className="bi bi-share me-2"/>
//               <span>Share Event</span>
              
//             </Button>
//           </div>

//           {/* Modal */}
          

//           <div className={`${styles.card} p-3 mt-4`}>
//             <div className={styles.header}>
//               <div className={styles.organizerIconBox}>
//                 {/* <i className={`bi bi-person-badge ${styles.headerIcon}`}/> */}
//                 <i className="bi bi-person fs-3"/>
//               </div>

//               <h5 className={styles.eventTitle}>Event Organizer</h5>
//             </div>

//             <div className={styles.infoList}>
//               <div className={styles.infoItem}>
//                 <i className={`bi bi-person ${styles.icon}`}/>
//                 <span>Mandem Naveen Kumar</span>
//               </div>

//               <div className={styles.infoItem}>
//                 <i className={`bi bi-diagram-3 ${styles.icon}`}/>
//                 <span>People &amp; Cultural Department</span>
//               </div>

//               <div className={styles.infoItem}>
//                 <i className={`bi bi-envelope ${styles.icon}`}/>
//                 <a href="">eventsorg@bharatpetroleum.in</a>
//               </div>

//               <div className={styles.infoItem}>
//                 <i className={`bi bi-telephone ${styles.icon}`}/>
//                 <a href="">+91 9999999999</a>
//               </div>
//             </div>

//             <Button className={`${styles.profileBtn} w-100`}>
//               View Organizer Profile
//             </Button>
//           </div>

//           <div className={`${styles.card} p-3 mt-4`}>
//             <div className={styles.header}>
//               <div className={styles.organizerIconBox}>
//                 <i className="bi bi-calendar2-event fs-3"/>
//               </div>

//               <h5 className={styles.eventTitle}>Event Details</h5>
//             </div>

//             {/* <div className={styles.infoList}>
//               <div className={styles.eventDetailsinfoItem}>
//                 <i className={`bi bi-calendar ${styles.icon}`}/>
//                 <span>Event Date</span>
//               </div>

//               <div className={styles.eventDetailsinfoItem}>
//                 <i className={`bi bi-clock ${styles.icon}`}/>
//                 <span>Registration Open</span>
//               </div>

//               <div className={styles.eventDetailsinfoItem}>
//                 <i className={`bi bi-calendar-x ${styles.icon}`}/>
//                 <span>Registration Close</span>
//               </div>

//               <div className={styles.eventDetailsinfoItem}>
//                 <i className={`bi bi-people ${styles.icon}`}/>
//                 <span>Event Participant Type</span>
//               </div>
//               <div className={styles.eventDetailsinfoItem}>
//                 <i className={`bi bi-people ${styles.icon}`}/>
//                 <span>Maximum Members In Team</span>
//               </div>
//               <div className={styles.infoItem}>
//                 <i className={`bi bi-people ${styles.icon}`}/>
//                 <span> Mandatory Members In Team</span>
//               </div>
//             </div> */}
//             <div className={styles.eventDetailsinfoList}>
//               <div className={styles.eventDetailsinfoItem}>
//                 <div className={styles.left}>
//                   <i className={`bi bi-calendar ${styles.icon}`}/>
//                   <span>Event Date</span>
//                 </div>
//                 <span className={styles.value}>
//                   24th Aug 2025 to 25th Aug 2025
//                 </span>
//               </div>

//               <div className={styles.eventDetailsinfoItem}>
//                 <div className={styles.left}>
//                   <i className={`bi bi-clock ${styles.icon}`}/>
//                   <span>Registration Open</span>
//                 </div>
//                 <span className={styles.value}>01 Aug 2026</span>
//               </div>

//               <div className={styles.eventDetailsinfoItem}>
//                 <div className={styles.left}>
//                   <i className={`bi bi-calendar-x ${styles.icon}`}/>
//                   <span>Registration Close</span>
//                 </div>
//                 <span className={styles.value}>10 Aug 2026</span>
//               </div>

//               <div className={styles.eventDetailsinfoItem}>
//                 <div className={styles.left}>
//                   <i className={`bi bi-people ${styles.icon}`}/>
//                   <span>Event Participant Type</span>
//                 </div>
//                 <span className={styles.value}>Team</span>
//               </div>

//               <div className={styles.eventDetailsinfoItem}>
//                 <div className={styles.left}>
//                   <i className={`bi bi-people ${styles.icon}`}/>
//                   <span>Maximum Members In Team</span>
//                 </div>
//                 <span className={styles.value}>100</span>
//               </div>

//               <div className={styles.eventDetailsinfoItem}>
//                 <div className={styles.left}>
//                   <i className={`bi bi-people ${styles.icon}`}/>
//                   <span>Mandatory Members In Team</span>
//                 </div>
//                 <span className={styles.value}>100</span>
//               </div>
//             </div>
//           </div>
//         </Col>
//       </Row>
//     </div>
//   );
// };

// export default About;