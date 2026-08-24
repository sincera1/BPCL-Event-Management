import * as React from "react";
import styles from "../EventTabs/About.module.scss";
import { Row,Col,Button, } from "react-bootstrap";

import eventRules from "../../assets/bpcleventimg.jpg";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const About: React.FC = () => {
  return (
    <div>
       {/* <Row> */}
      <Row>
        <Col xs={12} lg={8}>
          <Row>
            <Col>

               <div className={styles.sectionTitle}>
                <h2 className={styles.subheading}>About</h2>
              </div>

              <div className={styles.sectionContentHeading}>
                About the Event
              </div>

              <div className={`${styles.sectionContent} mt-2`}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum.
              </div>

              <div className={`${styles.sectionContentHeading} mt-4`}>
                Banner Image
              </div>

              <img src={eventRules} alt="Event" className={`${styles.eventImage} mt-2`} />

            </Col>
          </Row>

          <Row className="mt-4">
            <Col md={12}>
            <div className={styles.sectionTitle}>
                <h2 className={styles.subheading}>Subevent Details</h2>
              </div>
              <div className="d-flex align-items-center justify-content-between gap-2 mt-3">
              <div className={`${styles.subEventTitle}`}>
                Sub-Event Name1
              </div>
              <div className={styles.subEventTitleRightside}>
                <i className="bi bi-people"/>
                <span>2</span>
                <text>Mandatory Members</text>
              </div>
              </div>

              <div className={`${styles.subEventDescription} mt-2`}>
                   Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do 
               eiusmod tempor incididunt ut labore et dolore magna aliqua. 
               Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
               nisi ut aliquip ex ea commodo consequat.
              </div>

              <div className="d-flex align-items-center justify-content-between gap-2 mt-3">
              <div className={`${styles.subEventTitle}`}>
                Sub-Event Name2
              </div>
              <div className={styles.subEventTitleRightside}>
                <i className="bi bi-people"/>
                <span>2</span>
                <text>Mandatory Members</text>
              </div>
              </div>

              <div className={`${styles.subEventDescription} mt-2`}>
               Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do 
               eiusmod tempor incididunt ut labore et dolore magna aliqua. 
               Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
               nisi ut aliquip ex ea commodo consequat.
              </div>

              <div className="d-flex align-items-center justify-content-between gap-2 mt-3">
              <div className={`${styles.subEventTitle}`}>
                Sub-Event Name3
              </div>
              <div className={styles.subEventTitleRightside}>
                <i className="bi bi-people"/>
                <span>2</span>
                <text>Mandatory Members</text>
              </div>
              </div>

              <div className={`${styles.subEventDescription} mt-2`}>
               Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do 
               eiusmod tempor incididunt ut labore et dolore magna aliqua. 
               Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
               nisi ut aliquip ex ea commodo consequat.
              </div>
            </Col>
          </Row>
        </Col>

        <Col xs={12} lg={4}>
          <div className={`${styles.card} p-3 mt-4 mt-lg-0`}>
            <div className="row align-items-center">
              <div className="col-auto">
                <div className={styles.iconBox}>
                  <i className="bi bi-arrow-right-square fs-3"/>
                </div>
              </div>

              <div className="col">
                <h5 className={styles.title}>Registration Opened</h5>
                {/* <h5 className={styles.closedTitle}>Registration Closed</h5> */}

                <div className="d-flex flex-wrap align-items-stretch gap-2">
                  <div className="d-flex flex-column justify-content-center">
                    <div>
                      <span className={styles.count}>80</span>
                      <span className={styles.label}> Members</span>
                    </div>
                    <small className={styles.subText}>Registered</small>
                  </div>

                  <div className="vr opacity-100" style={{ minHeight: "40px" }}></div>

                  <div className="d-flex flex-column justify-content-center">
                    <div>
                      <span className={styles.count}>20</span>
                      <span className={styles.label}> Teams</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* <p className={`${styles.notice} mt-3 mb-3`}>
              Hurry! Registration closes on 20 Jul 2026. Register now.
            </p> */}

            <Button
              className={`btn w-100 d-flex justify-content-center align-items-center mt-3 ${styles.registerBtn}`}
            >
              <i className="bi bi-share me-2"/>
              <span>Share Event</span>
              
            </Button>
          </div>

          {/* Modal */}
          

          <div className={`${styles.card} p-3 mt-4`}>
            <div className={styles.header}>
              <div className={styles.organizerIconBox}>
                {/* <i className={`bi bi-person-badge ${styles.headerIcon}`}/> */}
                <i className="bi bi-person fs-3"/>
              </div>

              <h5 className={styles.eventTitle}>Event Organizer</h5>
            </div>

            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <i className={`bi bi-person ${styles.icon}`}/>
                <span>Mandem Naveen Kumar</span>
              </div>

              <div className={styles.infoItem}>
                <i className={`bi bi-diagram-3 ${styles.icon}`}/>
                <span>People &amp; Cultural Department</span>
              </div>

              <div className={styles.infoItem}>
                <i className={`bi bi-envelope ${styles.icon}`}/>
                <a href="">eventsorg@bharatpetroleum.in</a>
              </div>

              <div className={styles.infoItem}>
                <i className={`bi bi-telephone ${styles.icon}`}/>
                <a href="">+91 9999999999</a>
              </div>
            </div>

            <Button className={`${styles.profileBtn} w-100`}>
              View Organizer Profile
            </Button>
          </div>

          <div className={`${styles.card} p-3 mt-4`}>
            <div className={styles.header}>
              <div className={styles.organizerIconBox}>
                <i className="bi bi-calendar2-event fs-3"/>
              </div>

              <h5 className={styles.eventTitle}>Event Details</h5>
            </div>

            {/* <div className={styles.infoList}>
              <div className={styles.eventDetailsinfoItem}>
                <i className={`bi bi-calendar ${styles.icon}`}/>
                <span>Event Date</span>
              </div>

              <div className={styles.eventDetailsinfoItem}>
                <i className={`bi bi-clock ${styles.icon}`}/>
                <span>Registration Open</span>
              </div>

              <div className={styles.eventDetailsinfoItem}>
                <i className={`bi bi-calendar-x ${styles.icon}`}/>
                <span>Registration Close</span>
              </div>

              <div className={styles.eventDetailsinfoItem}>
                <i className={`bi bi-people ${styles.icon}`}/>
                <span>Event Participant Type</span>
              </div>
              <div className={styles.eventDetailsinfoItem}>
                <i className={`bi bi-people ${styles.icon}`}/>
                <span>Maximum Members In Team</span>
              </div>
              <div className={styles.infoItem}>
                <i className={`bi bi-people ${styles.icon}`}/>
                <span> Mandatory Members In Team</span>
              </div>
            </div> */}
            <div className={styles.eventDetailsinfoList}>
              <div className={styles.eventDetailsinfoItem}>
                <div className={styles.left}>
                  <i className={`bi bi-calendar ${styles.icon}`}/>
                  <span>Event Date</span>
                </div>
                <span className={styles.value}>
                  24th Aug 2025 to 25th Aug 2025
                </span>
              </div>

              <div className={styles.eventDetailsinfoItem}>
                <div className={styles.left}>
                  <i className={`bi bi-clock ${styles.icon}`}/>
                  <span>Registration Open</span>
                </div>
                <span className={styles.value}>01 Aug 2026</span>
              </div>

              <div className={styles.eventDetailsinfoItem}>
                <div className={styles.left}>
                  <i className={`bi bi-calendar-x ${styles.icon}`}/>
                  <span>Registration Close</span>
                </div>
                <span className={styles.value}>10 Aug 2026</span>
              </div>

              <div className={styles.eventDetailsinfoItem}>
                <div className={styles.left}>
                  <i className={`bi bi-people ${styles.icon}`}/>
                  <span>Event Participant Type</span>
                </div>
                <span className={styles.value}>Team</span>
              </div>

              <div className={styles.eventDetailsinfoItem}>
                <div className={styles.left}>
                  <i className={`bi bi-people ${styles.icon}`}/>
                  <span>Maximum Members In Team</span>
                </div>
                <span className={styles.value}>100</span>
              </div>

              <div className={styles.eventDetailsinfoItem}>
                <div className={styles.left}>
                  <i className={`bi bi-people ${styles.icon}`}/>
                  <span>Mandatory Members In Team</span>
                </div>
                <span className={styles.value}>100</span>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default About;