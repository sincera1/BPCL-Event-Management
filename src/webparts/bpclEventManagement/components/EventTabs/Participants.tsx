import * as React from "react";
import { useEffect, useState } from "react";
import styles from "../EventTabs/Participants.module.scss";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import {
 
  Pagination,
  Table
} from "react-bootstrap";

import ParticipantsService, {
  IParticipantData,
  IParticipantsResponse
} from "../../Services/EventTabsServices/Participants";


interface IParticipantsProps {
  eventId?: number;
}


const Participants: React.FC<IParticipantsProps> = ({
  eventId
}) => {

  const [eventParticipantType, setEventParticipantType] =
    useState<string>("");

  const [participants, setParticipants] =
    useState<IParticipantData[]>([]);

  const [searchText, setSearchText] =
    useState<string>("");

  const [isLoading, setIsLoading] =
    useState<boolean>(true);

  const [currentPage, setCurrentPage] =
    useState<number>(1);

  const [pageSize, setPageSize] =
    useState<number>(0);




  /* =======================================================
     LOAD PARTICIPANTS
  ======================================================= */

  useEffect(() => {

    const loadParticipants = async (): Promise<void> => {

      if (!eventId) {
        setParticipants([]);
        setIsLoading(false);
        return;
      }

      try {

        setIsLoading(true);

        const service = new ParticipantsService();

        const response: IParticipantsResponse =
          await service.getParticipants(eventId);

        setEventParticipantType(
          response.EventParticipantType
        );

        setParticipants(
          response.Participants
        );
        setPageSize(
          response.Participants.length
        );

        setCurrentPage(1);

      } catch (error) {

        console.error(
          "Error loading participants:",
          error
        );

        setParticipants([]);

      } finally {

        setIsLoading(false);

      }

    };

    loadParticipants();

  }, [eventId]);


  /* =======================================================
     CHECK EVENT TYPE
  ======================================================= */

  const isTeamEvent =
    eventParticipantType.toLowerCase() === "team";


  /* =======================================================
     SEARCH FILTER

     Team:
     - ID
     - Team Leader
     - Team Members

     Individual:
     - Participant Name
  ======================================================= */

  const filteredParticipants =
    participants.filter((item) => {

      const searchValue =
        searchText.toLowerCase().trim();

      if (!searchValue) {
        return true;
      }


      if (isTeamEvent) {

        const teamIdMatch =
          item.Id
            .toString()
            .includes(searchValue);


        const leaderMatch =
          item.TeamLeader?.Title
            ?.toLowerCase()
            .includes(searchValue) || false;


        const memberMatch =
          item.Participant.some(
            (person) =>
              person.Title
                .toLowerCase()
                .includes(searchValue)
          );


        return (
          teamIdMatch ||
          leaderMatch ||
          memberMatch
        );

      }


      /* INDIVIDUAL EVENT */

      return item.Participant.some(
        (person) =>
          person.Title
            .toLowerCase()
            .includes(searchValue)
      );

    });


  /* =======================================================
   PAGINATION
======================================================= */

  const totalItems = filteredParticipants.length;

  const effectivePageSize =
    pageSize > 0
      ? pageSize
      : totalItems || 1;

  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / effectivePageSize)
  );

  const startIndex =
    (currentPage - 1) * effectivePageSize;

  const paginatedParticipants =
    filteredParticipants.slice(
      startIndex,
      startIndex + effectivePageSize
    );


  /* =======================================================
     HANDLE SEARCH
  ======================================================= */

  const handleSearch = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {

    setSearchText(event.target.value);

    setCurrentPage(1);

  };



  /* =======================================================
     VIEW DETAILS
  ======================================================= */

  const handleView = (
    participantId: number
  ): void => {

    console.log(
      "View participant details:",
      participantId
    );

  };


  /* =======================================================
     FORMAT DATE
  ======================================================= */

  const formatDate = (
    dateValue: string
  ): string => {

    if (!dateValue) {
      return "";
    }

    return new Date(dateValue)
      .toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }
      );

  };


  /* =======================================================
     GET INDIVIDUAL PARTICIPANT NAME

     Participant is a multiple People Picker.
     For Individual events, display names.
  ======================================================= */

  const getParticipantNames = (
    item: IParticipantData
  ): string => {

    return item.Participant
      .map((person) => person.Title)
      .join(", ");

  };


  if (isLoading) {

    return (
      <div className="text-center p-4">
        Loading participants...
      </div>
    );

  }


  return (

    <div>

      {/* =================================================
          HEADER
      ================================================= */}

      <div className={styles.participantHeader}>

        <div className={styles.participantTitle}>

          <span className={styles.count}>
            {filteredParticipants.length}
          </span>

          <span className={styles.title}>
            {isTeamEvent
              ? "Participants / Teams"
              : "Participants"}
          </span>

        </div>


        <div className={styles.actionSection}>

          {/* SEARCH */}

          <div className={styles.searchBox}>

            <i
              className={`bi bi-search ${styles.searchIcon}`}
            />

            <input
              type="text"
              placeholder="Search..."
              className={styles.searchInput}
              value={searchText}
              onChange={handleSearch}
            />

          </div>


          {/* SEND EMAIL */}

          <button
            type="button"
            className={styles.sendEmailButton}
          >
            Send Email
          </button>

        </div>

      </div>


      {/* =================================================
          TABLE
      ================================================= */}

      <div className={styles.tableWrapper}>

        <div className="table-responsive">

          <Table
            hover
            className={styles.listTable}
          >

            {/* TABLE HEADER */}

            <thead>

              <tr>

                <th className={styles.selectColumn}>
                  Select
                </th>


                {/* TEAM EVENT ONLY */}

                {isTeamEvent && (
                  <th>
                    Team ID
                  </th>
                )}


                {/* DYNAMIC NAME COLUMN */}

                <th>
                  {isTeamEvent
                    ? "Lead Name"
                    : "Team Member"}
                </th>


                {/* TEAM EVENT ONLY */}

                {isTeamEvent && (
                  <th>
                    Tot Members
                  </th>
                )}


                <th>
                  Registered Date
                </th>


                <th>
                  Stages Cleared
                </th>


                <th>
                  Status
                </th>


                <th>
                  Doc Submitted
                </th>


                <th className={styles.actionColumn}>
                  Action
                </th>

              </tr>

            </thead>


            {/* TABLE BODY */}

            <tbody>

              {paginatedParticipants.length > 0 ? (

                paginatedParticipants.map((participant) => (

                  <tr key={participant.Id}>

                    {/* SELECT */}

                    <td className={styles.selectColumn}>

                      <input
                        type="checkbox"
                        className={styles.customCheckbox}
                      />

                    </td>


                    {/* TEAM ID */}

                    {isTeamEvent && (

                      <td>
                        {participant.Id}
                      </td>

                    )}


                    {/* LEAD NAME / TEAM MEMBER */}

                    <td>

                      {isTeamEvent
                        ? participant.TeamLeader?.Title || ""
                        : getParticipantNames(participant)}

                    </td>


                    {/* TOTAL MEMBERS */}

                    {isTeamEvent && (

                      <td>
                        {participant.Participant.length} Members
                      </td>

                    )}


                    {/* REGISTERED DATE */}

                    <td>
                      {formatDate(participant.Created)}
                    </td>


                    {/* STAGES CLEARED - BLANK FOR NOW */}

                    <td>
                    </td>


                    {/* STATUS - BLANK FOR NOW */}

                    <td>
                    </td>


                    {/* DOCUMENT SUBMITTED - BLANK FOR NOW */}

                    <td className={styles.docSubmitted}>
                    </td>


                    {/* ACTION */}

                    <td className={styles.actionColumn}>

                      <button
                        type="button"
                        className={styles.viewButton}
                        title="View Details"
                        aria-label="View Details"
                        onClick={() =>
                          handleView(participant.Id)
                        }
                      >

                        <i className="bi bi-eye-fill" />

                      </button>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan={isTeamEvent ? 9 : 7}
                    className="text-center"
                  >
                    No participants found.
                  </td>

                </tr>

              )}

            </tbody>

          </Table>

        </div>

      </div>


      {/* =================================================
          PAGINATION
      ================================================= */}

      {filteredParticipants.length > 0 && (

        <div className={styles.paginationSection}>

          <div className={styles.leftPagination}>

            <span className={styles.pageInfo}>
              Page {currentPage} of {totalPages}
            </span>

            <span className={styles.pageInfo}>
              {totalItems} per page
            </span>

          </div>


          <Pagination className="mb-0 justify-content-end flex-wrap">

            <Pagination.First
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            />

            <Pagination.Prev
              onClick={() =>
                setCurrentPage(
                  Math.max(1, currentPage - 1)
                )
              }
              disabled={currentPage === 1}
            />


            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (

              <Pagination.Item
                key={page}
                active={page === currentPage}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Pagination.Item>

            ))}


            <Pagination.Next
              onClick={() =>
                setCurrentPage(
                  Math.min(
                    totalPages,
                    currentPage + 1
                  )
                )
              }
              disabled={currentPage === totalPages}
            />


            <Pagination.Last
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            />

          </Pagination>

        </div>

      )}

    </div>

  );

};


export default Participants;