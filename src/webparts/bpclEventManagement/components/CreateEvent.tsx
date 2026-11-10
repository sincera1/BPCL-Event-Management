import * as React from "react";
import { useState } from "react";
import { Row, Col, Card, Form, Button, Container } from "react-bootstrap";

import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";

import styles from "./CreateEvent.module.scss";
import eventbg1 from "../assets/eventbg1.png";

import "@fontsource/inter";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import CreateEventService from "../Services/CreateEventService";
import { validateCreateEvent } from "../Services/CreateEventValidation";
import { ICreateEventProps } from "./ICreateEventProps";

import {
  PeoplePicker,
  PrincipalType,
  IPeoplePickerContext
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/site-users";


interface ISubEvent {
  id: number;
  sharePointId?: number;
  title: string;
  mandatoryMembers: number;
  description: string;
}



const participantTypes: string[] = [
  "Individual",
  "Team"
];

const rulesTypes: string[] = [
  "Image",
  "Text"
];

const CreateEvent: React.FC<ICreateEventProps> = ({ onBack, context, eventId, isEditMode, editSource }) => {

  const [eventTitle, setEventTitle] = useState<string>("");
  const [eventDescription, setEventDescription] = useState<string>("");

  const [eventStartDate, setEventStartDate] = useState<string>("");
  const [eventEndDate, setEventEndDate] = useState<string>("");


  const [participantType, setParticipantType] = useState<string>("Individual");
  const [hasSubEvents, setHasSubEvents] = useState<boolean>(false);
  const [subEvents, setSubEvents] = useState<ISubEvent[]>([]);
  const [originalSubEventIds, setOriginalSubEventIds] = useState<number[]>([]);
  const [rulesType, setRulesType] = useState<string>("Image");

  const [rulesAndRegualtionText, setRulesAndRegualtionText] =
    useState<string>("");

  const [registrationStartDate, setRegistrationStartDate] =
    useState<string>("");

  const [registrationEndDate, setRegistrationEndDate] =
    useState<string>("");

  const [maxTeamMembers, setMaxTeamMembers] =
    useState<number>(0);

  const [mandatoryMember, setMandatoryMember] =
    useState<number>(0);


  const [eventOwnerId, setEventOwnerId] = React.useState<number>(0);

  const [eventOrganizerDepartment, setEventOrganizerDepartment] =
    useState<string>("");

  const [eventOrganizerEmail, setEventOrganizerEmail] =
    useState<string>("");

  const [eventOrganizerPhoneNumber, setEventOrganizerPhoneNumber] =
    useState<string>("");
  const [selectedOrganisers, setSelectedOrganisers] =
    useState<string[]>([]);
  const [selectedEventOwnerEmail, setSelectedEventOwnerEmail] =
    useState<string>("");

  const [organiserPickerKey, setOrganiserPickerKey] =
    useState<number>(0);

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [eventBannerImage, setEventBannerImage] =
    useState<File | undefined>(undefined);

  const [rulesAndRegualtionImage, setRulesAndRegualtionImage] =
    useState<File | undefined>(undefined);

  const [attachments, setAttachments] =
    useState<File[]>([]);

  const [existingAttachments, setExistingAttachments] =
    useState<{ FileName: string; ServerRelativeUrl: string }[]>([]);

  const [existingEventBannerImage, setExistingEventBannerImage] =
    useState<string>("");


  const [existingRulesImage, setExistingRulesImage] =
    useState<string>("");


  const [successMessage, setSuccessMessage] =
    React.useState<string>("");

  const [validationErrors, setValidationErrors] =
    useState<Record<string, string>>({});
  const [, setEventStatus] = useState<"Draft" | "Created" | "">("");

  const handleHasSubEventsChange = (
    value: boolean
  ): void => {

    setHasSubEvents(value);

    if (value) {

      // Automatically create Subevent 1
      setSubEvents([
        {
          id: 1,
          title: "",
          mandatoryMembers: 0,
          description: ""
        }
      ]);

    } else {

      setSubEvents([]);
    }
  };

  const handleAddSubEvent = (): void => {

    setSubEvents((previousSubEvents) => {

      const nextId =
        previousSubEvents.length + 1;

      return [
        ...previousSubEvents,
        {
          id: nextId,
          title: "",
          mandatoryMembers: 0,
          description: ""
        }
      ];
    });
  };

  const handleDeleteSubEvent = (
    id: number
  ): void => {

    // Subevent 1 cannot be deleted
    if (id === 1) {
      return;
    }

    setSubEvents((previousSubEvents) =>
      previousSubEvents
        .filter(
          (subEvent) =>
            subEvent.id !== id
        )
        .map(
          (subEvent, index) => ({
            ...subEvent,
            id: index + 1
          })
        )
    );
  };

  const handleSubEventChange = (
    id: number,
    field: keyof ISubEvent,
    value: string | number
  ): void => {

    setSubEvents((previousSubEvents) =>
      previousSubEvents.map(
        (subEvent) =>
          subEvent.id === id
            ? {
              ...subEvent,
              [field]: value
            }
            : subEvent
      )
    );
  };

  const clearValidationError = (
    fieldName: string
  ): void => {

    setValidationErrors((previousErrors) => {

      const updatedErrors = {
        ...previousErrors
      };

      delete updatedErrors[fieldName];

      return updatedErrors;
    });
  };

  const handleUpdate = async (
    status?: "Draft" | "Created"
  ): Promise<void> => {
    try {
      // ==========================================
      // 1. VALIDATE UPDATE
      // ==========================================
      // Draft should save without mandatory validation.
      // Created / Update should go through validation.

      if (status !== "Draft") {
        const errors = validateCreateEvent({
          eventTitle,
          eventDescription,
          eventBannerImage,

          isEditMode: true,

          hasExistingEventBannerImage:
            !!existingEventBannerImage,

          hasExistingRulesImage:
            !!existingRulesImage,

          eventStartDate,
          eventEndDate,

          registrationStartDate,
          registrationEndDate,

          eventOwnerId,
          eventOrganizerDepartment,
          eventOrganizerEmail,
          eventOrganizerPhoneNumber,

          rulesType,
          rulesAndRegualtionText,
          rulesAndRegualtionImage,

          hasSubEvents,
          subEvents,

          participantType,
          maxTeamMembers,
          mandatoryMember
        });

        setValidationErrors(errors);

        if (Object.keys(errors).length > 0) {
          console.log(
            "Update validation failed:",
            errors
          );
          return;
        }
      } else {
        // Clear any previous validation errors
        setValidationErrors({});
      }

      // ==========================================
      // 2. CHECK EVENT ID
      // ==========================================

      if (!eventId) {
        throw new Error(
          "Event ID is missing in Edit Mode."
        );
      }

      // ==========================================
      // 3. CREATE SERVICE
      // ==========================================

      const eventService =
        new CreateEventService(context);

      console.log(
        "========== UPDATE EVENT =========="
      );

      console.log(
        "Updating Event ID:",
        eventId
      );

      console.log(
        "Update Status:",
        status
      );

      // ==========================================
      // 4. UPDATE MAIN EVENT
      // ==========================================

      const updateEventData = {
        EventTitle: eventTitle,

        EventDescription: eventDescription,

        EventStartDate: eventStartDate,

        EventEndDate: eventEndDate,

        EventParticipantType: participantType,

        HasSubEvents: hasSubEvents,

        NoofSubEvents: hasSubEvents
          ? subEvents.length
          : 0,

        EventBannerImage: eventBannerImage,

        RulesAndRegualtionType: rulesType,

        RulesAndRegualtionText:
          rulesAndRegualtionText,

        RulesAndRegualtionImage:
          rulesAndRegualtionImage,

        RegistrationStartDate:
          registrationStartDate,

        RegistrationEndDate:
          registrationEndDate,

        MaxTeamMembers:
          maxTeamMembers,

        MandatoryMember:
          mandatoryMember,

        EventOrganiser:
          eventOwnerId,
        Organisers: selectedOrganisers,

        EventOrganizerDepartment:
          eventOrganizerDepartment,

        EventOrganizerEmail:
          eventOrganizerEmail,

        EventOrganizerPhoneNumber:
          eventOrganizerPhoneNumber,

        Attachments: attachments
      };

      console.log(
        "Update Event Data:",
        updateEventData
      );

      await eventService.updateEvent(
        eventId,
        updateEventData,
        status
      );

      // ==========================================
      // 5. HANDLE SUBEVENTS
      // ==========================================

      const currentSubEventIds =
        subEvents
          .filter(
            (subEvent) =>
              subEvent.sharePointId !== undefined
          )
          .map(
            (subEvent) =>
              subEvent.sharePointId!
          );

      // ==========================================
      // 6. DELETE REMOVED SUBEVENTS
      // ==========================================

      const deletedSubEventIds =
        originalSubEventIds.filter(
          (originalId) =>
            currentSubEventIds.indexOf(
              originalId
            ) === -1
        );

      for (
        const deletedId of deletedSubEventIds
      ) {
        await eventService.deleteSubEvent(
          deletedId
        );
      }

      // ==========================================
      // 7. UPDATE EXISTING / CREATE NEW SUBEVENTS
      // ==========================================

      if (
        hasSubEvents &&
        subEvents.length > 0
      ) {
        for (
          const subEvent of subEvents
        ) {
          const subEventData = {
            SubEventTitle:
              subEvent.title,

            SubEventDescription:
              subEvent.description,

            MinimumMembersRequired:
              subEvent.mandatoryMembers
          };

          // Existing subevent
          if (subEvent.sharePointId) {
            await eventService.updateSubEvent(
              subEvent.sharePointId,
              subEventData
            );
          }

          // New subevent
          else {
            await eventService.createSingleSubEvent(
              eventId,
              eventTitle,
              subEventData
            );
          }
        }
      }

      // ==========================================
      // 8. SUCCESS
      // ==========================================

      setSuccessMessage(
        status === "Draft"
          ? "Event Saved Successfully"
          : "Event Updated Successfully"
      );

      setIsSubmitted(true);

    } catch (error) {
      console.error(
        "Error updating event:",
        error
      );

      setIsSubmitted(false);
    }
  };


  const handleSubmit = async (
    status: "Draft" | "Created"
  ): Promise<void> => {
    try {
      // ==========================================
      // VALIDATION
      // Submit -> Validate in BOTH Create and Edit mode
      // Draft  -> Do not validate
      // ==========================================
      if (status === "Created") {
        const errors = validateCreateEvent({
          eventTitle,
          eventDescription,
          eventBannerImage,
          isEditMode,
          hasExistingEventBannerImage: !!existingEventBannerImage,
          hasExistingRulesImage: !!existingRulesImage,
          eventStartDate,
          eventEndDate,
          registrationStartDate,
          registrationEndDate,
          eventOwnerId,
          eventOrganizerDepartment,
          eventOrganizerEmail,
          eventOrganizerPhoneNumber,
          rulesType,
          rulesAndRegualtionText,
          rulesAndRegualtionImage,
          hasSubEvents,
          subEvents,
          participantType,
          maxTeamMembers,
          mandatoryMember
        });

        setValidationErrors(errors);

        // Stop here if validation fails
        if (Object.keys(errors).length > 0) {
          console.log("Validation failed:", errors);
          return;
        }
      }

      // ==========================================
      // EDIT MODE
      // ==========================================
      if (isEditMode) {
        if (!eventId) {
          throw new Error("Event ID is missing in Edit Mode.");
        }

        // Draft -> save as Draft
        // Submit -> update existing Draft as Created
        await handleUpdate(status);

        setSuccessMessage(
          status === "Draft"
            ? "Event Saved Successfully"
            : "Event Created Successfully"
        );

        setIsSubmitted(true);

        return;
      }

      // ==========================================
      // CREATE NEW EVENT
      // ==========================================
      const eventService = new CreateEventService(context);

      const eventData = {
        EventTitle: eventTitle,
        EventDescription: eventDescription,
        EventStartDate: eventStartDate,
        EventEndDate: eventEndDate,
        EventParticipantType: participantType,
        HasSubEvents: hasSubEvents,
        NoofSubEvents: hasSubEvents ? subEvents.length : 0,
        EventBannerImage: eventBannerImage,
        RulesAndRegualtionType: rulesType,
        RulesAndRegualtionText: rulesAndRegualtionText,
        RulesAndRegualtionImage: rulesAndRegualtionImage,
        RegistrationStartDate: registrationStartDate,
        RegistrationEndDate: registrationEndDate,
        MaxTeamMembers: maxTeamMembers,
        MandatoryMember: mandatoryMember,
        EventOrganiser: eventOwnerId,
        Organisers: selectedOrganisers,
        EventOrganizerDepartment: eventOrganizerDepartment,
        EventOrganizerEmail: eventOrganizerEmail,
        EventOrganizerPhoneNumber: eventOrganizerPhoneNumber,
        Attachments: attachments,
        OverAllEventStatus: status
      };

      const savedEventId = await eventService.createEvent(eventData);

      console.log(
        "Main Event created successfully. Event ID:",
        savedEventId
      );

      // ==========================================
      // CREATE SUBEVENTS
      // ==========================================
      if (hasSubEvents && subEvents.length > 0) {
        const subEventData = subEvents.map((subEvent) => ({
          SubEventTitle: subEvent.title,
          SubEventDescription: subEvent.description,
          MinimumMembersRequired: subEvent.mandatoryMembers
        }));

        await eventService.createSubEvents(
          savedEventId,
          eventTitle,
          subEventData
        );
      }

      // ==========================================
      // SUCCESS
      // ==========================================
      setSuccessMessage(
        status === "Draft"
          ? "Event Saved Successfully"
          : "Event Created Successfully"
      );

      setIsSubmitted(true);

    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  const removeFile = (index: number): void => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);

    setSelectedFiles(updatedFiles);

    if (updatedFiles.length === 0) {
      const fileInput = document.getElementById(
        "eventDocUpload"
      ) as HTMLInputElement;

      if (fileInput) {
        fileInput.value = "";
      }
    }
  };


  const currentUserEmail =
    context.pageContext.user.email;

  const peoplePickerContext: IPeoplePickerContext = {
    absoluteUrl:
      context.pageContext.web.absoluteUrl,

    msGraphClientFactory:
      context.msGraphClientFactory,

    spHttpClient:
      context.spHttpClient
  };


  const loadEventDetails = async (
    id: number
  ): Promise<void> => {

    try {

      console.log(
        "========== EDIT EVENT =========="
      );

      console.log(
        "Loading Event ID:",
        id
      );

      const eventService =
        new CreateEventService(context);

      const eventDetails =
        await eventService.getEventDetails(id);
      setEventStatus(eventDetails.OverAllEventStatus || "");

      console.log(
        "Event Details Loaded:",
        eventDetails
      );


      /* =====================================================
         BASIC DETAILS
      ===================================================== */

      setEventTitle(
        eventDetails.EventTitle || ""
      );

      setEventDescription(
        eventDetails.EventDescription || ""
      );


      /* =====================================================
         EVENT TYPE
      ===================================================== */

      setParticipantType(
        eventDetails.EventParticipantType ||
        "Individual"
      );

      setHasSubEvents(
        eventDetails.HasSubEvents
      );


      /* =====================================================
         EVENT DATES
      ===================================================== */

      setEventStartDate(
        eventDetails.EventStartDate || ""
      );

      setEventEndDate(
        eventDetails.EventEndDate || ""
      );


      /* =====================================================
         RULES & REGULATIONS
      ===================================================== */

      setRulesType(
        eventDetails.RulesAndRegualtionType ||
        "Image"
      );

      setRulesAndRegualtionText(
        eventDetails.RulesAndRegualtionText ||
        ""
      );


      /* =====================================================
         REGISTRATION
      ===================================================== */

      setRegistrationStartDate(
        eventDetails.RegistrationStartDate || ""
      );

      setRegistrationEndDate(
        eventDetails.RegistrationEndDate || ""
      );


      /* =====================================================
         TEAM / MEMBER SETTINGS
      ===================================================== */

      setMaxTeamMembers(
        Number(
          eventDetails.MaxTeamMembers || 0
        )
      );

      setMandatoryMember(
        Number(
          eventDetails.MandatoryMember || 0
        )
      );


      /* =====================================================
         EVENT OWNER
      ===================================================== */

      setEventOwnerId(
        eventDetails.EventOrganiser || 0
      );

      setEventOrganizerDepartment(
        eventDetails.EventOrganizerDepartment || ""
      );

      setEventOrganizerEmail(
        eventDetails.EventOrganizerEmail || ""
      );

      setEventOrganizerPhoneNumber(
        eventDetails.EventOrganizerPhoneNumber || ""
      );

      setSelectedOrganisers(
        eventDetails.Organisers || []
      );

      setOrganiserPickerKey((prev) => prev + 1);


      /* =====================================================
         EXISTING IMAGES
      ===================================================== */

      setExistingEventBannerImage(
        eventDetails.EventBannerImageUrl || ""
      );

      setExistingRulesImage(
        eventDetails.RulesAndRegualtionImageUrl || ""
      );


      /* =====================================================
         SUB EVENTS
      ===================================================== */

      const mappedSubEvents =
        eventDetails.SubEvents.map(
          (subEvent, index) => ({

            id:
              index + 1,

            sharePointId:
              subEvent.Id,

            title:
              subEvent.SubEventTitle || "",

            mandatoryMembers:
              Number(
                subEvent.MinimumMembersRequired || 0
              ),

            description:
              subEvent.SubEventDescription || ""

          })
        );


      // ==========================================
      // IMPORTANT:
      // Load existing sub-events into the form
      // ==========================================

      setSubEvents(
        mappedSubEvents
      );


      // ==========================================
      // Store original SharePoint sub-event IDs
      // ==========================================

      setOriginalSubEventIds(
        mappedSubEvents
          .filter(
            (subEvent) =>
              subEvent.sharePointId !== undefined
          )
          .map(
            (subEvent) =>
              subEvent.sharePointId!
          )
      );


      /* =====================================================
         EXISTING ATTACHMENTS
      ===================================================== */

      setExistingAttachments(
        eventDetails.Attachments || []
      );


      console.log(
        "Edit Event loaded successfully."
      );


    } catch (error) {

      console.error(
        "Error loading Event for Edit:",
        error
      );

    }

  };



  React.useEffect(() => {

    const loadDefaultEventOwner = async (): Promise<void> => {

      console.log(
        "========== DEFAULT EVENT OWNER =========="
      );

      console.log(
        "currentUserEmail:",
        currentUserEmail
      );

      console.log(
        "context:",
        context
      );

      if (!currentUserEmail) {

        console.log(
          "currentUserEmail is empty. Skipping Event Owner load."
        );

        return;

      }

      try {

        // ==========================================
        // 1. SharePoint User
        // ==========================================

        console.log(
          "Calling ensureUser with:",
          currentUserEmail
        );

        const spUser =
          await sp.web.ensureUser(
            currentUserEmail
          );

        console.log(
          "ensureUser response:",
          spUser.data
        );

        console.log(
          "SharePoint Event Owner ID:",
          spUser.data.Id
        );

        setEventOwnerId(
          spUser.data.Id
        );


        // ==========================================
        // 2. Graph
        // ==========================================

        console.log(
          "Calling Graph for:",
          currentUserEmail
        );

        const eventService =
          new CreateEventService(context);

        const ownerDetails =
          await eventService.getCurrentUserDetails();

        console.log(
          "Graph Event Owner Details:",
          ownerDetails
        );


        // ==========================================
        // 3. Populate fields
        // ==========================================



        setEventOrganizerEmail(
          ownerDetails.email || ""
        );

        setEventOrganizerDepartment(
          ownerDetails.department || ""
        );

        setEventOrganizerPhoneNumber(
          ownerDetails.phoneNumber || ""
        );


        console.log(
          "Default Event Owner fields populated."
        );


      } catch (error) {

        console.error(
          "ERROR loading default Event Owner:",
          error
        );

      }

    };


    // =====================================================
    // CREATE MODE
    // =====================================================

    if (!isEditMode) {

      console.log(
        "Create Mode - Loading default Event Owner"
      );

      loadDefaultEventOwner();

      return;

    }


    // =====================================================
    // EDIT MODE
    // =====================================================

    if (
      isEditMode &&
      eventId
    ) {

      console.log(
        "Edit Mode - Loading Event:",
        eventId
      );

      loadEventDetails(
        eventId
      );

    }

  }, [
    currentUserEmail,
    context,
    eventId,
    isEditMode
  ]);




  return (
    <section className={styles.commonSectionstyle}>

      {/* Banner */}
      <Row className="mb-4">
        <Col xs={12}>
          <div className={styles.bannerContainer}>

            <img
              src={eventbg1}
              alt="Create Event"
              className={styles.bannerImage}
            />

            <div className={styles.bannerOverlay}>

              <button
                type="button"
                className={styles.backBtn}
                onClick={onBack}
              >
                <i className="bi bi-chevron-left"></i>
              </button>

              <div className={styles.bannerContent}>
                <h1>
                  {isEditMode ? "Edit Event" : "Create Event"}
                </h1>

                <p>
                  Plan, organize, and deliver engaging and insightful
                  experiences.
                </p>
              </div>

            </div>
          </div>
        </Col>
      </Row>

      {/* Content */}
      <Container>

        <Row className="mb-4">
          <Col xs={12}>

            <Card className={styles.eventCard}>

              {isSubmitted ? (

                /* ================= SUCCESS ================= */

                <div className={styles.successContainer}>

                  <div className={styles.successCircle}>
                    <i className="bi bi-check-lg"></i>
                  </div>

                  <h2>Thank You!</h2>

                  <h5>
                    {successMessage}
                  </h5>

                  <p>
                    View the Event Details page to see more.
                  </p>

                  <div className={styles.successDivider}></div>

                  <Button
                    type="button"
                    className={styles.homeBtn}
                    onClick={onBack}
                  >
                    <i className="bi bi-house-door me-2"></i>
                    Back
                  </Button>

                </div>

              ) : (

                <>

                  {/* ================= BASIC DETAILS ================= */}

                  <div className={styles.sectionTitle}>
                    <h2 className={styles.subheading}>
                      Basic Details
                    </h2>
                  </div>

                  <Row>

                    {/* Left */}
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Event Title
                          <span className={styles.required}>*</span>
                        </Form.Label>

                        <Form.Control
                          type="text"
                          placeholder="Enter event name / title"
                          className={styles.inputField}
                          value={eventTitle}
                          onChange={(e) => {
                            const value = e.target.value;

                            setEventTitle(value);

                            if (value.trim()) {
                              clearValidationError("eventTitle");
                            }
                          }}
                        />

                        {validationErrors.eventTitle && (
                          <div className={styles.validationError}>
                            {validationErrors.eventTitle}
                          </div>
                        )}
                      </Form.Group>

                      <Form.Group className={styles.inputGroup}>
                        <Form.Label className={styles.inputLabel}>
                          Event Description{" "}
                          <span className={styles.required}>*</span>
                        </Form.Label>

                        <Form.Control
                          as="textarea"
                          rows={5}
                          placeholder="Enter event description"
                          className={styles.inputField}
                          value={eventDescription}
                          onChange={(e) => {

                            const value = e.target.value;

                            setEventDescription(value);

                            if (value.trim()) {
                              clearValidationError("eventDescription");
                            }

                          }}
                        />

                        {validationErrors.eventDescription && (
                          <div className={styles.validationError}>
                            {validationErrors.eventDescription}
                          </div>
                        )}
                      </Form.Group>
                    </Col>

                    {/* Right */}
                    <Col md={6}>

                      <Form.Group className={styles.inputGroupRadio}>
                        <Form.Label className={styles.inputLabel}>
                          Event Participant Type{" "}
                          <span className={styles.required}>*</span>
                        </Form.Label>

                        <div className="mt-2">

                          {participantTypes.map((type: string) => (
                            <Form.Check
                              key={type}
                              inline
                              type="radio"
                              label={type}
                              name="participantType"
                              value={type}
                              checked={participantType === type}
                              onChange={(e) =>
                                setParticipantType(e.target.value)
                              }
                              className={styles.radioBtn}
                            />
                          ))}
                        </div>
                      </Form.Group>

                      <Form.Group className={styles.inputGroupRadio}>
                        <Form.Label className={styles.inputLabel}>
                          Does this Event have Sub-events?{" "}
                          <span className={styles.required}>*</span>
                        </Form.Label>

                        <div className="mt-2">

                          <Form.Check
                            inline
                            type="radio"
                            label="Yes"
                            name="hasSubEvents"
                            checked={hasSubEvents === true}
                            onChange={() =>
                              handleHasSubEventsChange(true)
                            }
                            className={styles.radioBtn}
                          />

                          <Form.Check
                            inline
                            type="radio"
                            label="No"
                            name="hasSubEvents"
                            checked={hasSubEvents === false}
                            onChange={() =>
                              handleHasSubEventsChange(false)
                            }
                            className={styles.radioBtn}
                          />

                        </div>
                      </Form.Group>

                      <Form.Group className={styles.inputGroup}>

                        <Form.Label className={styles.inputLabel}>
                          Event Banner Image{" "}
                          <span className={styles.required}>*</span>
                        </Form.Label>

                        <Form.Control
                          type="file"
                          accept="image/*"
                          className={styles.inputField}
                          onChange={(e) => {

                            const target =
                              e.target as HTMLInputElement;

                            const file =
                              target.files?.[0];

                            if (file) {

                              setEventBannerImage(file);

                              clearValidationError(
                                "eventBannerImage"
                              );

                            }

                          }}
                        />

                        {/* Existing image - Edit mode */}
                        {isEditMode &&
                          existingEventBannerImage &&
                          !eventBannerImage && (

                            <div className="mt-1 text-muted">

                              Existing file:{" "}

                              <strong>
                                {decodeURIComponent(
                                  existingEventBannerImage
                                    .split("/")
                                    .pop() || ""
                                ).replace(
                                  /^\d+_\d+_/,
                                  ""
                                )}
                              </strong>

                            </div>

                          )}

                        {/* Newly selected image */}
                        {eventBannerImage && (

                          <div className="mt-1 text-muted">
                            Selected file:{" "}
                            <strong>
                              {eventBannerImage.name}
                            </strong>
                          </div>

                        )}

                        {validationErrors.eventBannerImage && (
                          <div className={styles.validationError}>
                            {validationErrors.eventBannerImage}
                          </div>
                        )}

                      </Form.Group>

                    </Col>

                  </Row>

                  {/* Event Dates */}
                  <Row>

                    <Col xs={12} md={6}>

                      <Form.Group className={styles.inputGroup}>
                        <Form.Label className={styles.inputLabel}>
                          Event Start Date{" "}
                          <span className={styles.required}>*</span>
                        </Form.Label>

                        <Form.Control
                          type="date"
                          className={styles.inputField}
                          value={eventStartDate}
                          onChange={(e) => {

                            const value = e.target.value;

                            setEventStartDate(value);

                            if (value) {
                              clearValidationError("eventStartDate");
                            }

                          }}
                        />

                        {validationErrors.eventStartDate && (
                          <div className={styles.validationError}>
                            {validationErrors.eventStartDate}
                          </div>
                        )}
                      </Form.Group>

                    </Col>

                    <Col xs={12} md={6}>

                      <Form.Group className={styles.inputGroup}>
                        <Form.Label className={styles.inputLabel}>
                          Event End Date{" "}
                          <span className={styles.required}>*</span>
                        </Form.Label>

                        <Form.Control
                          type="date"
                          className={styles.inputField}
                          value={eventEndDate}
                          disabled={!eventStartDate}
                          onChange={(e) => {

                            const value = e.target.value;

                            setEventEndDate(value);

                            if (value) {
                              clearValidationError("eventEndDate");
                            }

                          }}
                        />

                        {validationErrors.eventEndDate && (
                          <div className={styles.validationError}>
                            {validationErrors.eventEndDate}
                          </div>
                        )}
                      </Form.Group>

                    </Col>

                  </Row>

                  {/* Rules */}
                  <Row>

                    <Col xs={12} md={6}>

                      <Form.Group className={styles.inputGroup}>

                        <Form.Label className={styles.inputLabel}>
                          Rules & Regulations{" "}
                          <span className={styles.required}>*</span>
                        </Form.Label>

                        <div className="mt-2">

                          {rulesTypes.map((type: string) => (
                            <Form.Check
                              key={type}
                              inline
                              type="radio"
                              label={type}
                              name="rulesType"
                              value={type}
                              checked={rulesType === type}
                              onChange={(e) => {

                                const selectedType =
                                  e.target.value;

                                setRulesType(
                                  selectedType
                                );

                                // Image selected
                                if (selectedType === "Image") {

                                  setRulesAndRegualtionText("");

                                }

                                // Text selected
                                if (selectedType === "Text") {

                                  setRulesAndRegualtionImage(
                                    undefined
                                  );

                                }

                              }}
                              className={styles.radioBtn}
                            />
                          ))}

                        </div>

                      </Form.Group>




                      <Form.Group className={styles.inputGroup}>

                        <Form.Label className={styles.inputLabel}>
                          Upload Rules & Regulations Image{" "}
                          <span className={styles.required}>*</span>
                        </Form.Label>

                        <Form.Control
                          type="file"
                          accept="image/*"
                          className={styles.inputField}
                          disabled={rulesType !== "Image"}
                          onChange={(e) => {

                            const target =
                              e.target as HTMLInputElement;

                            const file =
                              target.files?.[0];

                            if (file) {

                              setRulesAndRegualtionImage(file);

                              clearValidationError(
                                "rulesAndRegualtionImage"
                              );

                            }

                          }}
                        />

                        {/* Existing image */}
                        {isEditMode &&
                          rulesType === "Image" &&
                          existingRulesImage &&
                          !rulesAndRegualtionImage && (

                            <div className="mt-1 text-muted">

                              Existing file:{" "}

                              <strong>
                                {decodeURIComponent(
                                  existingRulesImage
                                    .split("/")
                                    .pop() || ""
                                ).replace(
                                  /^\d+_\d+_/,
                                  ""
                                )}
                              </strong>

                            </div>

                          )}

                        {/* Newly selected image */}
                        {rulesAndRegualtionImage && (

                          <div className="mt-1 text-muted">

                            Selected file:{" "}

                            <strong>
                              {rulesAndRegualtionImage.name}
                            </strong>

                          </div>

                        )}

                        {validationErrors.rulesAndRegualtionImage && (

                          <div className={styles.validationError}>
                            {validationErrors.rulesAndRegualtionImage}
                          </div>

                        )}

                      </Form.Group>

                    </Col>


                    <Col xs={12} md={6}>



                      <Form.Group className={styles.inputGroup}>

                        <Form.Label className={styles.inputLabel}>
                          Upload Rules & Regulations{" "}
                          <span className={styles.required}>*</span>
                        </Form.Label>

                        <Form.Control
                          as="textarea"
                          rows={5}
                          placeholder="Enter rules & regulations"
                          className={styles.inputField}
                          value={rulesAndRegualtionText}
                          onChange={(e) => {

                            const value = e.target.value;

                            setRulesAndRegualtionText(value);

                            if (value.trim()) {
                              clearValidationError(
                                "rulesAndRegualtionText"
                              );
                            }

                          }}
                          disabled={rulesType !== "Text"}
                        />

                        {validationErrors.rulesAndRegualtionText && (
                          <div className={styles.validationError}>
                            {validationErrors.rulesAndRegualtionText}
                          </div>
                        )}

                      </Form.Group>

                    </Col>

                  </Row>

                  {/* ================= SUBEVENT DETAILS ================= */}

                  {hasSubEvents && (

                    <>

                      {/* Subevent Section Header */}
                      <div className="d-flex align-items-center">

                        <div className={`${styles.sectionTitle} flex-grow-1`}>

                          <h2 className={styles.subheading}>
                            Provide Subevent Details
                          </h2>

                        </div>

                        <Button
                          type="button"
                          className={`${styles.eventOutlineBtn} ms-3`}
                          onClick={handleAddSubEvent}
                        >
                          <i className="bi bi-plus-circle me-2"></i>
                          Add Subevent
                        </Button>

                      </div>


                      {/* Dynamic Subevents */}
                      {subEvents.map((subEvent: ISubEvent, index: number) => (

                        <React.Fragment key={subEvent.id}>

                          {/* Subevent */}
                          <Row className="align-items-stretch">

                            {/* Left Side */}
                            <Col xs={12} md={4}>

                              <Row>

                                {/* Subevent Name */}
                                <Col xs={12}>

                                  <Form.Group
                                    className={styles.inputGroup}
                                  >

                                    <div className="d-flex align-items-center justify-content-between">

                                      <Form.Label
                                        className={styles.inputLabel}
                                      >
                                        Subevent Name / Title {index + 1}
                                      </Form.Label>

                                      {/* Delete button only from Subevent 2 */}
                                      {index > 0 && (

                                        <button
                                          type="button"
                                          className={styles.deleteSubEventBtn}
                                          onClick={() =>
                                            handleDeleteSubEvent(
                                              subEvent.id
                                            )
                                          }
                                          title={`Delete Subevent ${index + 1}`}
                                        >
                                          <i className="bi bi-trash"></i>
                                        </button>

                                      )}

                                    </div>

                                    <Form.Control
                                      type="text"
                                      placeholder="Enter subevent name / title"
                                      className={styles.inputField}
                                      value={subEvent.title}
                                      onChange={(e) => {

                                        const value = e.target.value;

                                        handleSubEventChange(
                                          subEvent.id,
                                          "title",
                                          value
                                        );

                                        if (value.trim()) {
                                          clearValidationError(
                                            `subEvent_${index}_title`
                                          );
                                        }

                                      }}
                                    />

                                    {validationErrors[`subEvent_${index}_title`] && (
                                      <div className={styles.validationError}>
                                        {validationErrors[`subEvent_${index}_title`]}
                                      </div>
                                    )}

                                  </Form.Group>

                                </Col>


                                {!(
                                  participantType === "Individual" &&
                                  hasSubEvents
                                ) && (
                                    <Col xs={12}>
                                      <Form.Group className={styles.inputGroup}>
                                        <Form.Label className={styles.inputLabel}>
                                          Mandatory Members Subevent
                                        </Form.Label>

                                        <Form.Control
                                          type="number"
                                          min={0}
                                          className={styles.inputField}
                                          value={subEvent.mandatoryMembers}
                                          onChange={(e) => {
                                            const value = Number(e.target.value);

                                            handleSubEventChange(
                                              subEvent.id,
                                              "mandatoryMembers",
                                              value
                                            );

                                            if (value > 0) {
                                              clearValidationError(
                                                `subEvent_${index}_mandatoryMembers`
                                              );
                                            }
                                          }}
                                        />

                                        {validationErrors[
                                          `subEvent_${index}_mandatoryMembers`
                                        ] && (
                                            <div className={styles.validationError}>
                                              {
                                                validationErrors[
                                                `subEvent_${index}_mandatoryMembers`
                                                ]
                                              }
                                            </div>
                                          )}
                                      </Form.Group>
                                    </Col>
                                  )}

                              </Row>

                            </Col>


                            {/* Right Side - Description */}
                            <Col
                              xs={12}
                              md={8}
                              className="d-flex"
                            >

                              <Form.Group
                                className={`${styles.inputGroup} w-100 d-flex flex-column`}
                              >

                                <Form.Label
                                  className={styles.inputLabel}
                                >
                                  Event Description
                                </Form.Label>

                                <Form.Control
                                  as="textarea"
                                  rows={4}
                                  placeholder="Enter event description"
                                  className={`${styles.inputField} flex-grow-1`}
                                  value={subEvent.description}
                                  onChange={(e) =>
                                    handleSubEventChange(
                                      subEvent.id,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                />

                              </Form.Group>

                            </Col>

                          </Row>


                          {/* Horizontal line between subevents */}
                          {index < subEvents.length - 1 && (
                            <hr />
                          )}

                        </React.Fragment>

                      ))}

                    </>

                  )}

                  {/* ================= REGISTRATION SETTINGS ================= */}

                  <div className={styles.sectionTitle}>

                    <h2 className={styles.subheading}>
                      Registration Settings
                    </h2>

                  </div>

                  <Row>

                    <Col xs={12} md={3}>

                      <Form.Group className={styles.inputGroup}>

                        <Form.Label className={styles.inputLabel}>
                          Registration Start Date{" "}
                          <span className={styles.required}>*</span>
                        </Form.Label>

                        <Form.Control
                          type="date"
                          className={styles.inputField}
                          value={registrationStartDate}
                          onChange={(e) => {

                            const value = e.target.value;

                            setRegistrationStartDate(value);

                            if (value) {
                              clearValidationError(
                                "registrationStartDate"
                              );
                            }

                          }}
                        />

                        {validationErrors.registrationStartDate && (
                          <div className={styles.validationError}>
                            {validationErrors.registrationStartDate}
                          </div>
                        )}

                      </Form.Group>

                    </Col>

                    <Col xs={12} md={3}>

                      <Form.Group className={styles.inputGroup}>

                        <Form.Label className={styles.inputLabel}>
                          Registration End Date{" "}
                          <span className={styles.required}>*</span>
                        </Form.Label>

                        <Form.Control
                          type="date"
                          className={styles.inputField}
                          value={registrationEndDate}
                          disabled={!registrationStartDate}
                          onChange={(e) => {

                            const value = e.target.value;

                            setRegistrationEndDate(value);

                            if (value) {
                              clearValidationError(
                                "registrationEndDate"
                              );
                            }

                          }}
                        />

                        {validationErrors.registrationEndDate && (
                          <div className={styles.validationError}>
                            {validationErrors.registrationEndDate}
                          </div>
                        )}

                      </Form.Group>

                    </Col>

                    {participantType === "Team" && (
                      <>

                        <Col xs={12} md={3}>
                          <Form.Group className={styles.inputGroup}>

                            <Form.Label className={styles.inputLabel}>
                              Maximum Member Allowed In Team{" "}
                              <span className={styles.required}>*</span>
                            </Form.Label>

                            <Form.Control
                              type="number"
                              placeholder="Enter maximum members"
                              className={styles.inputField}
                              value={maxTeamMembers}
                              onChange={(e) =>
                                setMaxTeamMembers(Number(e.target.value))
                              }
                            />

                            {validationErrors.maxTeamMembers && (
                              <div className={styles.validationError}>
                                {validationErrors.maxTeamMembers}
                              </div>
                            )}

                          </Form.Group>
                        </Col>


                        <Col xs={12} md={3}>
                          <Form.Group className={styles.inputGroup}>

                            <Form.Label className={styles.inputLabel}>
                              Minimum Members Required{" "}
                              <span className={styles.required}>*</span>
                            </Form.Label>

                            <Form.Control
                              type="number"
                              placeholder="Enter minimum members"
                              className={styles.inputField}
                              value={mandatoryMember}
                              onChange={(e) =>
                                setMandatoryMember(Number(e.target.value))
                              }
                            />

                            {validationErrors.mandatoryMember && (
                              <div className={styles.validationError}>
                                {validationErrors.mandatoryMember}
                              </div>
                            )}

                          </Form.Group>
                        </Col>

                      </>
                    )}

                  </Row>

                  {/* ================= ORGANIZER DETAILS ================= */}

                  <div className={styles.sectionTitle}>

                    <h2 className={styles.subheading}>
                      Organizer Details
                    </h2>

                  </div>

                  <Row>

                    <Col xs={12} md={3}>

                      <Form.Group className={styles.inputGroup}>

                        <Form.Label className={styles.inputLabel}>
                          Event Owner{" "}
                          <span className={styles.required}>*</span>
                        </Form.Label>

                        <PeoplePicker
                          key={
                            isEditMode
                              ? eventOrganizerEmail || String(eventOwnerId)
                              : currentUserEmail
                          }
                          context={peoplePickerContext}
                          titleText=""
                          personSelectionLimit={1}
                          principalTypes={[PrincipalType.User]}
                          defaultSelectedUsers={
                            isEditMode
                              ? eventOrganizerEmail
                                ? [eventOrganizerEmail]
                                : []
                              : currentUserEmail
                                ? [currentUserEmail]
                                : []
                          }
                          showtooltip={false}
                          required={false}
                          disabled={false}
                          searchTextLimit={2}
                          resolveDelay={500}
                          ensureUser={true}
                          webAbsoluteUrl={
                            context.pageContext.web.absoluteUrl
                          }
                          placeholder="Select Event Owner"

                          onChange={async (items) => {

                            if (!items || items.length === 0) {

                              setEventOwnerId(0);

                              setEventOrganizerEmail("");
                              setEventOrganizerDepartment("");
                              setEventOrganizerPhoneNumber("");
                              setSelectedEventOwnerEmail("");
                              setOrganiserPickerKey((prev) => prev + 1);

                              return;
                            }

                            const selectedUser = items[0];

                            try {

                              const selectedUserEmail =
                                selectedUser.secondaryText || "";

                              if (!selectedUserEmail) {
                                return;
                              }

                              setSelectedEventOwnerEmail(selectedUserEmail.trim().toLowerCase());

                              const spUser =
                                await sp.web.ensureUser(selectedUserEmail);

                              const sharePointUserId =
                                spUser.data.Id;

                              setEventOwnerId(sharePointUserId);

                              clearValidationError("eventOwnerId");

                              const graphUserPrincipalName =
                                (spUser.data as any).UserPrincipalName ||
                                selectedUserEmail;

                              const eventService =
                                new CreateEventService(context);

                              const ownerDetails =
                                await eventService.getEventOwnerDetails(
                                  graphUserPrincipalName
                                );

                              // Email
                              const ownerEmail = ownerDetails.email || "";

                              setEventOrganizerEmail(ownerEmail);

                              // Remove Event Owner from Organiser selection
                              setSelectedOrganisers((prev) =>
                                prev.filter(
                                  (email) =>
                                    email.toLowerCase() !==
                                    selectedUserEmail.toLowerCase() &&
                                    email.toLowerCase() !==
                                    ownerEmail.toLowerCase()
                                )
                              );

                              setOrganiserPickerKey((prev) => prev + 1);

                              // Department
                              setEventOrganizerDepartment(
                                ownerDetails.department || ""
                              );

                              // Phone Number
                              setEventOrganizerPhoneNumber(
                                ownerDetails.phoneNumber || ""
                              );

                              console.log(
                                "Event Owner details populated successfully."
                              );

                            } catch (error) {

                              console.error(
                                "Error loading Event Owner details:",
                                error
                              );

                            }

                          }}
                        />
                        {validationErrors.eventOwnerId && (
                          <div className={styles.validationError}>
                            {validationErrors.eventOwnerId}
                          </div>
                        )}

                      </Form.Group>

                    </Col>

                    <Col xs={12} md={3}>

                      <Form.Group className={styles.inputGroup}>

                        <Form.Label className={styles.inputLabel}>
                          Department{" "}
                          <span className={styles.required}>*</span>
                        </Form.Label>

                        <Form.Control
                          type="text"
                          placeholder="Enter department"
                          className={styles.inputField}
                          value={eventOrganizerDepartment}
                          onChange={(e) =>
                            setEventOrganizerDepartment(e.target.value)
                          }
                        />

                        {validationErrors.eventOrganizerDepartment && (
                          <div className={styles.validationError}>
                            {validationErrors.eventOrganizerDepartment}
                          </div>
                        )}



                      </Form.Group>

                    </Col>

                    <Col xs={12} md={3}>

                      <Form.Group className={styles.inputGroup}>

                        <Form.Label className={styles.inputLabel}>
                          Email{" "}
                          <span className={styles.required}>*</span>
                        </Form.Label>

                        <Form.Control
                          type="email"
                          placeholder="Enter email"
                          className={styles.inputField}
                          value={eventOrganizerEmail}
                          onChange={(e) =>
                            setEventOrganizerEmail(
                              e.target.value
                            )
                          }
                        />

                        {validationErrors.eventOrganizerEmail && (
                          <div className={styles.validationError}>
                            {validationErrors.eventOrganizerEmail}
                          </div>
                        )}

                      </Form.Group>

                    </Col>

                    <Col xs={12} md={3}>

                      <Form.Group className={styles.inputGroup}>

                        <Form.Label className={styles.inputLabel}>
                          Phone number {" "}
                          <span className={styles.required}>*</span>
                        </Form.Label>

                        <Form.Control
                          type="text"
                          placeholder="Enter phone number"
                          className={styles.inputField}
                          value={eventOrganizerPhoneNumber}
                          onChange={(e) =>
                            setEventOrganizerPhoneNumber(
                              e.target.value
                            )
                          }
                        />

                        {validationErrors.eventOrganizerPhoneNumber && (
                          <div className={styles.validationError}>
                            {validationErrors.eventOrganizerPhoneNumber}
                          </div>
                        )}

                      </Form.Group>

                    </Col>

                  </Row>

                  <Row>
                    <Col xs={12} md={3}>
                      <Form.Group className={styles.inputGroup}>
                        <Form.Label className={styles.inputLabel}>
                          Organiser
                        </Form.Label>

                        <div className={styles.organiserPicker}>
                          <PeoplePicker
                            key={organiserPickerKey}
                            context={peoplePickerContext}
                            titleText=""
                            personSelectionLimit={10}
                            principalTypes={[PrincipalType.User]}
                            defaultSelectedUsers={selectedOrganisers}
                            showtooltip={false}
                            required={false}
                            disabled={false}
                            searchTextLimit={2}
                            resolveDelay={500}
                            ensureUser={true}
                            webAbsoluteUrl={context.pageContext.web.absoluteUrl}
                            placeholder="Select Organisers"
                            onChange={(items) => {

                              const ownerEmails = [
                                selectedEventOwnerEmail,
                                eventOrganizerEmail
                              ]
                                .map(email => email.trim().toLowerCase())
                                .filter(email => email !== "");

                              const organiserEmails = (items || [])
                                .map(item => (item.secondaryText || "").trim())
                                .filter(email => email !== "");

                              const isOwnerSelected = organiserEmails.some(email =>
                                ownerEmails.includes(email.toLowerCase())
                              );

                              if (isOwnerSelected) {

                                setValidationErrors(prev => ({
                                  ...prev,
                                  organisers:
                                    "Event Owner cannot be selected as an Organiser. Please select another user."
                                }));

                                setSelectedOrganisers(
                                  organiserEmails.filter(
                                    email => !ownerEmails.includes(email.toLowerCase())
                                  )
                                );

                                setOrganiserPickerKey(prev => prev + 1);

                                return;
                              }

                              setSelectedOrganisers(organiserEmails);
                              clearValidationError("organisers");
                            }}
                          />
                        </div>

                        {validationErrors.organisers && (
                          <div className={styles.validationError}>
                            {validationErrors.organisers}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* ================= ATTACHMENTS ================= */}

                  <div className={styles.sectionTitle}>

                    <h2 className={styles.subheading}>
                      Attachments
                    </h2>

                  </div>

                  <Row>

                    <Col xs={12} md={6}>

                      <Form.Group>

                        <Form.Label>
                          Attach any Event Related Docs Here
                        </Form.Label>

                        <Form.Control
                          id="eventDocUpload"
                          type="file"
                          multiple
                          onChange={(e) => {

                            const target =
                              e.target as HTMLInputElement;

                            const files =
                              target.files
                                ? Array.from(target.files)
                                : [];

                            setAttachments(files);
                            setSelectedFiles(files);

                          }}
                        />

                        {/* Existing attachments in Edit mode */}
                        {isEditMode &&
                          existingAttachments.length > 0 && (

                            <div className="mt-1 text-muted">

                              Existing attachment(s):{" "}

                              {existingAttachments
                                .map(
                                  (attachment) =>
                                    attachment.FileName
                                )
                                .join(", ")}

                            </div>

                          )}

                        {/* Newly selected attachments */}
                        {selectedFiles.map((file, index) => (

                          <div
                            className={styles.filePreview}
                            key={index}
                          >

                            <div className={styles.fileIcon}>
                              <i className="bi bi-file-earmark"></i>
                            </div>

                            <span className={styles.fileName}>
                              {file.name}
                            </span>

                            <button
                              type="button"
                              className={styles.removeFileBtn}
                              onClick={() =>
                                removeFile(index)
                              }
                            >
                              <i className="bi bi-x-circle-fill"></i>
                            </button>

                          </div>

                        ))}

                      </Form.Group>

                    </Col>

                  </Row>



                  {/* ================= ACTION BUTTONS ================= */}

                  {/* ================= ACTION BUTTONS ================= */}

                  <div className="d-flex justify-content-end gap-2 mt-4">

                    {/* Cancel - Always visible */}
                    <Button
                      type="button"
                      className={styles.cancelBtn}
                      onClick={onBack}
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Cancel
                    </Button>

                    {/* ================= CREATE MODE ================= */}
                    {!isEditMode && (
                      <>
                        {/* Draft */}
                        <Button
                          type="button"
                          className={styles.cancelBtn}
                          onClick={() => handleSubmit("Draft")}
                        >
                          <i className="bi bi-file-earmark-text me-2"></i>
                          Draft
                        </Button>

                        {/* Submit */}
                        <Button
                          type="button"
                          className={styles.submitBtn}
                          onClick={() => handleSubmit("Created")}
                        >
                          <i className="bi bi-check-circle me-2"></i>
                          Submit
                        </Button>
                      </>
                    )}

                    {/* ================= EDIT FROM MAIN SCREEN ================= */}
                    {isEditMode && editSource === "Main" && (
                      <>
                        {/* Draft */}
                        <Button
                          type="button"
                          className={styles.cancelBtn}
                          onClick={() => handleSubmit("Draft")}
                        >
                          <i className="bi bi-file-earmark-text me-2"></i>
                          Draft
                        </Button>

                        {/* Submit */}
                        <Button
                          type="button"
                          className={styles.submitBtn}
                          onClick={() => handleSubmit("Created")}
                        >
                          <i className="bi bi-check-circle me-2"></i>
                          Submit
                        </Button>
                      </>
                    )}

                    {/* ================= EDIT FROM EVENT DETAILS ================= */}
                    {isEditMode && editSource === "EventDetails" && (
                      <Button
                        type="button"
                        className={styles.submitBtn}
                        onClick={() => handleUpdate()}
                      >
                        <i className="bi bi-check-circle me-2"></i>
                        Update
                      </Button>
                    )}

                  </div>
                </>
              )}


            </Card>

          </Col>
        </Row>

      </Container>



    </section >
  );
};

export default CreateEvent;