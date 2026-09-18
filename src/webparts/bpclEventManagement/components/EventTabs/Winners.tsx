import * as React from "react";

import styles from "../EventTabs/Winners.module.scss";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import winnerbanner from "../../assets/winnerbanner1.png";

import {
  Form,
  Pagination,
  Table,
  Button
} from "react-bootstrap";

import WinnersService, {
  IWinnerRow,
  IWinnerSubEvent,
  IWinnersResponse
} from "../../Services/EventTabsServices/Winners";


/* =========================================================
   PROPS
========================================================= */

interface IWinnersProps {

  eventId?: number;

  hasSubEvents: boolean;

  hasStages: boolean;

  context: any;
  onViewDetails?: (participantItemId: number) => void;
}


/* =========================================================
   COMPONENT
========================================================= */

const Winners: React.FC<IWinnersProps> = ({
  eventId, onViewDetails
}) => {


  const winnersService =
    React.useMemo(
      () => new WinnersService(),
      []
    );


  /* =======================================================
     STATES
  ======================================================= */

  const [winnersData, setWinnersData] = React.useState<IWinnersResponse | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [searchText, setSearchText] = React.useState<string>("");

  const [currentPage, setCurrentPage] = React.useState<number>(1);


  const [pageSize, setPageSize] = React.useState<number>(10);
  const [winnerFilter, setWinnerFilter] = React.useState<string>("All");


  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isDeclaring, setIsDeclaring] = React.useState<boolean>(false);






  /* =======================================================
     LOAD WINNERS
  ======================================================= */

  const loadWinners =
    React.useCallback(
      async (): Promise<void> => {

        if (!eventId) {

          setWinnersData(null);

          setIsLoading(false);

          return;
        }


        try {

          setIsLoading(true);


          const response:
            IWinnersResponse =
            await winnersService.getWinners(
              eventId
            );


          console.log(
            "Winners data:",
            response
          );


          setWinnersData(response);


          /*
           * Clear selected rows whenever
           * latest data is loaded.
           */

          setSelectedIds([]);


        } catch (error) {

          console.error(
            "Error loading winners:",
            error
          );


          setWinnersData(null);


        } finally {

          setIsLoading(false);

        }

      },
      [
        eventId,
        winnersService
      ]
    );


  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  React.useEffect(
    () => {

      void loadWinners();

    },
    [loadWinners]
  );


  /* =======================================================
     EVENT PARTICIPANT TYPE
  ======================================================= */

  const eventParticipantType:
    string =
    winnersData?.EventParticipantType || "";


  const isTeam:
    boolean =
    eventParticipantType.toLowerCase() ===
    "team";


  const isIndividual:
    boolean =
    eventParticipantType.toLowerCase() ===
    "individual";


  /* =======================================================
     SUB EVENTS
  ======================================================= */

  const subEvents:
    IWinnerSubEvent[] =
    winnersData?.SubEvents || [];

  /* Use the service response for dynamic sub-event columns. */
  const showSubEvents: boolean =
    subEvents.length > 0;


  /* =======================================================
     PARTICIPANTS
  ======================================================= */

  const participants:
    IWinnerRow[] =
    winnersData?.Participants || [];

  const isFinalized: boolean =
    winnersData?.IsFinalized === true;
  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredParticipants:
    IWinnerRow[] =
    participants.filter(
      (
        participant: IWinnerRow
      ): boolean => {

        /* ================================
           STATUS FILTER
        ================================= */

        const participantStatus:
          string =
          (
            participant.ParticipantOrTeamStatus ||
            ""
          )
            .trim()
            .toLowerCase();

        const selectedFilter:
          string =
          winnerFilter
            .trim()
            .toLowerCase();

        const statusMatches:
          boolean =
          selectedFilter === "all" ||
          participantStatus === selectedFilter;


        /* ================================
           SEARCH FILTER
        ================================= */

        const search:
          string =
          searchText
            .trim()
            .toLowerCase();

        if (!search) {
          return statusMatches;
        }


        const teamId:
          string =
          String(
            participant.TeamId || ""
          );

        const teamLeader:
          string =
          participant.TeamLeader?.Title ||
          "";

        const participantNames:
          string =
          participant.Participant
            .map(
              (
                person
              ) =>
                person.Title || ""
            )
            .join(" ");


        const searchMatches:
          boolean =
          teamId
            .toLowerCase()
            .includes(search) ||

          teamLeader
            .toLowerCase()
            .includes(search) ||

          participantNames
            .toLowerCase()
            .includes(search) ||

          participantStatus
            .includes(search);


        return (
          statusMatches &&
          searchMatches
        );
      }
    );


  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalRecords:
    number =
    filteredParticipants.length;


  const totalPages:
    number =
    Math.max(
      1,
      Math.ceil(
        totalRecords /
        pageSize
      )
    );


  /*
   * If search/page size changes and
   * current page becomes invalid,
   * automatically use page 1.
   */

  React.useEffect(
    () => {

      if (
        currentPage > totalPages
      ) {

        setCurrentPage(1);

      }

    },
    [
      currentPage,
      totalPages
    ]
  );


  const startIndex:
    number =
    (currentPage - 1) *
    pageSize;


  const endIndex:
    number =
    startIndex +
    pageSize;


  const paginatedParticipants:
    IWinnerRow[] =
    filteredParticipants.slice(
      startIndex,
      endIndex
    );


  /* =======================================================
     STATUS BADGE
  ======================================================= */

  const getStatusClass =
    (
      status: string
    ): string => {

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


  /* =======================================================
     PARTICIPANT NAME
  ======================================================= */

  const getParticipantName =
    (
      participant: IWinnerRow
    ): string => {

      return participant.Participant
        .map(
          (
            person
          ) =>
            person.Title || ""
        )
        .filter(
          (
            name
          ) =>
            name !== ""
        )
        .join(", ");
    };


  /* =======================================================
     TOTAL MEMBERS
  ======================================================= */

  const getTotalMembers =
    (
      participant: IWinnerRow
    ): string => {

      return `${participant.Participant.length} Members`;
    };


  /* =======================================================
     SELECT CHECKBOX
  ======================================================= */

  const handleSelect =
    (
      participantId: number,
      checked: boolean
    ): void => {

      if (
        winnersData?.IsFinalized
      ) {
        return;
      }


      setSelectedIds(
        (
          previousIds
        ) => {

          if (checked) {

            if (
              previousIds.indexOf(
                participantId
              ) === -1
            ) {

              return [
                ...previousIds,
                participantId
              ];

            }

            return previousIds;
          }


          return previousIds.filter(
            (
              id
            ) =>
              id !== participantId
          );

        }
      );

    };


  /* =======================================================
     CHECK ALL
  ======================================================= */










  /* =======================================================
     DECLARE AS WINNER
  ======================================================= */

  const handleDeclareWinner =
    async (): Promise<void> => {

      if (!eventId) {
        return;
      }


      if (
        selectedIds.length === 0
      ) {

        alert(
          "Please select at least one participant or team."
        );

        return;
      }


      if (
        winnersData?.CanDeclareWinner !== true
      ) {

        return;
      }


      try {

        setIsDeclaring(true);


        console.log(
          "Selected winner IDs:",
          selectedIds
        );


        await winnersService.declareWinners(
          eventId,
          selectedIds
        );


        /*
         * Fetch latest data after update.
         */

        await loadWinners();


      } catch (error) {

        console.error(
          "Error declaring winners:",
          error
        );


        alert(
          "Error declaring winners. Please try again."
        );


      } finally {

        setIsDeclaring(false);

      }

    };


  /* =======================================================
     SEND EMAIL
  ======================================================= */

  const handleSendEmail =
    (): void => {

      console.log(
        "Send Email clicked"
      );

    };


  /* =======================================================
     VIEW DETAILS
  ======================================================= */

  const handleView =
    (
      participantId: number
    ): void => {

      if (onViewDetails) {
        onViewDetails(participantId);
      }

    };


  /* =======================================================
     SUB EVENT RESULT ICON
  ======================================================= */

  const renderSubEventStatus =
    (
      participant: IWinnerRow,
      subEventId: number
    ): React.ReactElement => {

      const result =
        participant.SubEvents.find(
          (
            subEvent
          ) =>
            subEvent.subEventId ===
            subEventId
        );


      if (!result) {

        return (
          <span className={styles.failedIcon}>
            ×
          </span>
        );

      }


      if (
        result.displayStatus ===
        "qualified"
      ) {

        return (
          <span
            className={
              styles.successIcon
            }
          >
            ✓
          </span>
        );

      }


      if (
        result.displayStatus ===
        "not-qualified"
      ) {

        return (
          <span
            className={
              styles.failedIcon
            }
          >
            ×
          </span>
        );

      }


      /*
       * pending / missing
       */

      return (
        <span className={styles.failedIcon}>
          x
        </span>
      );

    };


  /* =======================================================
     BANNER TEAM ID
  ======================================================= */

  const winnerBannerTeamId:
    string =
    selectedIds.length > 0
      ? String(selectedIds[0])
      : "";


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <div>

      {/* ===================================================
          WINNER BANNER
      =================================================== */}

      {isFinalized && (
        <div className={styles.winnerBanner} >




          <img
            src={winnerbanner}
            alt="Winner Banner"
            className={
              styles.bannerBackground
            }
          />


          <div
            className={
              styles.bannerContent
            }
          >

            <div
              className={
                styles.teamIdSection
              }
            >

              <span
                className={
                  styles.teamLabel
                }
              >
                {isTeam
                  ? "Team ID"
                  : "Participant ID"}
              </span>


              <span
                className={
                  styles.teamId
                }
              >
                {
                  winnerBannerTeamId
                    ? `#${winnerBannerTeamId}`
                    : ""
                }
              </span>

            </div>


            <div
              className={
                styles.winnerText
              }
            >

              <span>
                is the
              </span>

              <strong>
                Winner
              </strong>

              <span>
                {" "}of {eventId
                  ? "the Event"
                  : ""}
              </span>

            </div>

          </div>


          <Button
            type="button"
            className={
              styles.sendEmailButton
            }
            onClick={
              handleSendEmail
            }
          >
            Send Email
          </Button>

        </div>

      )}
      {/* ===================================================
          TOP NAVIGATION
      =================================================== */}



      {
        winnersData?.CanDeclareWinner &&
        !winnersData.IsFinalized && (

          <div
            className={
              styles.stageNavigation
            }
          >

            <div>

              <h2
                className={
                  styles.subheading
                }
              >
                Select a qualified participant or team and confirm them as the event winner.
              </h2>

            </div>

            <div>

              <Button
                className={
                  styles.statusBadge
                }
                disabled={
                  isDeclaring ||
                  selectedIds.length === 0
                }
                onClick={
                  handleDeclareWinner
                }
              >
                {
                  isDeclaring
                    ? "DECLARING..."
                    : "DECLARE AS WINNER"
                }
              </Button>

            </div>

          </div>

        )
      }


      {/* ===================================================
          HEADER / SEARCH
      =================================================== */}

      <div
        className={
          styles.qualifiersHeader
        }
      >

        {/* LEFT */}

        <div
          className={
            styles.qualifiersTitle
          }
        >

          <span
            className={
              styles.count
            }
          >
            {totalRecords}
          </span>

          <span
            className={
              styles.title
            }
          >

            {
              winnersData?.IsFinalized
                ? " Final winner results."
                : " Participants are awaiting the final result."
            }

          </span>

        </div>


        {/* RIGHT */}

        <div
          className={
            styles.actionSection
          }
        >

          {/* WINNERS DROPDOWN */}
          {isFinalized && (
            <div
              className={
                styles.WinnersWrapper
              }
            >

              <select
                className={
                  styles.WinnersSelect
                }
                value={winnerFilter}
                onChange={(
                  event:
                    React.ChangeEvent<HTMLSelectElement>
                ): void => {

                  setWinnerFilter(
                    event.target.value
                  );

                  setCurrentPage(1);

                  setSelectedIds([]);
                }}
              >
                <option value="All">
                  All
                </option>

                <option value="Winner">
                  Winner
                </option>

                <option value="Not Qualified">
                  Not Qualified
                </option>
              </select>


              <span
                className={
                  styles.WinnersdropdownArrow
                }
              >
                <i className="bi bi-chevron-down" />
              </span>

            </div>
          )}

          {/* SEARCH */}

          <div
            className={
              styles.searchBox
            }
          >

            <i
              className={`bi bi-search ${styles.searchIcon}`}
            />


            <input
              type="text"
              placeholder="Search..."
              value={searchText}
              className={
                styles.searchInput
              }
              onChange={(
                event:
                  React.ChangeEvent<HTMLInputElement>
              ): void => {

                setSearchText(
                  event.target.value
                );

                setCurrentPage(1);

              }}
            />

          </div>

        </div>

      </div>


      {/* ===================================================
          TABLE
      =================================================== */}

      <div
        className={
          styles.tableWrapper
        }
      >

        <div
          className="table-responsive mb-3"
        >

          <Table
            hover
            className={
              styles.listTable
            }
          >

            {/* =============================================
                HEADER
            ============================================= */}

            <thead>

              <tr>

                {/* SELECT */}

                {
                  !winnersData?.IsFinalized && (

                    <th
                      className={
                        styles.selectColumn
                      }
                    >
                      Select
                    </th>

                  )
                }


                {/* TEAM */}

                {
                  isTeam && (

                    <>
                      <th>
                        Team ID
                      </th>

                      <th>
                        Lead Name
                      </th>

                      <th>
                        Tot Members
                      </th>
                    </>

                  )
                }


                {/* INDIVIDUAL */}

                {
                  isIndividual && (

                    <>
                      <th>
                        Participant ID
                      </th>

                      <th>
                        Participant Name
                      </th>
                    </>

                  )
                }


                {/* SUB EVENTS */}

                {
                  showSubEvents &&
                  subEvents.map(
                    (
                      subEvent:
                        IWinnerSubEvent
                    ) => (

                      <th
                        key={
                          subEvent.Id
                        }
                      >
                        {
                          subEvent.SubEventTitle
                        }
                      </th>

                    )
                  )
                }


                {/* STATUS */}

                <th>
                  Status
                </th>


                {/* ACTION */}

                <th
                  className={
                    styles.actionColumn
                  }
                >
                  Action
                </th>

              </tr>

            </thead>


            {/* =============================================
                BODY
            ============================================= */}

            <tbody>

              {
                isLoading ? (

                  <tr>

                    <td
                      colSpan={
                        (
                          (winnersData?.IsFinalized
                            ? 0
                            : 1) +

                          (isTeam
                            ? 3
                            : 2) +

                          (showSubEvents
                            ? subEvents.length
                            : 0) +

                          2
                        )
                      }
                      className="text-center py-4"
                    >

                      <div
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      />

                      Loading winners...

                    </td>

                  </tr>

                ) : paginatedParticipants.length > 0 ? (

                  paginatedParticipants.map(
                    (
                      participant:
                        IWinnerRow
                    ) => (

                      <tr
                        key={
                          participant.Id
                        }
                      >

                        {/* =================================
                            SELECT
                        ================================= */}

                        {
                          !winnersData?.IsFinalized && (

                            <td
                              className={
                                styles.selectColumn
                              }
                            >

                              <input
                                type="checkbox"
                                className={
                                  styles.customCheckbox
                                }
                                checked={
                                  selectedIds.indexOf(
                                    participant.Id
                                  ) !== -1
                                }
                                disabled={
                                  !participant.CanSelect
                                }
                                onChange={(
                                  event
                                ) =>
                                  handleSelect(
                                    participant.Id,
                                    event.target.checked
                                  )
                                }
                              />

                            </td>

                          )
                        }


                        {/* =================================
                            TEAM
                        ================================= */}

                        {
                          isTeam && (

                            <>

                              <td>
                                {participant.TeamId}
                              </td>


                              <td>
                                {
                                  participant
                                    .TeamLeader
                                    ?.Title || "-"
                                }
                              </td>


                              <td>
                                {
                                  getTotalMembers(
                                    participant
                                  )
                                }
                              </td>

                            </>

                          )
                        }


                        {/* =================================
                            INDIVIDUAL
                        ================================= */}

                        {
                          isIndividual && (

                            <>

                              <td>
                                {participant.Id}
                              </td>


                              <td>
                                {
                                  getParticipantName(
                                    participant
                                  ) || "-"
                                }
                              </td>

                            </>

                          )
                        }


                        {/* =================================
                            SUB EVENTS
                        ================================= */}

                        {
                          showSubEvents &&
                          subEvents.map(
                            (
                              subEvent:
                                IWinnerSubEvent
                            ) => (

                              <td
                                key={
                                  `${participant.Id}_${subEvent.Id}`
                                }
                                className="text-center"
                              >

                                {
                                  renderSubEventStatus(
                                    participant,
                                    subEvent.Id
                                  )
                                }

                              </td>

                            )
                          )
                        }


                        {/* =================================
                            STATUS
                        ================================= */}

                        <td>

                          <span
                            className={
                              getStatusClass(
                                participant.ParticipantOrTeamStatus
                              )
                            }
                          >
                            {
                              participant
                                .ParticipantOrTeamStatus ||
                              "-"
                            }
                          </span>

                        </td>


                        {/* =================================
                            ACTION
                        ================================= */}

                        <td
                          className={
                            styles.actionColumn
                          }
                        >

                          <button
                            type="button"
                            className={
                              styles.viewButton
                            }
                            title="View Details"
                            aria-label="View Details"
                            onClick={() =>
                              handleView(
                                participant.Id
                              )
                            }
                          >

                            <i className="bi bi-eye-fill" />

                          </button>

                        </td>

                      </tr>

                    )

                  )

                ) : (

                  <tr>

                    <td
                      colSpan={
                        (
                          (winnersData?.IsFinalized
                            ? 0
                            : 1) +

                          (isTeam
                            ? 3
                            : 2) +

                          (showSubEvents
                            ? subEvents.length
                            : 0) +

                          2
                        )
                      }
                      className="text-center py-4 text-muted"
                    >

                      No participants found

                    </td>

                  </tr>

                )
              }

            </tbody>

          </Table>

        </div>


        {/* =================================================
            PAGINATION
        ================================================= */}

        <div
          className={
            styles.paginationSection
          }
        >

          <div
            className={
              styles.leftPagination
            }
          >

            <span
              className={
                styles.pageInfo
              }
            >
              Page {currentPage} of {totalPages}
            </span>


            <Form.Select
              className={
                styles.pageSize
              }
              value={
                pageSize
              }
              onChange={(
                event:
                  React.ChangeEvent<HTMLSelectElement>
              ): void => {

                setPageSize(
                  Number(
                    event.target.value
                  )
                );

                setCurrentPage(1);

              }}
            >

              <option value={10}>
                10 per page
              </option>

              <option value={20}>
                20 per page
              </option>

              <option value={50}>
                50 per page
              </option>

            </Form.Select>

          </div>


          <Pagination
            className="mb-0 justify-content-end flex-wrap"
          >

            {/* FIRST */}

            <Pagination.First
              disabled={
                currentPage === 1
              }
              onClick={(): void => {

                setCurrentPage(1);

              }}
            />


            {/* PREVIOUS */}

            <Pagination.Prev
              disabled={
                currentPage === 1
              }
              onClick={(): void => {

                if (
                  currentPage > 1
                ) {

                  setCurrentPage(
                    currentPage - 1
                  );

                }

              }}
            />


            {/* PAGE NUMBERS */}

            {
              Array.from(
                {
                  length: totalPages
                },
                (
                  _,
                  index
                ) => {

                  const pageNumber:
                    number =
                    index + 1;


                  return (

                    <Pagination.Item
                      key={
                        pageNumber
                      }
                      active={
                        currentPage ===
                        pageNumber
                      }
                      onClick={(): void => {

                        setCurrentPage(
                          pageNumber
                        );

                      }}
                    >

                      {pageNumber}

                    </Pagination.Item>

                  );

                }
              )
            }


            {/* NEXT */}

            <Pagination.Next
              disabled={
                currentPage ===
                totalPages
              }
              onClick={(): void => {

                if (
                  currentPage <
                  totalPages
                ) {

                  setCurrentPage(
                    currentPage + 1
                  );

                }

              }}
            />


            {/* LAST */}

            <Pagination.Last
              disabled={
                currentPage ===
                totalPages
              }
              onClick={(): void => {

                setCurrentPage(
                  totalPages
                );

              }}
            />

          </Pagination>

        </div>

      </div>

    </div>

  );
};


export default Winners;