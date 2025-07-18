import TripCard from "./TripCard";


function TripSection({ title, trips, emptyMessage }) {

    return (
        <section className="trip-section">
            <h2>{title}</h2>
            {trips.length > 0 ? (
                <div className="trip-card-grid">
                    {trips.map((trip, index) => (
                        <TripCard key={trip.id} trip={trip} index={index}/>
                    ))}
                </div>
            ) : (
                <p className="placeholder">{emptyMessage}</p>
            )}
        </section>
    );
}

export default TripSection