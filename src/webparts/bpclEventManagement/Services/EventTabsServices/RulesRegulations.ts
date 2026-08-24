import { sp } from "@pnp/sp";

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/fields";
import "@pnp/sp/folders";
import "@pnp/sp/files";
import "@pnp/sp/attachments";

export interface IAttachmentData {
  FileName: string;
  ServerRelativeUrl: string;
}

export interface IRulesRegulationsData {
  Id: number;
  RulesAndRegualtionType: string;
  RulesAndRegualtionText: string;
  RulesAndRegualtionImage: string;
  Attachments: IAttachmentData[];
}

export default class RulesRegulationsService {

  public async getRulesRegulations(
    eventId: number
  ): Promise<IRulesRegulationsData | null> {

    try {
      const item: any = await sp.web.lists
        .getByTitle("Corp_SL_EventManagement")
        .items
        .getById(eventId)
        .select(
          "Id",
          "RulesAndRegualtionType",
          "RulesAndRegualtionText",
          "RulesAndRegualtionImage"
        )
        .get();

      if (!item) {
        return null;
      }

      const attachmentFiles: any[] = await sp.web.lists
        .getByTitle("Corp_SL_EventManagement")
        .items
        .getById(eventId)
        .attachmentFiles
        .get();

      const attachments: IAttachmentData[] = attachmentFiles.map(
        (file: any) => ({
          FileName: file.FileName,
          ServerRelativeUrl: file.ServerRelativeUrl
        })
      );

      let imageUrl = "";

      if (item.RulesAndRegualtionImage) {
        try {
          const imageData =
            typeof item.RulesAndRegualtionImage === "string"
              ? JSON.parse(item.RulesAndRegualtionImage)
              : item.RulesAndRegualtionImage;

          imageUrl =
            imageData.serverRelativeUrl ||
            imageData.serverUrl ||
            imageData.Url ||
            "";

        } catch (error) {
          console.error(
            "Error parsing RulesAndRegualtionImage:",
            error
          );
        }
      }

      return {
        Id: item.Id,
        RulesAndRegualtionType: item.RulesAndRegualtionType || "",
        RulesAndRegualtionText: item.RulesAndRegualtionText || "",
        RulesAndRegualtionImage: imageUrl,
        Attachments: attachments
      };

    } catch (error) {
      console.error(
        "Error getting Rules & Regulations data:",
        error
      );

      throw error;
    }
  }
}