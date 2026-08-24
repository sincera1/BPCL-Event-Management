

export interface ISubEventValidation {
    id: number;
    title: string;
    mandatoryMembers: number;
}

export interface ICreateEventValidationData {

    eventTitle: string;

    eventDescription: string;

    eventBannerImage?: File;

    // ==========================================
    // EDIT MODE
    // ==========================================

    isEditMode?: boolean;

    hasExistingEventBannerImage?: boolean;

    hasExistingRulesImage?: boolean;

    eventStartDate: string;

    eventEndDate: string;

    registrationStartDate: string;

    registrationEndDate: string;

    eventOwnerId: number;

    eventOrganizerDepartment: string;

    eventOrganizerEmail: string;

    eventOrganizerPhoneNumber: string;

    rulesType: string;

    rulesAndRegualtionText: string;

    rulesAndRegualtionImage?: File;

    hasSubEvents: boolean;

    subEvents: ISubEventValidation[];

    participantType: string;

    maxTeamMembers: number;

    mandatoryMember: number;
}



export const validateCreateEvent = (
    data: ICreateEventValidationData
): Record<string, string> => {

    const errors: Record<string, string> = {};


    // =========================================================
    // 1. BASIC MANDATORY FIELDS
    // =========================================================

    if (!data.eventTitle.trim()) {

        errors.eventTitle =
            'Please fill the "Event Title"';
    }


    if (!data.eventDescription.trim()) {

        errors.eventDescription =
            'Please fill the "Event Description"';
    }


    if (
        !data.eventBannerImage &&
        !data.hasExistingEventBannerImage
    ) {

        errors.eventBannerImage =
            'Please select the "Event Banner Image"';
    }


    if (!data.eventStartDate) {

        errors.eventStartDate =
            'Please select the "Event Start Date"';
    }


    if (!data.eventEndDate) {

        errors.eventEndDate =
            'Please select the "Event End Date"';
    }


    if (!data.registrationStartDate) {

        errors.registrationStartDate =
            'Please select the "Registration Start Date"';
    }


    if (!data.registrationEndDate) {

        errors.registrationEndDate =
            'Please select the "Registration End Date"';
    }


    if (!data.eventOwnerId) {

        errors.eventOwnerId =
            'Please select the "Event Owner"';
    }


    if (!data.eventOrganizerDepartment.trim()) {

        errors.eventOrganizerDepartment =
            'Please fill the "Department"';
    }


    if (!data.eventOrganizerEmail.trim()) {

        errors.eventOrganizerEmail =
            'Please fill the "Email"';
    }


    if (!data.eventOrganizerPhoneNumber.trim()) {

        errors.eventOrganizerPhoneNumber =
            'Please fill the "Phone Number"';
    }


    // =========================================================
    // 2. EVENT START DATE
    // =========================================================

    if (data.eventStartDate) {

        const today = new Date();

        const todayDate = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );

        const eventStartDate = new Date(
            `${data.eventStartDate}T00:00:00`
        );

        /*
         * Event Start Date must be a future date.
         *
         * Today is NOT considered a future date.
         */
        if (eventStartDate <= todayDate) {

            errors.eventStartDate =
                "Event Start Date must be a future date.";
        }
    }


    // =========================================================
    // 3. EVENT END DATE
    // =========================================================

    if (
        data.eventStartDate &&
        data.eventEndDate
    ) {

        const eventStartDate = new Date(
            `${data.eventStartDate}T00:00:00`
        );

        const eventEndDate = new Date(
            `${data.eventEndDate}T00:00:00`
        );

        /*
         * End Date must be greater than Start Date.
         *
         * Same date is NOT allowed.
         */
        if (eventEndDate <= eventStartDate) {

            errors.eventEndDate =
                "Event End Date must be greater than Event Start Date.";
        }
    }


    // =========================================================
    // 4. REGISTRATION START DATE
    // =========================================================

    if (
        data.eventStartDate &&
        data.eventEndDate &&
        data.registrationStartDate
    ) {

        const eventStartDate = new Date(
            `${data.eventStartDate}T00:00:00`
        );

        const eventEndDate = new Date(
            `${data.eventEndDate}T00:00:00`
        );

        const registrationStartDate = new Date(
            `${data.registrationStartDate}T00:00:00`
        );

        /*
         * Registration Start Date must be
         * within Event Start Date and Event End Date.
         */
        if (
            registrationStartDate < eventStartDate ||
            registrationStartDate > eventEndDate
        ) {

            errors.registrationStartDate =
                "Registration Start Date must be within the Event Start Date and Event End Date.";
        }
    }


    // =========================================================
    // 5. REGISTRATION END DATE
    // =========================================================

    if (
        data.eventStartDate &&
        data.eventEndDate &&
        data.registrationEndDate
    ) {

        const eventStartDate = new Date(
            `${data.eventStartDate}T00:00:00`
        );

        const eventEndDate = new Date(
            `${data.eventEndDate}T00:00:00`
        );

        const registrationEndDate = new Date(
            `${data.registrationEndDate}T00:00:00`
        );

        /*
         * Registration End Date must be
         * within Event Start Date and Event End Date.
         */
        if (
            registrationEndDate < eventStartDate ||
            registrationEndDate > eventEndDate
        ) {

            errors.registrationEndDate =
                "Registration End Date must be within the Event Start Date and Event End Date.";
        }
    }


    // =========================================================
    // 6. REGISTRATION START / END COMPARISON
    // =========================================================

    if (
        data.registrationStartDate &&
        data.registrationEndDate
    ) {

        const registrationStartDate = new Date(
            `${data.registrationStartDate}T00:00:00`
        );

        const registrationEndDate = new Date(
            `${data.registrationEndDate}T00:00:00`
        );

        /*
         * Registration End Date must be greater
         * than Registration Start Date.
         */
        if (registrationEndDate <= registrationStartDate) {

            errors.registrationEndDate =
                "Registration End Date must be greater than Registration Start Date.";
        }
    }


    // =========================================================
    // 7. RULES & REGULATIONS
    // =========================================================

    if (data.rulesType === "Image") {

        if (
            !data.rulesAndRegualtionImage &&
            !data.hasExistingRulesImage
        ) {

            errors.rulesAndRegualtionImage =
                'Please select the "Rules & Regulations Image"';
        }
    }


    if (data.rulesType === "Text") {

        /*
         * If Text is selected,
         * Rules & Regulations Text is mandatory.
         */
        if (!data.rulesAndRegualtionText.trim()) {

            errors.rulesAndRegualtionText =
                'Please fill the "Rules & Regulations"';
        }
    }


    // =========================================================
    // 8. SUB-EVENT VALIDATION
    // =========================================================

    if (data.hasSubEvents) {

        /*
         * At least one sub-event must exist.
         */
        if (
            !data.subEvents ||
            data.subEvents.length === 0
        ) {

            errors.subEvents =
                "Please add at least one Subevent.";
        }


        /*
         * Validate every dynamically added sub-event.
         */
        data.subEvents.forEach(
            (subEvent, index) => {

                // ---------------------------------------------
                // Subevent Name / Title
                // ---------------------------------------------

                if (!subEvent.title.trim()) {

                    errors[
                        `subEvent_${index}_title`
                    ] =
                        `Please fill the "Subevent Name / Title" for Subevent ${index + 1}.`;
                }


                // ---------------------------------------------
                // Mandatory Members
                // ---------------------------------------------

                if (
                    subEvent.mandatoryMembers <= 0
                ) {

                    errors[
                        `subEvent_${index}_mandatoryMembers`
                    ] =
                        `Please enter the "Mandatory Members" for Subevent ${index + 1}.`;
                }

            }
        );
    }


    // =========================================================
    // 9. TEAM PARTICIPANT TYPE
    // =========================================================

    if (data.participantType === "Team") {

        /*
         * Maximum Members Per Team is mandatory.
         */
        if (data.maxTeamMembers <= 0) {

            errors.maxTeamMembers =
                'Please enter the "Maximum Members Per Team"';
        }


        /*
         * Minimum Members Required is mandatory.
         */
        if (data.mandatoryMember <= 0) {

            errors.mandatoryMember =
                'Please enter the "Minimum Members Required"';
        }


        /*
         * Minimum cannot be greater than Maximum.
         */
        if (
            data.maxTeamMembers > 0 &&
            data.mandatoryMember > 0 &&
            data.mandatoryMember > data.maxTeamMembers
        ) {

            errors.mandatoryMember =
                "Minimum Members Required cannot be greater than Maximum Members Per Team.";
        }
    }


    // =========================================================
    // 10. RETURN ALL VALIDATION ERRORS
    // =========================================================

    return errors;
};