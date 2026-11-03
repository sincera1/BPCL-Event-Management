import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/fields";
import "@pnp/sp/folders";
import "@pnp/sp/files";
import "@pnp/sp/attachments";

import { WebPartContext } from "@microsoft/sp-webpart-base";

/* =========================================================
   EVENT OWNER
========================================================= */

export interface IEventOwnerDetails {
    id: string;
    displayName: string;
    email: string;
    department: string;
    phoneNumber: string;
}


/* =========================================================
   CREATE / UPDATE EVENT
========================================================= */

export interface ICreateEvent {

    Id?: number;

    EventTitle: string;
    EventDescription: string;

    EventStartDate: string;
    EventEndDate: string;

    EventParticipantType: string;
    HasSubEvents: boolean;
    NoofSubEvents?: number;
    EventBannerImage?: File;

    RulesAndRegualtionType: string;
    RulesAndRegualtionText: string;
    RulesAndRegualtionImage?: File;

    RegistrationStartDate: string;
    RegistrationEndDate: string;

    MaxTeamMembers: number;
    MandatoryMember: number;

    EventOrganiser: number;

    EventOrganizerDepartment: string;
    EventOrganizerEmail: string;
    EventOrganizerPhoneNumber: string;

    Attachments?: File[];

    OverAllEventStatus: "Draft" | "Created";

}


/* =========================================================
   SUB EVENT
========================================================= */

export interface ICreateSubEvent {

    Id?: number;

    SubEventTitle: string;

    SubEventDescription: string;

    MinimumMembersRequired: number;
}


/* =========================================================
   EXISTING SUB EVENT
========================================================= */

export interface IExistingSubEvent {

    Id: number;

    SubEventTitle: string;

    SubEventDescription: string;

    MinimumMembersRequired: number;
}


/* =========================================================
   EXISTING ATTACHMENT
========================================================= */

export interface IEventAttachment {

    FileName: string;

    ServerRelativeUrl: string;
}


/* =========================================================
   EVENT DETAILS FOR EDIT
========================================================= */

export interface IEventDetails {

    Id: number;

    EventTitle: string;
    EventDescription: string;

    EventStartDate: string;
    EventEndDate: string;

    EventParticipantType: string;
    HasSubEvents: boolean;

    RulesAndRegualtionType: string;
    RulesAndRegualtionText: string;

    RegistrationStartDate: string;
    RegistrationEndDate: string;

    MaxTeamMembers: number;
    MandatoryMember: number;

    EventOrganiser: number;

    EventOrganizerName: string;
    EventOrganizerDepartment: string;
    EventOrganizerEmail: string;
    EventOrganizerPhoneNumber: string;

    OverAllEventStatus: "Draft" | "Created";

    EventBannerImageUrl: string;
    RulesAndRegualtionImageUrl: string;

    SubEvents: IExistingSubEvent[];

    Attachments: IEventAttachment[];
}


/* =========================================================
   SERVICE
========================================================= */

export default class CreateEventService {

    private readonly listTitle: string =
        "Corp_SL_EventManagement";

    private readonly subEventListTitle: string =
        "Corp_SL_SubEventManagement";

    private readonly context: WebPartContext;


    constructor(context: WebPartContext) {

        this.context = context;

    }


    /* =========================================================
       CREATE EVENT
    ========================================================= */

