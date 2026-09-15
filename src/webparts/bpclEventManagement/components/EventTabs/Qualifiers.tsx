import * as React from "react";
import styles from "../EventTabs/Qualifiers.module.scss";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import {
  Form,
  Pagination,
  Table,
  Button
} from "react-bootstrap";

import QualifiersService, {
  IQualifierEventDetails,
  IQualifierSubEvent,
  IQualifierStage,
  IQualifierParticipant,
  IParticipantStageStatus
} from "../../Services/EventTabsServices/Qualifiers";

interface IQualifiersProps {
  eventId?: number;
  hasSubEvents: boolean;
  hasStages: boolean;
  context: any;
}

const Qualifiers: React.FC<IQualifiersProps> = ({
  eventId,
  hasSubEvents,
  hasStages,
  context
}) => {

  const service = new QualifiersService();

  /*
   * ============================================================
   * STATES
   * ============================================================
   */

  const [event, setEvent] =
    React.useState<IQualifierEventDetails | null>(null);

  const [subEvents, setSubEvents] =
    React.useState<IQualifierSubEvent[]>([]);

  const [selectedSubEvent, setSelectedSubEvent] =
    React.useState<number | undefined>();

  const [stages, setStages] =
    React.useState<IQualifierStage[]>([]);

  const [selectedStage, setSelectedStage] =
    React.useState<number>(0);

  const [participants, setParticipants] =
    React.useState<IQualifierParticipant[]>([]);

  const [stageStatus, setStageStatus] =
    React.useState<IParticipantStageStatus[]>([]);
  const [documentCounts, setDocumentCounts] =
    React.useState<Record<string, number>>({});

  const [selectedParticipants, setSelectedParticipants] =
    React.useState<number[]>([]);

  const [selectedQualified, setSelectedQualified] =
    React.useState<string>("All");

  const [searchText, setSearchText] =
    React.useState<string>("");

  const [loading, setLoading] =
    React.useState<boolean>(true);

  const [submitting, setSubmitting] =
    React.useState<boolean>(false);

  const [currentStageSubmitted, setCurrentStageSubmitted] =
    React.useState<boolean>(false);

  const [previousStageCompleted, setPreviousStageCompleted] =
    React.useState<boolean>(true);

  const [previousStageMessage, setPreviousStageMessage] =
    React.useState<string>("");
  const isSubEvent =
    event?.HasSubEvents ?? hasSubEvents;

  const isStage =
    event?.HasStages ?? hasStages;

  /*
   * ============================================================
   * LOAD EVENT
   * ============================================================
   */

  React.useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    loadEvent();
  }, [eventId]);

  /*
   * ============================================================
   * LOAD EVENT DETAILS
   * ============================================================
   */

  const loadEvent = async (): Promise<void> => {

    try {

      setLoading(true);

      const eventData =
        await service.getEventDetails(eventId!);

      setEvent(eventData);

      /*
       * SUB EVENTS
       */

      if (eventData.HasSubEvents) {

        const subEventData =
          await service.getSubEvents(eventId!);

        setSubEvents(subEventData);

        if (subEventData.length > 0) {

          setSelectedSubEvent(
            subEventData[0].Id
          );

        } else {

          setLoading(false);
        }

        return;
      }

      /*
       * STAGES WITHOUT SUB EVENTS
       */

      if (
        !eventData.HasSubEvents &&
        eventData.HasStages
      ) {

        const stageData =
          await service.getStages(eventId!);
        console.log("Event ID:", eventId);
        console.log("Has Stages:", eventData.HasStages);
        console.log("Stage Data:", stageData);

        setStages(stageData);

        setSelectedStage(0);

        setLoading(false);

        return;
      }

      /*
       * NO SUB EVENTS + NO STAGES
       */

      setLoading(false);

    } catch (error) {

      console.error(
        "Error loading event:",
        error
      );

      setLoading(false);
    }
  };

  /*
   * ============================================================
   * LOAD SUB EVENT
   * ============================================================
   */

  React.useEffect(() => {

    if (
      !eventId ||
      !event ||
      !event.HasSubEvents ||
      !selectedSubEvent
    ) {
      return;
    }

    loadSubEvent(
      selectedSubEvent
    );

  }, [
    selectedSubEvent,
    event
  ]);

  const loadSubEvent = async (
    subEventId: number
  ): Promise<void> => {

    try {

      setLoading(true);

      setParticipants([]);
      setStageStatus([]);
      setSelectedParticipants([]);

      setCurrentStageSubmitted(false);

      setPreviousStageCompleted(true);
      setPreviousStageMessage("");

      /*
       * SUB EVENT + STAGES
       */

      if (event?.HasStages) {

        const stageData =
          await service.getStages(
            eventId!,
            subEventId
          );

        setStages(stageData);

        setSelectedStage(0);

        setLoading(false);

        return;
      }

      /*
       * SUB EVENT WITHOUT STAGES
       */

      const participantData =
        await service.getSubEventParticipants(
          eventId!,
          subEventId
        );

      setParticipants(
        participantData
      );

      /*
       * Check whether qualification
       * is already submitted
       */
      const hasPendingResults =
        participantData.some(
          (item) =>
            item.ParticipantOrTeamStatus ===
            "Results Pending"
        );

      setCurrentStageSubmitted(
        participantData.length > 0 &&
        !hasPendingResults
      );

      setLoading(false);

    } catch (error) {

      console.error(
        "Error loading sub event:",
        error
      );

      setLoading(false);
    }
  };

  /*
   * ============================================================
   * LOAD STAGE
   * ============================================================
   */

  React.useEffect(() => {

    if (
      !eventId ||
      !event?.HasStages ||
      stages.length === 0
    ) {
      return;
    }

    loadStage();

  }, [
    selectedStage,
    stages,
    selectedSubEvent
  ]);

  const loadStage = async (): Promise<void> => {

    const currentStage =
      stages[selectedStage];

    if (!currentStage) {
      return;
    }

    try {

      setLoading(true);

      setParticipants([]);
      setStageStatus([]);

      setSelectedParticipants([]);

      setSelectedQualified("All");

      setCurrentStageSubmitted(false);

      setPreviousStageCompleted(true);
      setPreviousStageMessage("");

      /*
       * ========================================================
       * CHECK CURRENT STAGE HISTORY
       * ========================================================
       */

      const currentHistory =
        await service.getStageStatus(
          eventId!,
          currentStage.Stage,
          selectedSubEvent
        );

      /*
       * CURRENT STAGE ALREADY COMPLETED
       */

      if (currentHistory.length > 0) {

        setStageStatus(
          currentHistory
        );

        await loadDocumentCounts(
          currentHistory
        );

        setCurrentStageSubmitted(
          true
        );

        setLoading(false);

        return;
      }

      /*
       * ========================================================
       * FIRST STAGE
       * ========================================================
       */

      if (selectedStage === 0) {

        let participantData:
          IQualifierParticipant[] = [];

        if (event?.HasSubEvents) {

          participantData =
            await service.getSubEventParticipants(
              eventId!,
              selectedSubEvent!
            );

        } else {

          participantData =
            await service.getEventParticipants(
              eventId!
            );
        }

        setParticipants(
          participantData
        );

        await loadDocumentCounts(
          participantData
        );

        setLoading(false);

        return;
      }

      /*
       * ========================================================
       * PREVIOUS STAGE
       * ========================================================
       */

      const previousStage =
        stages[selectedStage - 1];

      const previousHistory =
        await service.getStageStatus(
          eventId!,
          previousStage.Stage,
          selectedSubEvent
        );

      /*
       * PREVIOUS STAGE NOT COMPLETED
       */

      if (previousHistory.length === 0) {

        setPreviousStageCompleted(
          false
        );

        setPreviousStageMessage(
          `${previousStage.Stage} qualification is not yet completed. Please complete ${previousStage.Stage} qualification to proceed.`
        );

        setLoading(false);

        return;
      }

      /*
       * ========================================================
       * ONLY QUALIFIED PARTICIPANTS MOVE TO NEXT STAGE
       * ========================================================
       */

      const qualifiedParticipants =
        previousHistory.filter(
          (item) =>
            item.Status === "Qualified"
        );

      const nextStageParticipants =
        qualifiedParticipants.map(
          (item) => ({
            Id: item.Id,

            Event_IDId:
              item.Event_IDId,

            SubEventIDId:
              item.SubEventIDId,

            TeamIDId:
              item.TeamIDId,

            TeamLeader:
              item.TeamLeader,

            Participant:
              item.Participant,

            EventParticipantType:
              item.EventParticipantType,

            ParticipantOrTeamStatus:
              "Results Pending",

            Created:
              item.Created
          })
        );

      setParticipants(
        nextStageParticipants
      );

      await loadDocumentCounts(
        nextStageParticipants
      );

      setPreviousStageCompleted(
        true
      );

      setLoading(false);

    } catch (error) {

      console.error(
        "Error loading stage:",
        error
      );

      setLoading(false);
    }
  };

  /*
   * ============================================================
   * SUB EVENT CHANGE
   * ============================================================
   */

  const handleSubEventChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {

    const value =
      Number(event.target.value);

    setSelectedSubEvent(
      value || undefined
    );

    setStages([]);
    setSelectedStage(0);

    setParticipants([]);
    setStageStatus([]);

    setSelectedParticipants([]);

    setCurrentStageSubmitted(false);

    setPreviousStageCompleted(true);
    setPreviousStageMessage("");

    setSelectedQualified("All");

    setSearchText("");
  };

  /*
   * ============================================================
   * STAGE CHANGE
   * ============================================================
   */

  const handleStageChange = (
    stageIndex: number
  ): void => {

    setSelectedStage(
      stageIndex
    );

    setDocumentCounts({});

    setSelectedParticipants([]);

    setSelectedQualified("All");

    setSearchText("");

    setPreviousStageCompleted(
      true
    );

    setPreviousStageMessage("");
  };

  /*
   * ============================================================
   * QUALIFIED FILTER
   * ============================================================
   */

  const handleQualifiedChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {

    setSelectedQualified(
      event.target.value
    );
  };

  /*
   * ============================================================
   * CHECKBOX
   * ============================================================
   */

  const handleCheckboxChange = (
    id: number,
    checked: boolean
  ): void => {

    setSelectedParticipants(
      (previous) => {

        if (checked) {

          if (
            previous.indexOf(id) === -1
          ) {

            return [
              ...previous,
              id
            ];
          }

          return previous;
        }

        return previous.filter(
          (item) => item !== id
        );
      }
    );
  };

  /*
   * ============================================================
   * PARTICIPANT NAMES
   * ============================================================
   */

  const getParticipantNames = (
    item:
      | IQualifierParticipant
      | IParticipantStageStatus
  ): string => {

    if (
      !item.Participant ||
      item.Participant.length === 0
    ) {
      return "-";
    }

    return item.Participant
      .map(
        (person) =>
          person.Title
      )
      .filter(
        (name) => !!name
      )
      .join(", ");
  };

  /*
   * ============================================================
   * TEAM LEADER
   * ============================================================
   */

  const getTeamLeader = (
    item:
      | IQualifierParticipant
      | IParticipantStageStatus
  ): string => {

    return (
      item.TeamLeader?.Title ||
      "-"
    );
  };

  /*
   * ============================================================
   * STATUS
   * ============================================================
   */

  const getStatus = (
    item:
      | IQualifierParticipant
      | IParticipantStageStatus
  ): string => {

    if (
      "Status" in item
    ) {

      return (
        item.Status ||
        "Results Pending"
      );
    }

    return (
      item.ParticipantOrTeamStatus ||
      "Results Pending"
    );
  };

  /*
   * ============================================================
   * STATUS BADGE
   * ============================================================
   */

  const getStatusClass = (
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

      case "Results Pending":
        return styles.resultsPendingBadge;

      case "Winner":
        return styles.winnerBadge;

      default:
        return styles.defaultStatusBadge;
    }
  };

  /*
   * ============================================================
   * GET CURRENT DATA
   * ============================================================
   */

  const getCurrentData = (): Array<
    IQualifierParticipant |
    IParticipantStageStatus
  > => {

    /*
     * Stage events
     * After submission display StageStatus data
     */
    if (
      isStage &&
      currentStageSubmitted
    ) {
      return stageStatus;
    }

    /*
     * Sub-event without stages
     * Always display participants from
     * Corp_SL_SubEvent_Participants
     */
    return participants;
  };

  /*
   * ============================================================
   * FILTER DATA
   * ============================================================
   */

  const getFilteredData = () => {

    const data =
      getCurrentData();

    return data.filter(
      (item) => {

        const status =
          getStatus(item);

        const participantNames =
          getParticipantNames(item);

        const teamLeader =
          getTeamLeader(item);

        const search =
          searchText
            .toLowerCase()
            .trim();

        const matchesStatus =
          selectedQualified === "All" ||
          status === selectedQualified;

        const matchesSearch =
          !search ||
          participantNames
            .toLowerCase()
            .indexOf(search) !== -1 ||
          teamLeader
            .toLowerCase()
            .indexOf(search) !== -1 ||
          String(
            item.TeamIDId || ""
          )
            .toLowerCase()
            .indexOf(search) !== -1 ||
          String(item.Id)
            .toLowerCase()
            .indexOf(search) !== -1;

        return (
          matchesStatus &&
          matchesSearch
        );
      }
    );
  };

  /*
   * ============================================================
   * VIEW
   * ============================================================
   */

  const handleView = (
    id: number
  ): void => {

    console.log(
      "View details:",
      id
    );
  };

  /* ============================================================
   LOAD DOCUMENT COUNTS
   
   Key:
     TeamID

   Filter:
     EventId
     SubEventID
     Stage
     TeamID
============================================================ */

  const loadDocumentCounts = async (
    data: Array<
      IQualifierParticipant |
      IParticipantStageStatus
    >
  ): Promise<void> => {

    try {

      if (
        !eventId ||
        !isStage ||
        !stages[selectedStage]
      ) {
        setDocumentCounts({});
        return;
      }

      const currentStage =
        stages[selectedStage];

      if (!currentStage?.Stage) {
        setDocumentCounts({});
        return;
      }

      const counts: Record<string, number> = {};

      /*
       * Get unique Team IDs
       */
      const teamIds: number[] = Array.from(
        new Set(
          data
            .map(
              (item) => item.TeamIDId
            )
            .filter(
              (id): id is number =>
                id !== undefined &&
                id !== null
            )
        )
      );

      /*
       * Get document count for every Team
       */
      await Promise.all(
        teamIds.map(
          async (teamId) => {

            const count =
              await service.getParticipantDocumentCount(
                eventId,
                selectedSubEvent,
                currentStage.Stage,
                teamId
              );

            counts[String(teamId)] = count;
          }
        )
      );

      setDocumentCounts(counts);

    } catch (error) {

      console.error(
        "Error loading document counts:",
        error
      );

      setDocumentCounts({});
    }
  };

  /*
   * ============================================================
   * SUBMIT
   * ============================================================
   */

  const handleSubmit = async (): Promise<void> => {

    if (
      selectedParticipants.length === 0
    ) {

      alert(
        "Please select at least one participant."
      );

      return;
    }

    if (
      !previousStageCompleted
    ) {
      return;
    }

    try {

      setSubmitting(true);

      /*
       * Stage qualification
       */

      if (isStage) {

        const currentStage =
          stages[selectedStage];

        /*
         * This method should be present
         * in Qualifiers.ts
         */
        await service.submitStageQualification(
          eventId!,
          currentStage.Stage,
          participants,
          selectedParticipants,
          selectedSubEvent
        );

        /*
         * Read from SharePoint again
         */

        const history =
          await service.getStageStatus(
            eventId!,
            currentStage.Stage,
            selectedSubEvent
          );

        setStageStatus(
          history
        );

        setParticipants([]);

        setSelectedParticipants([]);

        setCurrentStageSubmitted(
          true
        );

      } else {

        /*
         * Sub-event without stages
         */

        await service.submitSubEventQualification(
          eventId!,
          selectedSubEvent!,
          participants,
          selectedParticipants
        );

        /*
         * Reload from SharePoint
         */

        const updatedParticipants =
          await service.getSubEventParticipants(
            eventId!,
            selectedSubEvent!
          );

        setParticipants(
          updatedParticipants
        );

        setSelectedParticipants([]);

        setCurrentStageSubmitted(
          true
        );
      }

    } catch (error) {

      console.error(
        "Error submitting qualifier:",
        error
      );

      alert(
        "Unable to submit qualification."
      );

    } finally {

      setSubmitting(false);
    }
  };

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {

    return (
      <div className="text-center p-4">

        <div
          className="spinner-border"
          role="status"
        >
          <span className="visually-hidden">
            Loading...
          </span>
        </div>

      </div>
    );
  }

  /*
   * ============================================================
   * NO QUALIFICATION
   * ============================================================
   */

  if (
    !isSubEvent &&
    !isStage
  ) {

    return (
      <div className={styles.qualifiersHeader}>



        <div className={styles.title}>
          This event does not have stages or sub-events.

        </div>

      </div>
    );
  }

  /*
   * ============================================================
   * DATA
   * ============================================================
   */

  const filteredData =
    getFilteredData();

  const participantType =
    stageStatus.length > 0
      ? stageStatus[0].EventParticipantType
      : participants.length > 0
        ? participants[0].EventParticipantType
        : event?.EventParticipantType || "";

  const currentStage =
    stages[selectedStage];

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (

    <div>

      {/* =====================================================
          TOP STAGE NAVIGATION
      ===================================================== */}

      <div className={styles.stageNavigation}>

        {/* ================= SUB EVENT ================= */}

        {isSubEvent && (

          <div className={styles.subEventWrapper}>

            <select
              className={styles.subEventSelect}
              value={
                selectedSubEvent || ""
              }
              onChange={
                handleSubEventChange
              }
            >



              {subEvents.map(
                (subEvent) => (

                  <option
                    key={subEvent.Id}
                    value={subEvent.Id}
                  >
                    {
                      subEvent.SubEventTitle
                    }
                  </option>

                )
              )}

            </select>

            <span
              className={
                styles.dropdownArrow
              }
            >
              <i className="bi bi-chevron-down" />
            </span>

          </div>
        )}

        {/* ================= STAGES ================= */}

        {isStage && (

          <div className={styles.stageWrapper}>

            {stages.map(
              (stage, index) => (

                <button
                  key={stage.Id}
                  type="button"
                  className={`${styles.stageButton} ${selectedStage === index
                    ? styles.activeStage
                    : ""
                    }`}
                  onClick={() =>
                    handleStageChange(
                      index
                    )
                  }
                >
                  {
                    stage.Stage
                  }
                </button>

              )
            )}

          </div>
        )}

        {/* ================= SUBMIT ================= */}

        {(
          !currentStageSubmitted &&
          previousStageCompleted &&
          filteredData.length > 0
        ) && (

            <div>

              <Button
                className={
                  styles.statusBadge
                }
                disabled={
                  submitting ||
                  selectedParticipants.length === 0
                }
                onClick={
                  handleSubmit
                }
              >
                {submitting
                  ? "SUBMITTING..."
                  : isStage
                    ? `SUBMIT ${currentStage?.Stage || ""} QUALIFIER`
                    : "SUBMIT QUALIFIERS"}
              </Button>

            </div>
          )}

      </div>

      {/* =====================================================
          PREVIOUS STAGE MESSAGE
      ===================================================== */}

      {!previousStageCompleted && (

        <div className="mb-3">

          <span>
            {
              previousStageMessage
            }
          </span>

        </div>
      )}

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className={styles.qualifiersHeader}>

        {/* Left Side */}

        <div className={styles.qualifiersTitle}>

          <span className={styles.count}>
            {
              filteredData.length
            }
          </span>

          <span className={styles.title}>

            {isStage
              ? `Participants for ${currentStage?.Stage || ""}${isSubEvent ? ` of ${subEvents.find(
                (item) =>
                  item.Id ===
                  selectedSubEvent
              )?.SubEventTitle || ""}` : ""}`
              : `Participants${isSubEvent ? ` of ${subEvents.find(
                (item) =>
                  item.Id ===
                  selectedSubEvent
              )?.SubEventTitle || ""}` : ""}`}

          </span>

        </div>

        {/* Right Side */}

        <div className={styles.actionSection}>

          {/* STATUS FILTER */}

          <div className={styles.QualifiedWrapper}>

            <select
              className={
                styles.QualifiedSelect
              }
              value={
                selectedQualified
              }
              onChange={
                handleQualifiedChange
              }
            >

              <option value="All">
                All
              </option>

              <option value="Qualified">
                Qualified
              </option>

              <option value="Not Qualified">
                Not Qualified
              </option>


            </select>

            <span
              className={
                styles.QualifieddropdownArrow
              }
            >
              <i className="bi bi-chevron-down" />
            </span>

          </div>

          {/* SEARCH */}

          <div className={styles.searchBox}>

            <i
              className={`bi bi-search ${styles.searchIcon}`}
            />

            <input
              type="text"
              placeholder="Search..."
              className={
                styles.searchInput
              }
              value={searchText}
              onChange={(e) =>
                setSearchText(
                  e.target.value
                )
              }
            />

          </div>

        </div>

      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className={styles.tableWrapper}>

        <div className="table-responsive">

          <Table
            hover
            className={styles.listTable}
          >

            <thead>

              <tr>

                {!currentStageSubmitted && (

                  <th
                    className={
                      styles.selectColumn
                    }
                  >
                    Select
                  </th>

                )}

                {participantType === "Team" ? (

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

                    <th>
                      Participant Names
                    </th>
                  </>

                ) : (

                  <>
                    <th>
                      Participant ID
                    </th>

                    <th>
                      Participant Name
                    </th>
                  </>

                )}

                <th>
                  Status
                </th>

                <th>
                  Documents
                </th>

                <th
                  className={
                    styles.actionColumn
                  }
                >
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredData.length === 0 ? (

                <tr>

                  <td
                    colSpan={
                      participantType === "Team"
                        ? currentStageSubmitted
                          ? 7
                          : 8
                        : currentStageSubmitted
                          ? 5
                          : 6
                    }
                    className="text-center"
                  >
                    No participants found.
                  </td>

                </tr>

              ) : (

                filteredData.map(
                  (item) => {

                    const status =
                      getStatus(item);

                    return (

                      <tr
                        key={
                          item.Id
                        }
                      >

                        {!currentStageSubmitted && (

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
                                selectedParticipants.indexOf(
                                  item.Id
                                ) !== -1
                              }
                              onChange={(e) =>
                                handleCheckboxChange(
                                  item.Id,
                                  e.target.checked
                                )
                              }
                            />

                          </td>

                        )}

                        {participantType === "Team" ? (

                          <>
                            <td>
                              {
                                isSubEvent &&
                                  !isStage &&
                                  item.EventParticipantType === "Team"
                                  ? item.TeamIDId
                                  : currentStageSubmitted ||
                                    (isStage && selectedStage > 0)
                                    ? item.TeamIDId || item.Id
                                    : item.Id
                              }
                            </td>

                            <td>
                              {
                                getTeamLeader(
                                  item
                                )
                              }
                            </td>

                            <td>
                              {
                                item.Participant
                                  ? `${item.Participant.length} Members`
                                  : "0 Members"
                              }
                            </td>

                            <td>
                              {
                                getParticipantNames(
                                  item
                                )
                              }
                            </td>
                          </>

                        ) : (

                          <>
                            <td>
                              {
                                isSubEvent &&
                                  item.EventParticipantType === "Individual"
                                  ? item.TeamIDId || item.Id
                                  : currentStageSubmitted ||
                                    (isStage && selectedStage > 0)
                                    ? item.TeamIDId || item.Id
                                    : item.Id
                              }
                            </td>

                            <td>
                              {
                                getParticipantNames(
                                  item
                                )
                              }
                            </td>
                          </>

                        )}

                        <td>

                          <span
                            className={
                              getStatusClass(
                                status
                              )
                            }
                          >
                            {
                              status
                            }
                          </span>

                        </td>

                        <td
                          className={
                            styles.Documents
                          }
                        >
                          {(() => {

                            const teamId =
                              item.TeamIDId;

                            if (
                              !teamId ||
                              !isStage ||
                              !currentStage?.Stage
                            ) {
                              return 0;
                            }

                            return (
                              documentCounts[
                              String(teamId)
                              ] || 0
                            );

                          })()}
                        </td>

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
                                item.Id
                              )
                            }
                          >

                            <i className="bi bi-eye-fill" />

                          </button>

                        </td>

                      </tr>

                    );
                  }
                )

              )}

            </tbody>

          </Table>

        </div>

      </div>

      {/* =====================================================
          PAGINATION
      ===================================================== */}

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
            Page 1 of 1
          </span>

          <Form.Select
            className={
              styles.pageSize
            }
          >
            <option>
              10 per page
            </option>

            <option>
              20 per page
            </option>

            <option>
              50 per page
            </option>
          </Form.Select>

        </div>

        <Pagination className="mb-0 justify-content-end flex-wrap">

          <Pagination.First />

          <Pagination.Prev />

          <Pagination.Item active>
            1
          </Pagination.Item>

          <Pagination.Next />

          <Pagination.Last />

        </Pagination>

      </div>

    </div>
  );
};

export default Qualifiers;