import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/fields";
import "@pnp/sp/folders";
import "@pnp/sp/files";
import "@pnp/sp/attachments";


export interface IEventItem {
    id: number;
    eventName: string;
    hasSubEvents: boolean;
    hasStages: boolean;
    subEvents: number;
    eventOwner: string;
    authorEmail: string;
    organiserEmails: string[];
    eventOrganiserEmail: string;
    eventFromDate: string;
    eventToDate: string;
    registrationFromDate: string;
    registrationToDate: string;
    status: string;
    participantItemId: number | null;
}


export default class EventService {

    private readonly listTitle: string = "Corp_SL_EventManagement";



    // public async getEvents(): Promise<IEventItem[]> {

    //     try {

    //         console.log(
    //             "Fetching events from:",
    //             this.listTitle
    //         );

    //         const items: any[] =
    //             await sp.web.lists
    //                 .getByTitle(this.listTitle)
    //                 .items
    //                 .select(
    //                     "Id",
    //                     "EventTitle",
    //                     "EventStartDate",
    //                     "EventEndDate",
    //                     "RegistrationStartDate",
    //                     "RegistrationEndDate",
    //                     "HasSubEvents",
    //                     "HasStages",
    //                     "NoofSubEvents",
    //                     "EventOrganiser/Title",
    //                     "EventOrganiser/EMail",
    //                     "Author/EMail",
    //                     "OverAllEventStatus"
    //                 )
    //                 .expand(
    //                     "EventOrganiser",
    //                     "Author"
    //                 )
    //                 .orderBy(
    //                     "Created",
    //                     false
    //                 )
    //                 .get();

    //         console.log(
    //             "Event list response:",
    //             items
    //         );


    //         const events: IEventItem[] =
    //             items.map(
    //                 (item: any): IEventItem => {

    //                     return {

    //                         id:
    //                             item.Id,

    //                         eventName:
    //                             item.EventTitle || "",
    //                         hasSubEvents: item.HasSubEvents === true,
    //                         hasStages: item.HasStages === true,
    //                         // Sub event count will be added later.
    //                         subEvents: item.NoofSubEvents || 0,


    //                         eventOwner:
    //                             item.EventOrganiser?.Title ||
    //                             "",
    //                         authorEmail:
    //                             item.Author?.EMail || "",

    //                         eventFromDate:
    //                             this.formatDisplayDate(
    //                                 item.EventStartDate
    //                             ),

    //                         eventToDate:
    //                             this.formatDisplayDate(
    //                                 item.EventEndDate
    //                             ),

    //                         registrationFromDate:
    //                             this.formatDisplayDate(
    //                                 item.RegistrationStartDate
    //                             ),

    //                         registrationToDate:
    //                             this.formatDisplayDate(
    //                                 item.RegistrationEndDate
    //                             ),

    //                         status:
    //                             item.OverAllEventStatus ||
    //                             ""

    //                     };

    //                 }
    //             );


    //         console.log(
    //             "Formatted event data:",
    //             events
    //         );


    //         return events;

    //     } catch (error) {

    //         console.error(
    //             "Error fetching events:",
    //             error
    //         );

    //         throw error;
    //     }
    // }


