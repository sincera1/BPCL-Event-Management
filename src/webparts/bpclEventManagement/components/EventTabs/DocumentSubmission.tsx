import * as React from "react";
import styles from "./DocumentSubmission.module.scss";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import {
  Button,
  Row,
  Col,
  Form
} from "react-bootstrap";

const DocumentSubmission: React.FC = () => {
  return (
    <div>
      <div className="d-flex align-items-center">
                <div className={`${styles.sectionTitle} flex-grow-1`}>
                  <h2 className={styles.subheading}>
                    Sub-Event 1 Document Submission
                  </h2>
                </div>

                <Button className={`${styles.eventOutlineBtn} ms-3`}>
                  <i className="bi bi-plus-circle me-2"/>
                  Add Stage
                </Button>
              </div>
              <Row className="p-2">
                  {/* STAGE NAME */}
                <Col xs={12} md={1} className={styles.stageNameCol}>
                  <div className={styles.stageName}>
                    Stage1
                  </div>
                </Col>
                <Col xs={12} md={2}>
                  <Form.Group className={styles.inputGroup}>
                    <Form.Label className={styles.inputLabel}>
                      Start Date
                      <span className={styles.required}>*</span>
                    </Form.Label>

                    <Form.Control
                      type="date"
                      placeholder="Enter registration start date"
                      className={styles.inputField}
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={2}>
                  <Form.Group className={styles.inputGroup}>
                    <Form.Label className={styles.inputLabel}>
                      End Date
                      <span className={styles.required}>*</span>
                    </Form.Label>

                    <Form.Control
                      type="date"
                      placeholder="Enter registration end date"
                      className={styles.inputField}
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={3}>
                  <Form.Group className={styles.inputGroup}>
                    <Form.Label className={styles.inputLabel}>
                      Maximum File Size (in KB)
                      <span className={styles.required}>*</span>
                    </Form.Label>

                    <Form.Control
                      type="number"
                      placeholder="Enter File Size (in KB)"
                      className={styles.inputField}
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={3}>
                  <Form.Group className={styles.inputGroup}>
                    <Form.Label className={styles.inputLabel}>
                      Upload Limit
                      <span className={styles.required}>*</span>
                    </Form.Label>

                    <Form.Control
                      type="number"
                      placeholder="Enter Upload Limit"
                      className={styles.inputField}
                    />
                  </Form.Group>
                </Col>
                 {/* IS ACTIVE */}
                <Col xs={12} md={1} className={styles.activeCol}>
                  <Form.Group className={styles.inputGroup}>
                    <Form.Label className={styles.inputLabel}>
                      Is Active? <span className={styles.required}>*</span>
                    </Form.Label>
              
                    <div className={styles.checkboxWrapper}>
                      <Form.Check
                        type="checkbox"
                        defaultChecked
                        className={styles.activeCheckbox}
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>

               <div className="d-flex align-items-center">
                <div className={`${styles.sectionTitle} flex-grow-1`}>
                  <h2 className={styles.subheading}>
                    Sub-Event 2 Document Submission
                  </h2>
                </div>

                <Button className={`${styles.eventOutlineBtn} ms-3`}>
                  <i className="bi bi-plus-circle me-2"/>
                  Add Stage
                </Button>
              </div>
    </div>
  );
};

export default DocumentSubmission;