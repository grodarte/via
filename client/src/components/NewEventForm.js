import * as Yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useNavigate, useParams } from "react-router-dom";
import { Check } from "lucide-react";
import { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";
import { PlaceContext } from "../context/PlaceContext";
import PlaceSelectorModal from "./PlaceSelectorModal";
import { toDateTimeLocal } from "../utils/dateHelpers";
import "../styles/eventform.css"

function NewEventForm() {
    const { id, tripId } = useParams()
    const { userTrips, addEvent } = useContext(UserContext)
    const [selectedPlace, setSelectedPlace] = useState(null)
    const [showPlaceModal, setShowPlaceModal] = useState(false)
    const navigate = useNavigate()

    const trip = userTrips.find(trip => {
        return trip.id === parseInt(tripId || id)
    })
    const eventPlace = trip.places?.find(place => place.id === parseInt(id))

    const tripStart = toDateTimeLocal(trip.start_date)
    const tripEnd = toDateTimeLocal(trip.end_date)

    const EventSchema = Yup.object().shape({
        title: Yup.string().required("Event title is required"),
        planning_status: Yup.string()
        .oneOf(['confirmed', 'tentative'], 'Must be confirmed or tentative')
        .required("Planning status is required"),
        location: Yup.string().required("Please provide event location"),
        start_time: Yup.date()
        .nullable()
        .typeError('Start time must be a valid date/time')
        .notRequired()
        .min(new Date(trip.start_date), "Start must be after trip start")
        .max(new Date(trip.end_date), "Start must be before trip end"),
        end_time: Yup.date()
        .nullable()
        .typeError('Start time must be a valid date/time')
        .notRequired()
        .min(Yup.ref("start_time"), "End must be after start")
        .max(new Date(trip.end_date), "End must be before trip end")
        .test('is_after_start', 'End time must be after start time', function (value) {
            const { start_time } = this.parent
            if (!start_time || !value) return true
            return new Date(value) > new Date(start_time)
        }),
        place: !tripId 
        ? Yup.string().required('Please select a place or add a new one') 
        : Yup.string(),
    })
    
    const initialValues = {
        title: '',
        planning_status: 'confirmed',
        location: '',
        start_time: '',
        end_time: '',
        place: tripId ? id : '',
        trip: tripId ? tripId: id
    }

    return (
        <div>
            <div className="event-form-header">
                <button
                    type="button"
                    className="back-button"
                    onClick={() => navigate(`/my-trips/${tripId || id}`)}
                    >
                    ← Back to Trip
                </button>
            </div>
            <h1 className="form-title">{trip.name}</h1>
            <Formik
                initialValues={initialValues}
                validationSchema={EventSchema}
                onSubmit={async (values, { setSubmitting, setErrors }) => {
                    try {
                        const newEvent = {
                            title: values.title,
                            planning_status: values.planning_status,
                            location: values.location,
                            start_time: values.start_time,
                            end_time: values.end_time,
                            place_id: parseInt(values.place),
                            trip_id: parseInt(values.trip),
                        }
                        const result = await addEvent(newEvent)
                        if (result.success) {
                            navigate(`/my-trips/${tripId ? tripId : id}`)
                        } else {
                            setErrors({ general: result.error })
                        }
                    } catch (err) {
                        setErrors({ general: err.error })
                    } finally {
                        setSubmitting(false)
                    }
                }}
            >
                {({ values, setFieldValue, errors}) => (
                    <>
                    
                        <Form className="event-form">
                            <div className="event-place-heading">
                                {eventPlace ? (
                                    <>
                                        <h2>New Event in {eventPlace.name}</h2>
                                        <p className="event-place-address">{eventPlace.address}</p>
                                    </>
                                ) : (
                                    <>
                                        <h2>New Event</h2>
                                    </>
                                )}
                            </div>
                            <label htmlFor="title">Title</label>
                            <Field name="title" type="text" placeholder="Ex: Rehearsal Dinner" />
                            <ErrorMessage name="title" component="div" className="error" />

                            <label>Planning Status</label>
                            <div className="status-toggle">
                                {["confirmed", "tentative"].map((status) => (
                                <button
                                    type="button"
                                    key={status}
                                    className={`toggle-button ${
                                    values.planning_status === status ? "active" : ""
                                    }`}
                                    onClick={() => setFieldValue("planning_status", status)}
                                >
                                    {values.planning_status === status && (
                                    <Check size={14} style={{ marginRight: "4px" }} />
                                    )}
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                                ))}
                            </div>
                            <ErrorMessage name="planning_status" component="div" className="error" />

                            <label htmlFor="location">Location</label>
                            <Field name="location" type="text" placeholder="Ex: Rosewood Hotel, SB" />
                            <ErrorMessage name="location" component="div" className="error" />

                            <label htmlFor="start_time">Start Time</label>
                            <Field name="start_time" type="datetime-local" min={tripStart} max={tripEnd} step="60"/>
                            <ErrorMessage name="start_time" component="div" className="error" />

                            <label htmlFor="end_time">End Time</label>
                            <Field name="end_time" type="datetime-local" min={tripStart} max={tripEnd} step="60"/>
                            <ErrorMessage name="end_time" component="div" className="error" />

                            {!tripId && (
                                <>
                                    <div className="place-section">
                                        <label htmlFor="place">Place</label>
                                        {selectedPlace && (
                                            <p><strong>{selectedPlace.name}</strong><br />{selectedPlace.address}</p>
                                        )}
                                        <button type="button" className="toggle-new-place-button" onClick={() => setShowPlaceModal(true)}>
                                            {selectedPlace ? 'Change Place' : 'Select Place'}
                                        </button>
                                        <ErrorMessage name="place" component="div" className="error" />
                                    </div>
                                </>
                            )}
                            {errors.general && <div className="error">{errors.general}</div>}
                            <button type="submit">Add Event</button>                    
                        </Form>
                        <PlaceSelectorModal
                            show={showPlaceModal}
                            onClose={() => setShowPlaceModal(false)}
                            onPlaceSelect={(place) => {
                                setSelectedPlace(place)
                                setFieldValue('place', place.id)
                                setShowPlaceModal(false)
                            }}
                        />
                    </>
                )}
            </Formik>
        </div>
    )
}

export default NewEventForm