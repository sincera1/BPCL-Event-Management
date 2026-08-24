import * as React from "react";
import styles from "../EventTabs/Winners.module.scss";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import winnerbanner from "../../assets/winnerbanner 1.png";

import {
  Form,
  Pagination,
  Table,
  Button,
} from "react-bootstrap";

const Winners: React.FC = () => {

const WinnersList = [
  {
    id: 1,
    teamId: "EVTTM2786786",
    leadName: "Ajay Varadharajan",
    totalMembers: "6 Members",
    subEvent1: "not-qualified",
    subEvent2: "qualified",
    subEvent3: "qualified",
    status: "Registered",
    
  },
  {
    id: 2,
    teamId: "EVTTM2786786",
    leadName: "Ajay Varadharajan",
    totalMembers: "6 Members",
     subEvent1: "qualified",
    subEvent2: "not-qualified",
    subEvent3: "qualified",
    status: "Stage in Progress",
  
  },
  {
    id: 3,
    teamId: "EVTTM2786786",
    leadName: "Ajay Varadharajan",
    totalMembers: "6 Members",
     subEvent1: "qualified",
    subEvent2: "not-qualified",
    subEvent3: "qualified",
    status: "Not Qualified",
  },
  {
    id: 4,
    teamId: "EVTTM2786786",
    leadName: "Ajay Varadharajan",
    totalMembers: "6 Members",
    subEvent1: "qualified",
    subEvent2: "qualified",
    subEvent3: "qualified",
    status: "Registered",
   
  },
  {
    id: 5,
    teamId: "EVTTM2786786",
    leadName: "Ajay Varadharajan",
    totalMembers: "6 Members",
    subEvent1: "qualified",
    subEvent2: "qualified",
    subEvent3: "not-qualified",
    status: "Qualified",
    
  },
  {
    id: 6,
    teamId: "EVTTM2786786",
    leadName: "Ajay Varadharajan",
    totalMembers: "6 Members",
    subEvent1: "qualified",
    subEvent2: "qualified",
    subEvent3: "not-qualified",
    status: "Final Results Pending"
  },
  {
    id: 7,
    teamId: "EVTTM2786786",
    leadName: "Ajay Varadharajan",
    totalMembers: "6 Members",
    subEvent1: "qualified",
    subEvent2: "not-qualified",
    subEvent3: "not-qualified",
    status: "Winner"
  }
];

  /* =======================================================
     STATES
  ======================================================= */

     const [selectedWinners, setSelectedWinners] =
    React.useState<string>("Winners");


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

      case "Final Results Pending":
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
     QUALIFIED CHANGE
  ======================================================= */

   const handleWinnersChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {

    setSelectedWinners(event.target.value);

    console.log(
      "Selected Winners:",
      event.target.value
    );
  };

   const handleSendEmail = (): void => {
    console.log("Send Email clicked");
  };

  return (
    <div>

       <div className={styles.winnerBanner}>

      {/* Background Image */}
      <img
        src={winnerbanner}
        alt="Winner Banner"
        className={styles.bannerBackground}
      />

      {/* Banner Content */}
      <div className={styles.bannerContent}>

        {/* Team ID */}
        <div className={styles.teamIdSection}>
          <span className={styles.teamLabel}>
            Team ID
          </span>

          <span className={styles.teamId}>
            #EVTTM2786786
          </span>
        </div>

        {/* Winner Text */}
        <div className={styles.winnerText}>
          <span>is the </span>

          <strong>
            Winner
          </strong>

          <span>
            {" "}of Tech &amp; Innovation Expo Event
          </span>
        </div>

      </div>

      {/* Send Email Button */}
      <Button
        type="button"
        className={styles.sendEmailButton}
        onClick={handleSendEmail}
      >
        Send Email
      </Button>

    </div>

 {/* =====================================================
          TOP STAGE NAVIGATION
      ===================================================== */}

      <div className={styles.stageNavigation}>

        {/* ================= EVENT WINNERS ================= */}
           <div>
            <h2 className={styles.subheading}>
             Select a qualified participant or team and confirm them as the event winner.
            </h2>
           </div>

        {/* ================= STATUS BUTTON ================= */}

        <div>

          <Button className={styles.statusBadge}>
            DECLARE AS WINNER
          </Button>

        </div>

      </div>

       <div className={styles.qualifiersHeader}>

      {/* Left Side */}
      <div className={styles.qualifiersTitle}>
        <span className={styles.count}>20</span>
        <span className={styles.title}> Participants from the Final Stage are awaiting the final result.</span>
      </div>

      {/* Right Side */}
      <div className={styles.actionSection}>

          <div className={styles.WinnersWrapper}>

          <select
            className={styles.WinnersSelect}
            value={selectedWinners}
            onChange={handleWinnersChange}
          >

            <option value="Winners">
              Winners
            </option>

            <option value="Winners">
               Winners
            </option>

            <option value="Winners">
               Winners
            </option>

          </select>

          <span className={styles.WinnersdropdownArrow}>
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
                SubEvent1
              </th>

              <th>
                SubEvent2
              </th>

              <th>
                SubEvent3
              </th>

              <th>
                Status
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

            {WinnersList.map((winners) => (

              <tr key={winners.id}>

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
                  {winners.teamId}
                </td>


                {/* =========================================
                    LEAD NAME
                ========================================= */}

                <td>
                  {winners.leadName}
                </td>


                {/* =========================================
                    TOTAL MEMBERS
                ========================================= */}

                <td>
                  {winners.totalMembers}
                </td>


                {/* =========================================
                    SUBEVENT 1
                ========================================= */}

               <td>
                   {winners.subEvent1 === "qualified" && (
                     <span className={styles.successIcon}>✓</span>
                   )}
                  
                   {winners.subEvent1 === "not-qualified" && (
                     <span className={styles.failedIcon}>×</span>
                   )}
                </td>

                {/* =========================================
                    SUBEVENT 2
                ========================================= */}

                <td>
                  {winners.subEvent2 === "qualified" && (
                    <span className={styles.successIcon}>✓</span>
                  )}
                
                  {winners.subEvent2 === "not-qualified" && (
                    <span className={styles.failedIcon}>×</span>
                  )}
                </td>

                {/* =========================================
                    SUBEVENT 3
                ========================================= */}

                <td>
                   {winners.subEvent3 === "qualified" && (
                     <span className={styles.successIcon}>✓</span>
                   )}
                 
                   {winners.subEvent3 === "not-qualified" && (
                     <span className={styles.failedIcon}>×</span>
                   )}
                 </td>

                {/* =========================================
                    STATUS
                ========================================= */}

                <td>

                  <span
                    className={getStatusClass(
                      winners.status
                    )}
                  >
                    {winners.status}
                  </span>

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
                      handleView(winners.teamId)
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

export default Winners;