import * as React from "react";
import { useState } from "react";
import styles from "./BpclEventDetail.module.scss";

import { Row, Col } from "react-bootstrap";

import About from "./EventTabs/About";
import RulesRegulations from "./EventTabs/RulesRegulations";
import Participants from "./EventTabs/Participants";
import DocumentSubmission from "./EventTabs/DocumentSubmission";
import Qualifiers from "./EventTabs/Qualifiers";
import Winners from "./EventTabs/Winners";

import eventbg1 from "../assets/eventbg1.png";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import "@fontsource/inter";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";


interface IEventDetailsProps {
    eventId?: number;
    eventTitle: string;
    hasSubEvents: boolean;
    hasStages: boolean;
    context: any;
    onBack: () => void;
    onEdit: () => void;
}


const EventDetails: React.FC<IEventDetailsProps> = ({ eventId, eventTitle, hasSubEvents, hasStages, context, onBack,onEdit }) => {

    const tabs = [
        "About",
        "Rules & Regulations",
        "Participants",
        "Document Submission",
        "Qualifiers",
        "Winners"
    ];

    const [activeTab, setActiveTab] = useState("About");

    return (
        <section className={styles.commonSectionstyle}>
            <Row>
                <Col xs={12}>
                    <div className={styles.bannerContainer}>
                        <img
                            src={eventbg1}
                            alt="Event Detail"
                            className={styles.bannerImage}
                        />

                        <div className={styles.bannerOverlay}>

                            {/* Top Row */}
                            <div className={styles.bannerTop}>

                                <div className={styles.leftSection}>

                                    <button className={styles.backBtn} onClick={onBack}>
                                        <i className="bi bi-chevron-left" />

                                    </button>

                                    <div className={styles.bannerContent}>
                                        <h1>Event Details</h1>
                                        <p>{eventTitle}</p>
                                    </div>

                                </div>

                                <button className={styles.editBtn}  onClick={onEdit}>
                                    <i className="bi bi-pencil-square" />
                                    Edit Event
                                </button>

                            </div>

                            {/* Bottom Tabs */}

                            <div className={styles.bannerTabs}>
                                {tabs.map((tab) => (
                                    <button
                                        key={tab}
                                        className={`${styles.tab} ${activeTab === tab ? styles.active : ""
                                            }`}
                                        onClick={() => setActiveTab(tab)}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                        </div>

                    </div>
                </Col>
            </Row>

            <Row>
                <Col xs={12}>
                    <div className={styles.tabContainer}>

                        {activeTab === "About" && <About eventId={eventId} />}

                        {activeTab === "Rules & Regulations" && (
                            <RulesRegulations
                                eventId={eventId}
                                context={context}
                            />
                        )}

                        {activeTab === "Participants" && (
                            <Participants eventId={eventId} />
                        )}

                        {activeTab === "Document Submission" && (
                            <DocumentSubmission
                                eventId={eventId}
                                context={context} />
                        )}

                        {activeTab === "Qualifiers" && (
                            <Qualifiers
                                eventId={eventId}
                                hasSubEvents={hasSubEvents}
                                hasStages={hasStages}
                                context={context}
                            />
                        )}

                        {activeTab === "Winners" && (
                            <Winners
                                eventId={eventId}
                                hasSubEvents={hasSubEvents}
                                hasStages={hasStages}
                                context={context}
                            />
                        )}

                    </div>
                </Col>
            </Row>

        </section>
    );
};

export default EventDetails;