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
    eventFromDate: string;
    eventToDate: string;
    registrationFromDate: string;
    registrationToDate: string;
    status: string;
}


export default class EventService {

    private readonly listTitle: string = "Corp_SL_EventManagement";


    public async getEvents(): Promise<IEventItem[]> {

        try {

            console.log(
                "Fetching events from:",
                this.listTitle
            );

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
                        "Author/EMail",
                        "OverAllEventStatus"
                    )
                    .expand(
                        "EventOrganiser",
                        "Author"
                    )
                    .orderBy(
                        "Created",
                        false
                    )
                    .get();

            console.log(
                "Event list response:",
                items
            );


            const events: IEventItem[] =
                items.map(
                    (item: any): IEventItem => {

                        return {

                            id:
                                item.Id,

                            eventName:
                                item.EventTitle || "",
                            hasSubEvents: item.HasSubEvents === true,
                            hasStages: item.HasStages === true,
                            // Sub event count will be added later.
                            subEvents: item.NoofSubEvents || 0,


                            eventOwner:
                                item.EventOrganiser?.Title ||
                                "",
                            authorEmail:
                                item.Author?.EMail || "",

                            eventFromDate:
                                this.formatDisplayDate(
                                    item.EventStartDate
                                ),

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
                                item.OverAllEventStatus ||
                                ""

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

}