    public async createEvent(
        eventData: ICreateEvent
    ): Promise<number> {

        try {

            const result = await sp.web.lists
                .getByTitle(this.listTitle)
                .items
                .add({

                    EventTitle:
                        eventData.EventTitle,

                    EventDescription:
                        eventData.EventDescription,




                    EventStartDate:
                        this.formatSharePointDate(
                            eventData.EventStartDate
                        ),

                    EventEndDate:
                        this.formatSharePointDate(
                            eventData.EventEndDate
                        ),


                    EventParticipantType:
                        eventData.EventParticipantType,

                    HasSubEvents:
                        eventData.HasSubEvents,
                    NoofSubEvents:
                        eventData.NoofSubEvents,

                    RulesAndRegualtionType:
                        eventData.RulesAndRegualtionType,

                    RulesAndRegualtionText:
                        eventData.RulesAndRegualtionText,

                    RegistrationStartDate:
                        this.formatSharePointDate(
                            eventData.RegistrationStartDate
                        ),

                    RegistrationEndDate:
                        this.formatSharePointDate(
                            eventData.RegistrationEndDate
                        ),


                    MaxTeamMembers:
                        eventData.MaxTeamMembers,

                    MandatoryMember:
                        eventData.MandatoryMember,

                    EventOrganiserId:
                        eventData.EventOrganiser,

                    EventOrganizerDepartment:
                        eventData.EventOrganizerDepartment,

                    EventOrganizerEmail:
                        eventData.EventOrganizerEmail,

                    EventOrganizerPhoneNumber:
                        eventData.EventOrganizerPhoneNumber,

                    OverAllEventStatus:
                        eventData.OverAllEventStatus

                });


            const itemId: number =
                result.data.Id;


            /* =================================================
               EVENT BANNER
            ================================================= */

            if (eventData.EventBannerImage) {

                await this.uploadImageColumn(
                    itemId,
                    eventData.EventBannerImage,
                    "EventBannerImage"
                );

            }


            /* =================================================
               RULES IMAGE
            ================================================= */

            if (eventData.RulesAndRegualtionImage) {

                await this.uploadImageColumn(
                    itemId,
                    eventData.RulesAndRegualtionImage,
                    "RulesAndRegualtionImage"
                );

            }


            /* =================================================
               ATTACHMENTS
            ================================================= */

            if (
                eventData.Attachments &&
                eventData.Attachments.length > 0
            ) {

                await this.uploadAttachments(
                    itemId,
                    eventData.Attachments
                );

            }


            return itemId;

        } catch (error) {

            console.error(
                "Error creating event:",
                error
            );

            throw error;

        }

    }


    /* =========================================================
       CREATE SUB EVENTS
    ========================================================= */

    public async createSubEvents(
        eventId: number,
        eventTitle: string,
        subEvents: ICreateSubEvent[]
    ): Promise<void> {

        try {

            if (
                !subEvents ||
                subEvents.length === 0
            ) {

                console.log(
                    "No subevents to create."
                );

                return;

            }


            for (
                const subEvent of subEvents
            ) {

                await sp.web.lists
                    .getByTitle(
                        this.subEventListTitle
                    )
                    .items
                    .add({

                        SubEventTitle:
                            subEvent.SubEventTitle,

                        SubEventDescription:
                            subEvent.SubEventDescription,

                        MinimumMembersRequired:
                            subEvent.MinimumMembersRequired,

                        Event_IDId:
                            eventId,

                        Event_Title:
                            eventTitle

                    });

            }


        } catch (error) {

            console.error(
                "Error creating subevents:",
                error
            );

            throw error;

        }

    }


    /* =========================================================
       GET EVENT DETAILS
       
       Used when Edit button is clicked.
    ========================================================= */

