import * as React from 'react';
import styles from './BpclEventManagement.module.scss';
import type { IBpclEventManagementProps } from './IBpclEventManagementProps';
import CreateEvent from './CreateEvent';
import CancelEvent from './CancelEvent';
import EventDetails from './EventDetails';

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
  showCancelModal: boolean;
  searchText: string;
  selectedEvent: IEventItem | null;
  selectedEventId: number | null;
  selectedEventTitle: string;
  selectedEventHasSubEvents: boolean;
  selectedEventHasStages: boolean;
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
      showCancelModal: false,
      searchText: '',
      selectedEvent: null,
      selectedEventId: null,
      selectedEventTitle: '',
      selectedEventHasSubEvents: false,
      selectedEventHasStages: false,
      eventList: [],
      isLoading: true,
      isCancelling: false,
      pageSize: 10,
      currentPage: 1

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
      selectedEventId: null
    });

  };



  private handleEditEvent = (event: IEventItem): void => {

    this.setState({
      showCreateEvent: true,
      selectedEventId: event.id
    });

  };

  private handleViewEvent = (event: IEventItem): void => {

    this.setState({
      showEventDetails: true,
      selectedEventId: event.id,
      selectedEventTitle: event.eventName,

      selectedEventHasSubEvents: event.hasSubEvents,
      selectedEventHasStages: event.hasStages
    });

  };

  private handleBack = (): void => {

    this.setState({
      showCreateEvent: false,
      showEventDetails: false,

      selectedEventId: null,
      selectedEventTitle: '',

      selectedEventHasSubEvents: false,
      selectedEventHasStages: false
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
        />
      );
    }



    /**
     * ---------------------------------------------------------
     * FILTER EVENTS
     * ---------------------------------------------------------
     */
    const filteredEvents: IEventItem[] =
      this.state.eventList.filter(
        (event: IEventItem): boolean => {

          return event.eventName
            .toLowerCase()
            .indexOf(
              this.state.searchText.toLowerCase()
            ) !== -1;

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

                                {event.eventFromDate}

                              </div>

                              <div className="text-muted small">

                                to {event.eventToDate}

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

                            <td>

                              <div className="d-flex justify-content-center gap-1">

                                {/* Edit/Draft */}
                                <Button
                                  variant="light"
                                  size="sm"
                                  title="Edit Event"
                                  onClick={() => this.handleEditEvent(event)}
                                >

                                  <i className="bi bi-pencil text-primary" />

                                </Button>

                                {/* View */}

                                <Button
                                  variant="light"
                                  size="sm"
                                  title="View Event"
                                  onClick={() => this.handleViewEvent(event)}
                                >

                                  <i className="bi bi-eye-fill text-primary" />

                                </Button>



                                {/* Participant View */}

                                <Button
                                  variant="light"
                                  size="sm"
                                  title="Participant View"
                                >

                                  <i className="bi bi-people-fill text-secondary" />

                                </Button>


                                {/* Cancel */}

                                {event.status !== 'Completed' &&
                                  event.status !== 'Canceled' &&
                                  event.status !== 'Cancelled' && (

                                    <Button
                                      variant="light"
                                      size="sm"
                                      title="Cancel Event"
                                      onClick={
                                        (): void =>
                                          this.handleOpenCancel(
                                            event
                                          )
                                      }
                                    >

                                      <i className="bi bi-x-circle-fill text-danger" />

                                    </Button>

                                  )}


                                {/* Document Submission */}

                                <Button
                                  variant="light"
                                  size="sm"
                                  title="Document Submission"
                                >

                                  <i className="bi bi-file-earmark-text-fill text-success" />

                                </Button>

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