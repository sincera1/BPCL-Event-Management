import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface ICreateEventProps {
    onBack: () => void;
    context: WebPartContext;
    eventId?: number;
    isEditMode?: boolean;
}