    public async getEventDetails(
        eventId: number
    ): Promise<IEventDetails> {

        try {

            console.log(
                "Loading Event Details for ID:",
                eventId
            );


            /* =================================================
               1. GET MAIN EVENT
            ================================================= */

            const event = await sp.web.lists
                .getByTitle(this.listTitle)
                .items
                .getById(eventId)
                .select(
                    "Id",
                    "EventTitle",
                    "EventDescription",
                    "EventStartDate",
                    "EventEndDate",
                    "EventParticipantType",
                    "HasSubEvents",
                    "RulesAndRegualtionType",
                    "RulesAndRegualtionText",
                    "RegistrationStartDate",
                    "RegistrationEndDate",
                    "MaxTeamMembers",
                    "MandatoryMember",
                    "EventOrganiserId",
                    "EventOrganiser/Id",
                    "EventOrganiser/Title",
                    "EventOrganizerDepartment",
                    "EventOrganizerEmail",
                    "EventOrganizerPhoneNumber",
                    "OverAllEventStatus",
                    "EventBannerImage",
                    "RulesAndRegualtionImage"
                )
                .expand(
                    "EventOrganiser"
                )();


            console.log(
                "Main Event Details:",
                event
            );


            /* =================================================
               2. GET SUB EVENTS
            ================================================= */

            const subEvents =
                await this.getSubEvents(eventId);


            /* =================================================
               3. GET ATTACHMENTS
            ================================================= */

            const attachments =
                await this.getEventAttachments(
                    eventId
                );


            /* =================================================
               4. EVENT BANNER URL
            ================================================= */

            const eventBannerImageUrl =
                this.getImageUrl(
                    event.EventBannerImage
                );


            /* =================================================
               5. RULES IMAGE URL
            ================================================= */

            const rulesAndRegualtionImageUrl =
                this.getImageUrl(
                    event.RulesAndRegualtionImage
                );


            /* =================================================
               6. EVENT OWNER
            ================================================= */

            const eventOrganiserId =
                event.EventOrganiser?.Id ||
                event.EventOrganiserId ||
                0;

            const eventOrganiserName =
                event.EventOrganiser?.Title ||
                "";


            /* =================================================
               7. RETURN COMPLETE EVENT
            ================================================= */

            const eventDetails: IEventDetails = {

                Id:
                    event.Id,

                EventTitle:
                    event.EventTitle || "",

                EventDescription:
                    event.EventDescription || "",

                EventStartDate:
                    this.formatDateForInput(
                        event.EventStartDate
                    ),

                EventEndDate:
                    this.formatDateForInput(
                        event.EventEndDate
                    ),

                EventParticipantType:
                    event.EventParticipantType || "",

                HasSubEvents:
                    event.HasSubEvents === true,

                RulesAndRegualtionType:
                    event.RulesAndRegualtionType || "",

                RulesAndRegualtionText:
                    event.RulesAndRegualtionText || "",

                RegistrationStartDate:
                    this.formatDateForInput(
                        event.RegistrationStartDate
                    ),

                RegistrationEndDate:
                    this.formatDateForInput(
                        event.RegistrationEndDate
                    ),

                MaxTeamMembers:
                    Number(
                        event.MaxTeamMembers || 0
                    ),

                MandatoryMember:
                    Number(
                        event.MandatoryMember || 0
                    ),

                EventOrganiser:
                    eventOrganiserId,

                EventOrganizerName:
                    eventOrganiserName,

                EventOrganizerDepartment:
                    event.EventOrganizerDepartment || "",

                EventOrganizerEmail:
                    event.EventOrganizerEmail || "",

                EventOrganizerPhoneNumber:
                    event.EventOrganizerPhoneNumber || "",

                OverAllEventStatus:
                    event.OverAllEventStatus === "Draft"
                        ? "Draft"
                        : "Created",

                EventBannerImageUrl:
                    eventBannerImageUrl,

                RulesAndRegualtionImageUrl:
                    rulesAndRegualtionImageUrl,

                SubEvents:
                    subEvents,

                Attachments:
                    attachments

            };


            console.log(
                "Complete Event Details:",
                eventDetails
            );


            return eventDetails;


        } catch (error) {

            console.error(
                "Error loading event details:",
                error
            );

            throw error;

        }

    }


    /* =========================================================
       GET SUB EVENTS
    ========================================================= */

    public async getSubEvents(
        eventId: number
    ): Promise<IExistingSubEvent[]> {

        try {

            const items =
                await sp.web.lists
                    .getByTitle(
                        this.subEventListTitle
                    )
                    .items
                    .select(
                        "Id",
                        "SubEventTitle",
                        "SubEventDescription",
                        "MinimumMembersRequired",
                        "Event_IDId"
                    )
                    .filter(
                        `Event_IDId eq ${eventId}`
                    )
                    .orderBy(
                        "Id",
                        true
                    )();


            return items.map(
                (item: any): IExistingSubEvent => ({

                    Id:
                        item.Id,

                    SubEventTitle:
                        item.SubEventTitle || "",

                    SubEventDescription:
                        item.SubEventDescription || "",

                    MinimumMembersRequired:
                        Number(
                            item.MinimumMembersRequired || 0
                        )

                })
            );


        } catch (error) {

            console.error(
                "Error loading subevents:",
                error
            );

            throw error;

        }

    }


    /* =========================================================
       UPDATE MAIN EVENT
    ========================================================= */

