import { useNavigate } from "react-router-dom";
import { formatTripDates } from "../utils/dateHelpers";
import { CalendarDays } from "lucide-react"

function TripCard({ trip, index }) {
    const { id, name, start_date, end_date } = trip
    const formattedDates = formatTripDates(start_date, end_date)
    const navigate = useNavigate()

    const mapImages = [
        "/images/trip-icons/map1.png",
        "/images/trip-icons/map2.png",
        "/images/trip-icons/map3.png",
        "/images/trip-icons/map4.png"
    ]

    const mapImg = mapImages[index % mapImages.length]

    return (
        <div className="trip-card" onClick={() => navigate(`/my-trips/${id}`)}>
            <img src={mapImg} alt="Trip art" className="trip-icon"/>
            <div className="trip-details">
                <h3 className="trip-title">{name}</h3>
                <div className="trip-dates">
                    <CalendarDays size={18} />
                    <span>{formattedDates}</span>
                </div>
            </div>
        </div>
    )
}

export default TripCard