    public async getEvents(): Promise<IEventItem[]> {

        try {

            console.log(
                "Fetching events from:",
                this.listTitle
            );

            // ============================================
            // 1. GET LOGGED-IN USER
            // ============================================

            const currentUser =
                await sp.web.currentUser.get();

            const currentUserId =
                currentUser.Id;

            console.log(
                "Logged-in User ID:",
                currentUserId
            );


            // ============================================
            // 2. GET EVENTS
            // ============================================

            const items: any[] =
                await sp.web.lists
                    .getByTitle(this.listTitle)
                    .items
                    .select(
                        "Id",
                        "EventTitle",
                        "EventStartDate",
                        "EventEndDate",
                        "RegistrationStartDate",
                        "RegistrationEndDate",
                        "HasSubEvents",
                        "HasStages",
                        "NoofSubEvents",
                        "EventOrganiser/Title",
                        "EventOrganiser/EMail",
                        "Organiser/Id",
                        "Organiser/Title",
                        "Organiser/EMail",
                        "EventOrganiser/Title",
                        "EventOrganiser/EMail",
                        "Author/EMail",
                        "OverAllEventStatus"
                    )
                    .expand(
                        "EventOrganiser",
                        "Organiser",
                        "Author"
                    )
                    .orderBy(
                        "Created",
                        false
                    )
                    .get();


            // ============================================
            // 3. GET PARTICIPANT / TEAM RECORDS
            // ============================================

            const participantItems: any[] =
                await sp.web.lists
                    .getByTitle(
                        "Corp_SL_EventParticipants"
                    )
                    .items
                    .select(
                        "Id",
                        "Event_ID/Id",

                        "Participant/Id",
                        "Participant/Title",
                        "Participant/EMail"
                    )
                    .expand(
                        "Event_ID",
                        "Participant"
                    )
                    .get();


            // ============================================
            // 4. FORMAT EVENTS
            // ============================================

            const events: IEventItem[] =
                items.map(
                    (item: any): IEventItem => {

                        // ====================================
                        // Find current user's registration
                        // for this event
                        // ====================================

                        const matchedParticipant =
                            participantItems.find(
                                (participantItem: any): boolean => {

                                    const participants =
                                        Array.isArray(
                                            participantItem.Participant
                                        )
                                            ? participantItem.Participant
                                            : participantItem.Participant
                                                ? [participantItem.Participant]
                                                : [];

                                    return (
                                        Number(
                                            participantItem.Event_ID?.Id
                                        ) === Number(item.Id)
                                        &&
                                        participants.some(
                                            (participant: any): boolean =>
                                                Number(
                                                    participant?.Id
                                                ) === Number(
                                                    currentUserId
                                                )
                                        )
                                    );

                                }
                            );


                        // ====================================
                        // RETURN EVENT
                        // ====================================

                        return {

                            id:
                                item.Id,

                            eventName:
                                item.EventTitle || "",
                            hasSubEvents: item.HasSubEvents === true,
                            hasStages: item.HasStages === true,
                            subEvents: item.NoofSubEvents || 0,


                            eventOwner: item.EventOrganiser?.Title || "",

                            authorEmail: item.Author?.EMail || "",
                            
                            organiserEmails: Array.isArray(item.Organiser)
                                ? item.Organiser
                                    .map((person: any) =>
                                        person?.EMail?.toLowerCase() || ""
                                    )
                                    .filter((email: string) => email !== "")
                                : [],

                            eventOrganiserEmail: item.EventOrganiser?.EMail?.toLowerCase() || "",
                               

                            eventFromDate: this.formatDisplayDate(item.EventStartDate),




                            eventToDate:
                                this.formatDisplayDate(
                                    item.EventEndDate
                                ),

                            registrationFromDate:
                                this.formatDisplayDate(
                                    item.RegistrationStartDate
                                ),

                            registrationToDate:
                                this.formatDisplayDate(
                                    item.RegistrationEndDate
                                ),

                            status:
                                item.OverAllEventStatus || "",

                            // =================================
                            // IMPORTANT
                            // =================================

                            participantItemId:
                                matchedParticipant
                                    ? Number(
                                        matchedParticipant.Id
                                    )
                                    : null

                        };

                    }
                );


            console.log(
                "Formatted event data:",
                events
            );


            return events;


        } catch (error) {

            console.error(
                "Error fetching events:",
                error
            );

            throw error;
        }
    }

    private formatDisplayDate(
        dateValue?: string | null
    ): string {

        if (!dateValue) {
            return "";
        }

        const date: Date =
            new Date(dateValue);

        if (isNaN(date.getTime())) {
            return "";
        }

        const months: string[] = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec"
        ];

