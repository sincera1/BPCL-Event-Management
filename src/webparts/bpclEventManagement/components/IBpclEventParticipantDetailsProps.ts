import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IBpclEventParticipantDetailsProps {

  context: WebPartContext;

  participantItemId: number;

  onBack: () => void;

}