    public async updateEvent(
        eventId: number,
        eventData: Omit<ICreateEvent, "OverAllEventStatus">,
        status?: "Draft" | "Created"
    ): Promise<void> {
        try {
            console.log("Updating Event:", eventId);

            await sp.web.lists
                .getByTitle(this.listTitle)
                .items
                .getById(eventId)
                .update({
                    EventTitle: eventData.EventTitle,
                    EventDescription: eventData.EventDescription,

                    EventStartDate: this.formatSharePointDate(
                        eventData.EventStartDate
                    ),

                    EventEndDate: this.formatSharePointDate(
                        eventData.EventEndDate
                    ),

                    EventParticipantType: eventData.EventParticipantType,
                    HasSubEvents: eventData.HasSubEvents,
                    NoofSubEvents: eventData.NoofSubEvents,

                    RulesAndRegualtionType:
                        eventData.RulesAndRegualtionType,

                    RulesAndRegualtionText:
                        eventData.RulesAndRegualtionText,

                    RegistrationStartDate:
                        this.formatSharePointDate(
                            eventData.RegistrationStartDate
                        ),

                    RegistrationEndDate:
                        this.formatSharePointDate(
                            eventData.RegistrationEndDate
                        ),

                    MaxTeamMembers: eventData.MaxTeamMembers,
                    MandatoryMember: eventData.MandatoryMember,

                    EventOrganiserId: eventData.EventOrganiser,

                    EventOrganizerDepartment:
                        eventData.EventOrganizerDepartment,

                    EventOrganizerEmail:
                        eventData.EventOrganizerEmail,

                    EventOrganizerPhoneNumber:
                        eventData.EventOrganizerPhoneNumber
                });

            // Update status ONLY when explicitly passed
            if (status) {
                await sp.web.lists
                    .getByTitle(this.listTitle)
                    .items
                    .getById(eventId)
                    .update({
                        OverAllEventStatus: status
                    });
            }

            // Update Event Banner Image only if a new image is selected
            if (eventData.EventBannerImage) {
                await this.uploadImageColumn(
                    eventId,
                    eventData.EventBannerImage,
                    "EventBannerImage"
                );
            }

            // Update Rules & Regulations Image only if a new image is selected
            if (eventData.RulesAndRegualtionImage) {
                await this.uploadImageColumn(
                    eventId,
                    eventData.RulesAndRegualtionImage,
                    "RulesAndRegualtionImage"
                );
            }

            // Upload new attachments only
            if (
                eventData.Attachments &&
                eventData.Attachments.length > 0
            ) {
                await this.uploadNewAttachments(
                    eventId,
                    eventData.Attachments
                );
            }

            console.log(
                "Event updated successfully:",
                eventId
            );
        } catch (error) {
            console.error(
                "Error updating event:",
                error
            );

            throw error;
        }
    }

    /* =========================================================
       UPDATE SUB EVENT
    ========================================================= */

    public async updateSubEvent(
        subEventId: number,
        subEvent: ICreateSubEvent
    ): Promise<void> {

        try {

            await sp.web.lists
                .getByTitle(
                    this.subEventListTitle
                )
                .items
                .getById(subEventId)
                .update({

                    SubEventTitle:
                        subEvent.SubEventTitle,

                    SubEventDescription:
                        subEvent.SubEventDescription,

                    MinimumMembersRequired:
                        subEvent.MinimumMembersRequired

                });


        } catch (error) {

            console.error(
                "Error updating subevent:",
                error
            );

            throw error;

        }

    }


    /* =========================================================
       DELETE SUB EVENT
    ========================================================= */

    public async deleteSubEvent(
        subEventId: number
    ): Promise<void> {

        try {

            await sp.web.lists
                .getByTitle(
                    this.subEventListTitle
                )
                .items
                .getById(subEventId)
                .delete();


        } catch (error) {

            console.error(
                "Error deleting subevent:",
                error
            );

            throw error;

        }

    }


    /* =========================================================
       CREATE SINGLE SUB EVENT
    ========================================================= */

