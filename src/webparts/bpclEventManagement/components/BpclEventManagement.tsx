import * as React from 'react';
import styles from './BpclEventManagement.module.scss';
import type { IBpclEventManagementProps } from './IBpclEventManagementProps';
import CreateEvent from './CreateEvent';
import CancelEvent from './CancelEvent';
import EventDetails from './EventDetails';
import DocumentSubmission from './EventDocSubmission';
import BpclEventParticipantDetails from './BpclEventParticipantDetails';

import EventService, { IEventItem } from '../Services/EventManagementServices';


import '@fontsource/inter';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import {
  Row,
  Col,
  Card,
  Form,
  Button,
  Pagination,
  Table

} from 'react-bootstrap';


interface IBpclEventManagementState {
  showCreateEvent: boolean;
  showEventDetails: boolean;
  editSource: "Main" | "EventDetails" | null;
  showCancelModal: boolean;
  searchText: string;
  selectedEvent: IEventItem | null;
  selectedEventId: number | null;
  selectedEventTitle: string;
  selectedEventHasSubEvents: boolean;
  selectedEventHasStages: boolean;
  showDocumentSubmission: boolean;
  showParticipantDetails: boolean;
  selectedParticipantItemId: number | null;
  eventDetailsInitialTab: string;
  participantDetailsFromEventDetails: boolean;
  eventList: IEventItem[];
  isLoading: boolean;
  isCancelling: boolean;
  pageSize: number;
  currentPage: number;

}


