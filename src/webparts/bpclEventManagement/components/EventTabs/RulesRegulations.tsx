import * as React from "react";
import { useEffect, useState } from "react";
import styles from "./RulesRegulations.module.scss";
import { Row, Col } from "react-bootstrap";

import RulesRegulationsService, {
  IRulesRegulationsData
} from "../../Services/EventTabsServices/RulesRegulations";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";


interface IRulesRegulationsProps {
  eventId?: number;
  context: any;
}


const RulesRegulations: React.FC<IRulesRegulationsProps> = ({
  eventId,
  context
}) => {

  const [rulesData, setRulesData] =
    useState<IRulesRegulationsData | null>(null);

  const [isLoading, setIsLoading] =
    useState<boolean>(true);


  useEffect(() => {

    const loadRulesRegulations = async (): Promise<void> => {

      if (!eventId) {
        setIsLoading(false);
        return;
      }

      try {

        setIsLoading(true);

        const service = new RulesRegulationsService();

        const data =
          await service.getRulesRegulations(eventId);

        setRulesData(data);

      } catch (error) {

        console.error(
          "Error loading Rules & Regulations:",
          error
        );

      } finally {

        setIsLoading(false);

      }

    };

    loadRulesRegulations();

  }, [eventId]);


  if (isLoading) {
    return (
      <div className="text-center p-4">
        Loading...
      </div>
    );
  }


  if (!rulesData) {
    return (
      <div className="text-center p-4">
        No Rules & Regulations available.
      </div>
    );
  }


  return (

    <div>

      <Row>

        {/* Left Section - Rules Content */}

        <Col xs={12} lg={8}>

          <Row>

            <Col>

              <div className={styles.sectionTitle}>
                <h2 className={styles.subheading}>
                  Rules & Regulations
                </h2>
              </div>


              {/* TEXT TYPE */}

              {rulesData.RulesAndRegualtionType === "Text" && (

                <div
                  className={`${styles.sectionContent} mt-2`}
                >
                  {rulesData.RulesAndRegualtionText}
                </div>

              )}


              {/* IMAGE TYPE */}

              {rulesData.RulesAndRegualtionType === "Image" &&
                rulesData.RulesAndRegualtionImage && (

                  <img
                    src={rulesData.RulesAndRegualtionImage}
                    alt="Rules & Regulations"
                    className={`${styles.eventImage} mt-2`}
                  />

                )}

            </Col>

          </Row>

        </Col>


        {/* Right Section - Attachments */}

        <Col xs={12} lg={4}>

          <div
            className={`${styles.card} p-3 mt-4 mt-lg-0`}
          >

            {/* Header */}

            <div className={styles.attachmentsHeader}>

              <div className={styles.paperclipIcon}>
                <i className="bi bi-paperclip" />
              </div>

              <h3 className={styles.attachmentsTitle}>
                Attachments
              </h3>

            </div>


            {/* Dynamic Attachments */}

            {rulesData.Attachments &&
              rulesData.Attachments.length > 0 ? (

                rulesData.Attachments.map((file, index) => (

                  <div
                    className={styles.attachmentCard}
                    key={index}
                  >

                    <div className={styles.fileIcon}>
                      <i className="bi bi-file-earmark" />
                    </div>


                    <a
                      href={file.ServerRelativeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.fileName}
                      title={file.FileName}
                    >
                      {file.FileName}
                    </a>


                    <div className={styles.deleteIcon}>
                      <i className="bi bi-x-circle-fill" />
                    </div>

                  </div>

                ))

              ) : (

                <div className="text-muted mt-3">
                  No attachments available.
                </div>

              )}

          </div>

        </Col>

      </Row>

    </div>

  );
};


export default RulesRegulations;