    public async createSingleSubEvent(
        eventId: number,
        eventTitle: string,
        subEvent: ICreateSubEvent
    ): Promise<number> {

        try {

            const result =
                await sp.web.lists
                    .getByTitle(
                        this.subEventListTitle
                    )
                    .items
                    .add({

                        SubEventTitle:
                            subEvent.SubEventTitle,

                        SubEventDescription:
                            subEvent.SubEventDescription,

                        MinimumMembersRequired:
                            subEvent.MinimumMembersRequired,

                        Event_IDId:
                            eventId,

                        Event_Title:
                            eventTitle

                    });


            return result.data.Id;


        } catch (error) {

            console.error(
                "Error creating single subevent:",
                error
            );

            throw error;

        }

    }


    /* =========================================================
       GET EVENT ATTACHMENTS
    ========================================================= */

    public async getEventAttachments(
        eventId: number
    ): Promise<IEventAttachment[]> {

        try {

            const attachments =
                await sp.web.lists
                    .getByTitle(this.listTitle)
                    .items
                    .getById(eventId)
                    .attachmentFiles
                    .select(
                        "FileName",
                        "ServerRelativeUrl"
                    )();


            return attachments.map(
                (attachment: any): IEventAttachment => ({

                    FileName:
                        attachment.FileName,

                    ServerRelativeUrl:
                        attachment.ServerRelativeUrl

                })
            );


        } catch (error) {

            console.error(
                "Error loading event attachments:",
                error
            );

            throw error;

        }

    }


    /* =========================================================
       DELETE EVENT ATTACHMENT
    ========================================================= */

    public async deleteEventAttachment(
        eventId: number,
        fileName: string
    ): Promise<void> {

        try {

            await sp.web.lists
                .getByTitle(this.listTitle)
                .items
                .getById(eventId)
                .attachmentFiles
                .getByName(fileName)
                .delete();


        } catch (error) {

            console.error(
                "Error deleting event attachment:",
                error
            );

            throw error;

        }

    }


    /* =========================================================
       UPLOAD NEW ATTACHMENTS
    ========================================================= */

    public async uploadNewAttachments(
        eventId: number,
        files: File[]
    ): Promise<void> {

        if (
            !files ||
            files.length === 0
        ) {

            return;

        }


        const item =
            sp.web.lists
                .getByTitle(this.listTitle)
                .items
                .getById(eventId);


        for (const file of files) {

            await item.attachmentFiles.add(
                file.name,
                file
            );

        }

    }


    /* =========================================================
       EXISTING ATTACHMENT UPLOAD
       
       Kept for CreateEvent compatibility.
    ========================================================= */

    private async uploadAttachments(
        itemId: number,
        files: File[]
    ): Promise<void> {

        try {

            if (
                !files ||
                files.length === 0
            ) {

                return;

            }


            const item =
                sp.web.lists
                    .getByTitle(this.listTitle)
                    .items
                    .getById(itemId);


            for (const file of files) {

                await item.attachmentFiles.add(
                    file.name,
                    file
                );

            }


        } catch (error) {

            console.error(
                "Error uploading event attachments:",
                error
            );

            throw error;

        }

    }


    /* =========================================================
       UPLOAD IMAGE COLUMN
    ========================================================= */

    private async uploadImageColumn(
        itemId: number,
        file: File,
        fieldName: string
    ): Promise<void> {

        try {

            /* ================================================
               1. UNIQUE FILE NAME
            ================================================= */

            const uniqueFileName =
                `${itemId}_${Date.now()}_${file.name}`;


            console.log(
                `Uploading ${fieldName}:`,
                uniqueFileName
            );


            /* ================================================
               2. UPLOAD TO SITE ASSETS
            ================================================= */

            await sp.web
                .getFolderByServerRelativePath(
                    "SiteAssets"
                )
                .files
                .addUsingPath(
                    uniqueFileName,
                    file,
                    {
                        Overwrite: true
                    }
                );


            /* ================================================
               3. GET WEB RELATIVE URL
            ================================================= */

            const webInfo =
                await sp.web
                    .select(
                        "ServerRelativeUrl"
                    )();


            const serverRelativeWebUrl =
                webInfo.ServerRelativeUrl;


            /* ================================================
               4. BUILD IMAGE URL
            ================================================= */

            const fileUrl =
                `${serverRelativeWebUrl}/SiteAssets/${encodeURIComponent(
                    uniqueFileName
                )}`;


            /* ================================================
               5. IMAGE COLUMN VALUE
            ================================================= */

            const imageValue = {

                type: "thumbnail",

                fileName:
                    uniqueFileName,

                serverRelativeUrl:
                    fileUrl

            };


            /* ================================================
               6. UPDATE SHAREPOINT IMAGE COLUMN
            ================================================= */

            await sp.web
                .lists
                .getByTitle(this.listTitle)
                .items
                .getById(itemId)
                .update({

                    [fieldName]:
                        JSON.stringify(imageValue)

                });


        } catch (error) {

            console.error(
                `Error uploading image for ${fieldName}:`,
                error
            );

            throw error;

        }

    }


