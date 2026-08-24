import * as React from "react";
import styles from "../EventTabs/Qualifiers.module.scss";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import {
  Form,
  Pagination,
  Table,
  Button
} from "react-bootstrap";

const Qualifiers: React.FC = () => {

const QualifiersList = [
  {
    id: 1,
    teamId: "EVTTM2786786",
    leadName: "Ajay Varadharajan",
    totalMembers: "6 Members",
    participantNames: "Jeyaprakash, Ajay Varadharajan",
    status: "Registered",
    Documents: "2 Attachments"
  },
  {
    id: 2,
    teamId: "EVTTM2786786",
    leadName: "Ajay Varadharajan",
    totalMembers: "6 Members",
    participantNames: "Jeyaprakash, Ajay Varadharajan",
    status: "Stage in Progress",
    Documents: "2 Attachments"
  },
  {
    id: 3,
    teamId: "EVTTM2786786",
    leadName: "Ajay Varadharajan",
    totalMembers: "6 Members",
    participantNames: "Jeyaprakash, Ajay Varadharajan",
    status: "Not Qualified",
    Documents: "2 Attachments"
  },
  {
    id: 4,
    teamId: "EVTTM2786786",
    leadName: "Ajay Varadharajan",
    totalMembers: "6 Members",
    participantNames: "Jeyaprakash, Ajay Varadharajan",
    status: "Registered",
    Documents: "2 Attachments"
  },
  {
    id: 5,
    teamId: "EVTTM2786786",
    leadName: "Ajay Varadharajan",
    totalMembers: "6 Members",
    participantNames: "Jeyaprakash, Ajay Varadharajan",
    status: "Qualified",
    Documents: "2 Attachments"
  },
  {
    id: 6,
    teamId: "EVTTM2786786",
    leadName: "Ajay Varadharajan",
    totalMembers: "6 Members",
    participantNames: "Jeyaprakash, Ajay Varadharajan",
    status: "Results Pending",
    Documents: "2 Attachments"
  },
  {
    id: 7,
    teamId: "EVTTM2786786",
    leadName: "Ajay Varadharajan",
    totalMembers: "6 Members",
    participantNames: "Jeyaprakash, Ajay Varadharajan",
    status: "Winner",
    Documents: "2 Attachments"
  }
];

  /* =======================================================
     STATES
  ======================================================= */

  const [selectedStage, setSelectedStage] =
    React.useState<number>(1);

  const [selectedSubEvent, setSelectedSubEvent] =
    React.useState<string>("Sub Event1");

     const [selectedQualified, setSelectedQualified] =
    React.useState<string>("Qualified");


  /* =======================================================
     STATUS BADGE CLASS
  ======================================================= */

  const getStatusClass = (status: string): string => {

    switch (status) {

      case "Registered":
        return styles.registeredBadge;

      case "Stage in Progress":
        return styles.progressBadge;

      case "Not Qualified":
        return styles.notQualifiedBadge;

      case "Qualified":
        return styles.qualifiedBadge;

      case "Results Pending":
        return styles.resultsPendingBadge;

      case "Winner":
        return styles.winnerBadge;

      default:
        return styles.defaultStatusBadge;
    }
  };

    const handleView = (teamId: string): void => {
    console.log("View details:", teamId);
  };

    /* =======================================================
     STAGE CHANGE
  ======================================================= */

  const handleStageChange = (stage: number): void => {
    setSelectedStage(stage);

    console.log("Selected Stage:", stage);
  };

  /* =======================================================
     SUB EVENT CHANGE
  ======================================================= */

  const handleSubEventChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {

    setSelectedSubEvent(event.target.value);

    console.log(
      "Selected Sub Event:",
      event.target.value
    );
  };

  /* =======================================================
     QUALIFIED CHANGE
  ======================================================= */

   const handleQualifiedChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {

    setSelectedQualified(event.target.value);

    console.log(
      "Selected Qualified:",
      event.target.value
    );
  };

  return (
    <div>

 {/* =====================================================
          TOP STAGE NAVIGATION
      ===================================================== */}

      <div className={styles.stageNavigation}>

        {/* ================= SUB EVENT ================= */}

        <div className={styles.subEventWrapper}>

          <select
            className={styles.subEventSelect}
            value={selectedSubEvent}
            onChange={handleSubEventChange}
          >

            <option value="Sub Event1">
              Sub Event1
            </option>

            <option value="Sub Event2">
              Sub Event2
            </option>

            <option value="Sub Event3">
              Sub Event3
            </option>

          </select>

          <span className={styles.dropdownArrow}>
            <i className="bi bi-chevron-down"/>
          </span>

        </div>


        {/* ================= STAGES ================= */}

        <div className={styles.stageWrapper}>

          <button
            type="button"
            className={`${styles.stageButton} ${
              selectedStage === 1
                ? styles.activeStage
                : ""
            }`}
            onClick={() => handleStageChange(1)}
          >
            Stage 1
          </button>


          <button
            type="button"
            className={`${styles.stageButton} ${
              selectedStage === 2
                ? styles.activeStage
                : ""
            }`}
            onClick={() => handleStageChange(2)}
          >
            Stage 2
          </button>


          <button
            type="button"
            className={`${styles.stageButton} ${
              selectedStage === 3
                ? styles.activeStage
                : ""
            }`}
            onClick={() => handleStageChange(3)}
          >
            Stage 3
          </button>

        </div>


        {/* ================= STATUS BUTTON ================= */}

        <div >

          <Button className={styles.statusBadge}>
            SUBMIT STAGE 1 QUALIFIER
          </Button>

        </div>

      </div>

       <div className={styles.qualifiersHeader}>

      {/* Left Side */}
      <div className={styles.qualifiersTitle}>
        <span className={styles.count}>30</span>
        <span className={styles.title}>Participants for Stage1 of SubEvent1</span>
      </div>

      {/* Right Side */}
      <div className={styles.actionSection}>

          <div className={styles.QualifiedWrapper}>

          <select
            className={styles.QualifiedSelect}
            value={selectedQualified}
            onChange={handleQualifiedChange}
          >

            <option value="Qualified">
              Qualified
            </option>

            <option value="Qualified">
              Qualified
            </option>

            <option value="Qualified">
              Qualified
            </option>

          </select>

          <span className={styles.QualifieddropdownArrow}>
            <i className="bi bi-chevron-down"/>
          </span>

        </div>

        {/* Search */}
        <div className={styles.searchBox}>
          <i className={`bi bi-search ${styles.searchIcon}`}/>

          <input
            type="text"
            placeholder="Search..."
            className={styles.searchInput}
          />
        </div>

      </div>
    </div>

 <div className={styles.tableWrapper}>

      <div className="table-responsive">

        <Table
          hover
          className={styles.listTable}
        >

          {/* =================================================
              TABLE HEADER
          ================================================= */}

          <thead>

            <tr>

              <th className={styles.selectColumn}>
                Select
              </th>

              <th>
                Team ID
              </th>

              <th>
                Lead Name
              </th>

              <th>
                Tot Members
              </th>

              <th>
                Participant Names
              </th>

              <th>
                Status
              </th>

              <th>
                Documents
              </th>

              <th className={styles.actionColumn}>
                Action
              </th>

            </tr>

          </thead>


          {/* =================================================
              TABLE BODY
          ================================================= */}

          <tbody>

            {QualifiersList.map((qualifiers) => (

              <tr key={qualifiers.id}>

                {/* =========================================
                    SELECT
                ========================================= */}

                <td className={styles.selectColumn}>

                  <input
                    type="checkbox"
                    className={styles.customCheckbox}
                  />

                </td>


                {/* =========================================
                    TEAM ID
                ========================================= */}

                <td>
                  {qualifiers.teamId}
                </td>


                {/* =========================================
                    LEAD NAME
                ========================================= */}

                <td>
                  {qualifiers.leadName}
                </td>


                {/* =========================================
                    TOTAL MEMBERS
                ========================================= */}

                <td>
                  {qualifiers.totalMembers}
                </td>


                {/* =========================================
                    participantNames
                ========================================= */}

                <td>
                  {qualifiers.participantNames}
                </td>

                {/* =========================================
                    STATUS
                ========================================= */}

                <td>

                  <span
                    className={getStatusClass(
                      qualifiers.status
                    )}
                  >
                    {qualifiers.status}
                  </span>

                </td>


                {/* =========================================
                    DOCUMENTS
                ========================================= */}

                <td className={styles.Documents}>

                  {qualifiers.Documents}

                </td>


                {/* =========================================
                    ACTION
                ========================================= */}

                <td className={styles.actionColumn}>

                  <button
                    type="button"
                    className={styles.viewButton}
                    title="View Details"
                    aria-label="View Details"
                    onClick={() =>
                      handleView(qualifiers.teamId)
                    }
                  >

                    <i className="bi bi-eye-fill"/>

                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </Table>

      </div>

    </div>


     <div className={styles.paginationSection}>

            <div className={styles.leftPagination}>

              <span className={styles.pageInfo}>
                Page 1 of 132
              </span>

              <Form.Select className={styles.pageSize}>
                <option>10 per page</option>
                <option>20 per page</option>
                <option>50 per page</option>
              </Form.Select>

            </div>

            <Pagination className="mb-0 justify-content-end flex-wrap">
              <Pagination.First />
              <Pagination.Prev />
              <Pagination.Item active>1</Pagination.Item>
              <Pagination.Item>2</Pagination.Item>
              <Pagination.Item>3</Pagination.Item>
              <Pagination.Next />
              <Pagination.Last />
            </Pagination>

          </div>


    </div>
  );
};

export default Qualifiers;