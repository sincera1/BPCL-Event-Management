import * as React from 'react';

import {
    Modal,
    Button
} from 'react-bootstrap';

import { IEventItem } from '../Services/EventManagementServices';

export interface ICancelEventProps {

    show: boolean;

    event: IEventItem | null;

    onClose: () => void;

    onConfirm: () => Promise<void>;

    isCancelling: boolean;
}

export default class CancelEvent
    extends React.Component<ICancelEventProps> {

    public render(): React.ReactElement<ICancelEventProps> {

        const {
            show,
            event,
            onClose,
            onConfirm,
            isCancelling
        } = this.props;

        return (

            <Modal
                show={show}
                onHide={onClose}
                centered
                backdrop="static"
                keyboard={!isCancelling}
            >

                <Modal.Header closeButton={!isCancelling}>

                    <Modal.Title>

                        <i
                            className="bi bi-exclamation-triangle-fill text-warning me-2"
                        />

                        Cancel Event

                    </Modal.Title>

                </Modal.Header>


                <Modal.Body>

                    <p>

                        Are you sure you want to cancel

                        {event
                            ? ` "${event.eventName}"?`
                            : ' this event?'}

                    </p>


                    <p className="text-muted mb-0">

                        This action will change the event status to

                        <strong>
                            {' '}Cancelled
                        </strong>.

                    </p>


                    <p className="text-muted mb-0">

                        Registered participants will no longer be
                        able to participate in this event.

                    </p>

                </Modal.Body>


                <Modal.Footer>

                    <Button
                        variant="outline-secondary"
                        onClick={onClose}
                        disabled={isCancelling}
                    >

                        No, Keep Event

                    </Button>


                    <Button
                        variant="danger"
                        onClick={onConfirm}
                        disabled={isCancelling}
                    >

                        {isCancelling ? (

                            <>
                                <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                    aria-hidden="true"
                                />

                                Cancelling...

                            </>

                        ) : (

                            <>
                                <i className="bi bi-x-circle-fill me-2" />

                                Yes, Cancel Event
                            </>

                        )}

                    </Button>

                </Modal.Footer>

            </Modal>

        );
    }
}