    /* =========================================================
       GET IMAGE URL
       
       SharePoint Image column may return:
       - Object
       - JSON string
       - null
    ========================================================= */

    private getImageUrl(
        imageValue: any
    ): string {

        if (!imageValue) {

            return "";

        }


        try {

            let imageObject: any =
                imageValue;


            if (
                typeof imageValue === "string"
            ) {

                imageObject =
                    JSON.parse(imageValue);

            }


            return (
                imageObject?.serverRelativeUrl ||
                imageObject?.serverRelativeUrl ||
                ""
            );


        } catch {

            return "";

        }

    }


    /* =========================================================
       EVENT OWNER - GRAPH
    ========================================================= */

    public async getEventOwnerDetails(
        userEmail: string
    ): Promise<IEventOwnerDetails> {

        try {

            const client =
                await this.context
                    .msGraphClientFactory
                    .getClient("3");


            const user =
                await client
                    .api(
                        `/users/${encodeURIComponent(
                            userEmail
                        )}`
                    )
                    .select(
                        "id,displayName,mail,userPrincipalName,department,mobilePhone,businessPhones"
                    )
                    .get();


            const email =
                user?.mail ||
                user?.userPrincipalName ||
                "";


            const department =
                user?.department ||
                "";


            const phoneNumber =
                user?.mobilePhone ||
                (
                    user?.businessPhones &&
                        user.businessPhones.length > 0
                        ? user.businessPhones[0]
                        : ""
                );


            return {

                id:
                    user?.id || "",

                displayName:
                    user?.displayName || "",

                email:
                    email,

                department:
                    department,

                phoneNumber:
                    phoneNumber

            };


        } catch (error) {

            console.error(
                "Error fetching Event Owner details:",
                error
            );

            throw error;

        }

    }


    /* =========================================================
       CURRENT USER - GRAPH
    ========================================================= */

    public async getCurrentUserDetails():
        Promise<IEventOwnerDetails> {

        try {

            const client =
                await this.context
                    .msGraphClientFactory
                    .getClient("3");


            const user =
                await client
                    .api("/me")
                    .select(
                        "id,displayName,mail,userPrincipalName,department,mobilePhone,businessPhones"
                    )
                    .get();


            const email =
                user?.mail ||
                user?.userPrincipalName ||
                "";


            const department =
                user?.department ||
                "";


            const phoneNumber =
                user?.mobilePhone ||
                (
                    user?.businessPhones &&
                        user.businessPhones.length > 0
                        ? user.businessPhones[0]
                        : ""
                );


            return {

                id:
                    user?.id || "",

                displayName:
                    user?.displayName || "",

                email:
                    email,

                department:
                    department,

                phoneNumber:
                    phoneNumber

            };


        } catch (error) {

            console.error(
                "Error fetching current user details:",
                error
            );

            throw error;

        }

    }



    private formatSharePointDate(
        dateValue?: string | null
    ): string | null {

        if (!dateValue) {
            return null;
        }

        const [year, month, day] = dateValue.split("-");

        if (!year || !month || !day) {
            return null;
        }

        return `${year}-${month}-${day}`;
    }


    private formatDateForInput(
        dateValue?: string | null
    ): string {

        if (!dateValue) {
            return "";
        }

        const date = new Date(dateValue);

        return `${date.getUTCFullYear()}-${String(
            date.getUTCMonth() + 1
        ).padStart(2, "0")}-${String(
            date.getUTCDate()
        ).padStart(2, "0")}`;
    }

}