        const day: string =
            date.getDate() < 10
                ? "0" + date.getDate()
                : date.getDate().toString();

        const month: string =
            months[date.getMonth()];

        const year: number =
            date.getFullYear();

        return `${day} ${month} ${year}`;
    }

    public async cancelEvent(eventId: number): Promise<void> {

        try {

            console.log(
                "Cancelling event. Event ID:",
                eventId
            );

            await sp.web.lists
                .getByTitle(this.listTitle)
                .items
                .getById(eventId)
                .update({
                    OverAllEventStatus: "Cancelled"
                });

            console.log(
                "Event cancelled successfully. Event ID:",
                eventId
            );

        } catch (error) {

            console.error(
                "Error cancelling event:",
                error
            );

            throw error;
        }
    }

    public async deleteEvent(eventId: number): Promise<void> {

        try {

            console.log(
                "Deleting event. Event ID:",
                eventId
            );

            await sp.web.lists
                .getByTitle(this.listTitle)
                .items
                .getById(eventId)
                .delete();

            console.log(
                "Event deleted successfully. Event ID:",
                eventId
            );

        } catch (error) {

            console.error(
                "Error deleting event:",
                error
            );

            throw error;
        }
    }


    public async getMyParticipantItemForEvent(
        eventId: number
    ): Promise<number | null> {

        try {

            // ============================================
            // 1. GET LOGGED-IN USER
            // ============================================

            const currentUser =
                await sp.web.currentUser.get();

            const currentUserId =
                currentUser.Id;

            console.log(
                "Logged-in User ID:",
                currentUserId
            );


            // ============================================
            // 2. GET PARTICIPANT / TEAM RECORDS
            //    FOR THIS EVENT
            //
            // Participant is a MULTI-PERSON field.
            // Therefore we get the records for the event
            // and check Participant[] in JavaScript.
            // ============================================

            const items: any[] =
                await sp.web.lists
                    .getByTitle(
                        "Corp_SL_EventParticipants"
                    )
                    .items
                    .filter(
                        `Event_IDId eq ${eventId}`
                    )
                    .select(
                        "Id",
                        "Event_ID/Id",
                        "EventParticipantType",
                        "ParticipantOrTeamStatus",

                        "Participant/Id",
                        "Participant/Title",
                        "Participant/EMail",

                        "TeamLeader/Id",
                        "TeamLeader/Title",
                        "TeamLeader/EMail"
                    )
                    .expand(
                        "Event_ID",
                        "Participant",
                        "TeamLeader"
                    )
                    .get();


            console.log(
                "Event Participant / Team records:",
                items
            );


            // ============================================
            // 3. FIND THE RECORD WHERE LOGGED-IN USER
            //    EXISTS IN THE MULTI-PERSON PARTICIPANT
            //    FIELD
            // ============================================

            const matchedItem: any =
                items.find(
                    (item: any): boolean => {

                        const participants =
                            Array.isArray(item.Participant)
                                ? item.Participant
                                : item.Participant
                                    ? [item.Participant]
                                    : [];

                        return participants.some(
                            (participant: any): boolean =>
                                Number(participant?.Id) ===
                                Number(currentUserId)
                        );

                    }
                );


            // ============================================
            // 4. USER NOT REGISTERED FOR THIS EVENT
            // ============================================

            if (!matchedItem) {

                console.log(
                    "No participant/team registration found for current user."
                );

                return null;
            }


            // ============================================
            // 5. RETURN Corp_SL_EventParticipants ITEM ID
            // ============================================

            console.log(
                "Matched EventParticipant item:",
                matchedItem
            );

            console.log(
                "Matched EventParticipant Item ID:",
                matchedItem.Id
            );

            return Number(matchedItem.Id);

        } catch (error) {

            console.error(
                "Error getting participant/team for event:",
                error
            );

            throw error;
        }
    }

}