export default class BpclEventManagement
  extends React.Component<
    IBpclEventManagementProps,
    IBpclEventManagementState
  > {

  private eventService: EventService;


  constructor(props: IBpclEventManagementProps) {
    super(props);

    this.eventService = new EventService();

    this.state = {
      showCreateEvent: false,
      showEventDetails: false,
      editSource: null,
      showCancelModal: false,
      searchText: '',
      selectedEvent: null,
      selectedEventId: null,
      selectedEventTitle: '',
      selectedEventHasSubEvents: false,
      selectedEventHasStages: false,
      showDocumentSubmission: false,
      selectedParticipantItemId: null,
      eventDetailsInitialTab: "About",
      participantDetailsFromEventDetails: false,
      eventList: [],
      isLoading: true,
      isCancelling: false,
      pageSize: 10,
      currentPage: 1,
      showParticipantDetails: false,


    };
  }

  public async componentDidMount(): Promise<void> {

    await this.loadEvents();

  }

  private loadEvents = async (): Promise<void> => {

    try {

      this.setState({
        isLoading: true
      });


      const events: IEventItem[] =
        await this.eventService.getEvents();


      console.log(
        'Events loaded in BpclEventManagement:',
        events
      );


      this.setState({
        eventList: events,
        isLoading: false
      });

    } catch (error) {

      console.error(
        'Error loading events:',
        error
      );


      this.setState({
        eventList: [],
        isLoading: false
      });

    }

  };


  private handleCreateEvent = (): void => {

    this.setState({
      showCreateEvent: true,
      selectedEventId: null,
      editSource: null
    });

  };



  private handleEditEvent = (event: IEventItem): void => {

    this.setState({
      showCreateEvent: true,
      selectedEventId: event.id,
      editSource: "Main"
    });

  };

  private handleEditEventFromDetails = (): void => {
    if (!this.state.selectedEventId) {
      return;
    }

    this.setState({
      showEventDetails: false,
      showCreateEvent: true,
      editSource: "EventDetails"
    });
  };

  // private handleViewEventClick = (
  //   event: IEventItem
  // ): void => {

  //   const loggedInUserEmail: string =
  //     this.props.context.pageContext.user.email.toLowerCase();

  //   const authorEmail: string =
  //     event.authorEmail?.toLowerCase() || "";

  //   // Author → open Event Details inside the application
  //   if (authorEmail === loggedInUserEmail) {

  //     this.handleViewEvent(event);

  //     return;
  //   }

  //   // Other users → open Event Registration in new tab
  //   const registrationUrl =
  //     `https://bharatpetroleum.sharepoint.com/sites/dev-corporate-publishing-hub/SitePages/EventRegistration.aspx?EventID=${event.id}`;

  //   window.open(
  //     registrationUrl,
  //     "_blank",
  //     "noopener,noreferrer"
  //   );
  // };

  private handleViewEventClick = (
    event: IEventItem
  ): void => {

    const loggedInUserEmail: string =
      this.props.context.pageContext.user.email.toLowerCase();

    // Created By
    const authorEmail =
      event.authorEmail?.toLowerCase() || "";

    // Single EventOrganiser
    const eventOrganiserEmail =
      event.eventOrganiserEmail?.toLowerCase() || "";

    // Multiple Organiser users
    const organiserEmails =
      event.organiserEmails || [];

    // Check all three fields
    const isEventOwner =
      authorEmail === loggedInUserEmail ||
      eventOrganiserEmail === loggedInUserEmail ||
      organiserEmails.includes(loggedInUserEmail);

    // Event owner → Internal Event Details
    if (isEventOwner) {

      this.handleViewEvent(event);

      return;
    }

    // Other users → Event Registration in new tab
    const registrationUrl =
      `https://bharatpetroleum.sharepoint.com/sites/dev-corporate-publishing-hub/SitePages/EventRegistration.aspx?EventID=${event.id}`;

    window.open(
      registrationUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };
  private handleViewEvent = (event: IEventItem): void => {

    this.setState({
      showEventDetails: true,
      selectedEventId: event.id,
      selectedEventTitle: event.eventName,

      selectedEventHasSubEvents: event.hasSubEvents,
      selectedEventHasStages: event.hasStages,

      eventDetailsInitialTab: "About"
    });

  };





  private handleBack = (): void => {

    this.setState({
      showCreateEvent: false,
      showEventDetails: false,
      showDocumentSubmission: false,
      selectedEventId: null,
      selectedEventTitle: '',

      selectedEventHasSubEvents: false,
      selectedEventHasStages: false,
      showParticipantDetails: false,
      selectedParticipantItemId: null
    });

    this.loadEvents();
  };
  private handleOpenCancel = (
    event: IEventItem
  ): void => {

    this.setState({
      selectedEvent: event,
      showCancelModal: true
    });

  };

  private handleCloseCancel = (): void => {

    if (this.state.isCancelling) {
      return;
    }

    this.setState({
      showCancelModal: false,
      selectedEvent: null
    });

  };

  private handleCancelEvent = async (): Promise<void> => {

    const selectedEvent: IEventItem | null =
      this.state.selectedEvent;

    if (!selectedEvent) {
      return;
    }

    try {

      this.setState({
        isCancelling: true
      });

      console.log(
        "Cancelling event:",
        selectedEvent
      );

      await this.eventService.cancelEvent(
        selectedEvent.id
      );

      this.setState((prevState) => ({
        eventList: prevState.eventList.map(
          (event: IEventItem): IEventItem => {

            if (event.id === selectedEvent.id) {

              return {
                ...event,
                status: "Cancelled"
              };

            }

            return event;
          }
        ),

        showCancelModal: false,
        selectedEvent: null,
        isCancelling: false
      }));

    } catch (error) {

      console.error(
        "Error cancelling event:",
        error
      );

      this.setState({
        isCancelling: false
      });


    }

  };

  private handleDeleteEvent = async (
    event: IEventItem
  ): Promise<void> => {

    const confirmed: boolean = window.confirm(
      `Are you sure you want to delete "${event.eventName}"?`
    );

    if (!confirmed) {
      return;
    }

    try {

      this.setState({
        isCancelling: true
      });

      await this.eventService.deleteEvent(
        event.id
      );

      // Remove deleted event from current list
      this.setState((prevState) => ({
        eventList: prevState.eventList.filter(
          (item: IEventItem): boolean =>
            item.id !== event.id
        ),
        isCancelling: false
      }));

      console.log(
        "Event deleted successfully:",
        event.id
      );

    } catch (error) {

      console.error(
        "Error deleting event:",
        error
      );

      this.setState({
        isCancelling: false
      });

      window.alert(
        "Unable to delete the event. Please try again."
      );
    }
  };

  private handleDocumentSubmission = (
    event: IEventItem
  ): void => {

    this.setState({
      showDocumentSubmission: true,
      selectedEventId: event.id
    });

  };

  private handleParticipantView = async (
    event: IEventItem
  ): Promise<void> => {

    try {

      this.setState({
        isLoading: true
      });

      const participantItemId =
        await this.eventService
          .getMyParticipantItemForEvent(event.id);

      this.setState({
        showEventDetails: false,
        showParticipantDetails: true,
        selectedParticipantItemId: participantItemId,
        eventDetailsInitialTab: "Participants",
        participantDetailsFromEventDetails: false
      });

    } catch (error) {

      console.error(
        "Error opening participant details:",
        error
      );

      alert(
        "Unable to load participant details."
      );

    } finally {

      this.setState({
        isLoading: false
      });

    }
  };

  private handleViewParticipantDetails = (
    participantItemId: number,
    returnTab: string = "Participants"
  ): void => {
    this.setState({
      showEventDetails: false,
      showParticipantDetails: true,
      selectedParticipantItemId: participantItemId,
      eventDetailsInitialTab: returnTab,
      participantDetailsFromEventDetails: true
    });
  };

  private handleBackFromParticipantDetails = (): void => {
    if (this.state.participantDetailsFromEventDetails) {
      this.setState({
        showParticipantDetails: false,
        selectedParticipantItemId: null,
        showEventDetails: true,

        participantDetailsFromEventDetails: false
      });
    } else {
      this.setState({
        showParticipantDetails: false,
        selectedParticipantItemId: null,
        showEventDetails: false,
        participantDetailsFromEventDetails: false
      });
    }
  };

  private getStatusClass = (
    status: string
  ): string => {

    switch (status) {

      case 'Draft':
        return 'bg-secondary';

      case 'Created':
        return 'bg-dark';

      case 'Registration Open':
        return 'bg-success';

      case 'Registration Closed':
        return 'bg-warning text-dark';

      case 'Ongoing':
        return 'bg-primary';

      case 'Doc Submission Open':
        return 'bg-info text-dark';

      case 'Results Pending':
        return 'bg-warning text-dark';

      case 'Completed':
        return 'bg-success';

      case 'Canceled':
      case 'Cancelled':
        return 'bg-danger';

      default:
        return 'bg-secondary';

    }

  };

  private getPageSizeOptions = (
    totalRecords: number
  ): number[] => {

    if (totalRecords <= 0) {
      return [10];
    }

    const defaultSizes: number[] = [
      10,
      20,
      50,
      100
    ];

    const options: number[] =
      defaultSizes.filter(
        (size: number): boolean =>
          size <= totalRecords
      );

    /*
     * Always include the first page size
     * greater than the total records.
     */
    const nextSize: number | undefined =
      defaultSizes.find(
        (size: number): boolean =>
          size > totalRecords
      );

    if (
      nextSize !== undefined &&
      options.indexOf(nextSize) === -1
    ) {
      options.push(nextSize);
    }

    /*
     * If total records are greater than
     * all default sizes, add total records.
     */
    if (
      totalRecords >
      defaultSizes[
      defaultSizes.length - 1
      ]
    ) {
      options.push(totalRecords);
    }

    return options;
  };

  public render(): React.ReactElement<IBpclEventManagementProps> {


    if (this.state.showCreateEvent) {
      return (
        <CreateEvent
          onBack={this.handleBack}
          context={this.props.context}
          eventId={this.state.selectedEventId || undefined}
          isEditMode={this.state.selectedEventId !== null}
          editSource={this.state.editSource || undefined}
        />
      );
    }

    if (this.state.showEventDetails) {
      return (
        <EventDetails
          eventId={this.state.selectedEventId || undefined}
          eventTitle={this.state.selectedEventTitle}
          hasSubEvents={this.state.selectedEventHasSubEvents}
          hasStages={this.state.selectedEventHasStages}
          context={this.props.context}
          onBack={this.handleBack}
          onEdit={this.handleEditEventFromDetails}
          onViewParticipantDetails={this.handleViewParticipantDetails}
          initialActiveTab={this.state.eventDetailsInitialTab}
        />
      );
    }

    if (this.state.showDocumentSubmission) {
      return (
        <DocumentSubmission
          eventId={this.state.selectedEventId || undefined}
          context={this.props.context}
          onBack={this.handleBack}
        />
      );

    }

    if (this.state.showParticipantDetails) {
      return (
        <BpclEventParticipantDetails
          participantItemId={
            this.state.selectedParticipantItemId || 0
          }
          context={this.props.context}
          onBack={this.handleBackFromParticipantDetails}
        />
      );
    }



    /**
     * ---------------------------------------------------------
     * FILTER EVENTS
     * ---------------------------------------------------------
     */
    const loggedInUserEmail: string =
      this.props.context.pageContext.user.email.toLowerCase();

    const searchText: string =
      this.state.searchText.trim().toLowerCase();

    const filteredEvents: IEventItem[] =
      this.state.eventList.filter(
        (event: IEventItem): boolean => {

          // Draft events are visible only to the Author
          if (
            event.status === "Draft" &&
            event.authorEmail?.toLowerCase() !== loggedInUserEmail
          ) {
            return false;
          }

          // Search by Event Name
          if (
            searchText &&
            !event.eventName
              .toLowerCase()
              .includes(searchText)
          ) {
            return false;
          }

          return true;
        }
      );

    const statusCounts: {
      [key: string]: number;
    } = {};

    this.state.eventList.forEach(
      (event: IEventItem): void => {

        const status: string =
          event.status || 'Unknown';

        if (
          statusCounts[status] === undefined
        ) {
          statusCounts[status] = 0;
        }

        statusCounts[status]++;
      }
    );

    /**
         * ---------------------------------------------------------
         * Pagination Logic
         * ---------------------------------------------------------
         */
    const totalRecords: number =
      filteredEvents.length;

    const pageSizeOptions: number[] =
      this.getPageSizeOptions(totalRecords);

    const totalPages: number =
      Math.max(
        1,
        Math.ceil(
          totalRecords /
          this.state.pageSize
        )
      );

    const startIndex: number =
      (this.state.currentPage - 1) *
      this.state.pageSize;

    const endIndex: number =
      startIndex +
      this.state.pageSize;

    const paginatedEvents: IEventItem[] =
      filteredEvents.slice(
        startIndex,
        endIndex
      );


    return (

      <div className={styles.pageContainer}>

        {/* ============================= */}
        {/* Banner */}
        {/* ============================= */}

        <div className={styles.banner}>

          <div className={styles.bannerIcon}>

            <i className="bi bi-calendar-event" />

          </div>


          <div className="flex-grow-1">

            <h3>
              Events
            </h3>

            <p>
              Browse upcoming events, workshops,
              conferences and register before the
              closing date.
            </p>

          </div>


          {/* Create Event */}

          <Button
            variant="light"
            className={styles.createEventBtn}
            title="Create Event"
            onClick={this.handleCreateEvent}
          >

            <i className="bi bi-plus-circle me-2" />

            Create Event

          </Button>

        </div>


        {/* ============================= */}
        {/* Summary Cards */}
        {/* ============================= */}

        <div className={styles.summarySection}>

          <Row className="g-3">

            {/* All Events */}

            <Col xl={2} lg={4} md={6}>

              <Card className={styles.summaryCard}>

                <Card.Body>

                  <div className={styles.cardHeader}>

                    <div
                      className={`${styles.iconCircle} ${styles.primaryIcon}`}
                    >

                      <i className="bi bi-calendar-event-fill" />

                    </div>


                    <div className={styles.cardContent}>

                      <h3>
                        {this.state.eventList.length}
                      </h3>

                      <span>
                        All Events
                      </span>

                    </div>

                  </div>

                </Card.Body>

              </Card>

            </Col>


            {/* Draft */}

            <Col xl={2} lg={4} md={6}>

              <Card className={styles.summaryCard}>

                <Card.Body>

                  <div className={styles.cardHeader}>

                    <div
                      className={`${styles.iconCircle} ${styles.secondaryIcon}`}
                    >

                      <i className="bi bi-file-earmark-text" />

                    </div>


                    <div className={styles.cardContent}>

                      <h3>
                        {statusCounts['Draft'] || 0}
                      </h3>

                      <span>
                        Draft
                      </span>

                    </div>

                  </div>

                </Card.Body>

              </Card>

            </Col>


            {/* Registration Open */}

            <Col xl={2} lg={4} md={6}>

              <Card className={styles.summaryCard}>

                <Card.Body>

                  <div className={styles.cardHeader}>

                    <div
                      className={`${styles.iconCircle} ${styles.successIcon}`}
                    >

                      <i className="bi bi-unlock-fill" />

                    </div>


                    <div className={styles.cardContent}>

                      <h3>
                        {statusCounts['Registration Open'] || 0}
                      </h3>

                      <span>
                        Registration Open
                      </span>

                    </div>

                  </div>

                </Card.Body>

              </Card>

            </Col>


            {/* Registration Closed */}

            <Col xl={2} lg={4} md={6}>

              <Card className={styles.summaryCard}>

                <Card.Body>

                  <div className={styles.cardHeader}>

                    <div
                      className={`${styles.iconCircle} ${styles.warningIcon}`}
                    >

                      <i className="bi bi-lock-fill" />

                    </div>


                    <div className={styles.cardContent}>

                      <h3>
                        {statusCounts['Registration Closed'] || 0}
                      </h3>

                      <span>
                        Registration Closed
                      </span>

                    </div>

                  </div>

                </Card.Body>

              </Card>

            </Col>


            {/* Completed */}

            <Col xl={2} lg={4} md={6}>

              <Card className={styles.summaryCard}>

                <Card.Body>

                  <div className={styles.cardHeader}>

                    <div
                      className={`${styles.iconCircle} ${styles.primaryIcon}`}
                    >

                      <i className="bi bi-check2-circle" />

                    </div>


                    <div className={styles.cardContent}>

                      <h3>
                        {statusCounts['Completed'] || 0}
                      </h3>

                      <span>
                        Completed
                      </span>

                    </div>

                  </div>

                </Card.Body>

              </Card>

            </Col>


            {/* Cancelled */}

            <Col xl={2} lg={4} md={6}>

              <Card className={styles.summaryCard}>

                <Card.Body>

                  <div className={styles.cardHeader}>

                    <div
                      className={`${styles.iconCircle} ${styles.dangerIcon}`}
                    >

                      <i className="bi bi-x-circle-fill" />

                    </div>


                    <div className={styles.cardContent}>

                      <h3>
                        {(statusCounts['Cancelled'] || 0)}
                      </h3>

                      <span>
                        Cancelled
                      </span>

                    </div>

                  </div>

                </Card.Body>

              </Card>

            </Col>

          </Row>

        </div>


        {/* ============================= */}
        {/* Event List */}
        {/* ============================= */}

        <div className="mx-4 my-4">

          <Card className={styles.listCard}>

            <Card.Body>

              {/* Search */}

              <Row className="gx-2 gy-2 align-items-end mb-4">

                <Col xl={5} lg={6} md={8} sm={10}>

                  <Form.Control
                    type="text"
                    value={this.state.searchText}
                    onChange={
                      (
                        e: React.ChangeEvent<HTMLInputElement>
                      ): void => {

                        this.setState({
                          searchText: e.target.value,
                          currentPage: 1
                        });

                      }
                    }
                    placeholder="Search by Event Name"
                  />

                </Col>

              </Row>


              {/* Event Table */}

              <div className="table-responsive">

                <Table
                  hover
                  className={styles.listTable}
                >

                  <thead>

                    <tr>

                      <th>
                        Event Name
                      </th>

                      <th>
                        No. of Sub Events
                      </th>

                      <th>
                        Event Owner
                      </th>

                      <th>
                        Event Date
                      </th>

                      <th>
                        Registration Date
                      </th>

                      <th>
                        Status
                      </th>

                      <th className="text-center">
                        Actions
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {/* Loading */}

                    {this.state.isLoading ? (

                      <tr>

                        <td
                          colSpan={7}
                          className="text-center py-4"
                        >

                          <div
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          />

                          Loading events...

                        </td>

                      </tr>

                    ) : filteredEvents.length > 0 ? (

                      paginatedEvents.map(
                        (event: IEventItem) => (

                          <tr key={event.id}>

                            {/* Event Name */}

                            <td>

                              <div className="fw-semibold">

                                {event.eventName}

                              </div>

                            </td>


                            {/* Sub Events */}

                            <td className="text-center">

                              {event.subEvents}

                            </td>


                            {/* Owner */}

                            <td>

                              {event.eventOwner}

                            </td>


                            {/* Event Date */}

                            <td>
                              <div className="text-nowrap">
                                {event.eventFromDate === event.eventToDate
                                  ? event.eventFromDate
                                  : (
                                    <>
                                      {event.eventFromDate}
                                      <div className="text-muted small">
                                        to {event.eventToDate}
                                      </div>
                                    </>
                                  )}
                              </div>
                            </td>


                            {/* Registration Date */}

                            <td>

                              <div className="text-nowrap">

                                {event.registrationFromDate}

                              </div>

                              <div className="text-muted small">

                                to {event.registrationToDate}

                              </div>

                            </td>


                            {/* Status */}

                            <td>

                              <span
                                className={`badge ${this.getStatusClass(
                                  event.status
                                )}`}
                              >

                                {event.status}

                              </span>

                            </td>


                            {/* Actions */}

                            {/* Actions */}

                            <td>

                              <div className="d-flex justify-content-start gap-1">

                                {/* DRAFT - AUTHOR ONLY */}
                                {event.status === "Draft" &&
                                  event.authorEmail?.toLowerCase() === loggedInUserEmail && (

                                    <>
                                      {/* Edit */}
                                      <Button
                                        variant="light"
                                        size="sm"
                                        title="Edit Event"
                                        onClick={() => this.handleEditEvent(event)}
                                      >
                                        <i className="bi bi-pencil text-primary" />
                                      </Button>

                                      {/* Delete */}
                                      <Button
                                        variant="light"
                                        size="sm"
                                        title="Delete Event"
                                        onClick={() => this.handleDeleteEvent(event)}
                                      >
                                        <i className="bi bi-trash text-danger" />
                                      </Button>
                                    </>

                                  )}

                                {/* NON-DRAFT EVENTS */}
                                {event.status !== "Draft" && (

                                  <>

                                    {/* View */}
                                    <Button
                                      variant="light"
                                      size="sm"
                                      title="View Event"
                                      onClick={() => this.handleViewEventClick(event)}
                                    >
                                      <i className="bi bi-eye-fill text-primary" />
                                    </Button>

                                    {/* Participant View */}
                                    {event.participantItemId !== null && (
                                      <Button
                                        variant="light"
                                        size="sm"
                                        title="Participant View"
                                        onClick={() =>
                                          void this.handleParticipantView(event)
                                        }
                                      >
                                        <i className="bi bi-people-fill text-secondary" />
                                      </Button>
                                    )}

                                    {/* Cancel */}

                                    {event.status !== "Draft" &&
                                      event.status !== "Cancelled" &&
                                      event.status !== "Completed" &&
                                      event.authorEmail?.toLowerCase() === loggedInUserEmail && (

                                        <Button
                                          variant="light"
                                          size="sm"
                                          title="Cancel Event"
                                          onClick={() => this.handleOpenCancel(event)}
                                        >
                                          <i className="bi bi-x-circle-fill text-danger" />
                                        </Button>

                                      )}

                                    {/* Document Submission */}
                                    {/* Document Submission */}

                                    {event.hasStages &&
                                      event.status !== "Draft" &&
                                      event.status !== "Completed" &&
                                      event.status !== "Cancelled" && (

                                        <Button
                                          variant="light"
                                          size="sm"
                                          title="Document Submission"
                                          onClick={() => this.handleDocumentSubmission(event)}
                                        >
                                          <i className="bi bi-file-earmark-text-fill text-success" />
                                        </Button>

                                      )}

                                  </>

                                )}

                              </div>

                            </td>

                          </tr>

                        )
                      )

                    ) : (

                      <tr>

                        <td
                          colSpan={7}
                          className="text-center py-4 text-muted"
                        >

                          No events found

                        </td>

                      </tr>

                    )}

                  </tbody>

                </Table>

              </div>


              {/* ============================= */}
              {/* Pagination */}
              {/* ============================= */}

              <div className={styles.paginationSection}>

                <div className={styles.leftPagination}>

                  <span className={styles.pageInfo}>

                    Page {this.state.currentPage} of {totalPages}

                  </span>


                  <Form.Select
                    className={styles.pageSize}
                    value={this.state.pageSize}
                    onChange={(
                      e: React.ChangeEvent<HTMLSelectElement>
                    ): void => {

                      this.setState({
                        pageSize: Number(e.target.value),
                        currentPage: 1
                      });

                    }}
                  >

                    {pageSizeOptions.map(
                      (size: number) => (

                        <option
                          key={size}
                          value={size}
                        >
                          {size} per page
                        </option>

                      )
                    )}

                  </Form.Select>

                </div>


                <Pagination
                  className="mb-0 justify-content-end flex-wrap"
                >

                  {/* First Page */}

                  <Pagination.First
                    disabled={
                      this.state.currentPage === 1
                    }
                    onClick={(): void => {

                      this.setState({
                        currentPage: 1
                      });

                    }}
                  />


                  {/* Previous Page */}

                  <Pagination.Prev
                    disabled={
                      this.state.currentPage === 1
                    }
                    onClick={(): void => {

                      if (this.state.currentPage > 1) {

                        this.setState({
                          currentPage:
                            this.state.currentPage - 1
                        });

                      }

                    }}
                  />


                  {/* Page Numbers */}

                  {Array.from(
                    {
                      length: totalPages
                    },
                    (
                      _,
                      index: number
                    ) => {

                      const pageNumber: number =
                        index + 1;

                      return (

                        <Pagination.Item
                          key={pageNumber}
                          active={
                            this.state.currentPage ===
                            pageNumber
                          }
                          onClick={(): void => {

                            this.setState({
                              currentPage:
                                pageNumber
                            });

                          }}
                        >

                          {pageNumber}

                        </Pagination.Item>

                      );

                    }
                  )}


                  {/* Next Page */}

                  <Pagination.Next
                    disabled={
                      this.state.currentPage === totalPages
                    }
                    onClick={(): void => {

                      if (
                        this.state.currentPage <
                        totalPages
                      ) {

                        this.setState({
                          currentPage:
                            this.state.currentPage + 1
                        });

                      }

                    }}
                  />


                  {/* Last Page */}

                  <Pagination.Last
                    disabled={
                      this.state.currentPage === totalPages
                    }
                    onClick={(): void => {

                      this.setState({
                        currentPage: totalPages
                      });

                    }}
                  />

                </Pagination>

              </div>

            </Card.Body>

          </Card>

        </div>
        <CancelEvent
          show={this.state.showCancelModal}
          event={this.state.selectedEvent}
          onClose={this.handleCloseCancel}
          onConfirm={this.handleCancelEvent}
          isCancelling={this.state.isCancelling}
        />

      </div>

    );

  }

}